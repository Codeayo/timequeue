const express = require("express");
const cors = require("cors");
const db = require("./db/database");
const authRoutes = require("./routes/auth");
const slotRoutes = require("./routes/slots"); // 👈 ADD THIS
const bookingRoutes = require("./routes/bookings");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/slots", slotRoutes); // 👈 ADD THIS
app.use("/api", bookingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "DineQueue API running ✅" });
});

app.get("/api/health", (req, res) => {
  db.get("SELECT 1 AS ok", (err, row) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true, db: row.ok });
  });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});