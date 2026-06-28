const test = require("node:test");
const assert = require("node:assert");
const slugify = require("../src/utils/slug");

test("slugify normalises text", () => {
  assert.strictEqual(slugify("Hello World!"), "hello-world");
  assert.strictEqual(slugify("  Multiple   Spaces "), "multiple-spaces");
});
