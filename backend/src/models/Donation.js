const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  amount_paise: { type: Number, required: true }, // integer paise
  currency: { type: String, default: 'INR' },
  provider: { type: String, default: 'razorpay' },
  providerOrderId: { type: String }, // razorpay order id
  providerPaymentId: { type: String }, // razorpay payment id (from webhook)
  status: { type: String, enum: ['created','paid','failed','refunded'], default: 'created' },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date }
});

module.exports = mongoose.model('Donation', donationSchema);
