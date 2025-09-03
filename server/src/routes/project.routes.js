import express from 'express';
import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import User from '../models/User.js';
import { protect, getRoleForProject } from '../middleware/auth.js';
import { asyncHandler, isValidId } from '../utils/helpers.js';

const router = express.Router();
router.use(protect);

const populateProject = (query) =>
  query
    .populate('lead', '-password')
    .populate('members.user', '-password');

const serializeProject = (p) => ({
  _id: p._id,
  name: p.name,
  key: p.key,
  description: p.description,
  lead: p.lead,
  members: p.members,
  archived: p.archived,
  nextIssueNumber: p.nextIssueNumber,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

const loadProject = async (req, res, next) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Project not found' });
  }
  const project = await populateProject(Project.findById(req.params.id));
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  const role = getRoleForProject(project, req.user._id);
  if (!role) {
    return res.status(403).json({ message: 'You are not a member of this project' });
  }
  req.project = project;
  req.projectRole = role;
  next();
};

// @route   GET /api/projects
// @desc    Get all projects for the current user
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const projects = await populateProject(
      Project.find({
        $or: [{ lead: req.user._id }, { 'members.user': req.user._id }],
      })
    ).sort({ updatedAt: -1 });

    const issueCounts = await Issue.aggregate([
      { $match: { project: { $in: projects.map((p) => p._id) } } },
      { $group: { _id: '$project', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(issueCounts.map((c) => [c._id.toString(), c.count]));

    res.json({
      projects: projects.map((p) => ({
        ...serializeProject(p),
        issueCount: countMap[p._id.toString()] || 0,
      })),
    });
  })
);

// @route   POST /api/projects
// @desc    Create a new project
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, key, description } = req.body;
    if (!name || !key) {
      return res.status(400).json({ message: 'Project name and key are required' });
    }
    const cleanKey = key.toUpperCase().replace(/\s+/g, '').slice(0, 10);
    if (!/^[A-Z0-9]{2,10}$/.test(cleanKey)) {
      return res
        .status(400)
        .json({ message: 'Project key must be 2-10 characters (letters and numbers only)' });
    }
    const existing = await Project.findOne({ key: cleanKey });
    if (existing) {
      return res.status(400).json({ message: `Project key "${cleanKey}" is already in use` });
    }
    const project = await Project.create({
      name: name.trim(),
      key: cleanKey,
      description: description || '',
      lead: req.user._id,
    });
    const full = await populateProject(Project.findById(project._id));
    res.status(201).json({ project: serializeProject(full) });
  })
);

// @route   GET /api/projects/:id
// @desc    Get a single project
router.get(
  '/:id',
  loadProject,
  asyncHandler(async (req, res) => {
    res.json({ project: serializeProject(req.project) });
  })
);

// @route   PATCH /api/projects/:id
// @desc    Update project details (admin)
router.patch(
  '/:id',
  loadProject,
  asyncHandler(async (req, res) => {
    if (req.projectRole !== 'admin') {
      return res.status(403).json({ message: 'Only project admins can update project details' });
    }
    const { name, description, archived } = req.body;
    if (name !== undefined) req.project.name = name.trim() || req.project.name;
    if (description !== undefined) req.project.description = description;
