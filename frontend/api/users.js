const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// --- MongoDB Configuration ---
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Database connection configuration (MONGODB_URI) is missing.');
  cachedDb = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return cachedDb;
}

// --- UserProfile Model ---
const UserProfileSchema = new mongoose.Schema({
  userId:   { type: String, required: true, unique: true, index: true },
  phone:    { type: String },
  name:     { type: String, default: '' },
  email:    { type: String, default: '' },
  role:     { type: String, enum: ['farmer', 'buyer', 'labour', 'admin'], default: 'farmer' },
  language: { type: String, enum: ['en', 'hi', 'pa', 'ta', 'te'], default: 'hi' },
  location: {
    lat:      { type: Number },
    lng:      { type: Number },
    village:  { type: String, default: '' },
    district: { type: String, default: '' },
    state:    { type: String, default: '' },
    pincode:  { type: String, default: '' },
  },
  farmDetails: {
    landArea:   { type: Number },    // in acres
    soilType:   { type: String, enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other'] },
    irrigation: { type: String, enum: ['rain-fed', 'canal', 'borewell', 'drip', 'other'] },
  },
  profilePic: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);

const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token provided');
  }
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smart_kisan_secret_123');
  if (!decoded.userId) {
    throw new Error('Unauthorized: Invalid token payload');
  }
  return decoded;
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const userDecoded = verifyToken(req);
    const userId = userDecoded.userId;

    await connectToDatabase();
    
    const endpoint = req.url.split('?')[0].split('/').pop();

    if (req.method === 'GET' && endpoint === 'profile') {
      let profile = await UserProfile.findOne({ userId });
      if (!profile) {
        profile = new UserProfile({ 
          userId, 
          email: userDecoded.email || '', 
          phone: userDecoded.phone || '',
          role: userDecoded.role || 'farmer', 
          name: 'Smart Farmer',
          location: { village: 'Satna', district: 'Satna', state: 'Madhya Pradesh' }
        });
        await profile.save();
      }
      return res.json({ success: true, data: profile });
    }

    if (req.method === 'POST' && endpoint === 'profile') {
      const { name, language, location, farmDetails, phone, email, profilePic } = req.body;
      
      const updateData = {
        userId,
        email: email || userDecoded.email || '',
        phone: phone || userDecoded.phone || '',
        role: userDecoded.role || 'farmer'
      };

      if (name !== undefined) updateData.name = name;
      if (language !== undefined) updateData.language = language;
      if (location !== undefined) updateData.location = location;
      if (farmDetails !== undefined) updateData.farmDetails = farmDetails;
      if (profilePic !== undefined) updateData.profilePic = profilePic;

      const profile = await UserProfile.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, upsert: true, runValidators: true }
      );
      return res.json({ success: true, data: profile });
    }

    if (req.method === 'PATCH' && endpoint === 'language') {
      const { language } = req.body;
      const valid = ['en', 'hi', 'pa', 'ta', 'te'];
      if (!valid.includes(language)) {
        return res.status(400).json({ success: false, message: 'Invalid language code' });
      }
      await UserProfile.updateOne({ userId }, { $set: { language } });
      return res.json({ success: true, message: 'Language updated' });
    }

    if (req.method === 'PATCH' && endpoint === 'location') {
      const { lat, lng, village, district, state, pincode } = req.body;
      await UserProfile.updateOne({ userId }, { $set: { location: { lat, lng, village, district, state, pincode } } });
      return res.json({ success: true, message: 'Location updated' });
    }

    if (req.method === 'GET' && endpoint === 'all') {
      if (userDecoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
      }
      const users = await UserProfile.find().select('-__v').limit(100);
      return res.json({ success: true, data: users });
    }

    return res.status(404).json({ success: false, message: 'User endpoint not found' });
  } catch (error) {
    console.error('User serverless error:', error);
    let msg = error.message || 'Internal server error';
    if (msg.includes('mongodb') || msg.includes('mongodb+srv') || msg.includes('Cluster') || msg.includes('@') || msg.includes('URI')) {
      msg = 'Database connection error. Please check configuration.';
    }
    return res.status(error.message.includes('Unauthorized') ? 401 : 500).json({ success: false, message: msg });
  }
};
