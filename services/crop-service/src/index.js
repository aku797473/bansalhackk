require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cropRoutes = require('./routes/crop');

const app = express();
const PORT = process.env.PORT || 5004;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/crop', cropRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'crop-service' }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan')
  .then(() => app.listen(PORT, () => console.log(`🌾 Crop Service on port ${PORT}`)))
  .catch(err => { console.error(err.message); });
