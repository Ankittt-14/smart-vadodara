const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const db = require('./db');
require('./seed');
const {
  classifyIssue,
  nearestWard,
  checkDuplicateOrSpam,
  predictRisk,
  validateProof,
} = require('./aiHub');

const JWT_SECRET = process.env.JWT_SECRET || 'smart_vadodara_secret_key_2026';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- Auth Middleware ----
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ---- Auth Routes ----
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, role = 'citizen', wardId } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (email, password, name, role, ward_id) VALUES (?, ?, ?, ?, ?)'
    ).run(email.toLowerCase(), hash, name, role, wardId || null);

    const user = { id: result.lastInsertRowid, email: email.toLowerCase(), name, role, wardId: wardId || null };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const row = db.prepare(
      `SELECT users.*, wards.name AS ward_name FROM users LEFT JOIN wards ON wards.id = users.ward_id WHERE email = ?`
    ).get(email.toLowerCase().trim());

    if (!row || !bcrypt.compareSync(password, row.password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const title = row.role === 'admin'
      ? 'Municipal Admin'
      : row.role === 'ward_officer'
      ? `Ward ${row.ward_id} Officer`
      : 'Citizen';

    const user = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      wardId: row.ward_id,
      wardName: row.ward_name,
      title,
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const row = db.prepare('SELECT id, email, name, role, ward_id FROM users WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json({ user: row });
});

// ---- Ensure upload directories exist ----
['issues', 'proofs'].forEach((dir) => {
  fs.mkdirSync(path.join(__dirname, 'uploads', dir), { recursive: true });
});

// ---- Multer storage ----
const storage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads', subdir)),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${nanoid(6)}${path.extname(file.originalname)}`),
  });
const uploadIssue = multer({ storage: storage('issues') });
const uploadProof = multer({ storage: storage('proofs') });

// ---- Wards & Engineers ----
app.get('/api/wards', (req, res) => {
  res.json(db.prepare('SELECT * FROM wards').all());
});

app.get('/api/engineers', (req, res) => {
  res.json(db.prepare('SELECT * FROM engineers').all());
});

// ---- Create issue (runs the full AI Processing Hub pipeline) ----
app.post('/api/issues', uploadIssue.single('image'), (req, res) => {
  try {
    const { description = '', lat, lng, reporterType = 'citizen' } = req.body;
    if (!lat || !lng) return res.status(400).json({ error: 'Location (lat, lng) is required.' });

    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    const filename = req.file ? req.file.originalname : '';
    const imagePath = req.file ? `/uploads/issues/${req.file.filename}` : null;

    // 1. Issue Detection
    const { category, confidence } = classifyIssue(description, filename);

    // 2. Geo-Tagging
    const wards = db.prepare('SELECT * FROM wards').all();
    const ward = nearestWard(wards, latN, lngN);

    // 3. Spam & Duplicate Check
    const { isDuplicate, duplicateOf, isSpam } = checkDuplicateOrSpam(db, category, latN, lngN, description);

    // 4. Risk Prediction
    const { score, level } = predictRisk(db, category, latN, lngN);

    const status = isSpam ? 'Flagged' : isDuplicate ? 'Duplicate' : 'Pending Review';

    // Auto-assign to the engineer for this ward
    const engineer = db.prepare('SELECT * FROM engineers WHERE ward_id = ?').get(ward.id);

    const id = `VMC-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;

    db.prepare(
      `INSERT INTO issues
        (id, category, description, lat, lng, ward_id, reporter_type, image_path, status,
         risk_score, risk_level, is_duplicate, duplicate_of, is_spam, confidence, assigned_engineer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, category, description, latN, lngN, ward.id, reporterType, imagePath, status,
      score, level, isDuplicate ? 1 : 0, duplicateOf, isSpam ? 1 : 0, confidence,
      engineer ? engineer.id : null
    );

    const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(id);
    res.json({
      issue,
      ward,
      engineer,
      aiSummary: {
        category, confidence, riskScore: score, riskLevel: level,
        isDuplicate, isSpam,
        duplicateCheckPassed: !isDuplicate,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process issue.' });
  }
});

// ---- List issues (optionally filter by engineer / status / ward) ----
app.get('/api/issues', (req, res) => {
  const { engineerId, status, wardId } = req.query;
  let query = `SELECT issues.*, wards.name AS ward_name, engineers.name AS engineer_name
               FROM issues
               LEFT JOIN wards ON wards.id = issues.ward_id
               LEFT JOIN engineers ON engineers.id = issues.assigned_engineer_id
               WHERE 1=1`;
  const params = [];
  if (engineerId) { query += ' AND issues.assigned_engineer_id = ?'; params.push(engineerId); }
  if (status) { query += ' AND issues.status = ?'; params.push(status); }
  if (wardId) { query += ' AND issues.ward_id = ?'; params.push(wardId); }
  query += ` ORDER BY
    CASE issues.risk_level WHEN 'Critical' THEN 0 WHEN 'High' THEN 1 WHEN 'Moderate' THEN 2 ELSE 3 END,
    issues.created_at DESC`;
  res.json(db.prepare(query).all(...params));
});

app.get('/api/issues/latest', (req, res) => {
  const issue = db.prepare(
    `SELECT issues.*, wards.name AS ward_name, engineers.name AS engineer_name
     FROM issues LEFT JOIN wards ON wards.id = issues.ward_id
     LEFT JOIN engineers ON engineers.id = issues.assigned_engineer_id
     ORDER BY issues.created_at DESC LIMIT 1`
  ).get();
  if (!issue) return res.status(404).json({ error: 'No issues reported yet' });
  res.json(issue);
});

app.get('/api/issues/:id', (req, res) => {
  const issue = db.prepare(
    `SELECT issues.*, wards.name AS ward_name, engineers.name AS engineer_name
     FROM issues LEFT JOIN wards ON wards.id = issues.ward_id
     LEFT JOIN engineers ON engineers.id = issues.assigned_engineer_id
     WHERE issues.id = ?`
  ).get(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Not found' });
  res.json(issue);
});

// ---- Assign / reassign engineer ----
app.patch('/api/issues/:id/assign', (req, res) => {
  const { engineerId } = req.body;
  db.prepare('UPDATE issues SET assigned_engineer_id = ?, status = ? WHERE id = ?')
    .run(engineerId, 'In Progress', req.params.id);
  res.json(db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id));
});

// ---- Fix & Verify: engineer uploads proof, AI validates ----
app.patch('/api/issues/:id/resolve', authenticateToken, uploadProof.single('proof'), (req, res) => {
  if (req.user.role !== 'ward_officer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied. Only assigned Ward Officers or Admin can resolve issues.' });
  }

  const filename = req.file ? req.file.originalname : `proof-${Date.now()}`;
  const proofPath = req.file ? `/uploads/proofs/${req.file.filename}` : null;
  const validated = validateProof(filename);
  const status = validated ? 'Verified' : 'Fixed - Pending AI Review';

  db.prepare(
    `UPDATE issues SET proof_image_path = ?, ai_validated = ?, status = ?, resolved_at = datetime('now')
     WHERE id = ?`
  ).run(proofPath, validated ? 1 : 0, status, req.params.id);

  res.json({
    issue: db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id),
    aiValidated: validated,
  });
});

