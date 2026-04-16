const db = require("./database");

db.serialize(() => {
  // Users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('HOST','USER')),
      store_name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Migrate existing DB: add store_name if missing
  db.run(`ALTER TABLE users ADD COLUMN store_name TEXT`, () => {});

  // Slots
  db.run(`
    CREATE TABLE IF NOT EXISTS slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      host_id INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (host_id) REFERENCES users(id)
    )
  `);

  // Bookings
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('CONFIRMED','CANCELED')) DEFAULT 'CONFIRMED',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (slot_id) REFERENCES slots(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Waitlist
  db.run(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('WAITING','PROMOTED','REMOVED')) DEFAULT 'WAITING',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (slot_id) REFERENCES slots(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log("✅ Database tables created/verified.");
});

db.close();