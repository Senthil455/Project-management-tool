const test = require("node:test");
const assert = require("node:assert");
const { formatDate } = require("../src/utils/format");

test("formatDate returns ISO date portion", () => {
  assert.strictEqual(formatDate("2025-01-02T10:00:00Z"), "2025-01-02");
  assert.strictEqual(formatDate("not-a-date"), "");
});
