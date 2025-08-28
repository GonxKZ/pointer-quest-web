#!/usr/bin/env node

/**
 * Post-Migration Fix Script
 * 
 * Fixes common issues from the automated migration:
 * - Duplicate ButtonGroup tags
 * - Missing or incorrect CodeBlock language attributes
 * - Inconsistent spacing in components
 */

const fs = require('fs');
const path = require('path');

const LESSONS_DIR = path.join(__dirname, '../src/lessons');

function fixButtonGroupDuplicates(content) {
  // Remove nested ButtonGroups
  content = content.replace(/<ButtonGroup>\s*<ButtonGroup>/g, '<ButtonGroup>');
  content = content.replace(/<\/ButtonGroup>\s*<\/ButtonGroup>/g, '</ButtonGroup>');
  return content;
}

function fixCodeBlockLanguage(content) {
  // Ensure CodeBlock has language="cpp" attribute
  content = content.replace(/<CodeBlock>(\{`[^`]*`\})<\/CodeBlock>/g, '<CodeBlock language="cpp">$1</CodeBlock>');
  return content;
}

function fixComponentSpacing(content) {
  // Fix excessive spacing between components
  content = content.replace(/\n\n\n+/g, '\n\n');
  content = content.replace(/\s+<\/ButtonGroup>/g, '\n          </ButtonGroup>');
  content = content.replace(/\s+<\/InteractiveSection>/g, '\n        </InteractiveSection>');
  return content;
}

function removeObsoleteStyledComponents(content) {
  // Remove any remaining styled-components that weren't caught by the initial migration
  const styledComponentPatterns = [
    /const\s+\w+\s+=\s+styled\.\w+`[\s\S]*?`;?\n*/g,
    /const\s+\w+\s+=\s+styled\(\w+\)`[\s\S]*?`;?\n*/g
  ];
  
  for (const pattern of styledComponentPatterns) {
    content = content.replace(pattern, '');
  }
  
  return content;
}

function fixLessonStructure(content) {
  // Ensure proper lesson structure
  content = content.replace(/<div>\s*<SectionTitle>/g, '<InteractiveSection>\n          <SectionTitle>');
  content = content.replace(/<\/SectionTitle>\s*([\s\S]*?)\s*<\/div>/g, '</SectionTitle>\n$1\n        </InteractiveSection>');
  
  return content;
}

async function fixMigrationIssues() {
  console.log('🔧 Starting post-migration fixes...\n');
  
  const files = fs.readdirSync(LESSONS_DIR)
    .filter(file => file.startsWith('Lesson') && file.endsWith('.tsx'))
    .sort();
  
  let fixedCount = 0;
  
  for (const file of files) {
    const filepath = path.join(LESSONS_DIR, file);
    const originalContent = fs.readFileSync(filepath, 'utf8');
    let content = originalContent;
    
    // Apply fixes
    content = fixButtonGroupDuplicates(content);
    content = fixCodeBlockLanguage(content);
    content = fixComponentSpacing(content);
    content = removeObsoleteStyledComponents(content);
    content = fixLessonStructure(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filepath, content);
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  }
  
  console.log(`\n📊 Post-migration fixes complete! Fixed ${fixedCount} files.`);
}

// Run if called directly
if (require.main === module) {
  fixMigrationIssues().catch(console.error);
}

module.exports = { fixMigrationIssues };