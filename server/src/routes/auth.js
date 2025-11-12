const express = require('express');
const router = express.Router();
const { register, login, getMe, linkPartner, updateRole } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/link-partner', protect, linkPartner);
router.put('/update-role', protect, updateRole);

module.exports = router;
