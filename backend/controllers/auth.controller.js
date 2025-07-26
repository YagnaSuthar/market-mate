const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ name, email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const { password: _, ...userInfo } = user.toObject();
    req.session.user = userInfo;
    res.json({ user: userInfo });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    user.lastLogin = new Date();
    await user.save();
    const { password: _, ...userInfo } = user.toObject();
    req.session.user = userInfo;
    res.json({ user: userInfo });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ msg: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ msg: 'Logged out successfully' });
  });
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    if (!userId) return res.status(401).json({ msg: 'Not authenticated' });
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    if (!userId) return res.status(401).json({ msg: 'Not authenticated' });
    const updates = req.body;
    if (updates.password) delete updates.password; // Don't allow password change here
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    req.session.user = user;
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}; 