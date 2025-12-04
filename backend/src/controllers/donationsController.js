const Razorpay = require('razorpay');
const Donation = require('../models/Donation');
// optionally require Auth middleware to attach req.user

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createDonation = async (req, res, next) => {
  try {
    const { amount, currency='INR', metadata = {} } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success:false, error:{ message:'Invalid amount' }});

    const amountPaise = Math.round(Number(amount) * 100); // e.g. 500.50 => 50050 paise
    const donation = await Donation.create({
      userId: req.user?._id || null,
      amount_paise: amountPaise,
      currency,
      metadata,
      status: 'created'
    });

    // create razorpay order
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt: `donation_${donation._id}`,
      payment_capture: 1 // auto capture
    });

    donation.providerOrderId = order.id;
    await donation.save();

    return res.json({
      success: true,
      data: {
        donationId: donation._id,
        orderId: order.id,
        amount: donation.amount_paise,
        currency,
        key_id: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id).lean();
    if (!donation) return res.status(404).json({ success:false, error:{ message:'Not found' }});
    return res.json({ success:true, data: { status: donation.status, donation }});
  } catch (err) {
    next(err);
  }
};
