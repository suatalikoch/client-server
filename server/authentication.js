import { query } from "./database.js";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

const defaultSessions = new Map();

export async function registerUser(
  { firstName, lastName, email, password },
  { queryFn = query, hashFn = bcrypt.hash } = {}
) {
  if (!firstName || !lastName || !email || !password)
    throw new Error("Missing fields");

  const existing = await queryFn("SELECT * FROM users WHERE email=$1", [email]);
  if (existing.rows.length > 0) throw new Error("Email already registered");

  const hashed = await hashFn(password, 10);
  await queryFn(
    "INSERT INTO users(first_name, last_name, email, password) VALUES($1, $2, $3, $4)",
    [firstName, lastName, email, hashed]
  );

  return { firstName, lastName, email };
}

export async function loginUser(
  { email, password },
  {
    queryFn = query,
    compareFn = bcrypt.compare,
    uuidFn = randomUUID,
    sessionsMap = defaultSessions,
  } = {}
) {
  const res = await queryFn("SELECT * FROM users WHERE email=$1", [email]);
  if (res.rows.length === 0) throw new Error("Invalid credentials");

  const user = res.rows[0];
  const match = await compareFn(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = uuidFn();
  sessionsMap.set(token, {
    userId: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
  });

  return {
    user: {
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    },
    token,
  };
}

export async function logoutUser(
  token,
  { sessionsMap = defaultSessions } = {}
) {
  sessionsMap.delete(token);
  return { message: "Logged out" };
}

export function getSession(token, { sessionsMap = defaultSessions } = {}) {
  return sessionsMap.get(token) || null;
}
