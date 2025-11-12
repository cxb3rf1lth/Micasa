const express = require('express');
const router = express.Router();
const { register, login, getMe, linkPartner } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/link-partner', protect, linkPartner);

module.exports = router;
