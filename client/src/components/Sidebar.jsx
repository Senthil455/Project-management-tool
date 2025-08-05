import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Icon } from './Icons.jsx';
import Avatar from './Avatar.jsx';
import CreateProjectModal from './CreateProjectModal.jsx';

export default function Sidebar({ onProjectCreated }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="auth-logo-mark">J</div>
          <span>Jira Clone</span>
        </div>
        <NavLink to="/" className="sidebar-link">
          <Icon name="dashboard" />
          Dashboard
        </NavLink>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-head">
          <span>Projects</span>
          <button
            className="icon-btn icon-btn-light"
            onClick={() => setShowCreate(true)}
            title="Create project"
            aria-label="Create project"
          >
            <Icon name="plus" size={18} />
          </button>
        </div>
        <div className="sidebar-projects">
          {projects.map((p) => (
            <NavLink
              key={p._id}
              to={`/project/${p._id}/board`}
              className={({ isActive }) => `sidebar-project ${isActive ? 'sidebar-project-active' : ''}`}
              title={p.name}
            >
              <span className="sidebar-project-avatar" style={{ background: hashColor(p.key) }}>
                {p.key.slice(0, 2)}
              </span>
              <span className="sidebar-project-name">{p.name}</span>
            </NavLink>
          ))}
          {projects.length === 0 && !error && (
            <button className="sidebar-project sidebar-project-empty" onClick={() => setShowCreate(true)}>
              <Icon name="plus" size={16} />
              Create your first project
            </button>
          )}
          {error && <div className="sidebar-error">{error}</div>}
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <Avatar user={user} size={32} />
          <div className="sidebar-user-info">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="icon-btn icon-btn-light" onClick={handleLogout} title="Log out" aria-label="Log out">
            <Icon name="logout" />
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={(project) => {
