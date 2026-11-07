// Next's static HTML contains hydration scripts. Hash them instead of allowing arbitrary inline JS.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const hashes = new Set();
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${item.name}`;
    if (item.isDirectory()) await walk(path);
    else if (item.name.endsWith(".html")) {
      const html = await readFile(path, "utf8");
      for (const match of html.matchAll(
        /<script\b([^>]*)>([\s\S]*?)<\/script>/g,
      )) {
        if (!/\bsrc=/.test(match[1]) && match[2])
          hashes.add(
            `'sha256-${createHash("sha256").update(match[2]).digest("base64")}'`,
          );
      }
    }
  }
}
await walk("out");
const headers = await readFile("public/_headers", "utf8");
await writeFile(
  "out/_headers",
  headers.replace(
    "script-src 'self'",
    `script-src 'self' ${[...hashes].join(" ")}`,
  ),
);
console.log(`Secured static export with ${hashes.size} inline-script hashes.`);
