import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "web", "dist");
const port = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function safeJoin(baseDir, requestPath) {
  const normalizedPath = path
    .normalize(requestPath)
    .replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(baseDir, normalizedPath);
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolveFilePath(urlPath) {
  if (urlPath === "/" || urlPath === "") {
    return path.join(distDir, "index.html");
  }

  const requestedPath = safeJoin(distDir, urlPath);
  const exists = await pathExists(requestedPath);

  if (exists) {
    const stats = await fs.stat(requestedPath);

    if (stats.isDirectory()) {
      const nestedIndex = path.join(requestedPath, "index.html");
      if (await pathExists(nestedIndex)) {
        return nestedIndex;
      }
    }

    if (stats.isFile()) {
      return requestedPath;
    }
  }

  return path.join(distDir, "index.html");
}

async function sendFile(res, filePath) {
  try {
    const data = await fs.readFile(filePath);

    res.writeHead(200, {
      "Content-Type": getContentType(filePath),
      "Content-Length": data.length,
    });

    res.end(data);
  } catch {
    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = req.url || "/";
  const urlPath = decodeURIComponent(requestUrl.split("?")[0]);

  const filePath = await resolveFilePath(urlPath);
  await sendFile(res, filePath);
});

server.listen(port, () => {
  console.log(`Static server running on http://localhost:${port}`);
  console.log(`Serving directory: ${distDir}`);
});
