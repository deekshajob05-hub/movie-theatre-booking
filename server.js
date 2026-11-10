require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const movieRoutes = require("./routes/movies");
app.use("/api/movies", movieRoutes);
const bookingRoutes = require("./routes/bookings");
app.use("/api/bookings", bookingRoutes);
app.get("/api/health", async (req, res) => {
try {
const [rows] = await pool.query("SELECT 1 AS ok");
res.json({ status: "ok", db: rows[0].ok });
} catch (err) {
res.status(500).json({ status: "error", message: err.message });
}
});

app.listen(process.env.PORT, () => {
console.log("Server running on port " + process.env.PORT);
});