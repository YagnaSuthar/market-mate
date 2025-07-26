const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Supplier authentication middleware
const authenticateSupplier = (req, res, next) => {
  // TODO: Implement authentication logic
  next();
};

module.exports = { authenticateSupplier }; 