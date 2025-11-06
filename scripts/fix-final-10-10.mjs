#!/usr/bin/env node

/**
 * FINAL 10/10 FIXER
 * Parses line-by-line to fix ALL remaining keyboard access issues
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const targetFiles = [
  'src/components/minisite/MiniSiteEditor.tsx',
  'src/pages/NetworkingPage.tsx',
  'src/components/visitor/PersonalCalendar.tsx',
  'src/components/ui/upload/MediaManager.tsx',
  'src/components/recommendations/UserRecommendations.tsx',
  'src/components/pavilions/PavillonsPage.tsx',
  'src/components/minisite/editor/SectionsList.tsx',
  'src/components/minisite/editor/EditableText.tsx',
  'src/components/minisite/MiniSiteGalleryManager.tsx',
  'src/components/minisite/MiniSiteBuilder.tsx',
  'src/components/dashboard/ExhibitorDashboard.tsx',
  'src/components/dashboard/AdminDashboard.tsx',
  'src/components/admin/PartnerCreationForm.tsx',
  'src/components/admin/MediaManager.tsx',
  'src/components/admin/ExhibitorCreationSimulator.tsx'
];

let totalFixed = 0;

console.log('🚀 FINAL 10/10 FIXER\n');

for (const file of targetFiles) {
  const filePath = join(process.cwd(), file);
  let content = readFileSync(filePath, 'utf-8');
  const original = content;
  let fixed = 0;

  // Strategy: Find ALL elements with onClick and ensure they have onKeyDown
  // Parse line by line to handle multi-line elements

  const lines = content.split('\n');
  let i = 0;
  const result = [];

  while (i < lines.length) {
    const line = lines[i];

    // Detect start of an element with onClick
    if (line.match(/<(div|motion\.div|tr|td|span|img|a|Link)\s/) &&
        (line.includes('onClick=') || (i < lines.length - 10 && lines.slice(i, i + 10).some(l => l.includes('onClick='))))) {

      // Collect the full opening tag
      let fullTag = line;
      let j = i + 1;
      let braceDepth = 0;

      // Count braces to find the end of the opening tag
      for (const char of line) {
        if (char === '<') braceDepth++;
        if (char === '>') braceDepth--;
      }

      while (j < lines.length && (braceDepth !== 0 || !fullTag.includes('>'))) {
        fullTag += '\n' + lines[j];
        for (const char of lines[j]) {
          if (char === '<') braceDepth++;
          if (char === '>') braceDepth--;
        }
        j++;
      }

      // Check if has onClick but not onKeyDown
      if (fullTag.includes('onClick=') && !fullTag.includes('onKeyDown')) {
        // Extract onClick handler
        const onClickMatch = fullTag.match(/onClick=\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);

        if (onClickMatch) {
          const onClick = onClickMatch[1].trim();
          const indent = line.match(/^(\s*)/)[1];

          // Add missing accessibility attributes
          let fixedTag = fullTag;

          // Add role if missing
          if (!fixedTag.includes('role=')) {
            fixedTag = fixedTag.replace(/(<(?:div|motion\.div|tr|td|span|img)\s)/, `$1role="button"\n${indent}        `);
          }

          // Add tabIndex if missing
          if (!fixedTag.includes('tabIndex')) {
            fixedTag = fixedTag.replace(/(<(?:div|motion\.div|tr|td|span|img)\s)/, `$1tabIndex={0}\n${indent}        `);
          }

          // Add onKeyDown
          const keyHandler = `onKeyDown={(e: React.KeyboardEvent) => {
${indent}          if (e.key === 'Enter' || e.key === ' ') {
${indent}            e.preventDefault();
${indent}            (${onClick})();
${indent}          }
${indent}        }}`;

          fixedTag = fixedTag.replace(/(onClick=\{[^}]+(?:\{[^}]*\}[^}]*)*\})/, `$1\n${indent}        ${keyHandler}`);

          result.push(...fixedTag.split('\n'));
          fixed++;
        } else {
          result.push(...fullTag.split('\n'));
        }
      } else {
        result.push(...fullTag.split('\n'));
      }

      i = j;
    } else {
      result.push(line);
      i++;
    }
  }

  content = result.join('\n');

  // Additional pass: Fix simple cases missed
  content = content.replace(
    /(<(?:div|motion\.div|tr|span|img)[^>]*?)onClick=\{([^}]+)\}([^>]*?)(>)/g,
    (match, before, onClick, after, close) => {
      if (match.includes('onKeyDown')) return match;

      const indent = before.match(/^\s*/)[0];
      const keyHandler = `\n${indent}        onKeyDown={(e: React.KeyboardEvent) => {
${indent}          if (e.key === 'Enter' || e.key === ' ') {
${indent}            e.preventDefault();
${indent}            ${onClick.replace(/^\(\) => /, '')};
${indent}          }
${indent}        }}`;

      return `${before}onClick={${onClick}}${keyHandler}${after}${close}`;
    }
  );

  if (content !== original) {
    writeFileSync(filePath, content);
    totalFixed += fixed || 1;
    console.log(`✅ ${file.replace('src/', '')}: fixed`);
  }
}

console.log(`\n🏆 TOTAL: ${totalFixed} fixes applied`);
console.log('🎯 Target: 10/10 PERFECT SCORE!\n');

process.exit(0);
