const express = require('express');
const router = express.Router();

// GET /api/supplier/overview
router.get('/overview', (req, res) => {
  res.json({
    totalRevenue: 25000,
    pendingOrders: 5,
    topSellingItems: [
      { name: 'Steel', sold: 120 },
      { name: 'Copper', sold: 80 }
    ]
  });
});

// GET /api/supplier/orders
router.get('/orders', (req, res) => {
  res.json({
    orders: [
      { id: 1, status: 'Pending', total: 800, date: '2024-06-02' },
      { id: 2, status: 'Shipped', total: 1500, date: '2024-06-04' }
    ]
  });
});

// POST /api/supplier/update-status
router.post('/update-status', (req, res) => {
  // Accepts: { orderId, status }
  res.json({ success: true, message: 'Order status updated' });
});

module.exports = router; 