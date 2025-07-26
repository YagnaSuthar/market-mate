require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const supplierProductsRoutes = require('./routes/supplierProducts');
const supplierCategoriesRoutes = require('./routes/supplierCategories');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/supplier', supplierProductsRoutes);
app.use('/api/supplier', supplierCategoriesRoutes);

// Error handling middleware (placeholder)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('API Running');
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
