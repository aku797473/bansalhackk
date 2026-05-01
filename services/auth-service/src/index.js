require('dotenv').config();

// Also load .env.runtime if it exists (written by start-lite.js)
const path = require('path');
const fs   = require('fs');
const runtimeEnv = path.join(__dirname, '..', '..', '..', '.env.runtime');
if (fs.existsSync(runtimeEnv)) {
  const lines = fs.readFileSync(runtimeEnv, 'utf8').split('\n');
  lines.forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
  console.log('✅ Loaded runtime env from .env.runtime');
}

// Ensure JWT secrets exist even if .env.runtime is missing
process.env.JWT_SECRET = process.env.JWT_SECRET || 'smart_kisan_secret_123';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'smart_kisan_refresh_secret_456';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


const express    = require('express');
const mongoose   = require('mongoose');
const helmet     = require('helmet');
const cors       = require('cors');
const morgan     = require('morgan');
const authRoutes = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 5001;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'auth-service', mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// ─── Robust MongoDB connect with in-memory fallback ───────────────────────────
async function connectMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan';

  // First try the configured URI
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('✅ MongoDB connected:', uri.replace(/\/\/.*@/, '//***@'));
    return;
  } catch (err) {
    console.warn('⚠️  Cannot connect to MongoDB at configured URI:', err.message);
  }

  // Fallback: spin up an in-memory MongoDB
  console.log('🔄 Falling back to in-memory MongoDB...');
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod   = await MongoMemoryServer.create();
    const memUri   = mongod.getUri() + 'smart-kisan';
    await mongoose.connect(memUri);
    console.log('✅ In-memory MongoDB started:', memUri);

    // Keep memory server alive with process
    process.on('SIGINT',  async () => { await mongod.stop(); process.exit(0); });
    process.on('SIGTERM', async () => { await mongod.stop(); process.exit(0); });
  } catch (memErr) {
    console.error('❌ Could not start in-memory MongoDB either:', memErr.message);
    process.exit(1);
  }
}

connectMongo().then(async () => {
  // Seed demo user for testing/hackathon stability
  try {
    const AuthUser = require('./models/AuthUser');
    const bcrypt = require('bcryptjs');
    const demoEmail = 'farmer@smartkisan.com';
    const exists = await AuthUser.findOne({ email: demoEmail });
    if (!exists) {
      const hashedPassword = await bcrypt.hash('farmer123', 10);
      await new AuthUser({ 
        email: demoEmail, 
        password: hashedPassword, 
        name: 'Smart Farmer', 
        role: 'farmer' 
      }).save();
      console.log('🌱 Demo user seeded: farmer@smartkisan.com / farmer123');
    }
  } catch (seedErr) {
    console.warn('⚠️ Could not seed demo user:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`🔐 Auth Service running on port ${PORT}`);
    console.log(`   JWT_SECRET set: ${!!process.env.JWT_SECRET}`);
    console.log(`   JWT_REFRESH_SECRET set: ${!!process.env.JWT_REFRESH_SECRET}`);
  });
});
