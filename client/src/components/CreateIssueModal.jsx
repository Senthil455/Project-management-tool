import { useState } from 'react';
import api from '../api/client.js';
import { getErrorMessage } from '../api/client.js';
import Modal from './Modal.jsx';
import { TypeIcon, PriorityFlag, Icon } from './Icons.jsx';
import Dropdown from './Dropdown.jsx';
import Avatar from './Avatar.jsx';
import {
  ISSUE_TYPES,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  getType,
} from '../constants';

const userOption = (u) => ({ value: u ? u._id : '', label: u ? u.name : 'Unassigned' });

export default function CreateIssueModal({ project, users, defaultStatus, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('task');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState(defaultStatus || 'todo');
  const [assignee, setAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [storyPoints, setStoryPoints] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post(`/projects/${project._id}/issues`, {
        title,
        type,
        priority,
        status,
        assignee: assignee || null,
        description,
        storyPoints: storyPoints === '' ? null : Number(storyPoints),
        labels: labelsInput
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
      });
      onCreated(res.data.issue);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create issue'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Create issue in ${project.name}`} onClose={onClose} width={640}>
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="alert alert-error">{error}</div>}
        <label className="form-label">
          Title <span className="req">*</span>
        </label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize the issue in one line"
          required
          autoFocus
        />
        <label className="form-label">Description</label>
        <textarea
          className="textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a more detailed description..."
