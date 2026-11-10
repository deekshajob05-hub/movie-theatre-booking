const params = new URLSearchParams(window.location.search);
const movieId = params.get("movie");
const showId = params.get("show");
let selectedShow = null;
let selectedSeats = [];

function el(tag, text, cls) {
const e = document.createElement(tag);
if (text) e.textContent = text;
if (cls) e.className = cls;
return e;
}

async function init() {
const mres = await fetch("/api/movies");
const movies = await mres.json();
const m = movies.find((x) => String(x.id) === movieId);
if (m) document.getElementById("title").textContent = m.title;

const sres = await fetch("/api/movies/" + movieId + "/shows");
const shows = await sres.json();
selectedShow = shows.find((x) => String(x.id) === showId);
if (!selectedShow) {
document.getElementById("info").textContent = "Show not found";
return;
}
const d = new Date(selectedShow.show_time);
document.getElementById("info").textContent =
(selectedShow.theatre_name || "") + ", " + (selectedShow.mall || "") + " | " +
d.toLocaleDateString([], { day: "numeric", month: "short" }) + " " +
d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " | " + selectedShow.screen;
await drawSeats();
}

async function drawSeats() {
const res = await fetch("/api/bookings/show/" + selectedShow.id + "/seats");
const taken = await res.json();
const box = document.getElementById("seats");
box.textContent = "";
"ABCDE".split("").forEach((row) => {
const line = el("div", "", "seatrow");
for (let n = 1; n <= 8; n++) {
const id = row + n;
const s = el("button", id, "seat");
if (taken.includes(id)) {
s.classList.add("taken");
s.disabled = true;
} else {
s.onclick = () => toggleSeat(id, s);
}
line.appendChild(s);
}
box.appendChild(line);
});
updateTotal();
}

function toggleSeat(id, button) {
const i = selectedSeats.indexOf(id);
if (i >= 0) {
selectedSeats.splice(i, 1);
button.classList.remove("picked");
} else {
selectedSeats.push(id);
button.classList.add("picked");
}
updateTotal();
}

function updateTotal() {
const total = Number(selectedShow.price) * selectedSeats.length;
document.getElementById("total").textContent =
"Seats: " + (selectedSeats.join(", ") || "none") + " | Total: Rs " + total;
}

function goToPayment() {
const msg = document.getElementById("msg");
if (!localStorage.getItem("token")) {
window.location.href = "login.html";
return;
}
if (selectedSeats.length === 0) {
msg.textContent = "Please pick at least one seat";
return;
}
window.location.href = "payment.html?movie=" + movieId + "&show=" + selectedShow.id + "&seats=" + selectedSeats.join(",");
}

init().catch(function (e) {
document.getElementById("info").textContent = "Error: " + e.message;
});