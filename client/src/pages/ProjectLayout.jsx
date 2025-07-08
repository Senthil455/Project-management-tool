import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar, { hashColor } from '../components/Sidebar.jsx';
import Avatar from '../components/Avatar.jsx';
import { Icon } from '../components/Icons.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useStore } from '../context/StoreContext.jsx';

export default function ProjectLayout() {
  const { id } = useParams();
  const { user } = useAuth();
  const { refreshProjects } = useStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load project'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const myRole = project
    ? project.lead && project.lead._id === user._id
      ? 'admin'
      : (project.members.find((m) => m.user._id === user._id) || {}).role || null
    : null;

  const canEdit = myRole === 'admin' || myRole === 'member';
  const isAdmin = myRole === 'admin';

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <Sidebar />
        <div className="page-error">
          <div className="alert alert-error">{error}</div>
          <button className="btn" onClick={loadProject}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        onProjectCreated={() => {
          refreshProjects();
        }}
      />
      <div className="project-shell">
        <div className="project-sidebar">
          <div className="project-header">
            <div
              className="project-icon"
              style={{ background: hashColor(project.key) }}
            >
              {project.key.slice(0, 2)}
            </div>
            <div className="project-header-info">
              <strong>{project.name}</strong>
              <span>{project.key}</span>
            </div>
          </div>
          <nav className="project-nav">
            <NavLink
              to={`/project/${project._id}/board`}
              className={({ isActive }) => `project-nav-link ${isActive ? 'project-nav-link-active' : ''}`}
            >
              <Icon name="board" />
              <span>Board</span>
            </NavLink>
            <NavLink
              to={`/project/${project._id}/backlog`}
              className={({ isActive }) => `project-nav-link ${isActive ? 'project-nav-link-active' : ''}`}
            >
              <Icon name="backlog" />
              <span>Backlog</span>
            </NavLink>
            {isAdmin && (
              <NavLink
                to={`/project/${project._id}/settings`}
                className={({ isActive }) => `project-nav-link ${isActive ? 'project-nav-link-active' : ''}`}
              >
                <Icon name="settings" />
                <span>Project settings</span>
              </NavLink>
            )}
          </nav>
          <div className="project-people">
            <div className="project-people-head">
              <span>People</span>
            </div>
            <div className="project-people-list">
              <div className="project-person">
                <Avatar user={project.lead} size={24} />
                <div className="project-person-info">
                  <span>{project.lead.name}</span>
                  <small>Lead</small>
                </div>
              </div>
              {project.members.map((m) => (
