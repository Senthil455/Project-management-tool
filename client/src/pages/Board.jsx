import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import api from '../api/client.js';
import { getErrorMessage } from '../api/client.js';
import IssueCard from '../components/IssueCard.jsx';
import IssueModal from '../components/IssueModal.jsx';
import CreateIssueModal from '../components/CreateIssueModal.jsx';
import Dropdown from '../components/Dropdown.jsx';
import Avatar from '../components/Avatar.jsx';
import { Icon, TypeIcon, PriorityFlag } from '../components/Icons.jsx';
import { useStore } from '../context/StoreContext.jsx';
import {
  ISSUE_STATUSES,
  ISSUE_TYPES,
  ISSUE_PRIORITIES,
} from '../constants';
import LoadingScreen from '../components/LoadingScreen.jsx';

const ALL = 'all';

export default function Board() {
  const { project, canEdit } = useOutletContext();
  const { users } = useStore();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openIssue, setOpenIssue] = useState(null);
  const [createStatus, setCreateStatus] = useState(null);
  const [search, setSearch] = useState('');
  const [filterAssignee, setFilterAssignee] = useState(ALL);
  const [filterPriority, setFilterPriority] = useState(ALL);
  const [filterType, setFilterType] = useState(ALL);
  const [moving, setMoving] = useState(false);

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
    return issues.filter((i) => {
      if (q && !(i.title.toLowerCase().includes(q) || i.key.toLowerCase().includes(q))) return false;
      if (filterAssignee !== ALL && !(i.assignee && i.assignee._id === filterAssignee)) return false;
      if (filterPriority !== ALL && i.priority !== filterPriority) return false;
      if (filterType !== ALL && i.type !== filterType) return false;
      return true;
    });
  }, [issues, search, filterAssignee, filterPriority, filterType]);

  const columns = useMemo(() => {
    return ISSUE_STATUSES.map((s) => ({
      ...s,
      issues: filtered
        .filter((i) => i.status === s.value)
        .sort((a, b) => a.order - b.order),
    }));
  }, [filtered]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    setMoving(true);
    try {
      const targetStatus = destination.droppableId;
      const colIssues = issues
        .filter((i) => i.status === targetStatus)
        .sort((a, b) => a.order - b.order);
      const moved = issues.find((i) => i._id === draggableId);
      const next = colIssues.filter((i) => i._id !== draggableId);
      next.splice(destination.index, 0, moved);
      const orderedIds = next.map((i) => i._id);

      const prevColumn = [...issues];
      const optimistic = prevColumn.map((i) =>
        i._id === draggableId ? { ...i, status: targetStatus } : i
      );
      setIssues(optimistic);

      const res = await api.patch(`/issues/${draggableId}/move`, {
        status: targetStatus,
        orderedIds,
      });
      setIssues((prev) =>
        prev.map((i) => (i._id === draggableId ? res.data.issue : i))
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Could not move issue'));
      loadIssues();
    } finally {
      setMoving(false);
    }
  };

  const handleIssueUpdated = (updated) => {
    setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
  };

  const handleIssueCreated = (created) => {
    setIssues((prev) => [...prev, created]);
  };

  const isFiltered = search || filterAssignee !== ALL || filterPriority !== ALL || filterType !== ALL;

  const filterAssigneeOptions = [
    { value: ALL, label: 'All assignees' },
    ...users.map((u) => ({ value: u._id, label: u.name })),
  ];

  return (
    <div className="board-page">
      <div className="board-header">
        <div className="board-title">
          <h1>
            {project.name} <span className="board-title-key">/ {project.key}</span>
          </h1>
          <span className="board-sub">
            Kanban board · {issues.length} issues
          </span>
        </div>
        <div className="board-actions">
          {canEdit && (
            <button className="btn btn-primary" onClick={() => setCreateStatus('todo')}>
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
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dropdown
          options={filterAssigneeOptions}
          value={filterAssignee}
          onChange={setFilterAssignee}
          placeholder="All assignees"
          renderOption={(o) => {
            const u = users.find((x) => x._id === o.value);
            return (
              <span className="dropdown-option-row">
                <Avatar user={u} size={18} />
                {o.label}
              </span>
            );
          }}
          style={{ minWidth: 170 }}
