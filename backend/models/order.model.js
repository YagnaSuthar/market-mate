const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  notes: String
}, { _id: false });

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: Number,
  unit: String
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  status: { type: String, required: true },
  total: Number,
  deliveryAddress: Object,
  deliveryDate: Date,
  paymentMethod: String,
  paymentStatus: String,
  notes: String,
  tracking: {
    statusHistory: [StatusHistorySchema]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema); 