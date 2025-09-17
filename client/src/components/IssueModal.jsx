import { useState } from 'react';
import api from '../api/client.js';
import { getErrorMessage } from '../api/client.js';
import { TypeIcon, PriorityFlag, Icon } from './Icons.jsx';
import Avatar from './Avatar.jsx';
import Dropdown from './Dropdown.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import {
  ISSUE_TYPES,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  getStatus,
  getPriority,
  formatDateTime,
} from '../constants';

const Field = ({ label, children }) => (
  <div className="issue-field">
    <span className="issue-field-label">{label}</span>
    {children}
  </div>
);

export default function IssueModal({ issue: initialIssue, project, users, canEdit, onClose, onUpdated, onDeleted }) {
  const [issue, setIssue] = useState(initialIssue);
  const [editTitle, setEditTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(initialIssue.title);
  const [editDesc, setEditDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(initialIssue.description || '');
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  const applyUpdate = (updated) => {
    setIssue(updated.issue);
    if (onUpdated) onUpdated(updated.issue);
  };

  const handlePatch = async (patch) => {
    if (!canEdit) return;
    setError('');
    try {
      const res = await api.patch(`/issues/${issue._id}`, patch);
      applyUpdate(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update issue'));
    }
  };

  const saveTitle = async () => {
    if (titleDraft.trim() && titleDraft.trim() !== issue.title) {
      await handlePatch({ title: titleDraft.trim() });
    }
    setEditTitle(false);
  };

  const saveDesc = async () => {
    await handlePatch({ description: descDraft });
    setEditDesc(false);
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommenting(true);
    setError('');
    try {
      const res = await api.post(`/issues/${issue._id}/comments`, { body: comment.trim() });
      applyUpdate(res.data);
      setComment('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not add comment'));
    } finally {
      setCommenting(false);
    }
  };

  const deleteComment = async (commentId) => {
    setError('');
    try {
      const res = await api.delete(`/issues/${issue._id}/comments/${commentId}`);
      applyUpdate(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete comment'));
    }
  };

  const deleteIssue = async () => {
    setError('');
    try {
      await api.delete(`/issues/${issue._id}`);
      setConfirmDelete(false);
      if (onDeleted) onDeleted(issue);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete issue'));
    }
  };

  const userOption = (u) => ({ value: u ? u._id : '', label: u ? u.name : 'Unassigned' });
  const findUser = (id) => users.find((u) => u._id === id);

  return (
    <div className="issue-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="issue-modal">
        <div className="issue-modal-header">
          <div className="issue-modal-id">
            <TypeIcon type={issue.type} />
            <span>{issue.key}</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        {error && <div className="alert alert-error issue-modal-alert">{error}</div>}

        <div className="issue-modal-body">
          <div className="issue-modal-main">
            <div className="issue-title-block">
              {editTitle ? (
                <div className="issue-inline-edit">
                  <input
                    autoFocus
                    className="input issue-title-input"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTitle();
                      if (e.key === 'Escape') setEditTitle(false);
                    }}
                  />
                  <div className="inline-edit-actions">
                    <button className="btn btn-primary btn-sm" onClick={saveTitle} disabled={saving}>
                      Save
                    </button>
                    <button className="btn btn-sm" onClick={() => setEditTitle(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h2
                  className="issue-title"
                  onClick={() => canEdit && setEditTitle(true)}
                  title={canEdit ? 'Click to edit' : ''}
                >
                  {issue.title}
                </h2>
              )}
              <div className="issue-sub">
                <span className={`status-badge status-badge-${issue.status}`}>
                  {getStatus(issue.status).label}
                </span>
                <span>
                  Reporter: <strong>{issue.reporter ? issue.reporter.name : '—'}</strong>
                </span>
                <span>Created {formatDateTime(issue.createdAt)}</span>
                <span>Updated {formatDateTime(issue.updatedAt)}</span>
              </div>
            </div>

            <div className="issue-section">
              <h4>Description</h4>
              {editDesc ? (
                <div className="issue-inline-edit">
                  <textarea
                    autoFocus
                    className="textarea"
                    rows={6}
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                  />
                  <div className="inline-edit-actions">
                    <button className="btn btn-primary btn-sm" onClick={saveDesc} disabled={saving}>
                      Save
