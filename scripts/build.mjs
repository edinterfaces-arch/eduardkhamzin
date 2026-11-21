import { mkdir, rm, copyFile, writeFile, cp } from 'node:fs/promises';
await rm('out', { recursive: true, force: true });
await mkdir('out');
await copyFile('index.html', 'out/index.html');
await copyFile('index.html', 'out/404.html');
await cp('assets', 'out/assets', { recursive: true });
await writeFile('out/_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'none'; img-src 'self'; script-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
`);
console.log('Built standalone static page in out/.');
