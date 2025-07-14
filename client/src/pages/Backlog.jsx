import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/client.js';
import { getErrorMessage } from '../api/client.js';
import IssueCard from '../components/IssueCard.jsx';
import IssueModal from '../components/IssueModal.jsx';
import CreateIssueModal from '../components/CreateIssueModal.jsx';
import Dropdown from '../components/Dropdown.jsx';
import Avatar from '../components/Avatar.jsx';
import { Icon } from '../components/Icons.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { getStatus } from '../constants';
import LoadingScreen from '../components/LoadingScreen.jsx';

const ALL = 'all';

export default function Backlog() {
  const { project, canEdit } = useOutletContext();
  const { users } = useStore();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openIssue, setOpenIssue] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [search, setSearch] = useState('');

  const loadIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/projects/${project._id}/issues`);
      setIssues(res.data.issues);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load issues'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return issues
      .filter((i) => statusFilter === ALL || i.status === statusFilter)
      .filter((i) => !q || i.title.toLowerCase().includes(q) || i.key.toLowerCase().includes(q))
      .sort((a, b) => (a.order - b.order) || (a.status.localeCompare(b.status)));
  }, [issues, statusFilter, search]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((i) => {
      if (!groups[i.status]) groups[i.status] = [];
      groups[i.status].push(i);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="backlog-page">
      <div className="board-header">
        <div className="board-title">
          <h1>Backlog</h1>
          <span className="board-sub">{project.name} · {filtered.length} issues</span>
        </div>
        <div className="board-actions">
          {canEdit && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Icon name="plus" size={16} />
              Create issue
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <Icon name="search" />
          <input
            placeholder="Search backlog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dropdown
          options={[
            { value: ALL, label: 'All statuses' },
            { value: 'todo', label: 'To Do' },
            { value: 'inprogress', label: 'In Progress' },
            { value: 'done', label: 'Done' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          renderOption={(o) =>
            o.value === ALL ? (
              <span>All statuses</span>
            ) : (
              <span className="dropdown-option-row">
                <span className={`status-dot status-dot-${o.value}`} />
                {o.label}
              </span>
            )
          }
          style={{ minWidth: 140 }}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="backlog-groups">
          {Object.keys(grouped).length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🗂️</div>
              <h3>No issues found</h3>
              <p>Create an issue or adjust your filters.</p>
              {canEdit && (
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                  <Icon name="plus" size={16} />
                  Create issue
                </button>
              )}
            </div>
          )}
          {['todo', 'inprogress', 'done'].map((status) => {
            const items = grouped[status] || [];
            if (items.length === 0) return null;
            return (
              <div className="backlog-group" key={status}>
                <div className="backlog-group-head">
                  <span className={`status-dot status-dot-${status}`} />
                  <strong>{getStatus(status).label}</strong>
                  <span className="board-column-count">{items.length}</span>
                </div>
                <div className="backlog-list">
                  {items.map((issue, idx) => (
                    <div className="backlog-row" key={issue._id}>
                      <IssueCard issue={issue} index={idx} interactive={false} />
                      <div className="backlog-row-right">
                        {issue.assignee && <Avatar user={issue.assignee} size={24} />}
                        <button
                          className="icon-btn"
                          title="Open issue"
                          onClick={() => setOpenIssue(issue)}
                        >
                          <Icon name="edit" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openIssue && (
        <IssueModal
          issue={openIssue}
          project={project}
          users={users}
          canEdit={canEdit}
          onClose={() => setOpenIssue(null)}
          onUpdated={(updated) =>
            setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)))
          }
          onDeleted={(deleted) =>
            setIssues((prev) => prev.filter((i) => i._id !== deleted._id))
          }
        />
      )}

      {showCreate && (
        <CreateIssueModal
          project={project}
          users={users}
          onClose={() => setShowCreate(false)}
          onCreated={(created) => {
            setIssues((prev) => [...prev, created]);
            setOpenIssue(created);
          }}
        />
      )}
    </div>
  );
}