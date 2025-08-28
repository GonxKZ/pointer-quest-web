#!/usr/bin/env node
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/lessons/Lesson*.tsx');
let changed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const original = src;
  // Replace <CodeBlock ...>text</CodeBlock> with <CodeBlock ...>{`text`}</CodeBlock>
  // If inside the tag we don't already have a JSX expression
  src = src.replace(/(<CodeBlock[^>]*>)([\s\S]*?)(<\/CodeBlock>)/g, (m, open, inner, close) => {
    const trimmed = inner.trimStart();
    if (trimmed.startsWith('{')) {
      return m; // already an expression child
    }
    const safe = inner.replace(/`/g, '\\`');
    return `${open}{\`${safe}\`}${close}`;
  });

  if (src !== original) {
    fs.writeFileSync(file, src);
    console.log(`Wrapped CodeBlock in ${file}`);
    changed++;
  }
}

console.log(`\nWrapped CodeBlock content in ${changed} files (where needed).`);
