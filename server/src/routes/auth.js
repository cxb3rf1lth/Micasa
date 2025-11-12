const express = require('express');
const router = express.Router();
const { register, login, getMe, linkPartner, updateRole } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateLinkPartner,
  validateUpdateRole
} = require('../middleware/validation');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/link-partner', protect, validateLinkPartner, linkPartner);
router.put('/update-role', protect, validateUpdateRole, updateRole);

module.exports = router;
