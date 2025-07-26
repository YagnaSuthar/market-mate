const Order = require('../models/order.model');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper: Calculate priority score
function calculatePriority(order, customer) {
  let score = 0;
  // Order value
  score += order.total || 0;
  // Customer tier (assume customer.tier: 'premium' > 'regular' > 'new')
  if (customer && customer.tier) {
    if (customer.tier === 'premium') score += 1000;
    else if (customer.tier === 'regular') score += 500;
    else score += 100;
  }
  // Delivery urgency
  if (order.deliveryDate) {
    const now = new Date();
    const diff = (new Date(order.deliveryDate) - now) / (1000 * 60 * 60 * 24); // days
    if (diff < 1) score += 1000; // urgent
    else if (diff < 3) score += 500;
    else if (diff < 7) score += 100;
  }
  // Special requirements (if notes or items have special flags)
  if (order.notes && order.notes.toLowerCase().includes('urgent')) score += 500;
  if (order.items && order.items.some(i => i.specialRequirement)) score += 200;
  return score;
}

// Get prioritized order queue
exports.getOrderQueue = async (req, res) => {
  try {
    const vendorId = req.user._id;
    let orders = await Order.find({ vendorId }).lean();
    // Fetch customer info for each order
    const customerIds = [...new Set(orders.map(o => o.supplierId.toString()))];
    const customers = await User.find({ _id: { $in: customerIds } }).lean();
    const customerMap = {};
    customers.forEach(c => { customerMap[c._id.toString()] = c; });
    // Calculate priority and stats
    let pendingCount = 0, totalProcessingTime = 0, processingCount = 0;
    orders = orders.map(order => {
      const customer = customerMap[order.supplierId.toString()] || {};
      order.priorityScore = calculatePriority(order, customer);
      if (order.status === 'pending') pendingCount++;
      if (order.performanceMetrics && order.performanceMetrics.processingTime) {
        totalProcessingTime += order.performanceMetrics.processingTime;
        processingCount++;
      }
      return order;
    });
    // Sort by priorityScore descending
    orders.sort((a, b) => b.priorityScore - a.priorityScore);
    // Stats
    const avgProcessingTime = processingCount ? (totalProcessingTime / processingCount) : 0;
    res.json({
      queue: orders,
      stats: {
        totalPending: pendingCount,
        avgProcessingTime,
        totalOrders: orders.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order queue', details: err.message });
  }
};

// Get complete order details
exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // Customer details
    const customer = await User.findById(order.supplierId).lean();
    // Previous orders
    const previousOrders = await Order.find({ supplierId: order.supplierId, _id: { $ne: order._id } }).sort({ createdAt: -1 }).limit(5).lean();
    // Communication history
    const communication = order.customerInteractionLogs || [];
    // Modification history
    const modifications = order.modificationHistory || [];
    // Product details (simulate inventory check)
    const products = (order.items || []).map(item => ({
      ...item,
      inventoryStatus: 'Available', // Placeholder
      specifications: {}, // Placeholder
      images: [], // Placeholder
      description: '' // Placeholder
    }));
    // Payment info
    const payment = {
      method: order.paymentMethod,
      status: order.paymentStatus,
      transaction: order.paymentTransaction || {}
    };
    // Timeline
    const timeline = (order.tracking && order.tracking.statusHistory) || [];
    // Customer rating, preferences, reliability (simulate)
    const customerProfile = {
      ...customer,
      rating: customer?.rating || 4.5,
      reliabilityScore: customer?.reliabilityScore || 90,
      preferences: customer?.preferences || [],
      orderHistory: previousOrders
    };
    res.json({
      order: {
        ...order,
        customer: customerProfile,
        products,
        payment,
        timeline,
        communication,
        modifications
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details', details: err.message });
  }
};

// Bulk order actions (accept, reject, schedule, update status)
exports.bulkOrderActions = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { action, orderIds, payload } = req.body;
    if (!Array.isArray(orderIds) || !action) throw new Error('Invalid request');
    const results = [];
    for (const orderId of orderIds) {
      let update = {}, log = '';
      if (action === 'accept') {
        update = { status: 'confirmed', $push: { 'tracking.statusHistory': { status: 'confirmed', timestamp: new Date() } } };
        log = 'Order accepted';
      } else if (action === 'reject') {
        update = { status: 'cancelled', $push: { 'tracking.statusHistory': { status: 'cancelled', timestamp: new Date(), notes: payload?.reason } } };
        log = 'Order rejected';
      } else if (action === 'schedule') {
        update = { deliveryDate: payload?.deliveryDate, $push: { 'tracking.statusHistory': { status: 'scheduled', timestamp: new Date(), notes: `Scheduled for ${payload?.deliveryDate}` } } };
        log = 'Order scheduled';
      } else if (action === 'updateStatus') {
        update = { status: payload?.status, $push: { 'tracking.statusHistory': { status: payload?.status, timestamp: new Date() } } };
        log = `Status updated to ${payload?.status}`;
      } else {
        throw new Error('Unsupported bulk action');
      }
      const result = await Order.findByIdAndUpdate(orderId, update, { new: true, session });
      results.push({ orderId, result, log });
    }
    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, report: results });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: 'Bulk operation failed', details: err.message });
  }
};

// Modify order with approval workflow
exports.modifyOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { changeType, changeDetails } = req.body;
    if (!changeType || !changeDetails) throw new Error('Missing changeType or changeDetails');
    // Add modification request to history (pending approval)
    const modification = {
      changeType,
      changedBy: req.user._id,
      changeDetails,
      approved: false,
      approvalStatus: 'pending',
      timestamp: new Date()
    };
    await Order.findByIdAndUpdate(orderId, { $push: { modificationHistory: modification } });
    // TODO: Notify customer for approval if required
    res.json({ success: true, message: 'Modification request submitted for approval' });
  } catch (err) {
    res.status(500).json({ error: 'Order modification failed', details: err.message });
  }
};

// Automation rules (in-memory for demo; replace with DB in production)
let automationRules = [];
let automationLogs = [];

// Process automation rules for incoming orders
exports.processAutomationRules = async (req, res) => {
  try {
    const { order } = req.body;
    if (!order) throw new Error('No order provided');
    let appliedRules = [];
    for (const rule of automationRules) {
      // Simple rule matching (expand as needed)
      let match = true;
      if (rule.condition.customerType && rule.condition.customerType !== order.customerType) match = false;
      if (rule.condition.minValue && order.total < rule.condition.minValue) match = false;
      if (rule.condition.productCategory && !order.items.some(i => i.category === rule.condition.productCategory)) match = false;
      if (match) {
        appliedRules.push(rule);
        // Execute action (simulate)
        automationLogs.push({ ruleId: rule.id, orderId: order._id, executedAt: new Date(), result: 'applied' });
      }
    }
    res.json({ appliedRules });
  } catch (err) {
    res.status(500).json({ error: 'Automation rule processing failed', details: err.message });
  }
};

// Get automation rules
exports.getAutomationRules = async (req, res) => {
  res.json({ rules: automationRules });
};

// Create/update automation rules
exports.saveAutomationRules = async (req, res) => {
  try {
    const { rules } = req.body;
    if (!Array.isArray(rules)) throw new Error('Invalid rules');
    automationRules = rules;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save automation rules', details: err.message });
  }
};

// Get analytics
exports.getOrderAnalytics = async (req, res) => {
  // TODO: Return analytics data
  res.json({ analytics: {} });
}; 