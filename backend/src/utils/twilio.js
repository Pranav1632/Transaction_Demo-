const Twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

let client = null;
if (accountSid && authToken) client = Twilio(accountSid, authToken);

async function startTwilioVerification(phone) {
  if (!client || !verifyServiceSid) {
    console.warn('Twilio not configured - skipping actual send in dev');
    return;
  }
  return client.verify.services(verifyServiceSid).verifications.create({
    to: phone,
    channel: 'sms'
  });
}

async function checkTwilioVerification(phone, code) {
  if (!client || !verifyServiceSid) {
    console.warn('Twilio not configured - assuming success in dev');
    return true; // in dev mode, skip verification if not configured
  }
  const resp = await client.verify.services(verifyServiceSid).verificationChecks.create({
    to: phone,
    code
  });
  return resp && resp.status === 'approved';
}

module.exports = { startTwilioVerification, checkTwilioVerification };
