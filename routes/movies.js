const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
try {
const [rows] = await pool.query("SELECT * FROM movies ORDER BY id");
res.json(rows);
} catch (err) {
res.status(500).json({ message: err.message });
}
});

router.get("/:id/shows", async (req, res) => {
try {
const [rows] = await pool.query(
"SELECT s.*, t.name AS theatre_name, t.mall, t.area FROM shows s LEFT JOIN theatres t ON s.theatre_id = t.id WHERE s.movie_id = ? AND s.show_time > NOW() ORDER BY t.name, s.show_time",
[req.params.id]
);
res.json(rows);
} catch (err) {
res.status(500).json({ message: err.message });
}
});

module.exports = router;