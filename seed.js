/**
 * seed.js
 * Run this to populate your MongoDB Atlas with real-looking data for the hackathon.
 */
require('dotenv').config();
const mongoose = require('mongoose');

// Models
const Job = require('./services/labour-service/src/models/Job');

const REAL_JOBS = [
  {
    title: 'Wheat Harvesting - 10 Acres',
    description: 'Need 10 experienced workers for wheat harvesting. Food and stay provided.',
    category: 'harvesting',
    location: { district: 'Satna', state: 'Madhya Pradesh', village: 'Kothi' },
    wage: 600,
    wageUnit: 'per day',
    workersNeeded: 10,
    contactNumber: '9123456789',
    postedBy: 'system_seed',
    status: 'open'
  },
  {
    title: 'Soybean Sowing Help',
    description: 'Looking for 5 workers for soybean sowing in the upcoming week.',
    category: 'sowing',
    location: { district: 'Indore', state: 'Madhya Pradesh', village: 'Mhow' },
    wage: 450,
    wageUnit: 'per day',
    workersNeeded: 5,
    contactNumber: '9827012345',
    postedBy: 'system_seed',
    status: 'open'
  },
  {
    title: 'Tractor Driver for Irrigation',
    description: 'Experienced tractor driver needed for canal irrigation setup.',
    category: 'irrigation',
    location: { district: 'Rewa', state: 'Madhya Pradesh', village: 'Govindgarh' },
    wage: 800,
    wageUnit: 'per day',
    workersNeeded: 1,
    contactNumber: '7000123456',
    postedBy: 'system_seed',
    status: 'open'
  },
  {
    title: 'Vegetable Storage & Loading',
    description: 'Daily wage workers for loading vegetables into trucks for market.',
    category: 'transport',
    location: { district: 'Jabalpur', state: 'Madhya Pradesh', village: 'Patan' },
    wage: 400,
    wageUnit: 'per day',
    workersNeeded: 15,
    contactNumber: '8811223344',
    postedBy: 'system_seed',
    status: 'open'
  },
  {
    title: 'Sugarcane Cutting Team',
    description: 'Large team needed for seasonal sugarcane cutting. Long term work.',
    category: 'harvesting',
    location: { district: 'Pune', state: 'Maharashtra', village: 'Baramati' },
    wage: 550,
    wageUnit: 'per day',
    workersNeeded: 25,
    contactNumber: '9422012345',
    postedBy: 'system_seed',
    status: 'open'
  },
  {
    title: 'Pesticide Spraying Expert',
    description: 'Someone who knows how to handle organic pesticides for fruit orchard.',
    category: 'pesticide',
    location: { district: 'Nashik', state: 'Maharashtra', village: 'Pimpalgaon' },
    wage: 700,
    wageUnit: 'per day',
    workersNeeded: 2,
    contactNumber: '9011001122',
    postedBy: 'system_seed',
    status: 'open'
  }
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return console.error('MONGODB_URI missing');

  try {
    await mongoose.connect(uri);
    console.log('Connected to DB for seeding...');

    // Clear existing seed data
    await Job.deleteMany({ postedBy: 'system_seed' });
    
    // Add new jobs
    await Job.insertMany(REAL_JOBS);
    console.log(`✅ Successfully added ${REAL_JOBS.length} REAL jobs to the database!`);

    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seed();
