function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function formatDateTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
}

module.exports = { formatDate, formatDateTime };
