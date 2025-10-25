export function parseCookies(req) {
  const header = req.headers.cookie || "";
  const cookies = {};
  header.split(";").forEach((cookie) => {
    const [key, ...val] = cookie.trim().split("=");
    if (!key) return;
    cookies[key] = decodeURIComponent(val.join("="));
  });
  return cookies;
}

export function setCookie(res, name, value, options = {}) {
  let cookieStr = `${name}=${encodeURIComponent(value)}`;
  cookieStr += `; Path=${options.path || "/"}`;
  if (options.maxAge) cookieStr += `; Max-Age=${options.maxAge}`;
  if (options.httpOnly) cookieStr += "; HttpOnly";
  if (options.secure) cookieStr += "; Secure";
  cookieStr += `; SameSite=${options.sameSite || "Lax"}`;

  const prev = res.getHeader("Set-Cookie");
  if (prev) {
    if (Array.isArray(prev)) res.setHeader("Set-Cookie", [...prev, cookieStr]);
    else res.setHeader("Set-Cookie", [prev, cookieStr]);
  } else {
    res.setHeader("Set-Cookie", cookieStr);
  }
}
