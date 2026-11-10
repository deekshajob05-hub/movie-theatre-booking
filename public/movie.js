const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");
let selectedShow = null;
let selectedSeats = [];

function el(tag, text, cls) {
const e = document.createElement(tag);
if (text) e.textContent = text;
if (cls) e.className = cls;
return e;
}

async function loadMovie() {
const res = await fetch("/api/movies");
const movies = await res.json();
const m = movies.find((x) => String(x.id) === movieId);
if (m) document.getElementById("title").textContent = m.title;
}

async function loadShows() {
const res = await fetch("/api/movies/" + movieId + "/shows");
const shows = await res.json();
const box = document.getElementById("shows");
box.textContent = "";
const groups = {};
shows.forEach((s) => {
const key = s.theatre_name || "Other theatre";
if (!groups[key]) groups[key] = { info: s, list: [] };
groups[key].list.push(s);
});
Object.keys(groups).forEach((name) => {
const g = groups[name];
const card = el("div", "", "theatre");
card.appendChild(el("h4", name));
card.appendChild(el("p", (g.info.mall || "") + (g.info.area ? ", " + g.info.area : ""), "meta"));
const times = el("div", "", "row");
g.list.forEach((s) => {
const d = new Date(s.show_time);
const label = d.toLocaleDateString([], { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " | Rs " + s.price;
const b = el("button", label, "time");
b.onclick = () => { window.location.href = "seats.html?movie=" + movieId + "&show=" + s.id; };
times.appendChild(b);
});
card.appendChild(times);
box.appendChild(card);
});
}

async function chooseShow(show) {
selectedShow = show;
selectedSeats = [];
document.getElementById("seatArea").classList.remove("hidden");
document.getElementById("msg").textContent = "";
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

async function bookSeats() {
const msg = document.getElementById("msg");
const token = localStorage.getItem("token");
if (!token) {
window.location.href = "login.html";
return;
}
if (selectedSeats.length === 0) {
msg.textContent = "Please pick at least one seat";
return;
}
const res = await fetch("/api/bookings", {
method: "POST",
headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
body: JSON.stringify({ showId: selectedShow.id, seats: selectedSeats })
});
const data = await res.json();
if (res.status === 401) {
window.location.href = "login.html";
return;
}
msg.textContent = res.ok ? "Booking confirmed! Total Rs " + data.total : data.message;
selectedSeats = [];
await drawSeats();
}

loadMovie();
loadShows();