import express from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/helpers.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User exists" });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await user.matchPassword(password)) {
      res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/me", protect, (req, res) => res.json(req.user));

export default router;
