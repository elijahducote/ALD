import { print } from "./lib/utility.js";

import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const app = new Hono();

const reservedPaths = [
  "cdn",
  "web",
  "src",
  "assets",
  "go"
];

function isReserved (path, routes) {
  for (let i = routes.length; i; --i) {
    if (path.startsWith(`/${routes[i - 1]}`)) return false;
  }
  return true;
}

function getPageName(path) {
  const cleaned = path.replace(/^\/+|\/+$/g, "");
  return cleaned || "home";
}

const MIME_TYPES = {
  ".m3u8": "application/vnd.apple.mpegurl",
  ".mpd":  "application/dash+xml",
  ".ts":   "video/mp2t",
  ".m4s":  "video/iso.segment",
  ".mp4":  "video/mp4",
  ".vtt":  "text/vtt",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".html": "text/html",
  ".json": "application/json",
  ".woff2":"font/woff2",
  ".woff": "font/woff",
  ".ttf":  "font/ttf",
  ".svg":  "image/svg+xml"
};

// ============================================
// Streaming CORS and Cache Headers Middleware
// ============================================
app.use("/assets/*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Range, Content-Type");
  c.header("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");

  if (c.req.method === "OPTIONS") return c.text("", 204);

  await next();

  const path = c.req.path;
  if (path.endsWith(".m3u8") || path.endsWith(".mpd")) {
    c.header("Cache-Control", "public, max-age=2");
  } else if (path.endsWith(".ts") || path.endsWith(".m4s")) {
    c.header("Cache-Control", "public, max-age=31536000, immutable");
  } else if (path.endsWith(".vtt")) {
    c.header("Cache-Control", "public, max-age=3600");
  } else if (path.endsWith(".jpg") || path.endsWith(".png") || path.endsWith(".webp")) {
    c.header("Cache-Control", "public, max-age=31536000, immutable");
  }

  c.header("Accept-Ranges", "bytes");
});

// ============================================
// Asset routes
// ============================================
app.get(
  "/assets/*",
  serveStatic({
    root: "./assets",
    rewriteRequestPath: (path) => path.replace(/^\/assets\/(\/?.+)?$/, "/$1"),
    mimes: MIME_TYPES
  })
);

app.get(
  "/cdn/*",
  serveStatic({
    root: "./nav",
    rewriteRequestPath: (path) => path.replace(/^\/cdn\/([^\/]+)\/(.+)$/, "/$1/media/$2"),
    mimes: MIME_TYPES
  })
);

app.get(
  "/web/*",
  serveStatic({
    root: "./nav",
    rewriteRequestPath: (path) => path.replace(/^\/web\/(\/?.+)?$/, "/$1"),
    mimes: MIME_TYPES
  })
);

app.get(
  "/src/*",
  serveStatic({
    root: "./dploy",
    rewriteRequestPath: (path) => path.replace(/^\/src\/(\/?.+)?$/, "/$1"),
    mimes: MIME_TYPES
  })
);

// /go/* is reserved for Deno Deploy endpoints (handled by the production proxy /
// hosting layer, not by this server). In dev these requests will 404 — point your
// hosts file or run a local proxy if you need to test them against staging.
app.all("/go/*", (c) => c.text("Forwarded to Deno Deploy in production. Not available in this dev server.", 404));

// ============================================
// Page catch-all: build on demand and serve generated index.html
// ============================================
app.use("*", async (c, next) => {
  if (isReserved(c.req.path, reservedPaths)) {
    const pageName = getPageName(c.req.path);
    const cmd = Bun.spawn(["bun", "build.js", pageName], {
      env: { ...process.env, PATH: `${process.env.PATH}:/root/.bun/bin/` },
      stdin: "inherit",
      stdout: "inherit"
    });
    await cmd.exited;
    return await serveStatic({
      root: "./nav/",
      index: "index.html",
      mimes: MIME_TYPES
    })(c, next);
  }
  await next();
});

export default {
  port: 3000,
  fetch: app.fetch
};

print(`Running on http://127.0.0.1:3000`);
