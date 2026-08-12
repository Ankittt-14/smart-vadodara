const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'vadodara.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS wards (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS engineers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  ward_id INTEGER NOT NULL,
  FOREIGN KEY (ward_id) REFERENCES wards(id)
);

CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  ward_id INTEGER,
  reporter_type TEXT NOT NULL DEFAULT 'citizen',
  image_path TEXT,
  status TEXT NOT NULL DEFAULT 'Pending Review',
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'Low',
  is_duplicate INTEGER NOT NULL DEFAULT 0,
  duplicate_of TEXT,
  is_spam INTEGER NOT NULL DEFAULT 0,
  confidence REAL NOT NULL DEFAULT 0,
  assigned_engineer_id INTEGER,
  proof_image_path TEXT,
  ai_validated INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  FOREIGN KEY (assigned_engineer_id) REFERENCES engineers(id)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen',
  ward_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ward_id) REFERENCES wards(id)
);
`);

module.exports = db;
