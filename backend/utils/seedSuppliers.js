const mongoose = require('mongoose');
const Supplier = require('../models/supplier');
const connectDB = require('../config/db');

const sampleSuppliers = [
  {
    username: 'supplier1',
    email: 'supplier1@example.com',
    password: 'password123',
    company: 'Supplier One Inc.',
    phone: '123-456-7890',
    address: {
      street: '123 Main St',
      city: 'Cityville',
      state: 'Stateville',
      zip: '12345',
      country: 'Countryland'
    }
  },
  {
    username: 'supplier2',
    email: 'supplier2@example.com',
    password: 'password123',
    company: 'Supplier Two LLC',
    phone: '987-654-3210',
    address: {
      street: '456 Side St',
      city: 'Townsville',
      state: 'Regionland',
      zip: '67890',
      country: 'Countryland'
    }
  }
];

async function seedSuppliers() {
  try {
    await connectDB();
    await Supplier.deleteMany({});
    await Supplier.insertMany(sampleSuppliers);
    console.log('Sample suppliers seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding suppliers:', err);
    process.exit(1);
  }
}

seedSuppliers();
