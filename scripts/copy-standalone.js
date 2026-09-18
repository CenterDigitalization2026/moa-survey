const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');

console.log('[copy-standalone] Checking standalone directory:', standaloneDir);

if (!fs.existsSync(standaloneDir)) {
  console.error('[copy-standalone] Error: .next/standalone folder not found. Run "next build" first.');
  process.exit(1);
}

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`[copy-standalone] Copied "${path.relative(rootDir, src)}" -> "${path.relative(rootDir, dest)}"`);
  } else {
    console.warn(`[copy-standalone] Warning: Source "${path.relative(rootDir, src)}" does not exist.`);
  }
}

// Find possible standalone project root (in case Next creates nested structure)
const possibleRoots = [standaloneDir];

// Check for nested directory inside standalone that has a package.json or server.js
try {
  const entries = fs.readdirSync(standaloneDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      const nestedPath = path.join(standaloneDir, entry.name);
      if (fs.existsSync(path.join(nestedPath, 'server.js')) || fs.existsSync(path.join(nestedPath, 'package.json'))) {
        possibleRoots.push(nestedPath);
      }
    }
  }
} catch (e) {
  console.error('[copy-standalone] Error scanning standalone directories:', e);
}

// Copy public and .next/static to all relevant locations
const publicSrc = path.join(rootDir, 'public');
const staticSrc = path.join(rootDir, '.next', 'static');
const envSrc = path.join(rootDir, '.env.local');

for (const targetRoot of possibleRoots) {
  copyDir(publicSrc, path.join(targetRoot, 'public'));
  copyDir(staticSrc, path.join(targetRoot, '.next', 'static'));
  
  if (fs.existsSync(envSrc)) {
    const envDest = path.join(targetRoot, '.env.local');
    fs.copyFileSync(envSrc, envDest);
    console.log(`[copy-standalone] Copied .env.local -> "${path.relative(rootDir, envDest)}"`);
  }
}

console.log('[copy-standalone] Standalone static assets prepared successfully.');
