const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/vendor/suppliers - Advanced search & filter
exports.searchSuppliers = async (req, res) => {
  try {
    const {
      search = '',
      location = '',
      distance = 500,
      categories = [],
      minOrder = 0,
      paymentTerms = [],
      delivery = [],
      trustScore = [0, 100],
      priceRange = [0, 1000000],
      page = 1,
      limit = 20,
      sort = 'relevance',
    } = req.query;

    // Build query
    let query = { role: 'supplier', isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'profile.company': { $regex: search, $options: 'i' } },
        { specializations: { $regex: search, $options: 'i' } },
        { categories: { $regex: search, $options: 'i' } },
      ];
    }
    if (categories.length) query.categories = { $in: Array.isArray(categories) ? categories : [categories] };
    if (paymentTerms.length) query.paymentTerms = { $in: Array.isArray(paymentTerms) ? paymentTerms : [paymentTerms] };
    if (delivery.length) query.delivery = { $in: Array.isArray(delivery) ? delivery : [delivery] };
    if (minOrder) query.minOrder = { $gte: Number(minOrder) };
    if (trustScore.length === 2) query.trustScore = { $gte: Number(trustScore[0]), $lte: Number(trustScore[1]) };
    if (priceRange.length === 2) query.priceRange = { $gte: Number(priceRange[0]), $lte: Number(priceRange[1]) };
    if (location) {
      query.$or = [
        ...(query.$or || []),
        { city: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
      ];
    }
    // TODO: Add geo-distance filter if geo and distance provided

    // Sorting
    let sortObj = {};
    if (sort === 'trust') sortObj.trustScore = -1;
    else if (sort === 'rating') sortObj['performance.orderCompletion'] = -1;
    else sortObj.createdAt = -1;

    // Pagination
    const skip = (page - 1) * limit;
    const suppliers = await User.find(query)
      .select('-password')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    // Autocomplete suggestions (mocked)
    const suggestions = suppliers.map(s => s.profile?.company || s.name);

    res.json({ suppliers, suggestions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search suppliers', details: err.message });
  }
};

// GET /api/vendor/suppliers/:id - Supplier profile
exports.getSupplierProfile = async (req, res) => {
  try {
    const supplier = await User.findById(req.params.id)
      .select('-password')
      .populate('reviews.reviewer', 'name profile')
      .populate('certifications');
    if (!supplier || supplier.role !== 'supplier') return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch supplier profile', details: err.message });
  }
};

// POST /api/vendor/suppliers/:id/favorite - Toggle favorite supplier
exports.toggleFavoriteSupplier = async (req, res) => {
  try {
    const userId = req.user._id;
    const supplierId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const idx = user.favoriteSuppliers.findIndex(id => id.equals(supplierId));
    if (idx > -1) user.favoriteSuppliers.splice(idx, 1);
    else user.favoriteSuppliers.push(supplierId);
    await user.save();
    res.json({ favoriteSuppliers: user.favoriteSuppliers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle favorite', details: err.message });
  }
};

// POST /api/vendor/suppliers/:id/contact - Contact supplier
exports.contactSupplier = async (req, res) => {
  try {
    // In real app, send message/email/notification
    // For now, just acknowledge
    res.json({ success: true, message: 'Contact request sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to contact supplier', details: err.message });
  }
};

// GET /api/vendor/suppliers/compare?ids=... - Compare suppliers
exports.compareSuppliers = async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (!ids.length) return res.status(400).json({ error: 'No supplier IDs provided' });
    const suppliers = await User.find({ _id: { $in: ids }, role: 'supplier' })
      .select('-password');
    res.json({ suppliers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compare suppliers', details: err.message });
  }
}; 