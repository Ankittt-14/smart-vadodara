// ---------------------------------------------------------------------------
// AI Processing Hub (rule-based mock)
// This simulates what a trained CV model + geospatial risk model would do,
// using deterministic heuristics so behaviour is explainable and demoable.
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS = {
  Pothole: ['pothole', 'road', 'crack', 'asphalt', 'pit', 'street damage'],
  Garbage: ['garbage', 'trash', 'waste', 'dump', 'litter', 'dustbin'],
  Waterlogging: ['water', 'flood', 'drain', 'sewage', 'clog', 'overflow'],
  'Streetlight Fault': ['light', 'lamp', 'dark', 'streetlight', 'pole'],
  'Illegal Construction': ['construction', 'encroachment', 'illegal', 'debris'],
};

const CATEGORY_BASE_SEVERITY = {
  Pothole: 55,
  Garbage: 35,
  Waterlogging: 70,
  'Streetlight Fault': 40,
  'Illegal Construction': 50,
};

function classifyIssue(description = '', filename = '') {
  const text = `${description} ${filename}`.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const hits = keywords.filter((k) => text.includes(k)).length;
    if (hits > bestScore) {
      bestScore = hits;
      best = category;
    }
  }

  if (!best) {
    // deterministic pseudo-random fallback based on a simple hash,
    // so the same filename+description always yields the same category (stable demo)
    const categories = Object.keys(CATEGORY_KEYWORDS);
    const hash = [...text].reduce((a, c) => a + c.charCodeAt(0), 0);
    best = categories[hash % categories.length];
  }

  const confidence = Math.min(0.99, 0.62 + bestScore * 0.12 + Math.random() * 0.08);
  return { category: best, confidence: Number(confidence.toFixed(2)) };
}

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function nearestWard(wards, lat, lng) {
  let best = wards[0];
  let bestDist = Infinity;
  for (const w of wards) {
    const d = haversineMeters(lat, lng, w.lat, w.lng);
    if (d < bestDist) {
      bestDist = d;
      best = w;
    }
  }
  return best;
}

// Spam & duplicate check: same category within 80m reported in the last 14 days
function checkDuplicateOrSpam(db, category, lat, lng, description) {
  const recentSame = db
    .prepare(
      `SELECT id, lat, lng, created_at FROM issues
       WHERE category = ? AND created_at >= datetime('now', '-14 days')`
    )
    .all(category);

  for (const row of recentSame) {
    const dist = haversineMeters(lat, lng, row.lat, row.lng);
    if (dist <= 80) {
      return { isDuplicate: true, duplicateOf: row.id, isSpam: false };
    }
  }

  const isSpam = !!description && description.trim().length > 0 && description.trim().length < 3;
  return { isDuplicate: false, duplicateOf: null, isSpam };
}

// Risk prediction: base severity + density of open issues nearby (within 300m) + duplicate boost
function predictRisk(db, category, lat, lng) {
  const base = CATEGORY_BASE_SEVERITY[category] ?? 40;

  const nearby = db
    .prepare(
      `SELECT lat, lng FROM issues WHERE status != 'Verified' AND created_at >= datetime('now', '-30 days')`
    )
    .all();

  const density = nearby.filter((r) => haversineMeters(lat, lng, r.lat, r.lng) <= 300).length;

  let score = base + density * 6;
  score = Math.min(100, Math.max(5, Math.round(score)));

  let level = 'Low';
  if (score >= 75) level = 'Critical';
  else if (score >= 55) level = 'High';
  else if (score >= 30) level = 'Moderate';

  return { score, level };
}

// AI validation of the engineer's "proof of fix" photo — mock but deterministic
function validateProof(filename = '') {
  const hash = [...filename].reduce((a, c) => a + c.charCodeAt(0), 0);
  // 85% of the time, validates successfully (keeps the demo mostly-happy-path)
  return hash % 100 < 85;
}

module.exports = {
  classifyIssue,
  nearestWard,
  checkDuplicateOrSpam,
  predictRisk,
  validateProof,
  haversineMeters,
};
