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

// Get future slots only (for customers)
router.get("/", (req, res) => {
  const query = `
    SELECT 
      s.*, 
      s.capacity as total_capacity,
      (s.capacity - (SELECT COUNT(*) FROM bookings b WHERE b.slot_id = s.id AND b.status = 'CONFIRMED')) as available_capacity
    FROM slots s
    WHERE s.start_time >= datetime('now') 
    ORDER BY s.start_time ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get only this host's slots (secure server-side filter)
router.get("/mine", requireAuth, requireRole("HOST"), (req, res) => {
  const query = `
    SELECT 
      s.*, 
      s.capacity as total_capacity,
      (s.capacity - (SELECT COUNT(*) FROM bookings b WHERE b.slot_id = s.id AND b.status = 'CONFIRMED')) as available_capacity
    FROM slots s
    WHERE s.host_id = ? 
    ORDER BY s.start_time ASC
  `;
  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get bookings and waitlist for a specific slot (HOST only)
router.get("/:slotId/bookings", requireAuth, requireRole("HOST"), (req, res) => {
  const slotId = req.params.slotId;
  
  db.get(`SELECT * FROM slots WHERE id = ? AND host_id = ?`, [slotId, req.user.id], (err, slot) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!slot) return res.status(403).json({ error: "Not authorized to view this slot" });
    
    db.all(
      `SELECT b.id, b.status, u.name, u.email 
       FROM bookings b JOIN users u ON b.user_id = u.id 
       WHERE b.slot_id = ? AND b.status != 'CANCELED'`, 
      [slotId], 
      (err2, bookings) => {
        if (err2) return res.status(500).json({ error: err2.message });
        
        db.all(
          `SELECT w.id, w.status, w.created_at, u.name, u.email 
           FROM waitlist w JOIN users u ON w.user_id = u.id 
           WHERE w.slot_id = ? AND w.status = 'WAITING' 
           ORDER BY w.created_at ASC`,
          [slotId],
          (err3, waitlists) => {
            if (err3) return res.status(500).json({ error: err3.message });
            res.json({ bookings, waitlists });
          }
        );
      }
    );
  });
});

module.exports = router;