const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

router.post("/signup", async (req, res) => {
try {
const { name, email, password } = req.body;
if (!name || !email || !password) {
return res.status(400).json({ message: "All fields are required" });
}
const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
if (existing.length > 0) {
return res.status(400).json({ message: "Email already registered" });
}
const hash = await bcrypt.hash(password, 10);
await pool.query(
"INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
[name, email, hash]
);
res.status(201).json({ message: "Signup successful" });
} catch (err) {
res.status(500).json({ message: err.message });
}
});

router.post("/login", async (req, res) => {
try {
const { email, password } = req.body;
const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
if (rows.length === 0) {
return res.status(401).json({ message: "Invalid email or password" });
}
const user = rows[0];
const match = await bcrypt.compare(password, user.password_hash);
if (!match) {
return res.status(401).json({ message: "Invalid email or password" });
}
const token = jwt.sign(
{ id: user.id, role: user.role },
process.env.JWT_SECRET,
{ expiresIn: "1d" }
);
res.json({ token: token, name: user.name });
} catch (err) {
res.status(500).json({ message: err.message });
}
});

module.exports = router;