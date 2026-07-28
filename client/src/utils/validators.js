export function isEmail(value) {
  return typeof value === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
}

export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
