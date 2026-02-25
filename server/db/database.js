const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "timequeue.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Failed to connect to SQLite:", err.message);
  else console.log("✅ Connected to SQLite:", dbPath);
});

module.exports = db;