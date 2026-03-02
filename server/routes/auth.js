const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db/database");
const { signUser, requireAuth } = require("../utils/auth");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "name, email, password, role required" });
  }
  if (!["HOST", "USER"].includes(role)) {
    return res.status(400).json({ error: "role must be HOST or USER" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [name, email.toLowerCase(), password_hash, role],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(409).json({ error: "Email already in use" });
          }
          return res.status(500).json({ error: err.message });
        }

        const user = { id: this.lastID, name, email: email.toLowerCase(), role };
        const token = signUser(user);
        res.json({ user, token });
      }
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  db.get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase()], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = signUser(user);
    res.json({ user, token });
  });
});

// Who am I (test auth)
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;