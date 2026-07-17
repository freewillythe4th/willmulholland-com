import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const analyticsTag = '    <script type="module" src="/js/analytics.js"></script>';
const checkOnly = process.argv.includes('--check');

async function htmlFilesIn(directory, recursive = false) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
    if (recursive && entry.isDirectory()) files.push(...await htmlFilesIn(absolute, true));
  }

  return files;
}

function removeLegacyAnalytics(html) {
  return html
    .replace(/\s*<!-- PostHog Analytics[^>]*-->\s*<script>[\s\S]*?<\/script>\s*/g, '\n')
    .replace(/\s*<!-- UTM capture[^>]*-->\s*<script>[\s\S]*?<\/script>\s*/g, '\n');
}

function installAnalytics(html) {
  const cleaned = removeLegacyAnalytics(html)
    .replace(/\s*<script type="module" src="\/js\/analytics\.js"><\/script>\s*/g, '\n');

  if (!cleaned.includes('</head>')) throw new Error('Missing closing head tag');
  return cleaned.replace('</head>', `${analyticsTag}\n</head>`);
}

const rootFiles = (await htmlFilesIn(root)).filter((file) => path.dirname(file) === root);
const blogFiles = await htmlFilesIn(path.join(root, 'blog'), true);
const publicFiles = [...rootFiles, ...blogFiles].sort();
const problems = [];
let changed = 0;

for (const file of publicFiles) {
  const html = await readFile(file, 'utf8');
  const installed = installAnalytics(html);
  const count = (html.match(/<script type="module" src="\/js\/analytics\.js"><\/script>/g) || []).length;
  const legacyCount = (html.match(/<!-- (?:PostHog Analytics|UTM capture)/g) || []).length;

  if (checkOnly) {
    if (count !== 1 || legacyCount !== 0) {
      problems.push(`${path.relative(root, file)}: shared=${count}, legacy=${legacyCount}`);
    }
    continue;
  }

  if (installed !== html) {
    await writeFile(file, installed);
    changed += 1;
  }
}

if (problems.length > 0) {
  console.error(`Analytics installation check failed:\n${problems.join('\n')}`);
  process.exitCode = 1;
} else if (checkOnly) {
  console.log(`Analytics installation is valid on ${publicFiles.length} public pages.`);
} else {
  console.log(`Installed shared analytics on ${publicFiles.length} public pages. Changed ${changed} files.`);
}
