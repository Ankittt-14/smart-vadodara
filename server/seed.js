const db = require('./db');
const bcrypt = require('bcryptjs');

const wardCount = db.prepare('SELECT COUNT(*) AS c FROM wards').get().c;

if (wardCount === 0) {
  const wards = [
    { name: 'Sayajigunj', lat: 22.3125, lng: 73.1900 },
    { name: 'Alkapuri', lat: 22.3086, lng: 73.1662 },
    { name: 'Manjalpur', lat: 22.2762, lng: 73.1932 },
    { name: 'Gotri', lat: 22.3164, lng: 73.1503 },
    { name: 'Karelibaug', lat: 22.3225, lng: 73.2070 },
    { name: 'Waghodia Road', lat: 22.3193, lng: 73.2298 },
    { name: 'Fatehgunj', lat: 22.3245, lng: 73.1815 },
    { name: 'Vasna Road', lat: 22.2861, lng: 73.1738 },
  ];

  const insertWard = db.prepare('INSERT INTO wards (name, lat, lng) VALUES (?, ?, ?)');
  const wardIds = wards.map((w) => insertWard.run(w.name, w.lat, w.lng).lastInsertRowid);

  const engineers = [
    { name: 'Er. Ankit Sharma', ward_id: wardIds[0] },
    { name: 'Er. Sneha Sharma', ward_id: wardIds[1] },
    { name: 'Er. Vikram Desai', ward_id: wardIds[2] },
    { name: 'Er. Ananya Roy', ward_id: wardIds[3] },
    { name: 'Er. Suresh Mehta', ward_id: wardIds[4] },
    { name: 'Er. Priya Joshi', ward_id: wardIds[5] },
    { name: 'Er. Amit Parmar', ward_id: wardIds[6] },
    { name: 'Er. Pooja Bhatt', ward_id: wardIds[7] },
  ];
  const insertEng = db.prepare('INSERT INTO engineers (name, ward_id) VALUES (?, ?)');
  engineers.forEach((e) => insertEng.run(e.name, e.ward_id));

  console.log(`Seeded ${wards.length} wards and ${engineers.length} engineers.`);
} else {
  console.log('Wards already seeded.');
}

// Seed Users — Ensure ankit@gmail.com is seeded
const ankitPassHash = bcrypt.hashSync('12345', 10);
const citizenPassHash = bcrypt.hashSync('12345', 10);

const upsertUser = db.prepare(`
  INSERT INTO users (email, password, name, role, ward_id)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(email) DO UPDATE SET password = excluded.password, name = excluded.name, role = excluded.role, ward_id = excluded.ward_id
`);

upsertUser.run('ankit@gmail.com', ankitPassHash, 'Er. Ankit Sharma', 'ward_officer', 1);
upsertUser.run('citizen@vadodara.in', citizenPassHash, 'Citizen User', 'citizen', null);
upsertUser.run('admin@vmc.gov.in', ankitPassHash, 'Comm. H. R. Solanki', 'admin', null);

console.log('Seeded / updated officer ankit@gmail.com (pass: 12345) and demo accounts.');
