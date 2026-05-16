require('dotenv').config();

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
}

process.env.JWT_SECRET = process.env.JWT_SECRET || 'smart_kisan_secret_123';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'smart_kisan_refresh_secret_456';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const express    = require('express');
const mongoose   = require('mongoose');
const helmet     = require('helmet');
const cors       = require('cors');
const morgan     = require('morgan');
const authRoutes = require('./routes/auth');
const AuthUser   = require('./models/AuthUser');

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

async function connectMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan';
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
    
    // CRITICAL: Drop the old unique email index if it exists
    // This is the most likely cause of "Email Required" or "Duplicate Key" errors
    try {
       await AuthUser.collection.dropIndex('email_1');
       console.log('🗑️  Dropped legacy unique email index');
    } catch (e) {
       // Index might not exist, ignore
    }
    
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed, using in-memory fallback');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri() + 'smart-kisan');
  }
}

connectMongo().then(async () => {
  // Updated Seed Logic: Use Phone instead of Email
  try {
    const bcrypt = require('bcryptjs');
    const demoPhone = '9999999999';
    const exists = await AuthUser.findOne({ phone: demoPhone });
    if (!exists) {
      const hashedPassword = await bcrypt.hash('kisan123', 10);
      await new AuthUser({ 
        phone: demoPhone, 
        password: hashedPassword, 
        name: 'Smart Farmer', 
        role: 'farmer' 
      }).save();
      console.log('🌱 Demo user seeded: 9999999999 / kisan123');
    }
  } catch (seedErr) {
    console.warn('⚠️ Could not seed demo user:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`🔐 Auth Service running on port ${PORT}`);
  });
});
