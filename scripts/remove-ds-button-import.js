#!/usr/bin/env node
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/lessons/Lesson*.tsx');
let changed = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (!/const\s+Button\s*=\s*styled\.button/.test(src)) continue; // only files with local Button
  // Find DS import line
  const importRegex = /import\s*\{([\s\S]*?)\}\s*from\s*'\.\.\/design-system';/m;
  const m = src.match(importRegex);
  if (!m) continue;
  let importBlock = m[1];
  if (!/\bButton\b/.test(importBlock)) continue; // nothing to remove
  // Remove 'Button' and any adjacent commas/whitespace
  let newImportBlock = importBlock
    .replace(/\bButton\b,?\s*/g, '')
    .replace(/,\s*\}/, ' }');
  const newSrc = src.replace(importRegex, `import {${newImportBlock}} from '../design-system';`);
  fs.writeFileSync(file, newSrc);
  console.log(`Removed DS Button import from ${file}`);
  changed++;
}

console.log(`\nRemoved DS Button import in ${changed} files.`);
