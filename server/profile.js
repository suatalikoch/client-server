import { query } from "./database.js";
import { getSession } from "./authentication.js";
import bcrypt from "bcrypt";

export async function getProfile(
  token,
  { getSessionFn = getSession, queryFn = query } = {}
) {
  const session = getSessionFn(token);
  if (!session) throw new Error("Unauthorized");

  const res = await queryFn(
    "SELECT first_name, last_name, email FROM users WHERE id=$1",
    [session.userId]
  );
  if (res.rows.length === 0) throw new Error("User not found");
  return res.rows[0];
}

export async function updateProfile(
  token,
  data,
  {
    getSessionFn = getSession,
    queryFn = query,
    hashFn = bcrypt.hash,
    getProfileFn = getProfile,
  } = {}
) {
  const session = getSessionFn(token);
  if (!session) throw new Error("Unauthorized");

  const updates = [];
  const values = [];

  if (data.firstName) {
    updates.push(`first_name=$${values.length + 1}`);
    values.push(data.firstName);
  }
  if (data.lastName) {
    updates.push(`last_name=$${values.length + 1}`);
    values.push(data.lastName);
  }
  if (data.email) {
    updates.push(`email=$${values.length + 1}`);
    values.push(data.email);
  }
  if (data.password) {
    const hashed = await hashFn(data.password, 10);
    updates.push(`password=$${values.length + 1}`);
    values.push(hashed);
  }

  if (updates.length === 0) throw new Error("Nothing to update");

  values.push(session.userId);
  const sql = `UPDATE users SET ${updates.join(", ")} WHERE id=$${
    values.length
  }`;
  await queryFn(sql, values);

  return getProfileFn(token, { getSessionFn, queryFn });
}
