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

    // Username length validation
    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check for password complexity (at least one number, one letter)
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one letter and one number' });
    }

    // Display name validation
    if (displayName.trim().length < 2 || displayName.trim().length > 50) {
      return res.status(400).json({ message: 'Display name must be between 2 and 50 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ username: sanitizedUsername });

    if (userExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create user
    const user = await User.create({
      username: sanitizedUsername,
      password,
      displayName: displayName.trim()
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
      res.status(400).json({ message: 'Registration failed. Please try again.' });
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
    const user = User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get partner info if exists
    const partner = User.getPartner(req.user._id);
    
    const userResponse = {
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      partnerId: partner ? partner._id : null,
      avatar: user.avatar,
      role: user.role,
      preferences: user.preferences
    };
    
    res.json(userResponse);
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

// @desc    Update user role
// @route   PUT /api/auth/update-role
// @access  Private
const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    // Validate role
    const validRoles = ['husband', 'wife', 'partner', 'dependent', 'child', 'sibling', 'roommate', 'member'];
    if (!role || !validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = User.findByIdAndUpdate(req.user._id, { role: role.toLowerCase() });
    
    res.json({ 
      message: 'Role updated successfully',
      role: user.role 
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  linkPartner,
  updateRole
};
