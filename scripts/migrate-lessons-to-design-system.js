#!/usr/bin/env node

/**
 * Migration Script: Lessons to Design System
 * 
 * Migrates all lessons 11-120 from styled-components to the unified design system.
 * This script maintains functionality while applying consistent UI/UX patterns.
 */

const fs = require('fs');
const path = require('path');

const LESSONS_DIR = path.join(__dirname, '../src/lessons');
const MIGRATION_LOG = path.join(__dirname, 'migration-log.json');

// Lesson categorization by difficulty/topic
const LESSON_CATEGORIES = {
  intermediate: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
  advanced: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
  expert: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120]
};

// Common styled-components to design system mapping
const MIGRATION_PATTERNS = [
  {
    name: 'imports',
    pattern: /import React, { useState, useRef, useEffect } from 'react';\nimport styled from 'styled-components';\nimport { Canvas, useFrame } from '@react-three\/fiber';\nimport { OrbitControls, Text } from '@react-three\/drei';\nimport { Mesh, Group } from 'three';\nimport { THREE } from '\.\.\/utils\/three';/,
    replacement: `import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { THREE } from '../utils/three';
import { useApp } from '../context/AppContext';
import {
  LessonLayout,
  TheoryPanel,
  VisualizationPanel,
  Section,
  SectionTitle,
  Button,
  CodeBlock,
  InteractiveSection,
  theme,
  StatusDisplay,
  ButtonGroup
} from '../design-system';`
  },
  {
    name: 'container-structure',
    pattern: /const Container = styled\.div`[\s\S]*?`;[\s\S]*?const ControlPanel = styled\.div`[\s\S]*?`;/,
    replacement: `// Using design system - no need for styled components

const InputGroup = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '10px 0',
    flexWrap: 'wrap'
  }}>
    {children}
  </div>
);

const Input = ({ type, min, max, value, onChange, ...props }: {
  type?: string;
  min?: string;
  max?: string;
  value?: number | string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}) => (
  <input
    type={type}
    min={min}
    max={max}
    value={value}
    onChange={onChange}
    style={{
      background: 'rgba(0, 0, 0, 0.3)',
      border: \`1px solid \${theme.colors.primary}\`,
      borderRadius: '4px',
      padding: '8px 12px',
      color: 'white',
      fontFamily: 'inherit',
      width: type === 'number' ? '80px' : '200px'
    }}
    {...props}
  />
);`
  },
  {
    name: 'main-return-structure',
    pattern: /return \(\s*<Container>\s*<Header>\s*<Title>([^<]*)<\/Title>\s*<Subtitle>([^<]*)<\/Subtitle>\s*<\/Header>\s*<MainContent>\s*<VisualizationPanel>/,
    replacement: (match, title, subtitle, lessonNumber) => {
      const topic = getLessonTopic(lessonNumber);
      return `const { updateProgress } = useApp();
  
  useEffect(() => {
    updateProgress(${lessonNumber}, {
      completed: false,
      timeSpent: 0,
      hintsUsed: 0,
      errors: 0
    });
  }, [updateProgress]);

  const lessonColors = theme.colors.${topic};

  return (
    <LessonLayout
      title="${title}"
      subtitle="${subtitle}"
      lessonNumber={${lessonNumber}}
      topic="${topic}"
    >
      <VisualizationPanel>`;
    }
  }
];

function getLessonTopic(lessonNumber) {
  if (LESSON_CATEGORIES.intermediate.includes(lessonNumber)) return 'intermediate';
  if (LESSON_CATEGORIES.advanced.includes(lessonNumber)) return 'advanced';
  if (LESSON_CATEGORIES.expert.includes(lessonNumber)) return 'expert';
  return 'basic';
}

function extractLessonNumber(filename) {
  const match = filename.match(/Lesson(\d+)_/);
  return match ? parseInt(match[1]) : null;
}

async function migrateLessonFile(filepath) {
  console.log(`Migrating: ${path.basename(filepath)}`);
  
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    const lessonNumber = extractLessonNumber(path.basename(filepath));
    
    if (!lessonNumber || lessonNumber <= 10) {
      console.log(`  Skipping (already migrated or invalid): ${lessonNumber}`);
      return { success: false, reason: 'Already migrated or invalid' };
    }

    const originalContent = content;
    let changes = 0;

    // Apply migration patterns
    for (const pattern of MIGRATION_PATTERNS) {
      if (pattern.pattern.test(content)) {
        if (pattern.name === 'main-return-structure') {
          content = content.replace(pattern.pattern, (match, title, subtitle) => {
            return pattern.replacement(match, title, subtitle, lessonNumber);
          });
        } else {
          content = content.replace(pattern.pattern, pattern.replacement);
        }
        changes++;
        console.log(`  Applied pattern: ${pattern.name}`);
      }
    }

    // Generic transformations
    content = content.replace(/<TheorySection>/g, '<Section>');
    content = content.replace(/<\/TheorySection>/g, '</Section>');
    content = content.replace(/<h4>([^<]*)<\/h4>/g, '<SectionTitle>$1</SectionTitle>');
    content = content.replace(/<h3>([^<]*)<\/h3>/g, '<SectionTitle>$1</SectionTitle>');
    
    // Replace CodeBlock usage
    content = content.replace(/<CodeBlock>{`([^`]*)`}<\/CodeBlock>/g, '<CodeBlock language="cpp">$1</CodeBlock>');
    
    // Wrap interactive sections
    content = content.replace(/<div>\s*<h4>([^<]*)<\/h4>\s*([\s\S]*?)<\/div>/g, (match, title, body) => {
      if (title.includes('🎮') || title.includes('🔍') || title.includes('⚙️') || title.includes('🔧')) {
        return `<InteractiveSection>
          <SectionTitle>${title}</SectionTitle>
          ${body}
        </InteractiveSection>`;
      }
      return match;
    });

    // Add ButtonGroup wrapping where multiple buttons exist
    content = content.replace(/(<Button[^>]*>[^<]*<\/Button>\s*){2,}/g, (match) => {
      return `<ButtonGroup>\n            ${match.trim()}\n          </ButtonGroup>`;
    });

    // Close the layout structure
    content = content.replace(/<\/ControlPanel>\s*<\/MainContent>\s*<\/Container>\s*\);/, 
      `      </TheoryPanel>
    </LessonLayout>
  );`);

    // Replace ControlPanel with TheoryPanel  
    content = content.replace(/<ControlPanel>/g, '<TheoryPanel>');

    if (content !== originalContent) {
      // Create backup
      const backupPath = filepath + '.backup';
      fs.writeFileSync(backupPath, originalContent);
      
      // Write migrated content
      fs.writeFileSync(filepath, content);
      
      console.log(`  ✅ Successfully migrated with ${changes} pattern changes`);
      return { 
        success: true, 
        changes, 
        lessonNumber,
        topic: getLessonTopic(lessonNumber)
      };
    } else {
      console.log(`  ⚠️  No changes needed`);
      return { success: false, reason: 'No changes needed' };
    }

  } catch (error) {
    console.error(`  ❌ Error migrating ${filepath}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function migrateAllLessons() {
  console.log('🚀 Starting migration of lessons 11-120 to design system...\n');
  
  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    details: []
  };

  // Get all lesson files
  const files = fs.readdirSync(LESSONS_DIR)
    .filter(file => file.startsWith('Lesson') && file.endsWith('.tsx'))
    .sort();

  for (const file of files) {
    const filepath = path.join(LESSONS_DIR, file);
    const result = await migrateLessonFile(filepath);
    
    results.total++;
    
    if (result.success) {
      results.successful++;
    } else if (result.reason === 'Already migrated or invalid') {
      results.skipped++;
    } else {
      results.failed++;
    }
    
    results.details.push({
      file,
      ...result,
      timestamp: new Date().toISOString()
    });
  }

  // Save migration log
  fs.writeFileSync(MIGRATION_LOG, JSON.stringify(results, null, 2));

  console.log('\n📊 Migration Summary:');
  console.log(`Total files: ${results.total}`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Failed: ${results.failed}`);

  if (results.failed > 0) {
    console.log('\n❌ Failed migrations:');
    results.details
      .filter(d => !d.success && d.error)
      .forEach(d => console.log(`  ${d.file}: ${d.error}`));
  }

  console.log(`\n✅ Migration complete! Log saved to: ${MIGRATION_LOG}`);
}

// Run migration if called directly
if (require.main === module) {
  migrateAllLessons().catch(console.error);
}

module.exports = { migrateAllLessons, migrateLessonFile, LESSON_CATEGORIES };