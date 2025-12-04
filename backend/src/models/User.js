const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, index: true, sparse: true },
  isPhoneVerified: { type: Boolean, default: false },
  email: { type: String, lowercase: true, index: true, sparse: true },
  isEmailVerified: { type: Boolean, default: false },
  authMethods: { type: [String], default: [] }, // e.g., ["phone","email"]
  linkedAccounts: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
