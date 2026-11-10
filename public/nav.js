(function () {
var nav = document.querySelector(".nav");
if (!nav) return;
var links = document.createElement("div");
links.className = "navlinks";

function addLink(text, href) {
var a = document.createElement("a");
a.textContent = text;
a.href = href;
links.appendChild(a);
return a;
}

var token = localStorage.getItem("token");
addLink("Movies", "index.html");
if (token) {
addLink("My Bookings", "mybookings.html");
var out = addLink("Logout (" + localStorage.getItem("name") + ")", "#");
out.onclick = function () {
localStorage.removeItem("token");
localStorage.removeItem("name");
window.location.href = "login.html";
};
} else {
addLink("Login", "login.html");
}
nav.appendChild(links);
})();