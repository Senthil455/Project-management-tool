export function formatDate(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

export function formatDateTime(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString();
}
