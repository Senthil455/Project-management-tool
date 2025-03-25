import mongoose from 'mongoose';

export const ISSUE_TYPES = ['task', 'story', 'bug', 'epic'];
export const ISSUE_STATUSES = ['todo', 'inprogress', 'done'];
export const ISSUE_PRIORITIES = ['highest', 'high', 'medium', 'low', 'lowest'];

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['created', 'updated', 'commented', 'deleted'],
      required: true,
    },
    field: String,
    oldValue: String,
    newValue: String,
  },
  { timestamps: true }
);

const issueSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    key: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ISSUE_TYPES, default: 'task' },
    status: { type: String, enum: ISSUE_STATUSES, default: 'todo' },
    priority: { type: String, enum: ISSUE_PRIORITIES, default: 'medium' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
