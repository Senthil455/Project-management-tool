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
      return res.status(403).json({ message: 'Viewers cannot create issues' });
    }
    const { title, type, priority, description, assignee, storyPoints, labels, status } =
      req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Issue title is required' });
    }
    const issueNumber = await req.project.getNextIssueNumber();
    const key = await req.project.getIssueKey(issueNumber);

    const issue = await Issue.create({
      project: req.project._id,
      key,
      title: title.trim(),
      description: description || '',
      type: type || 'task',
      priority: priority || 'medium',
      status: status || 'todo',
      assignee: assignee || null,
      reporter: req.user._id,
      storyPoints: storyPoints !== undefined && storyPoints !== null ? Number(storyPoints) : null,
      labels: labels || [],
      order: 0,
    });
    logCreated(issue, req.user._id);
    await issue.save();

    const full = await populateIssue(Issue.findById(issue._id));
    res.status(201).json({ issue: serializeIssue(full) });
  })
);

// @route   GET /api/issues/:id
// @desc    Get a single issue
router.get(
  '/issues/:id',
  loadIssue,
  asyncHandler(async (req, res) => {
    res.json({ issue: serializeIssue(req.issue) });
  })
);

// @route   PATCH /api/issues/:id
// @desc    Update an issue
router.patch(
  '/issues/:id',
  loadIssue,
  asyncHandler(async (req, res) => {
    if (!canEdit(req.issueRole)) {
      return res.status(403).json({ message: 'Viewers cannot edit issues' });
    }
    const issue = req.issue;
    const userId = req.user._id;
    const body = req.body;
    const updatable = ['title', 'description', 'type', 'status', 'priority', 'assignee', 'storyPoints', 'labels'];
    let changed = false;

    for (const field of updatable) {
      if (body[field] === undefined) continue;
      const oldValue = issue[field];
      if (field === 'assignee') {
        if ((oldValue && oldValue._id ? oldValue._id.toString() : null) !== (body[field] || null)) {
          logChange(issue, userId, field, oldValue?._id || null, body[field] || null);
          issue.assignee = body[field] || null;
          changed = true;
        }
      } else if (field === 'labels') {
        const newLabels = Array.isArray(body[field]) ? body[field].map((l) => String(l).trim()).filter(Boolean) : [];
        if (JSON.stringify((issue.labels || []).slice().sort()) !== JSON.stringify(newLabels.slice().sort())) {
          logChange(issue, userId, field, (issue.labels || []).join(', '), newLabels.join(', '));
          issue.labels = newLabels;
          changed = true;
        }
      } else if (field === 'storyPoints') {
        const newVal = body[field] === '' || body[field] === null || body[field] === undefined ? null : Number(body[field]);
        if ((issue.storyPoints ?? null) !== newVal) {
          logChange(issue, userId, field, issue.storyPoints ?? null, newVal);
          issue.storyPoints = newVal;
          changed = true;
        }
      } else {
        if (String(issue[field]) !== String(body[field])) {
          logChange(issue, userId, field, issue[field], body[field]);
          issue[field] = body[field];
          changed = true;
        }
      }
    }

    if (changed) await issue.save();
    const full = await populateIssue(Issue.findById(issue._id));
    res.json({ issue: serializeIssue(full) });
  })
);

// @route   DELETE /api/issues/:id
// @desc    Delete an issue
router.delete(
  '/issues/:id',
  loadIssue,
  asyncHandler(async (req, res) => {
    if (!canEdit(req.issueRole)) {
      return res.status(403).json({ message: 'Viewers cannot delete issues' });
    }
    await req.issue.deleteOne();
    res.json({ message: 'Issue deleted' });
  })
);

// @route   POST /api/issues/:id/comments
// @desc    Add a comment to an issue
router.post(
  '/issues/:id/comments',
  loadIssue,
  asyncHandler(async (req, res) => {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ message: 'Comment body is required' });
    }
    req.issue.comments.push({ author: req.user._id, body: body.trim() });
    logComment(req.issue, req.user._id);
    await req.issue.save();
    const full = await populateIssue(Issue.findById(req.issue._id));
    res.status(201).json({ issue: serializeIssue(full) });
  })
);

// @route   DELETE /api/issues/:id/comments/:commentId
// @desc    Delete a comment (own comment or admin)
router.delete(
  '/issues/:id/comments/:commentId',
  loadIssue,
  asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const comment = req.issue.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const isOwner = comment.author && comment.author._id
      ? comment.author._id.toString() === req.user._id.toString()
      : comment.author.toString() === req.user._id.toString();
    if (!isOwner && req.issueRole !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }
    comment.deleteOne();
    await req.issue.save();
    const full = await populateIssue(Issue.findById(req.issue._id));
    res.json({ issue: serializeIssue(full) });
  })
);

// @route   PATCH /api/issues/:id/move
// @desc    Move an issue between statuses / reorder within a column
router.patch(
  '/issues/:id/move',
  loadIssue,
  asyncHandler(async (req, res) => {
    if (!canEdit(req.issueRole)) {
      return res.status(403).json({ message: 'Viewers cannot move issues' });
    }
    const { status, orderedIds } = req.body;
    if (!ISSUE_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const issue = req.issue;

    if (issue.status !== status) {
      issue.activity.push({
        user: req.user._id,
        action: 'updated',
        field: 'status',
        oldValue: issue.status,
        newValue: status,
