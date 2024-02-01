const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to check if the user is logged in
exports.isAuthenticated = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(
      token,
      '4b4f8e38a9406c8774a53a001af27f24c4c17a0268d4d09f45e557c6d37226ff',
    );
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Middleware to check if the user is an admin
exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.userType === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. You are not an admin.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
