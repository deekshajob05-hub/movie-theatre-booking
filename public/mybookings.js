function el(tag, text, cls) {
const e = document.createElement(tag);
if (text) e.textContent = text;
if (cls) e.className = cls;
return e;
}

async function cancelBooking(id) {
if (!confirm("Cancel this booking?")) return;
const token = localStorage.getItem("token");
const res = await fetch("/api/bookings/" + id, {
method: "DELETE",
headers: { Authorization: "Bearer " + token }
});
const data = await res.json();
alert(data.message);
window.location.reload();
}

async function loadBookings() {
const token = localStorage.getItem("token");
if (!token) {
window.location.href = "login.html";
return;
}
const res = await fetch("/api/bookings/my", {
headers: { Authorization: "Bearer " + token }
});
if (res.status === 401) {
window.location.href = "login.html";
return;
}
const bookings = await res.json();
const box = document.getElementById("list");
if (bookings.length === 0) {
document.getElementById("empty").textContent = "No bookings yet";
return;
}
bookings.forEach((b) => {
const card = el("div", "", "card bk");
card.appendChild(el("h3", b.title));
card.appendChild(el("p", new Date(b.show_time).toLocaleString() + " | " + b.screen, "meta"));
card.appendChild(el("p", "Seats: " + b.seats, "desc"));
card.appendChild(el("span", "Total: Rs " + b.total_amount, "rating"));
if (new Date(b.show_time) > new Date()) {
const btn = el("button", "Cancel booking", "btn cancel");
btn.onclick = () => cancelBooking(b.id);
card.appendChild(btn);
}
box.appendChild(card);
});
}

loadBookings();