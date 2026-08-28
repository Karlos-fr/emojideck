import { gzipSync } from 'node:zlib';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const assetsDirectory = path.join(root, 'dist', 'assets');
const assets = await readdir(assetsDirectory);
const appJavaScript = assets.find((name) => /^index-.*\.js$/.test(name));
const appStyles = assets.find((name) => /^index-.*\.css$/.test(name));
const localeChunks = assets.filter((name) => /^emojis\.[a-z]{2}-.*\.js$/.test(name));

if (!appJavaScript || !appStyles) {
  throw new Error('Production application assets are missing. Run npm run build first.');
}

const appJavaScriptGzip = gzipSync(await readFile(path.join(assetsDirectory, appJavaScript))).length;
const appStylesGzip = gzipSync(await readFile(path.join(assetsDirectory, appStyles))).length;
const expectedLocales = ['de', 'en', 'es', 'fr', 'it', 'pt'];
const builtLocales = localeChunks.map((name) => name.slice(7, 9)).sort();

assertBudget('Application JavaScript', appJavaScriptGzip, 15 * 1024);
assertBudget('Application CSS', appStylesGzip, 5 * 1024);

if (builtLocales.join(',') !== expectedLocales.join(',')) {
  throw new Error(`Unexpected locale chunks: ${builtLocales.join(', ')}`);
}

const sourceFiles = await collectFiles(path.join(root, 'src'));
const forbiddenPatterns = [
  [/document\.cookie/i, 'cookie access'],
  [/google-analytics|googletagmanager|mixpanel|segment\.com|hotjar/i, 'tracking service'],
  [/https?:\/\//i, 'application backend call'],
];

for (const filename of sourceFiles.filter((name) => /\.(?:ts|css)$/.test(name))) {
  const source = await readFile(filename, 'utf8');
  for (const [pattern, label] of forbiddenPatterns) {
    if (pattern.test(source)) {
      throw new Error(`Unexpected ${label} in ${path.relative(root, filename)}.`);
    }
  }
}

console.log(`Application JavaScript: ${formatSize(appJavaScriptGzip)} gzip`);
console.log(`Application CSS: ${formatSize(appStylesGzip)} gzip`);
console.log(`Locale chunks: ${builtLocales.join(', ')} (loaded on demand)`);
console.log('No tracking, cookie access or application backend URL found in src.');

function assertBudget(label, actual, maximum) {
  if (actual > maximum) {
    throw new Error(`${label} exceeds its gzip budget: ${formatSize(actual)} > ${formatSize(maximum)}.`);
  }
}

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const filename = path.join(directory, entry.name);
        return entry.isDirectory() ? collectFiles(filename) : [filename];
      }),
    )
  ).flat();
}
