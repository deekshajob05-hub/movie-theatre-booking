const msg = document.getElementById("msg");

async function send(path, body) {
const res = await fetch("/api/auth/" + path, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body)
});
return { ok: res.ok, data: await res.json() };
}

function value(id) {
return document.getElementById(id).value;
}

async function doLogin() {
const r = await send("login", { email: value("email"), password: value("password") });
if (r.ok) {
localStorage.setItem("token", r.data.token);
localStorage.setItem("name", r.data.name);
window.location.href = "index.html";
} else {
msg.textContent = r.data.message;
}
}

async function doSignup() {
const r = await send("signup", { name: value("name"), email: value("email"), password: value("password") });
msg.textContent = r.ok ? "Signup successful, now click Login" : r.data.message;
}