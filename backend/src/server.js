require('dotenv').config();
const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/verification_dev';

async function start() {
  try {
    // NOTE: modern mongoose (v6+) doesn't require useNewUrlParser / useUnifiedTopology options.
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
