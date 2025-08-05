import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { getErrorMessage } from '../api/client.js';
import { useStore } from '../context/StoreContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';
import Dropdown from '../components/Dropdown.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { PROJECT_ROLES } from '../constants';
import { Icon } from '../components/Icons.jsx';

export default function ProjectSettings() {
  const { project, loadProject } = useOutletContext();
  const { users } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [addUserId, setAddUserId] = useState('');
  const [addRole, setAddRole] = useState('member');
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const isLead = project.lead._id === user._id;

  const saveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');
    try {
      const res = await api.patch(`/projects/${project._id}`, { name, description });
      loadProject();
      setMsg('Project details updated');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update project'));
    } finally {
      setSaving(false);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!addUserId) return;
    setAdding(true);
    setError('');
    try {
      const res = await api.post(`/projects/${project._id}/members`, {
        userId: addUserId,
        role: addRole,
      });
      loadProject();
      setAddUserId('');
      setAddRole('member');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not add member'));
    } finally {
      setAdding(false);
    }
  };

  const changeRole = async (userId, role) => {
    setError('');
    try {
      await api.patch(`/projects/${project._id}/members/${userId}`, { role });
      loadProject();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not change role'));
    }
  };

  const removeMember = async (userId) => {
    setRemovingId(userId);
    setError('');
    try {
      await api.delete(`/projects/${project._id}/members/${userId}`);
      loadProject();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not remove member'));
    } finally {
      setRemovingId(null);
    }
  };

  const deleteProject = async () => {
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/projects/${project._id}`);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete project'));
      setDeleting(false);
    }
  };

  const memberIds = [project.lead._id, ...project.members.map((m) => m.user._id)];
  const candidates = users.filter((u) => !memberIds.includes(u._id));

  const allMembers = [
    { user: project.lead, role: 'admin', isLead: true },
    ...project.members.map((m) => ({ user: m.user, role: m.role, isLead: false })),
  ];

  return (
    <div className="settings-page">
      <div className="board-header">
        <div className="board-title">
          <h1>Project settings</h1>
          <span className="board-sub">{project.key}</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="settings-card">
        <h3>Details</h3>
        <form onSubmit={saveDetails} className="form">
          <label className="form-label">Project name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          <label className="form-label">Project key</label>
          <input className="input" value={project.key} disabled />
          <p className="form-hint">The key cannot be changed after creation.</p>
          <label className="form-label">Description</label>
          <textarea
            className="textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save details'}
            </button>
          </div>
        </form>
      </div>

      <div className="settings-card">
        <h3>People ({allMembers.length})</h3>
        <form className="member-add" onSubmit={addMember}>
          <Dropdown
            options={candidates.map((u) => ({ value: u._id, label: u.name }))}
            value={addUserId}
            onChange={setAddUserId}
            placeholder="Select user to add..."
            searchable
            renderOption={(o) => {
              const u = users.find((x) => x._id === o.value);
              return (
                <span className="dropdown-option-row">
                  <Avatar user={u} size={20} />
                  {o.label}
                </span>
              );
            }}
            style={{ flex: 1, minWidth: 200 }}
          />
          <Dropdown
            options={PROJECT_ROLES}
            value={addRole}
            onChange={setAddRole}
            style={{ width: 130 }}
          />
          <button type="submit" className="btn btn-primary" disabled={adding || !addUserId}>
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
        <div className="member-list">
          {allMembers.map((m) => (
            <div className="member-row" key={m.user._id}>
              <Avatar user={m.user} size={32} />
              <div className="member-info">
                <strong>
                  {m.user.name}
                  {m.isLead && <span className="member-lead-badge">Lead</span>}
                  {m.user._id === user._id && <span className="member-you-badge">You</span>}
