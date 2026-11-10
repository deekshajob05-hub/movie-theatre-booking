const params = new URLSearchParams(window.location.search);
const bookingId = params.get("id");

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

async function init() {
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
  const list = await res.json();
  const b = list.find((x) => String(x.id) === bookingId);
  if (!b) {
    setText("heading", "Booking not found");
    return;
  }
  const d = new Date(b.show_time);
  setText("heading", "Booking confirmed!");
  setText("note", "Payment successful. Thank you, " + localStorage.getItem("name") + ". Your seats are booked.");
  setText("tmovie", b.title);
  setText("ttheatre", (b.theatre_name || "") + ", " + (b.mall || "") + " | " + b.screen);
  setText("ttime", d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) + " at " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  setText("tseats", "Seats: " + b.seats);
  setText("ttotal", "Total paid: Rs " + b.total_amount);
  setText("tid", "Booking ID: CB" + String(b.id).padStart(5, "0"));
}

init().catch(function (e) {
  setText("heading", "Error: " + e.message);
});