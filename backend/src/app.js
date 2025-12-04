// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit'); 
const donationRoutes = require('./routes/donations');
const authRoutes = require('./routes/authRoutes');
const webhookRoutes = require('./routes/webhooks');

const cookieParser = require('cookie-parser'); // if you plan to use cookies
const app = express();

// security headers
app.use(helmet());

// CORS - allow credentials for cookie sessions (frontend must use credentials:'include')
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// parse cookies (if you use cookie sessions)
app.use(cookieParser());

// IMPORTANT: mount webhook route(s) BEFORE body parser so raw body is available
// webhookRoutes should register route using express.raw({ type: 'application/json' })
app.use('/webhooks', webhookRoutes);

// Now parse JSON normally for other routes
app.use(express.json());

// Rate-limiters: apply more narrowly (example: auth & donation creation)
const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter); // light global cap to avoid abuse overall

// stronger limiter for auth endpoints (OTP)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator // ✅ correct way
});

// mount auth routes with limiter
app.use('/auth', authLimiter, authRoutes);

// donations routes (you can add a limiter specifically if needed)
app.use('/donations', donationRoutes);

// health
app.get('/', (req, res) => res.json({ success: true, message: 'Verification backend running' }));

// error handler (keep at end)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success:false, error: { message: err.message || 'Internal Server Error' }});
});

module.exports = app;





// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const donationRoutes = require('./routes/donations');
// const authRoutes = require('./routes/authRoutes');
// const webhookRoutes = require('./routes/webhooks');
// const app = express();

// app.use(helmet());
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());

// // Basic rate limiter for auth endpoints
// const limiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 200, // general cap (tune in production)
//   standardHeaders: true,
//   legacyHeaders: false
// });
// app.use(limiter);

// app.get('/', (req, res) => res.json({ success: true, message: 'Verification backend running' }));
// app.use('/donations', donationRoutes);
// app.use('/auth', authRoutes);
// app.use('/webhooks', webhookRoutes);

// // error handler
// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(err.status || 500).json({ success:false, error: { message: err.message || 'Internal Server Error' }});
// });

// module.exports = app;
