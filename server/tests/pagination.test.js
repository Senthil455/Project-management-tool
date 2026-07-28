const test = require("node:test");
const assert = require("node:assert");
const paginate = require("../src/utils/pagination");

test("paginate uses defaults", () => {
  assert.deepStrictEqual(paginate(), { skip: 0, limit: 20, page: 1 });
});

test("paginate clamps limit and computes skip", () => {
  const r = paginate(3, 999);
  assert.strictEqual(r.limit, 100);
  assert.strictEqual(r.skip, 200);
  assert.strictEqual(r.page, 3);
});
