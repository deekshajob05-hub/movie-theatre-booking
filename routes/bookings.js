const express = require("express");
const pool = require("../config/db");
const requireLogin = require("../middleware/auth");
const sendMail = require("../config/mailer");

const router = express.Router();

function sendTicket(userId, showId, seats, bookingId, total) {
  pool.query(
    "SELECT u.name, u.email, m.title, s.show_time, s.screen, t.name AS theatre_name, t.mall FROM shows s JOIN movies m ON s.movie_id = m.id LEFT JOIN theatres t ON s.theatre_id = t.id JOIN users u ON u.id = ? WHERE s.id = ?",
    [userId, showId]
  ).then(([rows]) => {
    if (rows.length === 0) return;
    const i = rows[0];
    const when = new Date(i.show_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const text =
      "Hi " + i.name + ",\n\n" +
      "Your booking is confirmed.\n\n" +
      "Booking ID: CB" + String(bookingId).padStart(5, "0") + "\n" +
      "Movie: " + i.title + "\n" +
      "Theatre: " + (i.theatre_name || "") + ", " + (i.mall || "") + "\n" +
      "Show time: " + when + "\n" +
      "Screen: " + i.screen + "\n" +
      "Seats: " + seats.join(", ") + "\n" +
      "Total paid: Rs " + total + "\n\n" +
      "Enjoy the movie!\nCineBook";
    return sendMail(i.email, "CineBook booking confirmed: " + i.title, text);
  }).catch((e) => console.log("Email failed: " + e.message));
}

router.get("/show/:showId/seats", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT seat_number FROM booked_seats WHERE show_id = ?",
      [req.params.showId]
    );
    res.json(rows.map((r) => r.seat_number));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", requireLogin, async (req, res) => {
  const { showId, seats } = req.body;
  if (!showId || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: "Show and seats are required" });
  }
  const validSeat = /^[A-E][1-8]$/;
  const allValid = seats.every((s) => validSeat.test(s));
  if (!allValid || new Set(seats).size !== seats.length) {
    return res.status(400).json({ message: "Invalid seat selection" });
  }

  const conn = await pool.getConnection();
  try {
    const [shows] = await conn.query(
      "SELECT price FROM shows WHERE id = ? AND show_time > NOW()",
      [showId]
    );
    if (shows.length === 0) {
      return res.status(404).json({ message: "Show not found" });
    }
    const total = shows[0].price * seats.length;

    await conn.beginTransaction();
    const [result] = await conn.query(
      "INSERT INTO bookings (user_id, show_id, total_amount) VALUES (?, ?, ?)",
      [req.user.id, showId, total]
    );
    for (const seat of seats) {
      await conn.query(
        "INSERT INTO booked_seats (booking_id, show_id, seat_number) VALUES (?, ?, ?)",
        [result.insertId, showId, seat]
      );
    }
    await conn.commit();
    res.status(201).json({ message: "Booking confirmed", bookingId: result.insertId, total: total });
    sendTicket(req.user.id, showId, seats, result.insertId, total);
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "One or more seats are already booked" });
    }
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
});

router.get("/my", requireLogin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT b.id, b.total_amount, b.booked_at, m.title, s.show_time, s.screen, t.name AS theatre_name, t.mall, GROUP_CONCAT(bs.seat_number ORDER BY bs.seat_number) AS seats FROM bookings b JOIN shows s ON b.show_id = s.id JOIN movies m ON s.movie_id = m.id LEFT JOIN theatres t ON s.theatre_id = t.id JOIN booked_seats bs ON bs.booking_id = b.id WHERE b.user_id = ? GROUP BY b.id, m.title, s.show_time, s.screen, t.name, t.mall ORDER BY b.booked_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", requireLogin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT b.id, (s.show_time > NOW()) AS upcoming FROM bookings b JOIN shows s ON b.show_id = s.id WHERE b.id = ? AND b.user_id = ?",
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (!rows[0].upcoming) {
      return res.status(400).json({ message: "This show has already started" });
    }
    await pool.query("DELETE FROM bookings WHERE id = ?", [req.params.id]);
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;