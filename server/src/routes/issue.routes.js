import express from 'express';
import Project from '../models/Project.js';
import Issue from '../models/Issue.js';
import { ISSUE_STATUSES } from '../models/Issue.js';
import { protect, getRoleForProject } from '../middleware/auth.js';
import { asyncHandler, isValidId } from '../utils/helpers.js';

const router = express.Router();
router.use(protect);

const populateIssue = (query) =>
  query
    .populate('assignee', '-password')
    .populate('reporter', '-password')
    .populate('comments.author', '-password')
    .populate('activity.user', '-password');

const serializeIssue = (i) => ({
  _id: i._id,
  project: i.project,
  key: i.key,
  title: i.title,
  description: i.description,
  type: i.type,
  status: i.status,
  priority: i.priority,
  assignee: i.assignee,
  reporter: i.reporter,
  storyPoints: i.storyPoints,
  labels: i.labels,
  comments: i.comments,
  activity: i.activity,
  order: i.order,
  createdAt: i.createdAt,
  updatedAt: i.updatedAt,
});

const loadProject = async (req, res, next) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Project not found' });
  }
  const project = await Project.findById(req.params.id);
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

const loadIssue = async (req, res, next) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Issue not found' });
  }
  const issue = await populateIssue(Issue.findById(req.params.id));
  if (!issue) {
    return res.status(404).json({ message: 'Issue not found' });
  }
  const project = await Project.findById(issue.project);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  const role = getRoleForProject(project, req.user._id);
  if (!role) {
    return res.status(403).json({ message: 'You are not a member of this project' });
  }
  req.issue = issue;
  req.issueProject = project;
  req.issueRole = role;
  next();
};

const canEdit = (role) => role === 'admin' || role === 'member';

const logChange = (issue, user, field, oldValue, newValue) => {
  const normalize = (v) => {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'object' && v._id) return v._id.toString();
    return String(v);
  };
  const oldNorm = normalize(oldValue);
  const newNorm = normalize(newValue);
  if (oldNorm === newNorm) return;
  issue.activity.push({ user, action: 'updated', field, oldValue: oldNorm, newValue: newNorm });
};

const logComment = (issue, user) => {
  issue.activity.push({ user, action: 'commented' });
};

const logCreated = (issue, user) => {
  issue.activity.push({ user, action: 'created' });
};

// @route   GET /api/projects/:id/issues
// @desc    Get all issues of a project
router.get(
  '/projects/:id/issues',
  loadProject,
  asyncHandler(async (req, res) => {
    const issues = await populateIssue(Issue.find({ project: req.project._id })).sort({
      status: 1,
      order: 1,
      createdAt: 1,
    });
    res.json({ issues: issues.map(serializeIssue) });
  })
);

// @route   POST /api/projects/:id/issues
// @desc    Create an issue in a project
router.post(
  '/projects/:id/issues',
  loadProject,
  asyncHandler(async (req, res) => {
    if (!canEdit(req.projectRole)) {
