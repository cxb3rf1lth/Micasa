const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    // Input validation
    if (!username || !password || !displayName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Sanitize username to prevent injection
    const sanitizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_-]+$/.test(sanitizedUsername)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers, underscores, and hyphens' });
    }

    // Check if user exists
    const userExists = await User.findOne({ username: sanitizedUsername });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username: sanitizedUsername,
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

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Sanitize username
    const sanitizedUsername = username.trim().toLowerCase();

    // Check for user
    const user = await User.findOne({ username: sanitizedUsername });

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
    
    // Input validation
    if (!partnerUsername) {
      return res.status(400).json({ message: 'Partner username is required' });
    }

    // Sanitize partner username
    const sanitizedPartnerUsername = partnerUsername.trim().toLowerCase();
    
    const partner = await User.findOne({ username: sanitizedPartnerUsername });
    
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
