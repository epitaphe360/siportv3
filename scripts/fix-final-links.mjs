#!/usr/bin/env node

/**
 * Final Link Fixer - Adds aria-labels to all multi-line links
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

class FinalLinkFixer {
  constructor() {
    this.stats = { filesProcessed: 0, filesModified: 0, linksFixed: 0 };
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

    // Fix multi-line <a> tags without aria-label
    content = content.replace(
      /<a\s+([^>]*?)>\s*([^<]*?)<\/a>/gs,
      (match, attrs, innerText) => {
        if (attrs.includes('aria-label=')) return match;

        innerText = innerText.trim();
        if (!innerText) return match; // Skip if no text

        // Generate aria-label from href if possible
        const hrefMatch = attrs.match(/href=["']([^"']+)["']/);
        let ariaLabel = innerText;

        if (hrefMatch) {
          const href = hrefMatch[1];
          if (href.includes('mailto:')) {
            ariaLabel = `Envoyer un email à ${innerText}`;
          } else if (href.includes('tel:')) {
            ariaLabel = `Appeler le ${innerText}`;
          } else if (attrs.includes('target="_blank"')) {
            ariaLabel = `Ouvrir ${innerText} dans un nouvel onglet`;
          }
        }

        this.stats.linksFixed++;
        return match.replace('<a ', `<a aria-label="${ariaLabel}" `);
      }
    );

    // Fix <Link> components (React Router)
    content = content.replace(
      /<Link\s+([^>]*?)>\s*([^<]*?)<\/Link>/gs,
      (match, attrs, innerText) => {
        if (attrs.includes('aria-label=')) return match;

        innerText = innerText.trim();
        if (!innerText) return match;

        this.stats.linksFixed++;
        return match.replace('<Link ', `<Link aria-label="${innerText}" `);
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
    console.log('\n🎉 Final Link Fix Complete!\n');
    console.log('📊 Statistics:');
    console.log(`  Files Processed: ${this.stats.filesProcessed}`);
    console.log(`  Files Modified: ${this.stats.filesModified}`);
    console.log(`  Links Fixed: ${this.stats.linksFixed}\n`);
  }
}

console.log('🚀 Starting Final Link Fix...\n');
const fixer = new FinalLinkFixer();
fixer.fixDirectory(join(process.cwd(), 'src'));
fixer.printStats();
process.exit(0);
