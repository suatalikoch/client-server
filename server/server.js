import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { registerUser, loginUser, logoutUser } from "./authentication.js";
import { getProfile, updateProfile } from "./profile.js";
import { parseCookies, setCookie } from "./cookies.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "../public");
const PORT = 3000;

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
  };
  const contentType = contentTypes[ext] || "text/plain";

  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
}

function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const cookies = parseCookies(req);

    if (
      req.method === "GET" &&
      (url.pathname === "/" || url.pathname.endsWith(".html"))
    ) {
      const requested = url.pathname === "/" ? "/index.html" : url.pathname;
      const safePath = path.normalize(path.join(publicPath, requested));
      if (!safePath.startsWith(publicPath)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      serveFile(res, safePath);
      return;
    }

    if (
      req.method === "GET" &&
      (url.pathname.endsWith(".css") || url.pathname.endsWith(".js"))
    ) {
      const safePath = path.normalize(path.join(publicPath, url.pathname));
      if (!safePath.startsWith(publicPath)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      serveFile(res, safePath);
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      if (req.method === "POST" && url.pathname === "/api/register") {
        try {
          const data = await parseJSON(req);
          const user = await registerUser(data);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Account created successfully", user })
          );
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/login") {
        try {
          const data = await parseJSON(req);
          const { user, token } = await loginUser(data);
          setCookie(res, "session", token, {
            httpOnly: true,
            sameSite: "Lax",
            path: "/",
          });
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Login successful", user }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/logout") {
        try {
          const token = cookies.session;
          await logoutUser(token);
          setCookie(res, "session", "", { maxAge: 0, path: "/" });
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Logged out" }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/profile") {
        try {
          const token = cookies.session;
          const profile = await getProfile(token);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(profile));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      if (req.method === "PUT" && url.pathname === "/api/profile") {
        try {
          const token = cookies.session;
          const data = await parseJSON(req);
          const updated = await updateProfile(token, data);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Profile updated", user: updated })
          );
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "API route not found" }));
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
