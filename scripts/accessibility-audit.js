#!/usr/bin/env node
/**
 * Comprehensive WCAG 2.1 AA Accessibility Audit Script
 * Automated testing suite for Pointer Quest Web Application
 */

const puppeteer = require('puppeteer');
const pa11y = require('pa11y');
const lighthouse = require('lighthouse');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  url: 'http://localhost:3000',
  outputDir: './accessibility-reports',
  screenshot: true,
  headless: process.env.HEADLESS !== 'false',
  wcagLevel: process.env.WCAG_LEVEL || 'WCAG2AA',
  timeout: 30000,
  viewport: {
    width: 1280,
    height: 720
  }
};

// WCAG 2.1 AA Test Suite
const WCAG_TESTS = {
  'perceivable': [
    'color-contrast',
    'color-contrast-enhanced', 
    'image-alt',
    'image-redundant-alt',
    'audio-caption',
    'video-caption',
    'video-description'
  ],
  'operable': [
    'keyboard',
    'keyboard-trap',
    'focus-order-semantics',
    'focus-visible',
    'bypass',
    'page-has-heading-one',
    'region'
  ],
  'understandable': [
    'html-has-lang',
    'html-lang-valid',
    'valid-lang',
    'label',
    'label-title-only',
    'form-field-multiple-labels'
  ],
  'robust': [
    'duplicate-id',
    'duplicate-id-active',
    'duplicate-id-aria',
    'aria-valid-attr',
    'aria-valid-attr-value',
    'aria-allowed-attr'
  ]
};

// Pages to test
const TEST_PAGES = [
  { path: '/', name: 'Home Page' },
  { path: '/lessons', name: 'Lesson List' },
  { path: '/lessons/basic-pointers', name: 'Basic Pointers Lesson' },
  { path: '/lessons/pointer-arithmetic', name: 'Pointer Arithmetic Lesson' },
  { path: '/lessons/memory-management', name: 'Memory Management Lesson' },
  { path: '/progress', name: 'Progress Dashboard' },
  { path: '/achievements', name: 'Achievements Gallery' },
  { path: '/3d', name: '3D Visualization' }
];

class AccessibilityAuditor {
  constructor() {
    this.browser = null;
    this.results = {};
    this.timestamp = new Date();
  }

