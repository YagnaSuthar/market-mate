const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: String,
  subcategory: String,
  price: { type: Number, required: true },
  unit: String,
  quantity: Number,
  minOrderQuantity: Number,
  images: [String],
  specifications: Object,
  tags: [String],
  rating: Number,
  reviewCount: Number,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);