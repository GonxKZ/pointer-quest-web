#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/lessons/Lesson*.tsx');
let changed = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const needsDS = /<LessonLayout|<TheoryPanel|<VisualizationPanel|<SectionTitle|<InteractiveSection|<StatusDisplay|<CodeBlock|<ButtonGroup/.test(content);
  const hasImport = /from '\.\.\/design-system'/.test(content);
  if (needsDS && !hasImport) {
    const importLine = "import {\n  LessonLayout,\n  TheoryPanel,\n  VisualizationPanel,\n  Section,\n  SectionTitle,\n  CodeBlock,\n  InteractiveSection,\n  StatusDisplay,\n  ButtonGroup,\n  theme\n} from '../design-system';\n\n";
    // Insert after the last import line block at top
    const lines = content.split('\n');
    let insertIdx = 0;
    while (insertIdx < lines.length && /^\s*import\b/.test(lines[insertIdx])) {
      insertIdx++;
    }
    lines.splice(insertIdx, 0, importLine);
    fs.writeFileSync(file, lines.join('\n'));
    console.log(`Added DS import to ${file}`);
    changed++;
  }
}

console.log(`\nDS imports added to ${changed} files.`);
