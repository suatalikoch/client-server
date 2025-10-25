import test from "node:test";
import assert from "node:assert/strict";
import * as db from "../server/database.js";

const mockClient = {
  query: async (sql, params) => {
    return { rows: [{ id: 1, name: "Test" }], rowCount: 1 };
  },
  release: () => {},
};

db.pool.connect = async () => mockClient;

test("query function returns rows", async () => {
  const res = await db.query("SELECT * FROM users WHERE id=$1", [1]);
  assert.equal(res.rows.length, 1);
  assert.equal(res.rows[0].name, "Test");
});

test("query function releases client", async () => {
  let released = false;
  db.pool.connect = async () => ({
    query: async () => ({ rows: [] }),
    release: () => {
      released = true;
    },
  });

  await db.query("SELECT 1");
  assert.ok(released, "Client should be released after query");
});
