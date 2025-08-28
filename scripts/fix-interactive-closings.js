#!/usr/bin/env node
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/lessons/Lesson*.tsx');
let changed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const original = src;
  // Replace patterns where InteractiveSection was incorrectly replaced by div after ButtonGroup
  src = src.replace(/(<\/ButtonGroup>)\s*<\/div>/g, '$1</InteractiveSection>');
  // Fix variants with extra closings like </div></div>
  src = src.replace(/(<\/ButtonGroup>)\s*<\/div>\s*<\/div>/g, '$1</InteractiveSection></div>');
  // Also fix lone sequences where an InteractiveSection open is not closed at end of Section
  // If a line contains '<InteractiveSection>' and later the next closing tag is '</div>' on its own line, replace it.
  src = src.replace(/<InteractiveSection>([\s\S]*?)<\/div>/g, (m, inner) => {
    // If inner contains a matching </InteractiveSection> already, skip
    if (/<\/InteractiveSection>/.test(inner)) return m;
    return `<InteractiveSection>${inner}</InteractiveSection>`;
  });

  if (src !== original) {
    fs.writeFileSync(file, src);
    console.log(`Fixed InteractiveSection closings in ${file}`);
    changed++;
  }
}

console.log(`\nFixed closings in ${changed} files.`);
