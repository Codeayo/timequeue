const express = require("express");
const cors = require("cors");
const db = require("./db/database");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "TimeQueue API running ✅" });
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