import { build } from 'esbuild';
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

function findTsFiles(dir, base = dir) {
  let files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry === 'dist' || entry === 'tests') continue;
    if (statSync(full).isDirectory()) {
      files = files.concat(findTsFiles(full, base));
    } else if (entry.endsWith('.ts')) {
      files.push(relative(base, full));
    }
  }
  return files;
}

const files = findTsFiles('.');

await build({
  entryPoints: files,
  outdir: 'dist',
  bundle: false,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  sourcemap: true,
});

console.log('Build complete');
