export const ISSUE_TYPES = [
  { value: 'task', label: 'Task', color: '#4BADE5' },
  { value: 'story', label: 'Story', color: '#65BA43' },
  { value: 'bug', label: 'Bug', color: '#E5484D' },
  { value: 'epic', label: 'Epic', color: '#A77DC2' },
];

export const ISSUE_STATUSES = [
  { value: 'todo', label: 'To Do', color: '#4BADE5' },
  { value: 'inprogress', label: 'In Progress', color: '#E97F33' },
  { value: 'done', label: 'Done', color: '#65BA43' },
];

export const ISSUE_PRIORITIES = [
  { value: 'highest', label: 'Highest', color: '#E5484D' },
  { value: 'high', label: 'High', color: '#E5484D' },
  { value: 'medium', label: 'Medium', color: '#E97F33' },
  { value: 'low', label: 'Low', color: '#4BADE5' },
  { value: 'lowest', label: 'Lowest', color: '#8C7C6B' },
];

export const PROJECT_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

export const getType = (value) =>
  ISSUE_TYPES.find((t) => t.value === value) || ISSUE_TYPES[0];

export const getStatus = (value) =>
  ISSUE_STATUSES.find((s) => s.value === value) || ISSUE_STATUSES[0];

export const getPriority = (value) =>
  ISSUE_PRIORITIES.find((p) => p.value === value) || ISSUE_PRIORITIES[2];

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};