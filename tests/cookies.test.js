import test from "node:test";
import assert from "node:assert/strict";
import { parseCookies, setCookie } from "../server/cookies.js";

test("parseCookies parses single cookie", () => {
  const req = { headers: { cookie: "session=abc123" } };
  const cookies = parseCookies(req);
  assert.deepEqual(cookies, { session: "abc123" });
});

test("parseCookies parses multiple cookies", () => {
  const req = { headers: { cookie: "a=1; b=2; c=3" } };
  const cookies = parseCookies(req);
  assert.deepEqual(cookies, { a: "1", b: "2", c: "3" });
});

test("parseCookies handles empty header", () => {
  const req = { headers: {} };
  const cookies = parseCookies(req);
  assert.deepEqual(cookies, {});
});

test("parseCookies handles empty cookie values", () => {
  const req = { headers: { cookie: "a=; b=2" } };
  const cookies = parseCookies(req);
  assert.deepEqual(cookies, { a: "", b: "2" });
});

test("parseCookies decodes URL-encoded values", () => {
  const req = { headers: { cookie: "token=abc%20123; user=John%20Doe" } };
  const cookies = parseCookies(req);
  assert.deepEqual(cookies, { token: "abc 123", user: "John Doe" });
});

test("setCookie sets single cookie with default SameSite", () => {
  const res = {
    headers: {},
    getHeader(name) {
      return this.headers[name];
    },
    setHeader(name, val) {
      this.headers[name] = val;
    },
  };
  setCookie(res, "test", "123");
  assert.equal(res.getHeader("Set-Cookie"), "test=123; Path=/; SameSite=Lax");
});

test("setCookie appends multiple cookies with default SameSite", () => {
  const res = {
    headers: {},
    getHeader(name) {
      return this.headers[name];
    },
    setHeader(name, val) {
      this.headers[name] = val;
    },
  };
  setCookie(res, "a", "1");
  setCookie(res, "b", "2");
  const cookies = res.getHeader("Set-Cookie");
  assert.ok(Array.isArray(cookies));
  assert.deepEqual(cookies, [
    "a=1; Path=/; SameSite=Lax",
    "b=2; Path=/; SameSite=Lax",
  ]);
});

test("setCookie appends cookie when previous header is already array", () => {
  const res = {
    headers: { "Set-Cookie": ["x=1; Path=/"] },
    getHeader(name) {
      return this.headers[name];
    },
    setHeader(name, val) {
      this.headers[name] = val;
    },
  };
  setCookie(res, "y", "2");
  const cookies = res.getHeader("Set-Cookie");
  assert.deepEqual(cookies, ["x=1; Path=/", "y=2; Path=/; SameSite=Lax"]);
});

test("setCookie applies all options", () => {
  const res = {
    headers: {},
    getHeader(name) {
      return this.headers[name];
    },
    setHeader(name, val) {
      this.headers[name] = val;
    },
  };
  setCookie(res, "secure", "val", {
    httpOnly: true,
    maxAge: 3600,
    sameSite: "Strict",
    secure: true,
    path: "/custom",
  });
  const cookie = res.getHeader("Set-Cookie");
  assert.equal(
    cookie,
    "secure=val; Path=/custom; Max-Age=3600; HttpOnly; Secure; SameSite=Strict"
  );
});

test("setCookie uses defaults when options missing", () => {
  const res = {
    headers: {},
    getHeader(name) {
      return this.headers[name];
    },
    setHeader(name, val) {
      this.headers[name] = val;
    },
  };
  setCookie(res, "foo", "bar");
  const cookie = res.getHeader("Set-Cookie");
  assert.equal(cookie, "foo=bar; Path=/; SameSite=Lax");
});
