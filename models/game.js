const mongoose = require('mongoose');

const cardGridSchema = new mongoose.Schema({
  rows: [
    [
      {
        type: Number,
        required: true,
      },
    ],
  ],
});

const playerCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cardGrid: cardGridSchema,
});

const gameSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 6,
    uppercase: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  playerCardConfigurations: [], // Store player card configurations as an array
  events: [
    {
      numberCalled: {
        type: Number,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  status: {
    type: String,
    enum: ['created', 'inProgress', 'completed', 'stopped'],
    default: 'created',
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  startTime: {
    type: Date,
    default: null,
  },
  endTime: {
    type: Date,
    default: null,
  },
});

// Middleware to convert the code to uppercase before saving
gameSchema.pre('save', function (next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Game', gameSchema);
