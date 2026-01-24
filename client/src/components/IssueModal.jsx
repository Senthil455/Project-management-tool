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
                    </button>
                    <button className="btn btn-sm" onClick={() => setEditDesc(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`issue-description ${canEdit ? 'issue-description-editable' : ''}`}
                  onClick={() => canEdit && setEditDesc(true)}
                >
                  {issue.description ? (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{issue.description}</p>
                  ) : (
                    <span className="issue-placeholder">
                      {canEdit ? 'Add a description...' : 'No description'}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="issue-section">
              <h4>
                Comments ({issue.comments.length})
                <Icon name="comment" size={14} className="section-icon" />
              </h4>
              {canEdit && (
                <form className="comment-form" onSubmit={addComment}>
                  <Avatar user={project.lead} size={28} />
                  <div className="comment-input-wrap">
                    <textarea
                      className="textarea comment-input"
                      rows={2}
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    {comment.trim() && (
                      <div className="comment-form-actions">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={commenting}>
                          {commenting ? 'Posting...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              )}
              <div className="comment-list">
                {issue.comments.length === 0 && (
                  <p className="issue-placeholder">No comments yet.</p>
                )}
                {issue.comments.map((c) => (
                  <div className="comment" key={c._id}>
                    <Avatar user={c.author} size={28} />
                    <div className="comment-content">
                      <div className="comment-meta">
                        <strong>{c.author.name}</strong>
                        <span>{formatDateTime(c.createdAt)}</span>
                      </div>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{c.body}</p>
                    </div>
                    {canEdit && (
                      <button
                        className="icon-btn comment-delete"
                        title="Delete comment"
                        onClick={() => deleteComment(c._id)}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="issue-section">
              <h4>Activity</h4>
              <div className="activity-list">
                {[...issue.activity].reverse().map((a, idx) => (
                  <div className="activity-item" key={a._id || idx}>
                    <Avatar user={a.user} size={24} />
                    <div className="activity-content">
                      <span>
                        <strong>{a.user.name}</strong> {activityText(a)}
                      </span>
                      <small>{formatDateTime(a.createdAt)}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="issue-modal-side">
            <Field label="Status">
              {canEdit ? (
                <Dropdown
                  options={ISSUE_STATUSES}
                  value={issue.status}
                  onChange={(v) => handlePatch({ status: v })}
                  renderOption={(o) => (
                    <span className="dropdown-option-row">
                      <span className={`status-dot status-dot-${o.value}`} />
                      {o.label}
                    </span>
                  )}
                />
              ) : (
                <span className={`status-badge status-badge-${issue.status}`}>
                  {getStatus(issue.status).label}
                </span>
              )}
            </Field>
            <Field label="Assignee">
              {canEdit ? (
                <Dropdown
                  options={[{ value: '', label: 'Unassigned' }, ...users.map(userOption)]}
                  value={issue.assignee ? issue.assignee._id : ''}
                  onChange={(v) => handlePatch({ assignee: v || null })}
                  renderOption={(o) => {
                    const u = findUser(o.value);
                    return (
                      <span className="dropdown-option-row">
                        <Avatar user={u} size={20} />
                        {o.label}
                      </span>
                    );
                  }}
                />
              ) : issue.assignee ? (
                <Avatar user={issue.assignee} size={24} showName />
              ) : (
                'Unassigned'
              )}
            </Field>
            <Field label="Reporter">
              <Avatar user={issue.reporter} size={24} showName />
            </Field>
            <Field label="Priority">
              {canEdit ? (
                <Dropdown
                  options={ISSUE_PRIORITIES}
                  value={issue.priority}
                  onChange={(v) => handlePatch({ priority: v })}
                  renderOption={(o) => (
                    <span className="dropdown-option-row">
                      <PriorityFlag priority={o.value} size={14} />
                      {o.label}
                    </span>
                  )}
                />
              ) : (
                <span className="dropdown-option-row">
                  <PriorityFlag priority={issue.priority} size={14} />
                  {getPriority(issue.priority).label}
                </span>
              )}
            </Field>
            <Field label="Issue type">
              {canEdit ? (
                <Dropdown
                  options={ISSUE_TYPES}
                  value={issue.type}
                  onChange={(v) => handlePatch({ type: v })}
                  renderOption={(o) => (
                    <span className="dropdown-option-row">
                      <TypeIcon type={o.value} size={14} />
                      {o.label}
                    </span>
                  )}
                />
              ) : (
                <span className="dropdown-option-row">
                  <TypeIcon type={issue.type} size={14} /> {issue.type}
                </span>
              )}
            </Field>
            <Field label="Story points">
              {canEdit ? (
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={issue.storyPoints ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') handlePatch({ storyPoints: null });
                    else handlePatch({ storyPoints: Number(v) });
                  }}
                />
              ) : (
                issue.storyPoints ?? '—'
              )}
            </Field>
            {issue.labels.length > 0 && (
              <Field label="Labels">
                <div className="issue-labels">
                  {issue.labels.map((l) => (
                    <span className="issue-label" key={l}>
                      {l}
                    </span>
                  ))}
                </div>
              </Field>
            )}
            {canEdit && (
              <div className="issue-danger">
                <button className="btn btn-danger-outline btn-sm" onClick={() => setConfirmDelete(true)}>
                  <Icon name="trash" size={14} />
                  Delete issue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete issue"
          message={`Are you sure you want to delete ${issue.key}? This cannot be undone.`}
          confirmLabel="Delete issue"
          onConfirm={deleteIssue}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

const activityText = (a) => {
  const value = (v) => (v ? `"${v}"` : 'empty');
  switch (a.action) {
    case 'created':
      return 'created this issue';
    case 'commented':
      return 'commented on this issue';
    case 'deleted':
      return 'deleted this issue';
    case 'updated':
      if (a.field === 'status') {
        return `moved issue from ${value(a.oldValue)} to ${value(a.newValue)}`;
      }
      if (a.field === 'assignee') {
        if (a.newValue) return `assigned issue to ${a.newValue}`;
        if (a.oldValue) return `unassigned issue`;
        return 'changed assignee';
      }
      return `changed ${a.field} from ${value(a.oldValue)} to ${value(a.newValue)}`;
    default:
      return 'updated this issue';
  }
};