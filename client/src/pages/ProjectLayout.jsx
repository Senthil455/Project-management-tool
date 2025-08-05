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
