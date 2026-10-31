// Keep a copy of a kb page as the desk sees it: the prerendered HTML from `vite build`, styles inline,
// scripts dropped so it opens on its own. Usage: node scripts/snapshot.mjs [route] (default below).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const route = process.argv[2] ?? 'kb/incidents/4471-split';
const html = readFileSync(`build/${route}.html`, 'utf8')
  .replace(/<script\b[\s\S]*?<\/script>/g, '')
  .replace(/<link rel="modulepreload"[^>]*>/g, '')
  .replace(/\n\s*\n+/g, '\n');

const out = `rendered/${route.replaceAll('/', '--')}.html`;
mkdirSync('rendered', { recursive: true });
writeFileSync(out, html);
console.log(`wrote ${out}`);
