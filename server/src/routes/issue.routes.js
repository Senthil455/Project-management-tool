import express from "express";
import Issue from "../models/Issue.js";
import { protect } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find({ project: req.params.projectId }).populate("reporter assignees", "name email avatar").sort("order");
    res.json(issues);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const issue = await Issue.create({ ...req.body, project: req.params.projectId, reporter: req.user._id });
    res.status(201).json(issue);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
