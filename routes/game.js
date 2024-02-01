const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { isAuthenticated } = require('../middlewares/auth');

router.post('/create', isAuthenticated, gameController.createGame);
router.get('/:code', isAuthenticated, gameController.getGameDetails);

module.exports = router;
