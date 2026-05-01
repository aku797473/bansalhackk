require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const labourRoutes = require('./routes/labour');

const app = express();
const PORT = process.env.PORT || 5007;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/labour', labourRoutes);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'labour-service' }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kisan')
  .then(() => app.listen(PORT, () => console.log(`👷 Labour Service on port ${PORT}`)))
  .catch(err => { console.error(err.message); });
