const Game = require('../models/game');

// Create a new game and return the code
exports.createGame = async (req, res) => {
  try {
    const { user } = req; // User object is obtained from middleware

    // Generate a unique 6-digit code
    const code = generateUniqueCode();

    // Create the game
    const game = new Game({
      code,
      createdBy: user._id,
      players: [user._id],
    });

    await game.save();

    res.status(201).json({ code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate a unique 6-digit code
function generateUniqueCode() {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random 6-digit code
  } while (!isUniqueCode(code));

  return code;
}

// Check if the generated code is unique
async function isUniqueCode(code) {
  const game = await Game.findOne({ code });
  return !game;
}

exports.getGameDetails = async (req, res) => {
  try {
    const game = await Game.findOne({ code: req.params.code });
    if (!game) {
      return res.status(404).json({ message: 'Game Not Found' });
    }
    res.json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Errorgit st' });
  }
};
