require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const newsRoutes = require('./routes/news');

const app = express();
const PORT = process.env.PORT || 5009;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/news', newsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'news-service' });
});

app.listen(PORT, () => {
  console.log(`📰 News Service running on port ${PORT}`);
});
