const nodemailer = require('nodemailer');
const { createTokenHash } = require('./token');

const FROM = process.env.EMAIL_FROM || 'no-reply@example.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// configure transporter via env (SendGrid SMTP or SES)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmailMagicLink(email, token) {
  const link = `${FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
    <p>Click the link to sign in (expires in 24 hours).</p>
    <p><a href="${link}">Verify email</a></p>
  `;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Your magic link',
    html
  });
}

module.exports = { sendEmailMagicLink, transporter };
