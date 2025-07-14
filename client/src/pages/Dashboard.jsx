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

  const openIssues = myIssues.length;
  const inProgress = myIssues.filter((i) => i.status === 'inprogress').length;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="page-sub">Here's what's happening across your projects.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-icon" style={{ background: '#e6f4ff' }}><Icon name="board" /></span>
          <div>
            <strong>{projectsWithCounts.length}</strong>
            <span>Projects</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ background: '#fff4e6' }}><Icon name="backlog" /></span>
          <div>
            <strong>{openIssues}</strong>
            <span>Issues assigned to you</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ background: '#eef9ef' }}><Icon name="check" /></span>
          <div>
            <strong>{inProgress}</strong>
            <span>In progress</span>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-head">
          <h2>Your projects</h2>
          <span className="section-sub">{projectsWithCounts.length} active</span>
        </div>
        {loading && <LoadingScreen />}
        {!loading && projectsWithCounts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>You don't have any projects yet</h3>
            <p>Create a project from the sidebar to start tracking issues on a board.</p>
          </div>
        )}
        <div className="project-grid">
          {projectsWithCounts.map((p) => {
            const counts = { ...STATUS_COUNTS };
            (p.issues || []).forEach((i) => {
              counts[i.status] += 1;
            });
            return (
              <Link
                to={`/project/${p._id}/board`}
                className="project-card"
                key={p._id}
              >
                <div className="project-card-top">
                  <span className="project-card-icon" style={{ background: hashColor(p.key) }}>
                    {p.key.slice(0, 2)}
                  </span>
                  <span className="project-card-count">{p.issueCount} issues</span>
                </div>
                <h3>{p.name}</h3>
                <p className="project-card-desc">{p.description || 'No description'}</p>
                <div className="project-card-meta">
                  <div className="status-pills">
                    {['todo', 'inprogress', 'done'].map((s) => (
                      <span key={s} className={`status-pill status-pill-${s}`}>
                        {getStatus(s).label}: {counts[s]}
                      </span>
                    ))}
                  </div>
                  <Avatar user={p.lead} size={22} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-head">
          <h2>Assigned to me</h2>
          <span className="section-sub">{openIssues} open</span>
        </div>
        {myIssues.length === 0 ? (
          <div className="empty-state empty-state-small">
            <p>Nothing assigned to you. Enjoy the calm!</p>
          </div>
        ) : (
          <div className="issue-list">
            {myIssues.map((i) => (
              <Link to={`/project/${i.project}/board`} className="issue-row" key={i._id}>
                <TypeIcon type={i.type} />
                <span className="issue-row-key">{i.key}</span>
                <span className="issue-row-title">{i.title}</span>
                <span className={`status-badge status-badge-${i.status}`}>
                  {getStatus(i.status).label}
                </span>
                <PriorityFlag priority={i.priority} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}