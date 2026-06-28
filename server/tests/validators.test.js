const test = require("node:test");
const assert = require("node:assert");
const { isEmail, isNonEmptyString, isIn } = require("../src/utils/validators");

test("isEmail accepts valid emails", () => {
  assert.strictEqual(isEmail("user@example.com"), true);
  assert.strictEqual(isEmail("not-an-email"), false);
});

test("isNonEmptyString validates strings", () => {
  assert.strictEqual(isNonEmptyString("hi"), true);
  assert.strictEqual(isNonEmptyString("   "), false);
  assert.strictEqual(isNonEmptyString(42), false);
  assert.strictEqual(isNonEmptyString("abcdef", 3), false);
});

test("isIn checks membership", () => {
  assert.strictEqual(isIn("a", ["a", "b"]), true);
  assert.strictEqual(isIn("z", ["a", "b"]), false);
});