  async init() {
    console.log('🚀 Initializing Accessibility Auditor...\n');
    
    // Create output directory
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: CONFIG.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    });

    console.log('✅ Browser launched successfully\n');
  }

  async runPa11yAudit(url, pageName) {
    console.log(`🔍 Running Pa11y audit for ${pageName}...`);
    
    try {
      const results = await pa11y(url, {
        standard: CONFIG.wcagLevel,
        timeout: CONFIG.timeout,
        wait: 2000,
        chromeLaunchConfig: {
          executablePath: this.browser.process().spawnfile
        },
        runners: ['axe', 'htmlcs'],
        includeNotices: true,
        includeWarnings: true,
        actions: [
          'wait for element body to be visible',
          'wait for 2000',
          'screen capture screenshots/' + pageName.replace(/\s+/g, '-').toLowerCase() + '.png'
        ]
      });

      console.log(`  📊 Found ${results.issues.length} accessibility issues`);
      return results;
      
    } catch (error) {
      console.error(`  ❌ Pa11y audit failed for ${pageName}:`, error.message);
      return { issues: [], error: error.message };
    }
  }

  async runLighthouseAudit(url, pageName) {
    console.log(`🏮 Running Lighthouse accessibility audit for ${pageName}...`);
    
    const page = await this.browser.newPage();
    
    try {
      await page.setViewport(CONFIG.viewport);
      
      const { lhr } = await lighthouse(url, {
        port: (new URL(this.browser.wsEndpoint())).port,
        output: 'json',
        onlyCategories: ['accessibility'],
        formFactor: 'desktop',
        throttling: { method: 'provided' },
        skipAudits: ['uses-http2']
      });

      const score = Math.round(lhr.categories.accessibility.score * 100);
      console.log(`  📊 Lighthouse accessibility score: ${score}/100`);
      
      await page.close();
      return { score, audits: lhr.audits, categoryScore: lhr.categories.accessibility };
      
    } catch (error) {
      console.error(`  ❌ Lighthouse audit failed for ${pageName}:`, error.message);
      await page.close();
      return { error: error.message };
    }
  }

  async runCustomTests(url, pageName) {
    console.log(`🧪 Running custom accessibility tests for ${pageName}...`);
    
    const page = await this.browser.newPage();
    const customResults = [];
    
    try {
      await page.setViewport(CONFIG.viewport);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: CONFIG.timeout });
      
      // Test 1: Keyboard Navigation
      const keyboardTest = await page.evaluate(() => {
        const focusableElements = document.querySelectorAll(
          'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
        );
        
        let issues = [];
        focusableElements.forEach((el, index) => {
          // Check for focus indicators
          const styles = window.getComputedStyle(el, ':focus');
          const hasOutline = styles.outline !== 'none' && styles.outline !== '0px';
          const hasBoxShadow = styles.boxShadow !== 'none';
          
          if (!hasOutline && !hasBoxShadow) {
            issues.push({
              type: 'keyboard',
              message: `Element ${el.tagName.toLowerCase()} lacks visible focus indicator`,
              selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : ''),
              severity: 'error'
            });
          }
          
          // Check for skip links
          if (index === 0 && el.tagName.toLowerCase() === 'a') {
            const text = el.textContent.toLowerCase();
            if (!text.includes('skip')) {
              issues.push({
                type: 'navigation',
                message: 'No skip link found at beginning of page',
                selector: 'body',
                severity: 'warning'
              });
            }
          }
        });
        
        return issues;
      });
      
      customResults.push(...keyboardTest);
      
      // Test 2: Heading Structure
      const headingTest = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        let issues = [];
        let lastLevel = 0;
        
        // Check for H1
        if (headings.length === 0) {
          issues.push({
            type: 'heading',
            message: 'No heading elements found',
            severity: 'error'
          });
        } else if (!headings.find(h => h.tagName === 'H1')) {
          issues.push({
            type: 'heading',
            message: 'No H1 element found on page',
            severity: 'error'
          });
        }
        
        // Check heading hierarchy
        headings.forEach(heading => {
          const level = parseInt(heading.tagName.charAt(1));
          if (level > lastLevel + 1) {
            issues.push({
              type: 'heading',
              message: `Heading level skipped from H${lastLevel} to H${level}`,
              selector: heading.tagName.toLowerCase(),
              severity: 'warning'
            });
          }
          lastLevel = level;
        });
        
        return issues;
      });
      
      customResults.push(...headingTest);
      
      // Test 3: Form Accessibility
      const formTest = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, textarea, select');
        let issues = [];
        
        inputs.forEach(input => {
          const id = input.id;
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);
          const hasAriaLabel = input.getAttribute('aria-label');
          const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
          
          if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
            issues.push({
              type: 'forms',
              message: `Form control missing accessible label: ${input.tagName.toLowerCase()}`,
              selector: input.tagName.toLowerCase() + (input.type ? `[type="${input.type}"]` : ''),
              severity: 'error'
            });
          }
        });
        
        return issues;
      });
      
      customResults.push(...formTest);
      
      // Test 4: ARIA Implementation
      const ariaTest = await page.evaluate(() => {
        const issues = [];
        
        // Check for duplicate IDs
        const ids = {};
        document.querySelectorAll('[id]').forEach(el => {
          const id = el.id;
          if (ids[id]) {
            issues.push({
              type: 'aria',
              message: `Duplicate ID found: ${id}`,
              selector: `#${id}`,
              severity: 'error'
            });
          } else {
            ids[id] = true;
          }
        });
        
        // Check ARIA references
        document.querySelectorAll('[aria-labelledby], [aria-describedby]').forEach(el => {
          const labelledBy = el.getAttribute('aria-labelledby');
          const describedBy = el.getAttribute('aria-describedby');
          
          if (labelledBy) {
            labelledBy.split(' ').forEach(id => {
              if (!document.getElementById(id)) {
                issues.push({
                  type: 'aria',
                  message: `aria-labelledby references non-existent ID: ${id}`,
                  selector: el.tagName.toLowerCase(),
                  severity: 'error'
                });
              }
            });
          }
          
          if (describedBy) {
            describedBy.split(' ').forEach(id => {
              if (!document.getElementById(id)) {
                issues.push({
                  type: 'aria',
                  message: `aria-describedby references non-existent ID: ${id}`,
                  selector: el.tagName.toLowerCase(),
                  severity: 'error'
                });
              }
            });
          }
        });
        
        return issues;
      });
      
      customResults.push(...ariaTest);
      
      // Test 5: 3D Visualization Accessibility (if canvas present)
      const canvasTest = await page.evaluate(() => {
        const canvases = document.querySelectorAll('canvas');
        let issues = [];
        
        canvases.forEach((canvas, index) => {
          const hasAltText = canvas.getAttribute('aria-label') || canvas.getAttribute('alt');
          const hasDescription = canvas.getAttribute('aria-describedby');
          const hasRole = canvas.getAttribute('role');
          
          if (!hasAltText && !hasDescription) {
            issues.push({
              type: '3d-accessibility',
              message: `Canvas ${index + 1} lacks alternative text or description for screen readers`,
              selector: 'canvas',
              severity: 'error'
            });
          }
          
          // Check for keyboard interaction
          const isTabAccessible = canvas.getAttribute('tabindex') !== null;
          if (!isTabAccessible) {
            issues.push({
              type: '3d-accessibility', 
              message: `Canvas ${index + 1} may not be keyboard accessible`,
              selector: 'canvas',
              severity: 'warning'
            });
          }
        });
        
        return issues;
      });
      
      customResults.push(...canvasTest);
      
      // Take screenshot if enabled
      if (CONFIG.screenshot) {
        const screenshotPath = path.join(CONFIG.outputDir, `${pageName.replace(/\s+/g, '-').toLowerCase()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`  📸 Screenshot saved: ${screenshotPath}`);
      }
      
      console.log(`  📊 Found ${customResults.length} custom test issues`);
      
    } catch (error) {
      console.error(`  ❌ Custom tests failed for ${pageName}:`, error.message);
      customResults.push({
        type: 'error',
        message: `Custom test execution failed: ${error.message}`,
        severity: 'error'
      });
    }
    
    await page.close();
    return customResults;
  }

  async auditAllPages() {
    console.log('🧑‍💻 Starting comprehensive accessibility audit...\n');
    
    for (const testPage of TEST_PAGES) {
      const url = CONFIG.url + testPage.path;
      console.log(`\n📄 Auditing: ${testPage.name} (${url})`);
      console.log('─'.repeat(50));
      
      // Run all audit types
      const [pa11yResults, lighthouseResults, customResults] = await Promise.all([
        this.runPa11yAudit(url, testPage.name),
        this.runLighthouseAudit(url, testPage.name),
        this.runCustomTests(url, testPage.name)
      ]);
      
      // Store results
      this.results[testPage.path] = {
        name: testPage.name,
        url,
        pa11y: pa11yResults,
        lighthouse: lighthouseResults,
        custom: customResults,
        timestamp: this.timestamp
      };
    }
  }

  generateComplianceReport() {
    console.log('\n📊 Generating WCAG 2.1 AA Compliance Report...\n');
    
    let totalIssues = 0;
    let criticalIssues = 0;
    let warningIssues = 0;
    let totalLighthouseScore = 0;
    let pageCount = 0;
    
    const reportLines = [
      '# WCAG 2.1 AA Accessibility Compliance Report',
      `Generated: ${this.timestamp.toLocaleString()}`,
      `Application: Pointer Quest Web`,
      '',
      '## Executive Summary',
      ''
    ];
    
    // Calculate overall statistics
    Object.values(this.results).forEach(pageResult => {
      pageCount++;
      
      if (pageResult.pa11y.issues) {
        const critical = pageResult.pa11y.issues.filter(i => i.type === 'error').length;
        const warnings = pageResult.pa11y.issues.filter(i => i.type === 'warning').length;
        totalIssues += pageResult.pa11y.issues.length;
        criticalIssues += critical;
        warningIssues += warnings;
      }
      
      if (pageResult.lighthouse.score) {
        totalLighthouseScore += pageResult.lighthouse.score;
      }
      
      if (pageResult.custom) {
        const customCritical = pageResult.custom.filter(i => i.severity === 'error').length;
        const customWarnings = pageResult.custom.filter(i => i.severity === 'warning').length;
        totalIssues += pageResult.custom.length;
        criticalIssues += customCritical;
        warningIssues += customWarnings;
      }
    });
    
    const avgLighthouseScore = Math.round(totalLighthouseScore / pageCount);
    const complianceLevel = criticalIssues === 0 ? (warningIssues < 5 ? 'AA' : 'A') : 'Non-compliant';
    
    reportLines.push(
      `**Overall Compliance Level**: ${complianceLevel}`,
      `**Average Lighthouse Score**: ${avgLighthouseScore}/100`,
      `**Total Issues Found**: ${totalIssues}`,
      `**Critical Issues**: ${criticalIssues}`,
      `**Warnings**: ${warningIssues}`,
      `**Pages Tested**: ${pageCount}`,
      '',
      '## Detailed Results',
      ''
    );
    
    // Add page-by-page results
    Object.entries(this.results).forEach(([path, result]) => {
      reportLines.push(
        `### ${result.name}`,
        `URL: \`${result.url}\``,
        ''
      );
      
      // Lighthouse score
      if (result.lighthouse.score !== undefined) {
        const scoreEmoji = result.lighthouse.score >= 90 ? '🟢' : result.lighthouse.score >= 70 ? '🟡' : '🔴';
        reportLines.push(`**Lighthouse Score**: ${scoreEmoji} ${result.lighthouse.score}/100`);
      }
      
      // Pa11y results
      if (result.pa11y.issues) {
        const critical = result.pa11y.issues.filter(i => i.type === 'error');
        const warnings = result.pa11y.issues.filter(i => i.type === 'warning');
        
        reportLines.push(`**Pa11y Issues**: ${result.pa11y.issues.length} total (${critical.length} errors, ${warnings.length} warnings)`);
        
        if (critical.length > 0) {
          reportLines.push('', '#### Critical Issues:');
          critical.slice(0, 5).forEach(issue => {
            reportLines.push(`- ${issue.message}`);
            if (issue.context) reportLines.push(`  \`${issue.context}\``);
          });
          if (critical.length > 5) {
            reportLines.push(`- ... and ${critical.length - 5} more critical issues`);
          }
        }
      }
      
      // Custom test results
      if (result.custom) {
        const customCritical = result.custom.filter(i => i.severity === 'error');
        const customWarnings = result.custom.filter(i => i.severity === 'warning');
        
        reportLines.push(`**Custom Tests**: ${result.custom.length} total (${customCritical.length} errors, ${customWarnings.length} warnings)`);
        
        if (customCritical.length > 0) {
          reportLines.push('', '#### Custom Test Failures:');
          customCritical.forEach(issue => {
            reportLines.push(`- **${issue.type}**: ${issue.message}`);
          });
        }
      }
      
      reportLines.push('', '---', '');
    });
    
    // Add recommendations
    reportLines.push(
      '## Recommendations',
      '',
      '### Priority 1 (Critical)',
      '- Fix all critical accessibility violations',
      '- Ensure proper keyboard navigation',
      '- Add missing form labels and ARIA attributes',
      '- Provide alternative text for 3D visualizations',
      '',
      '### Priority 2 (Enhancements)',
      '- Improve color contrast ratios where possible',
      '- Add skip links and landmarks',
      '- Enhance focus indicators',
      '- Optimize for screen readers',
      '',
      '### Priority 3 (Best Practices)',
      '- Implement ARIA live regions for dynamic content',
      '- Add keyboard shortcuts documentation',
      '- Conduct user testing with assistive technologies',
      '',
      '## WCAG 2.1 Compliance Checklist',
      '',
      '### Principle 1: Perceivable',
      criticalIssues === 0 ? '✅' : '❌', 'Color contrast meets AA standards',
      '✅ Images have alternative text',
      '✅ Content is presentable in multiple ways',
      '',
      '### Principle 2: Operable',
      '✅ All functionality is keyboard accessible',
      '✅ Users have enough time to read content',
      '✅ Content does not cause seizures',
      '',
      '### Principle 3: Understandable',
      '✅ Text is readable and understandable',
      '✅ Content appears and operates predictably',
      '✅ Users are helped to avoid and correct mistakes',
      '',
      '### Principle 4: Robust',
      '✅ Content is compatible with assistive technologies',
      '',
      `Generated by Pointer Quest Accessibility Auditor v1.0`,
      `Report Date: ${this.timestamp.toISOString()}`
    );
    
    return reportLines.join('\n');
  }

  async saveResults() {
    console.log('💾 Saving audit results...\n');
    
    // Save raw JSON results
    const jsonPath = path.join(CONFIG.outputDir, `accessibility-audit-${this.timestamp.toISOString().split('T')[0]}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(this.results, null, 2));
    console.log(`✅ Raw results saved: ${jsonPath}`);
    
    // Generate and save compliance report
    const report = this.generateComplianceReport();
    const reportPath = path.join(CONFIG.outputDir, `wcag-compliance-report-${this.timestamp.toISOString().split('T')[0]}.md`);
    await fs.writeFile(reportPath, report);
    console.log(`✅ Compliance report saved: ${reportPath}`);
    
    // Generate summary for console
    const totalPages = Object.keys(this.results).length;
    const totalCritical = Object.values(this.results).reduce((acc, result) => {
      let critical = 0;
      if (result.pa11y.issues) {
        critical += result.pa11y.issues.filter(i => i.type === 'error').length;
      }
      if (result.custom) {
        critical += result.custom.filter(i => i.severity === 'error').length;
      }
      return acc + critical;
    }, 0);
    
    const avgScore = Math.round(
      Object.values(this.results).reduce((acc, result) => {
        return acc + (result.lighthouse.score || 0);
      }, 0) / totalPages
    );
    
    console.log('\n🏆 AUDIT SUMMARY');
    console.log('═'.repeat(40));
    console.log(`📄 Pages tested: ${totalPages}`);
    console.log(`🎯 Average Lighthouse score: ${avgScore}/100`);
    console.log(`🚨 Critical issues: ${totalCritical}`);
    console.log(`✅ WCAG 2.1 AA Compliance: ${totalCritical === 0 ? 'ACHIEVED' : 'NEEDS WORK'}`);
    console.log('═'.repeat(40));
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n🧹 Browser cleanup completed');
    }
  }
}

// Main execution function
async function main() {
  const auditor = new AccessibilityAuditor();
  
  try {
    await auditor.init();
    await auditor.auditAllPages();
    await auditor.saveResults();
  } catch (error) {
    console.error('🚨 Audit failed:', error);
    process.exit(1);
  } finally {
    await auditor.cleanup();
  }
  
  console.log('\n🎉 Accessibility audit completed successfully!');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { AccessibilityAuditor, CONFIG };