// src/app.js
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const pool = require('./db');

const bookRoutes = require('./routes/books');
const memberRoutes = require('./routes/members');
const transactionRoutes = require('./routes/transactions');
const fineRoutes = require('./routes/fines');
const { errorMiddleware } = require('./utils/errorHandler');

const app = express();
app.use(express.json());

// health check
const healthHandler = (req, res) => {
  res.json({ status: 'ok' });
};

app.get('/health', healthHandler);       // existing route
app.get('/api/health', healthHandler);   // added route to match your .http file

// DB test
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Database connection works!',
      time: result.rows[0].now
    });
  } catch (err) {
    console.error('DB test error: ', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// main routes
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fines', fineRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorMiddleware);

module.exports = app;
