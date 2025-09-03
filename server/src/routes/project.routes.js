import express from "express";
import Project from "../models/Project.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ "members.user": req.user._id }).populate("members.user", "name email");
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const p = await Project.create({ ...req.body, owner: req.user._id, members: [{ user: req.user._id, role: "owner" }] });
    res.status(201).json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const p = await Project.findById(req.params.id).populate("members.user", "name email avatar");
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
