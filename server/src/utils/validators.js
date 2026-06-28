function isNonEmptyString(value, max) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (typeof max === "number" && trimmed.length > max) return false;
  return true;
}

function isEmail(value) {
  return isNonEmptyString(value) && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
}

function isIn(value, allowed) {
  return Array.isArray(allowed) && allowed.includes(value);
}

module.exports = { isNonEmptyString, isEmail, isIn };
