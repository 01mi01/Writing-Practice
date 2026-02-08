const express = require('express');
const { Sequelize } = require('sequelize');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth.routes');
const textRoutes = require('./routes/text.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const vocabularyRoutes = require('./routes/vocabulary.routes');
const preferencesRoutes = require('./routes/preferences.routes');
const adminRoutes = require('./routes/admin.routes');

dotenv.config();
app.use(express.json());

const sequelize = new Sequelize(
  process.env.DB_NAME || 'writing_practice',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
  }
);

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/texts', textRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Error connecting to PostgreSQL:', err));

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

module.exports = app;