const express = require("express");
const db = require("../db/database");
const { requireAuth, requireRole } = require("../utils/auth");

const router = express.Router();

// Create slot (HOST only)
router.post("/", requireAuth, requireRole("HOST"), (req, res) => {
  const { start_time, end_time, capacity } = req.body;

  if (!start_time || !end_time) {
    return res.status(400).json({ error: "start_time and end_time required" });
  }

  db.run(
    `INSERT INTO slots (host_id, start_time, end_time, capacity)
     VALUES (?, ?, ?, ?)`,
    [req.user.id, start_time, end_time, capacity || 1],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        id: this.lastID,
        host_id: req.user.id,
        start_time,
        end_time,
        capacity: capacity || 1
      });
    }
  );
});

// Get all slots
router.get("/", (req, res) => {
  db.all(`SELECT * FROM slots`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;