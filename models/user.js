const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  userType: {
    type: String,
    enum: ['admin', 'superuser', 'player'],
    default: 'player',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add a method to generate a JWT token
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, username: this.username },
    '4b4f8e38a9406c8774a53a001af27f24c4c17a0268d4d09f45e557c6d37226ff',
    { expiresIn: '1h' },
  );
  return token;
};

module.exports = mongoose.model('User', userSchema);
