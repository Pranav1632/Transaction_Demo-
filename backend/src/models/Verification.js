const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  target: { type: String, required: true }, // phone or email
  channel: { type: String, enum: ['phone','email'], required: true },
  purpose: { type: String, enum: ['login','link','verify-email'], default: 'login' },
  tokenHash: { type: String }, // hashed magic link token (for email)
  expiresAt: { type: Date },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});
verificationSchema.index({ target: 1, channel: 1 });

module.exports = mongoose.model('Verification', verificationSchema);
