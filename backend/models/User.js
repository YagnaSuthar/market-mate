const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
  company: String,
  phone: String,
  address: AddressSchema,
  avatar: String
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const CertificationSchema = new mongoose.Schema({
  name: String,
  authority: String,
  validUntil: Date,
  verified: { type: Boolean, default: false }
}, { _id: false });

const PerformanceMetricsSchema = new mongoose.Schema({
  responseTime: { type: Number, default: 0 }, // in hours
  deliverySuccess: { type: Number, default: 0 }, // %
  orderCompletion: { type: Number, default: 0 }, // %
}, { _id: false });

const GeoSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
}, { _id: false });

const SupplierFields = {
  trustScore: { type: Number, min: 0, max: 100, default: 50, index: true },
  performance: PerformanceMetricsSchema,
  certifications: [CertificationSchema],
  reviews: [ReviewSchema],
  specializations: [String],
  categories: [String],
  minOrder: { type: Number, default: 0 },
  paymentTerms: [{ type: String, enum: ['COD', 'UPI', 'Bank Transfer', 'Credit'] }],
  delivery: [{ type: String, enum: ['Same Day', 'Next Day', 'Express', 'Standard'] }],
  priceRange: { type: [Number], default: [0, 0] },
  geo: GeoSchema,
  city: String,
  state: String,
  businessHours: { type: String },
  favoriteSuppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
};

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['vendor', 'supplier'], required: true },
  profile: ProfileSchema,
  preferences: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
  // Supplier-specific fields
  ...SupplierFields
});

UserSchema.index({ trustScore: 1 });
UserSchema.index({ 'geo': '2dsphere' });
UserSchema.index({ city: 1 });
UserSchema.index({ state: 1 });
UserSchema.index({ categories: 1 });
UserSchema.index({ specializations: 1 });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema); 