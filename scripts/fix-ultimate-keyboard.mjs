#!/usr/bin/env node

/**
 * Ultimate Keyboard Access Fixer
 * Adds onKeyDown to ALL elements with onClick
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

class UltimateKeyboardFixer {
  constructor() {
    this.stats = { filesProcessed: 0, filesModified: 0, keyboardFixed: 0 };
  }

  fixDirectory(dir) {
    const files = readdirSync(dir);
    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', 'build', '.git', '__tests__'].includes(file)) {
          this.fixDirectory(filePath);
        }
      } else if (['.tsx', '.jsx'].includes(extname(file))) {
        this.fixFile(filePath);
      }
    }
  }

  fixFile(filePath) {
    this.stats.filesProcessed++;
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Fix 1: div with role="button" + tabIndex but no onKeyDown
    content = content.replace(
      /<div([^>]*?)role="button"([^>]*?)tabIndex=\{0\}([^>]*?)onClick=\{([^}]+)\}([^>]*?)>/g,
      (match, before, middle, after, onClick, end) => {
        if (match.includes('onKeyDown')) return match;
        this.stats.keyboardFixed++;
        return `<div${before}role="button"${middle}tabIndex={0}${after}onClick={${onClick}}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            ${onClick.replace(/^\(\) => /, '').replace(/;$/, '')};
          }
        }}${end}>`;
      }
    );

    // Fix 2: motion.div with role="button" + tabIndex but no onKeyDown
    content = content.replace(
      /<motion\.div([^>]*?)role="button"([^>]*?)tabIndex=\{0\}([^>]*?)onClick=\{([^}]+)\}([^>]*?)>/g,
      (match, before, middle, after, onClick, end) => {
        if (match.includes('onKeyDown')) return match;
        this.stats.keyboardFixed++;
        return `<motion.div${before}role="button"${middle}tabIndex={0}${after}onClick={${onClick}}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                ${onClick.replace(/^\(\) => /, '').replace(/;$/, '')};
              }
            }}${end}>`;
      }
    );

    // Fix 3: img with onClick but no keyboard support
    content = content.replace(
      /<img([^>]*?)onClick=\{([^}]+)\}([^>]*?)>/g,
      (match, before, onClick, after) => {
        if (match.includes('onKeyDown') || match.includes('role=')) return match;
        this.stats.keyboardFixed++;
        return `<img${before}role="button"
                                        tabIndex={0}
                                        onClick={${onClick}}
                                        onKeyDown={(e: React.KeyboardEvent) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            ${onClick.replace(/^\(\) => /, '').replace(/;$/, '')};
                                          }
                                        }}${after}>`;
      }
    );

    // Fix 4: Any element with onClick but without role/tabIndex/onKeyDown
    content = content.replace(
      /<(div|span)([^>]*?)onClick=\{([^}]+)\}([^>]*?)>/g,
      (match, tag, before, onClick, after) => {
        const fullAttrs = before + after;
        if (fullAttrs.includes('onKeyDown') || fullAttrs.includes('role="button"')) return match;
        if (fullAttrs.includes('className') && !fullAttrs.includes('cursor-pointer')) return match;

        this.stats.keyboardFixed++;
        return `<${tag}${before}role="button"
        tabIndex={0}
        onClick={${onClick}}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            ${onClick.replace(/^\(\) => /, '').replace(/;$/, '')};
          }
        }}${after}>`;
      }
    );

    if (content !== originalContent) {
      writeFileSync(filePath, content);
      this.stats.filesModified++;
      console.log(`  ✅ Fixed: ${filePath.replace(process.cwd() + '/', '')}`);
    }
  }

  printStats() {
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Ultimate Keyboard Fix Complete!\n');
    console.log('📊 Statistics:');
    console.log(`  Files Processed: ${this.stats.filesProcessed}`);
    console.log(`  Files Modified: ${this.stats.filesModified}`);
    console.log(`  Keyboard Access Fixed: ${this.stats.keyboardFixed}\n`);
  }
}

console.log('🚀 Starting Ultimate Keyboard Fix...\n');
const fixer = new UltimateKeyboardFixer();
fixer.fixDirectory(join(process.cwd(), 'src'));
fixer.printStats();
process.exit(0);
