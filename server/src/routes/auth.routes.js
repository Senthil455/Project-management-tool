import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, generateToken } from '../utils/helpers.js';

const router = express.Router();

const toUserJson = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatarColor: user.avatarColor,
  createdAt: user.createdAt,
});

// @route   POST /api/auth/register
// @desc    Register a new user
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    const user = await User.create({
      name,
      email,
      password,
      avatarColor: User.getRandomColor(),
    });
    res.status(201).json({
      user: toUserJson(user),
      token: generateToken(user._id),
    });
  })
);

// @route   POST /api/auth/login
// @desc    Login a user
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      user: toUserJson(user),
      token: generateToken(user._id),
    });
  })
);

// @route   GET /api/auth/me
// @desc    Get current logged-in user
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({ user: toUserJson(req.user) });
  })
);

export default router;