// ---- Stats for the Public Outcome dashboard ----
app.get('/api/stats', (req, res) => {
  const wards = db.prepare('SELECT * FROM wards').all();

  const wardStats = wards.map((w) => {
    const issues = db.prepare('SELECT * FROM issues WHERE ward_id = ?').all(w.id);
    const resolved = issues.filter((i) => i.status === 'Verified').length;
    const open = issues.length - resolved;
    const criticalOpen = issues.filter((i) => i.status !== 'Verified' && i.risk_level === 'Critical').length;
    const highOpen = issues.filter((i) => i.status !== 'Verified' && i.risk_level === 'High').length;

    // Health score: starts at 100, penalized by open issues weighted by risk
    let penalty = criticalOpen * 12 + highOpen * 7 +
      issues.filter((i) => i.status !== 'Verified' && i.risk_level === 'Moderate').length * 3 +
      issues.filter((i) => i.status !== 'Verified' && i.risk_level === 'Low').length * 1;
    const healthScore = Math.max(5, Math.min(100, 100 - penalty));

    return { ...w, totalIssues: issues.length, resolved, open, criticalOpen, highOpen, healthScore };
  });

  const allIssues = db.prepare(
    `SELECT issues.*, wards.name AS ward_name FROM issues LEFT JOIN wards ON wards.id = issues.ward_id`
  ).all();

  const totalResolved = allIssues.filter((i) => i.status === 'Verified').length;
  const totalActive = allIssues.filter((i) => i.status !== 'Verified').length;
  const avgConfidence = allIssues.length
    ? Math.round((allIssues.reduce((a, i) => a + (i.confidence || 0), 0) / allIssues.length) * 100)
    : 0;

  const riskAlerts = allIssues
    .filter((i) => i.status !== 'Verified' && (i.risk_level === 'Critical' || i.risk_level === 'High'))
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10);

  const recentActivity = db.prepare(
    `SELECT issues.*, wards.name AS ward_name FROM issues LEFT JOIN wards ON wards.id = issues.ward_id
     ORDER BY COALESCE(issues.resolved_at, issues.created_at) DESC LIMIT 10`
  ).all();

  res.json({
    totalResolved,
    totalActive,
    avgConfidence,
    wardStats,
    riskAlerts,
    recentActivity,
    allIssuesForMap: allIssues.map((i) => ({
      id: i.id, lat: i.lat, lng: i.lng, category: i.category,
      risk_level: i.risk_level, status: i.status, ward_name: i.ward_name,
    })),
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Smart Vadodara API running on http://localhost:${PORT}`));
