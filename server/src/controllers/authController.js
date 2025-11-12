const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      password,
      displayName
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        partnerId: user.partnerId,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check for user
    const user = await User.findOne({ username });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        partnerId: user.partnerId,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('partnerId', 'username displayName');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Link partner
// @route   PUT /api/auth/link-partner
// @access  Private
const linkPartner = async (req, res) => {
  try {
    const { partnerUsername } = req.body;
    
    const partner = await User.findOne({ username: partnerUsername });
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    if (partner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot link to yourself' });
    }
    
    // Update both users
    await User.findByIdAndUpdate(req.user._id, { partnerId: partner._id });
    await User.findByIdAndUpdate(partner._id, { partnerId: req.user._id });
    
    res.json({ message: 'Partner linked successfully', partnerId: partner._id });
  } catch (error) {
    console.error('Link partner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  linkPartner
};
