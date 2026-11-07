import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("out");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
};
const headers = Object.fromEntries(
  (await readFile("out/_headers", "utf8"))
    .split("\n")
    .filter((line) => line.startsWith("  "))
    .map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);
createServer(async (req, res) => {
  try {
    let file = resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
    );
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if ((await stat(file)).isDirectory()) file += "/index.html";
    const bytes = await readFile(file);
    res.writeHead(200, {
      ...headers,
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(bytes);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(await readFile("out/404.html"));
  }
}).listen(Number(process.env.PORT || 4174), "0.0.0.0", () =>
  console.log(
    "Static production preview: http://localhost:" + (process.env.PORT || 4174),
  ),
);
