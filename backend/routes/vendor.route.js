const express = require('express');
const router = express.Router();

// GET /api/vendor/overview
router.get('/overview', (req, res) => {
  res.json({
    totalOrders: 42,
    weeklySpend: 12000,
    favoriteSuppliers: [
      { name: 'Supplier A', trustScore: 95 },
      { name: 'Supplier B', trustScore: 90 }
    ]
  });
});

// GET /api/vendor/orders
router.get('/orders', (req, res) => {
  res.json({
    orders: [
      { id: 1, status: 'Delivered', total: 500, date: '2024-06-01' },
      { id: 2, status: 'Confirmed', total: 1200, date: '2024-06-03' }
    ]
  });
});

// POST /api/vendor/order
router.post('/order', (req, res) => {
  // Accepts: { items, supplierId, quantity, address, paymentMethod }
  res.json({ success: true, message: 'Order placed successfully', orderId: Math.floor(Math.random()*10000) });
});

module.exports = router; 