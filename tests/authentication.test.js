import test from "node:test";
import assert from "node:assert/strict";
import * as auth from "../server/authentication.js";

test("registerUser throws if fields missing", async () => {
  await assert.rejects(
    () =>
      auth.registerUser({
        firstName: "John",
        email: "a@b.com",
        password: "123",
      }),
    /Missing fields/
  );
});

test("registerUser throws if email already registered", async () => {
  const mockQuery = async () => ({ rows: [1] });

  await assert.rejects(
    () =>
      auth.registerUser(
        {
          firstName: "John",
          lastName: "Doe",
          email: "a@b.com",
          password: "123",
        },
        { queryFn: mockQuery }
      ),
    /Email already registered/
  );
});

test("registerUser hashes password and inserts user", async () => {
  let inserted = null;
  const mockQuery = async (sql, values) => {
    if (sql.startsWith("SELECT")) return { rows: [] };
    inserted = values;
    return { rows: [] };
  };
  const mockHash = async (p) => "hashed-" + p;

  const result = await auth.registerUser(
    { firstName: "John", lastName: "Doe", email: "a@b.com", password: "123" },
    { queryFn: mockQuery, hashFn: mockHash }
  );

  assert.deepStrictEqual(result, {
    firstName: "John",
    lastName: "Doe",
    email: "a@b.com",
  });
  assert.strictEqual(inserted[3], "hashed-123");
});

test("loginUser throws if email not found", async () => {
  const mockQuery = async () => ({ rows: [] });
  await assert.rejects(
    () =>
      auth.loginUser(
        { email: "a@b.com", password: "123" },
        { queryFn: mockQuery }
      ),
    /Invalid credentials/
  );
});

test("loginUser throws if password does not match", async () => {
  const mockQuery = async () => ({
    rows: [
      {
        id: 1,
        email: "a@b.com",
        password: "hashed",
        first_name: "John",
        last_name: "Doe",
      },
    ],
  });
  const mockCompare = async () => false;

  await assert.rejects(
    () =>
      auth.loginUser(
        { email: "a@b.com", password: "123" },
        { queryFn: mockQuery, compareFn: mockCompare }
      ),
    /Invalid credentials/
  );
});

test("loginUser returns user and token if correct", async () => {
  const mockQuery = async () => ({
    rows: [
      {
        id: 1,
        email: "a@b.com",
        password: "hashed",
        first_name: "John",
        last_name: "Doe",
      },
    ],
  });
  const mockCompare = async () => true;
  const mockUUID = () => "uuid-123";

  const result = await auth.loginUser(
    { email: "a@b.com", password: "123" },
    {
      queryFn: mockQuery,
      compareFn: mockCompare,
      uuidFn: mockUUID,
      sessionsMap: new Map(),
    }
  );

  assert.deepStrictEqual(result.user, {
    email: "a@b.com",
    firstName: "John",
    lastName: "Doe",
  });
  assert.strictEqual(result.token, "uuid-123");
});

test("logoutUser removes session", async () => {
  const sessions = new Map([["token123", { userId: 1 }]]);
  const result = await auth.logoutUser("token123", { sessionsMap: sessions });
  assert.strictEqual(result.message, "Logged out");
  assert.strictEqual(sessions.has("token123"), false);
});

test("getSession returns session or null", () => {
  const sessions = new Map([["token123", { userId: 1 }]]);
  const get = auth.getSession("token123", { sessionsMap: sessions });
  assert.deepStrictEqual(get, { userId: 1 });
  const missing = auth.getSession("missing", { sessionsMap: sessions });
  assert.strictEqual(missing, null);
});
