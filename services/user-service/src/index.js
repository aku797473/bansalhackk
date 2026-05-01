require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

app.use('/users', userRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'user-service' }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`👤 User Service on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB:', err.message); });
