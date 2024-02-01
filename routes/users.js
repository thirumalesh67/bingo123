const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// Create a new user
router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/allUsers', isAuthenticated, isAdmin, userController.getAllUsers);

module.exports = router;
