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
        />
        <div className="field-grid">
          <div className="field">
            <label className="form-label">Issue type</label>
            <Dropdown
              options={ISSUE_TYPES}
              value={type}
              onChange={setType}
              renderOption={(o) => (
                <span className="dropdown-option-row">
                  <TypeIcon type={o.value} />
                  {o.label}
                </span>
              )}
            />
          </div>
          <div className="field">
            <label className="form-label">Status</label>
            <Dropdown
              options={ISSUE_STATUSES}
              value={status}
              onChange={setStatus}
              renderOption={(o) => (
                <span className="dropdown-option-row">
                  <span className={`status-dot status-dot-${o.value}`} />
                  {o.label}
                </span>
              )}
            />
          </div>
          <div className="field">
            <label className="form-label">Priority</label>
            <Dropdown
              options={ISSUE_PRIORITIES}
              value={priority}
              onChange={setPriority}
              renderOption={(o) => (
                <span className="dropdown-option-row">
                  <PriorityFlag priority={o.value} size={14} />
                  {o.label}
                </span>
              )}
            />
          </div>
          <div className="field">
            <label className="form-label">Assignee</label>
            <Dropdown
              options={[{ value: '', label: 'Unassigned' }, ...users.map(userOption)]}
              value={assignee}
              onChange={setAssignee}
              renderOption={(o) => {
                const u = users.find((x) => x._id === o.value);
                return (
                  <span className="dropdown-option-row">
                    <Avatar user={u} size={20} />
                    {o.label}
                  </span>
                );
              }}
            />
          </div>
          <div className="field">
            <label className="form-label">Story points</label>
            <input
              type="number"
              min="0"
              className="input"
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
              placeholder="e.g. 3"
            />
          </div>
          <div className="field">
            <label className="form-label">Labels</label>
            <input
              className="input"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              placeholder="comma, separated"
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
