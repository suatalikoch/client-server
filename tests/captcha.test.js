import test from "node:test";
import assert from "node:assert/strict";
import { generateCaptcha } from "../public/js/captcha.js";

function mockRandomValues(arr) {
  for (let i = 0; i < arr.length; i++) arr[i] = i + 1;
}

global.window = {
  crypto: {
    getRandomValues: mockRandomValues,
  },
};

test("generateCaptcha returns default 6-character uppercase captcha", () => {
  const captcha = generateCaptcha();
  assert.strictEqual(captcha.length, 6);
  assert.ok(/^[A-Z2-9]+$/.test(captcha));
});

test("generateCaptcha returns captcha of custom length", () => {
  const captcha = generateCaptcha({ length: 10 });
  assert.strictEqual(captcha.length, 10);
});

test("generateCaptcha returns lowercase when toUpper is false", () => {
  const captcha = generateCaptcha({ toUpper: false });
  assert.ok(captcha === captcha.toLowerCase());
});

test("generateCaptcha uses custom charset", () => {
  const captcha = generateCaptcha({ charset: "ABC" });
  assert.ok(/^[ABC]+$/.test(captcha));
});

test("generateCaptcha returns empty string for empty charset", () => {
  const captcha = generateCaptcha({ charset: "" });
  assert.strictEqual(captcha, "");
});

test("generateCaptcha returns empty string when length is 0", () => {
  const captcha = generateCaptcha({ length: 0 });
  assert.strictEqual(captcha, "");
});
