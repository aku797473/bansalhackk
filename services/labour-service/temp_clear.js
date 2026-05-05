const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan';

async function clearLabourData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define the Job model
    const jobSchema = new mongoose.Schema({}, { strict: false, collection: 'jobs' });
    const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

    const result = await Job.deleteMany({});
    console.log(`Deleted ${result.deletedCount} jobs from the labour marketplace.`);

  } catch (error) {
    console.error('Error clearing labour data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
}

clearLabourData();
