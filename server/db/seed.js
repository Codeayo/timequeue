const db = require('./database');

function dt(dayOffset, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// [dayOffset, startHour, startMin, endHour, endMin, capacity]
const sessions = [
  // ── Today ──────────────────────────────
  [0, 12,  0, 14,  0, 4],
  [0, 12, 30, 14, 30, 2],
  [0, 17,  0, 19,  0, 6],
  [0, 19,  0, 21,  0, 4],
  [0, 19, 30, 21, 30, 8],
  [0, 20, 30, 22, 30, 2],
  // ── Tomorrow ───────────────────────────
  [1,  9,  0, 10, 30, 4],
  [1, 11,  0, 13,  0, 6],
  [1, 12,  0, 14,  0, 4],
  [1, 13,  0, 15,  0, 2],
  [1, 17, 30, 19, 30, 8],
  [1, 18,  0, 20,  0, 4],
  [1, 19,  0, 21,  0, 6],
  [1, 20,  0, 22,  0, 4],
  // ── +2 days ────────────────────────────
  [2, 10, 30, 12, 30, 4],
  [2, 12,  0, 14,  0, 6],
  [2, 12, 30, 14, 30, 2],
  [2, 17,  0, 19,  0, 4],
  [2, 18,  0, 20,  0, 8],
  [2, 19,  0, 21,  0, 6],
  [2, 20, 30, 22, 30, 2],
  // ── +3 days ────────────────────────────
  [3,  9,  0, 10, 30, 2],
  [3, 11,  0, 13,  0, 4],
  [3, 12,  0, 14,  0, 6],
  [3, 17,  0, 19,  0, 4],
  [3, 19,  0, 21,  0, 8],
  [3, 20,  0, 22,  0, 2],
  // ── +4 days ────────────────────────────
  [4, 11,  0, 13,  0, 6],
  [4, 12, 30, 14, 30, 4],
  [4, 17, 30, 19, 30, 8],
  [4, 19,  0, 21,  0, 4],
  [4, 20, 30, 22, 30, 2],
  // ── +5 days ────────────────────────────
  [5,  9,  0, 10, 30, 4],
  [5, 10, 30, 12, 30, 6],
  [5, 12,  0, 14,  0, 2],
  [5, 17,  0, 19,  0, 4],
  [5, 18, 30, 20, 30, 8],
  [5, 19, 30, 21, 30, 6],
];

db.serialize(() => {
  db.get("SELECT id FROM users WHERE role = 'HOST' LIMIT 1", (err, host) => {
    if (err || !host) {
      console.error('No host user found. Register a HOST account first.');
      db.close();
      return;
    }
    console.log('Seeding slots for host id:', host.id);

    const stmt = db.prepare(
      `INSERT INTO slots (host_id, start_time, end_time, capacity) VALUES (?, ?, ?, ?)`
    );

    for (const [d, sh, sm, eh, em, cap] of sessions) {
      stmt.run(host.id, dt(d, sh, sm), dt(d, eh, em), cap);
    }

    stmt.finalize(() => {
      console.log(`✅ Inserted ${sessions.length} slots.`);
      db.close();
    });
  });
});
