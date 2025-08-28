#!/usr/bin/env node
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/lessons/Lesson*.tsx');
let changed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const original = src;

  // Only process if there is a DS import
  const importRegex = /import\s*\{([\s\S]*?)\}\s*from\s*'\.\.\/design-system';/m;
  const m = src.match(importRegex);
  if (!m) continue;
  let block = m[1];

  // If file defines local Button, drop Button from DS import
  if (/const\s+Button\s*=\s*styled\.button/.test(src)) {
    block = block.replace(/\bButton\b,?\s*/g, '');
  }

  // If file defines local StatusDisplay, drop StatusDisplay from DS import
  if (/const\s+StatusDisplay\s*=\s*styled\./.test(src)) {
    block = block.replace(/\bStatusDisplay\b,?\s*/g, '');
  }

  // Clean up double commas and trailing commas before closing brace
  block = block.replace(/,\s*,/g, ', ').replace(/,\s*\}/, ' }');

  // Write back if changed
  const newSrc = src.replace(importRegex, `import {${block}} from '../design-system';`);
  if (newSrc !== original) {
    fs.writeFileSync(file, newSrc);
    console.log(`Removed DS collisions in ${file}`);
    changed++;
  }
}

console.log(`\nRemoved DS collisions in ${changed} files.`);
