const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

async function sendMail(to, subject, text) {
  await transporter.sendMail({
    from: "CineBook <" + process.env.MAIL_USER + ">",
    to: to,
    subject: subject,
    text: text
  });
}

module.exports = sendMail;