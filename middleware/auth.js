const jwt = require("jsonwebtoken");

function requireLogin(req, res, next) {
const header = req.headers.authorization;
if (!header) {
return res.status(401).json({ message: "Please login first" });
}
const token = header.split(" ")[1];
try {
const data = jwt.verify(token, process.env.JWT_SECRET);
req.user = data;
next();
} catch (err) {
res.status(401).json({ message: "Invalid or expired token" });
}
}

module.exports = requireLogin;