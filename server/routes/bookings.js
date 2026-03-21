const express = require("express");
const db = require("../db/database");
const { requireAuth } = require("../utils/auth");

const router = express.Router();

// Helper: count confirmed bookings for a slot
function countConfirmed(slotId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) AS count FROM bookings WHERE slot_id = ? AND status = 'CONFIRMED'`,
      [slotId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      }
    );
  });
}

// Helper: get slot capacity
function getSlot(slotId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM slots WHERE id = ?`, [slotId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// BOOK or WAITLIST (B3)
router.post("/slots/:slotId/book", requireAuth, async (req, res) => {
  const slotId = Number(req.params.slotId);
  const userId = req.user.id;

  try {
    const slot = await getSlot(slotId);
    if (!slot) return res.status(404).json({ error: "Slot not found" });

    // prevent duplicate confirmed booking
    db.get(
      `SELECT * FROM bookings WHERE slot_id = ? AND user_id = ? AND status='CONFIRMED'`,
      [slotId, userId],
      async (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existing) return res.status(409).json({ error: "Already booked" });

        const confirmedCount = await countConfirmed(slotId);

        if (confirmedCount < slot.capacity) {
          // create booking
          db.run(
            `INSERT INTO bookings (slot_id, user_id, status) VALUES (?, ?, 'CONFIRMED')`,
            [slotId, userId],
            function (err2) {
              if (err2) return res.status(500).json({ error: err2.message });
              return res.json({
                type: "BOOKED",
                booking: { id: this.lastID, slot_id: slotId, user_id: userId, status: "CONFIRMED" },
              });
            }
          );
        } else {
          // add to waitlist (prevent duplicates)
          db.get(
            `SELECT * FROM waitlist WHERE slot_id = ? AND user_id = ? AND status='WAITING'`,
            [slotId, userId],
            (err3, waiting) => {
              if (err3) return res.status(500).json({ error: err3.message });
              if (waiting) return res.status(409).json({ error: "Already on waitlist" });

              db.run(
                `INSERT INTO waitlist (slot_id, user_id, status) VALUES (?, ?, 'WAITING')`,
                [slotId, userId],
                function (err4) {
                  if (err4) return res.status(500).json({ error: err4.message });
                  return res.json({
                    type: "WAITLISTED",
                    waitlist: { id: this.lastID, slot_id: slotId, user_id: userId, status: "WAITING" },
                  });
                }
              );
            }
          );
        }
      }
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CANCEL booking + auto-promote next waitlisted user
router.post("/bookings/:bookingId/cancel", requireAuth, (req, res) => {
  const bookingId = Number(req.params.bookingId);
  const userId = req.user.id;

  db.get(`SELECT * FROM bookings WHERE id = ?`, [bookingId], (err, booking) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Only the owner can cancel (or later we can allow host)
    if (booking.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

    // Transaction: cancel + promote 1 from waitlist
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.run(
        `UPDATE bookings SET status='CANCELED' WHERE id = ?`,
        [bookingId],
        (err2) => {
          if (err2) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err2.message });
          }

          // Find earliest waitlisted user
          db.get(
            `SELECT * FROM waitlist WHERE slot_id = ? AND status='WAITING'
             ORDER BY created_at ASC LIMIT 1`,
            [booking.slot_id],
            (err3, nextWait) => {
              if (err3) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: err3.message });
              }

              if (!nextWait) {
                db.run("COMMIT");
                return res.json({ canceled: true, promoted: false });
              }

              // Create booking for promoted user
              db.run(
                `INSERT INTO bookings (slot_id, user_id, status) VALUES (?, ?, 'CONFIRMED')`,
                [booking.slot_id, nextWait.user_id],
                function (err4) {
                  if (err4) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err4.message });
                  }

                  // Mark waitlist as promoted
                  db.run(
                    `UPDATE waitlist SET status='PROMOTED' WHERE id = ?`,
                    [nextWait.id],
                    (err5) => {
                      if (err5) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: err5.message });
                      }

                      db.run("COMMIT");
                      return res.json({
                        canceled: true,
                        promoted: true,
                        new_booking_id: this.lastID,
                        promoted_user_id: nextWait.user_id,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
});

// GET user's bookings and waitlists
router.get("/bookings", requireAuth, (req, res) => {
  const userId = req.user.id;
  
  db.all(
    `SELECT b.id as booking_id, b.slot_id, b.status as booking_status, s.start_time, s.end_time 
     FROM bookings b 
     JOIN slots s ON b.slot_id = s.id 
     WHERE b.user_id = ? AND b.status != 'CANCELED'`,
    [userId],
    (err, bookings) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.all(
        `SELECT w.id as waitlist_id, w.slot_id, w.status as waitlist_status, s.start_time, s.end_time 
         FROM waitlist w 
         JOIN slots s ON w.slot_id = s.id 
         WHERE w.user_id = ? AND w.status = 'WAITING'`,
        [userId],
        (err2, waitlists) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ bookings, waitlists });
        }
      );
    }
  );
});

module.exports = router;