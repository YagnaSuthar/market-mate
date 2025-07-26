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
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', UserSchema); 