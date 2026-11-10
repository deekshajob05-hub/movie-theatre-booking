const params = new URLSearchParams(window.location.search);
const movieId = params.get("movie");
const showId = params.get("show");
const seats = (params.get("seats") || "").split(",").filter(Boolean);
let show = null;
let method = "";

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function pickMethod(name, button) {
  method = name;
  document.querySelectorAll(".method").forEach((b) => b.classList.remove("on"));
  button.classList.add("on");
}

async function init() {
  const mres = await fetch("/api/movies");
  const movies = await mres.json();
  const m = movies.find((x) => String(x.id) === movieId);
  const sres = await fetch("/api/movies/" + movieId + "/shows");
  const shows = await sres.json();
  show = shows.find((x) => String(x.id) === showId);
  if (!m || !show || seats.length === 0) {
    setText("summary", "Invalid booking details");
    return;
  }
  const d = new Date(show.show_time);
  setText("summary", m.title + " | " + (show.theatre_name || "") + ", " + (show.mall || "") + " | " +
    d.toLocaleDateString([], { day: "numeric", month: "short" }) + " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  setText("seatline", "Seats: " + seats.join(", "));
  setText("amount", "Amount to pay: Rs " + Number(show.price) * seats.length);
}

async function pay() {
  const msg = document.getElementById("msg");
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  if (!show) return;
  if (!method) {
    msg.textContent = "Please choose a payment method";
    return;
  }
  const btn = document.getElementById("payBtn");
  btn.disabled = true;
  msg.textContent = "Processing payment with " + method + "...";
  await new Promise((r) => setTimeout(r, 2000));
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ showId: show.id, seats: seats })
  });
  const data = await res.json();
  if (res.status === 401) {
    window.location.href = "login.html";
    return;
  }
  if (res.ok) {
    window.location.href = "confirmation.html?id=" + data.bookingId;
    return;
  }
  msg.textContent = data.message + ". Please go back and choose other seats.";
  btn.disabled = false;
}

init().catch(function (e) {
  setText("summary", "Error: " + e.message);
});