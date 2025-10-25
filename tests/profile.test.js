import test from "node:test";
import assert from "node:assert/strict";
import * as profile from "../server/profile.js";

test("getProfile throws if session is invalid", async () => {
  await assert.rejects(
    () => profile.getProfile("fake-token", { getSessionFn: () => null }),
    /Unauthorized/
  );
});

test("getProfile throws if user not found", async () => {
  const session = { userId: 1 };
  await assert.rejects(
    () =>
      profile.getProfile("token", {
        getSessionFn: () => session,
        queryFn: async () => ({ rows: [] }),
      }),
    /User not found/
  );
});

test("getProfile returns user data", async () => {
  const session = { userId: 1 };
  const userData = {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
  };

  const result = await profile.getProfile("token", {
    getSessionFn: () => session,
    queryFn: async () => ({ rows: [userData] }),
  });

  assert.deepStrictEqual(result, userData);
});

test("updateProfile throws if session invalid", async () => {
  await assert.rejects(
    () =>
      profile.updateProfile(
        "token",
        { firstName: "Alice" },
        { getSessionFn: () => null }
      ),
    /Unauthorized/
  );
});

test("updateProfile throws if nothing to update", async () => {
  await assert.rejects(
    () =>
      profile.updateProfile(
        "token",
        {},
        { getSessionFn: () => ({ userId: 1 }) }
      ),
    /Nothing to update/
  );
});

test("updateProfile updates all fields and returns updated profile", async () => {
  const session = { userId: 1 };
  const data = {
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@example.com",
    password: "secret",
  };
  const updatedProfile = {
    first_name: "Alice",
    last_name: "Smith",
    email: "alice@example.com",
  };

  const result = await profile.updateProfile("token", data, {
    getSessionFn: () => session,
    queryFn: async () => ({ rows: [updatedProfile] }),
    hashFn: async () => "hashed-password",
    getProfileFn: async () => updatedProfile,
  });

  assert.deepStrictEqual(result, updatedProfile);
});

test("updateProfile updates only provided fields", async () => {
  const session = { userId: 1 };
  const data = { firstName: "Bob" };
  const updatedProfile = {
    first_name: "Bob",
    last_name: "Doe",
    email: "bob@example.com",
  };

  const result = await profile.updateProfile("token", data, {
    getSessionFn: () => session,
    queryFn: async () => ({ rows: [updatedProfile] }),
    getProfileFn: async () => updatedProfile,
  });

  assert.deepStrictEqual(result, updatedProfile);
});
