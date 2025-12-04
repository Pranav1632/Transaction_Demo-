const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const VERIFICATION_TOKEN_SECRET = process.env.VERIFICATION_TOKEN_SECRET || 'verif_secret';

function createTokenHash(token) {
  // HMAC-SHA256
  return crypto.createHmac('sha256', VERIFICATION_TOKEN_SECRET).update(token).digest('hex');
}

function jwtSign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { createTokenHash, jwtSign };
