const crypto = require('crypto');
const Donation = require('../models/Donation');

exports.razorpayWebhook = async (req, res, next) => {
  try {
    const secret = process.env.WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body; // raw buffer string
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expected !== signature) {
      console.warn('Invalid Razorpay webhook signature');
      return res.status(401).send('invalid signature');
    }

    const payload = JSON.parse(body.toString());
    // log the payload to DB (WebhookLog) for idempotency/replay safety (omitted here)
    // handle event types
    if (payload.event === 'payment.captured' || payload.event === 'payment.authorized') {
      const payment = payload.payload.payment.entity;
      // payment has order_id, id, amount
      const orderId = payment.order_id;
      const donation = await Donation.findOne({ providerOrderId: orderId });
      if (!donation) {
        console.warn('Donation not found for order', orderId);
        return res.status(200).send('ok');
      }
      // idempotency: if already paid, skip
      if (donation.status === 'paid') return res.status(200).send('ok');

      donation.status = 'paid';
      donation.providerPaymentId = payment.id;
      donation.paidAt = new Date();
      await donation.save();

      // create ledger entry, email receipt, etc.
    }

    // handle refunds, failed payments etc.

    return res.status(200).send('ok');
  } catch (err) {
    next(err);
  }
};
