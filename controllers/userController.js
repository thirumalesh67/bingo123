const User = require('../models/user');

// Create a new user and return a JWT token
const createUser = async (req, res) => {
  try {
    const { username } = req.body;
    const user = new User({ username });
    await user.save();

    // Generate a JWT token
    const token = user.generateAuthToken();

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login and return a JWT token
const loginUser = async (req, res) => {
  try {
    const { username } = req.body;

    // Find the user by username
    let user = await User.findOne({ username });

    if (!user) {
      user = new User({ username });
      await user.save();
    }

    // Generate a JWT token
    const token = user.generateAuthToken();

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createUser, loginUser, getAllUsers };
