const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Verification = require('../models/Verification');
const { sendEmailMagicLink } = require('../utils/emails');
const { startTwilioVerification, checkTwilioVerification } = require('../utils/twilio');
const { jwtSign, createTokenHash } = require('../utils/token');
const { verificationSecret } = require('../config/utilsConfig') || {};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

function genericSuccess(res) {
  return res.status(202).json({ success: true, data: { message: 'If this target exists we sent a code/magic-link' }});
}

exports.startVerification = async (req, res, next) => {
  try {
    const { method, target, purpose } = req.body;
    if (!method || !target) return res.status(400).json({ success:false, error:{ message:'method and target required' }});

    const ip = req.ip;
    const ua = req.get('User-Agent');

    if (method === 'phone') {
      // call Twilio verify API to send OTP
      await startTwilioVerification(target);
      // log attempt in Verification (optional)
      await Verification.create({ target, channel: 'phone', purpose: purpose || 'login', ip, userAgent: ua });
      return genericSuccess(res);
    }

    if (method === 'email') {
      // create magic link token and save hash
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = createTokenHash(token);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      await Verification.create({ target, channel: 'email', tokenHash, expiresAt, purpose: purpose || 'login', ip, userAgent: ua });
      // send email (async)
      await sendEmailMagicLink(target, token);
      return genericSuccess(res);
    }

    return res.status(400).json({ success:false, error:{ message:'unsupported method' }});
  } catch (err) {
    next(err);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const { method, phone, code, token, email, purpose } = req.body;
    const ip = req.ip;

    if (method === 'phone') {
      if (!phone || !code) return res.status(400).json({ success:false, error:{ message:'phone and code required' }});
      // verify with Twilio
      const ok = await checkTwilioVerification(phone, code);
      if (!ok) return res.status(401).json({ success:false, error:{ message:'Invalid or expired code' }});

      // find or create user
      let user = await User.findOne({ phone });
      if (!user) {
        user = await User.create({ phone, isPhoneVerified: true, authMethods: ['phone'] });
      } else {
        user.isPhoneVerified = true;
        if (!user.authMethods.includes('phone')) user.authMethods.push('phone');
        user.lastLogin = new Date();
        await user.save();
      }

      const sessionToken = jwt.sign({ sub: user._id, methods: user.authMethods }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success:true, data: { token: sessionToken, user }});
    }

    if (method === 'email') {
      if ((req.body.type === 'magic_link' && !token) && (req.body.type === 'code' && !code && !email)) {
        return res.status(400).json({ success:false, error:{ message:'token or code required' }});
      }

      // magic link path
      if (req.body.type === 'magic_link') {
        // hash token and find verification
        const tokenHash = createTokenHash(token);
        const v = await Verification.findOne({ tokenHash, channel: 'email', used: false });
        if (!v) return res.status(401).json({ success:false, error:{ message:'Invalid or expired token' }});
        if (v.expiresAt && v.expiresAt < new Date()) return res.status(401).json({ success:false, error:{ message:'Expired token' }});

        // find or create user by email
        let user = await User.findOne({ email: v.target });
        if (!user) {
          user = await User.create({ email: v.target, isEmailVerified: true, authMethods: ['email'] });
        } else {
          // conflict: target already belongs to another user? handled by unique indexes typically
          user.isEmailVerified = true;
          if (!user.authMethods.includes('email')) user.authMethods.push('email');
          user.lastLogin = new Date();
          await user.save();
        }

        v.used = true;
        v.userId = user._id;
        await v.save();

        const sessionToken = jwt.sign({ sub: user._id, methods: user.authMethods }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ success:true, data: { token: sessionToken, user }});
      }

      // code path not implemented here (could be similar)
      return res.status(400).json({ success:false, error:{ message:'Unsupported email verify type' }});
    }

    return res.status(400).json({ success:false, error:{ message:'Invalid method' }});
  } catch (err) {
    next(err);
  }
};

exports.resend = async (req, res, next) => {
  try {
    const { method, target, purpose } = req.body;
    // To avoid enumeration, simply act like start
    return await this.startVerification(req, res, next);
  } catch (err) {
    next(err);
  }
};
