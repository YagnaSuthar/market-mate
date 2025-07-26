const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const session = require('express-session');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    maxAge: 12 * 60 * 60 * 1000 // 12 hours
  }
}));

// Connect Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/vendor', require('./routes/vendor.route'));
app.use('/api/supplier', require('./routes/supplier.route'));
app.use('/api/products', require('./routes/product.route'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
