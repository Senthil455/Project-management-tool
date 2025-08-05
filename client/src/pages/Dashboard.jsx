import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { getErrorMessage } from '../api/client.js';
import { TypeIcon, PriorityFlag, Icon } from '../components/Icons.jsx';
import Avatar from '../components/Avatar.jsx';
import { hashColor } from '../components/Sidebar.jsx';
import { getStatus } from '../constants';
import LoadingScreen from '../components/LoadingScreen.jsx';

const STATUS_COUNTS = { todo: 0, inprogress: 0, done: 0 };

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, projectsLoading, refreshProjects } = useStore();
  const [projectsWithCounts, setProjectsWithCounts] = useState(projects);
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    setProjectsWithCounts(projects);
  }, [projects]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const withCounts = [];
        let issues = [];
        for (const p of projects) {
          const res = await api.get(`/projects/${p._id}/issues`);
          withCounts.push({ ...p, issueCount: res.data.issues.length, issues: res.data.issues });
          issues = issues.concat(res.data.issues);
        }
        const mine = issues.filter(
          (i) => i.assignee && i.assignee._id === user._id && i.status !== 'done'
        );
        if (mounted) {
          setProjectsWithCounts(withCounts);
          setMyIssues(mine);
        }
      } catch (err) {
        if (mounted) setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (projects.length > 0) load();
    else setLoading(false);
    return () => {
      mounted = false;
    };
  }, [projects, user._id]);

  if (projectsLoading) return <LoadingScreen />;
