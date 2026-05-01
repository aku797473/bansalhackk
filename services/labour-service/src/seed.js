const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config({ path: '../../.env.runtime' });

const seedJobs = [
  {
    postedBy: 'admin',
    title: 'Wheat Harvesting Workers Needed',
    description: 'Looking for 10 workers for wheat harvesting. 5 days work.',
    category: 'harvesting',
    location: { village: 'Pipariya', district: 'Rewa', state: 'Madhya Pradesh', lat: 24.5373, lng: 81.3039 },
    wage: 500,
    wageUnit: 'per day',
    workersNeeded: 10,
    contactNumber: '9876543210',
    status: 'open'
  },
  {
    postedBy: 'admin',
    title: 'Sowing Help for Soybean',
    description: 'Expert sowing workers needed for 20 acres land.',
    category: 'sowing',
    location: { village: 'Dewas Naka', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7500, lng: 75.9000 },
    wage: 450,
    wageUnit: 'per day',
    workersNeeded: 5,
    contactNumber: '9988776655',
    status: 'open'
  },
  {
    postedBy: 'admin',
    title: 'Sugarcane Cutting Team',
    description: 'Need a team for sugarcane cutting and transport.',
    category: 'harvesting',
    location: { village: 'Hadapsar', district: 'Pune', state: 'Maharashtra', lat: 18.5000, lng: 73.9000 },
    wage: 600,
    wageUnit: 'per day',
    workersNeeded: 20,
    contactNumber: '8877665544',
    status: 'open'
  },
  {
    postedBy: 'admin',
    title: 'Irrigation Setup Workers',
    description: 'Workers needed to install drip irrigation systems.',
    category: 'irrigation',
    location: { village: 'Ambala Cantt', district: 'Ambala', state: 'Haryana', lat: 30.3300, lng: 76.8300 },
    wage: 550,
    wageUnit: 'per day',
    workersNeeded: 3,
    contactNumber: '7766554433',
    status: 'open'
  },
  {
    postedBy: 'admin',
    title: 'Potato Sorting & Packing',
    description: 'Workers for sorting and packing potatoes in cold storage.',
    category: 'storage',
    location: { village: 'Jalandhar City', district: 'Jalandhar', state: 'Punjab', lat: 31.3200, lng: 75.5700 },
    wage: 400,
    wageUnit: 'per day',
    workersNeeded: 15,
    contactNumber: '6655443322',
    status: 'open'
  }
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  
  await Job.deleteMany({ postedBy: 'admin' });
  await Job.insertMany(seedJobs);
  
  console.log('✅ Labour Seed Data Inserted!');
  process.exit(0);
}

seed();
