#!/usr/bin/env node

/**
 * Advanced Accessibility Fixer
 * Fixes remaining complex issues: links without text, nested inputs, etc.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

class AdvancedAccessibilityFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      linksFixed: 0,
      textareasFixed: 0,
      selectsFixed: 0,
      nestedInputsFixed: 0,
      imagesFixed: 0
    };
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

    // Fix 1: Links with only icons (multi-line)
    content = content.replace(
      /<a\s+([^>]*?)>\s*<([A-Z]\w+)\s+([^>]*?)\/>\s*<\/a>/gs,
      (match, attrs, iconName, iconAttrs) => {
        if (attrs.includes('aria-label=')) return match;

        // Determine label from href
        let label = 'Link';
        const hrefMatch = attrs.match(/href=["']([^"']+)["']/);
        if (hrefMatch) {
          const href = hrefMatch[1];
          if (href.includes('mailto:')) {
            label = 'Send email';
          } else if (href.includes('tel:')) {
            label = 'Call phone number';
          } else if (href.includes('facebook')) {
            label = 'Visit Facebook page';
          } else if (href.includes('twitter') || href.includes('x.com')) {
            label = 'Visit Twitter/X page';
          } else if (href.includes('linkedin')) {
            label = 'Visit LinkedIn page';
          } else if (href.includes('instagram')) {
            label = 'Visit Instagram page';
          } else if (href.includes('youtube')) {
            label = 'Visit YouTube channel';
          } else {
            label = this.iconToLabel(iconName);
          }
        } else {
          label = this.iconToLabel(iconName);
        }

        this.stats.linksFixed++;
        return `<a ${attrs} aria-label="${label}">\n                  <${iconName} ${iconAttrs}/>\n                </a>`;
      }
    );

    // Fix 2: Link with only icons (single line)
    content = content.replace(
      /<Link\s+([^>]*?)>\s*<([A-Z]\w+)\s+([^>]*?)\/>\s*<\/Link>/g,
      (match, attrs, iconName, iconAttrs) => {
        if (attrs.includes('aria-label=')) return match;
        const label = this.iconToLabel(iconName);
        this.stats.linksFixed++;
        return `<Link ${attrs} aria-label="${label}"><${iconName} ${iconAttrs}/></Link>`;
      }
    );

    // Fix 3: Textareas without aria-label
    content = content.replace(
      /<textarea\s+([^>]*?)>/g,
      (match, attrs) => {
        if (attrs.includes('aria-label=') || attrs.includes('id=')) return match;

        const placeholderMatch = attrs.match(/placeholder=["']([^"']+)["']/);
        const nameMatch = attrs.match(/name=["']([^"']+)["']/);

        let label = 'Text area';
        if (placeholderMatch) {
          label = placeholderMatch[1];
        } else if (nameMatch) {
          label = this.humanize(nameMatch[1]);
        }

        this.stats.textareasFixed++;
        return `<textarea ${attrs}\n                  aria-label="${label}">`;
      }
    );

    // Fix 4: Select without aria-label
    content = content.replace(
      /<select\s+([^>]*?)>/g,
      (match, attrs) => {
        if (attrs.includes('aria-label=') || attrs.includes('id=')) return match;

        const nameMatch = attrs.match(/name=["']([^"']+)["']/);
        const valueMatch = attrs.match(/value=\{[^}]*\.(\w+)\}/);

        let label = 'Select option';
        if (nameMatch) {
          label = this.humanize(nameMatch[1]);
        } else if (valueMatch) {
          label = this.humanize(valueMatch[1]);
        }

        this.stats.selectsFixed++;
        return `<select ${attrs}\n                aria-label="${label}">`;
      }
    );

    // Fix 5: Images without alt text
    content = content.replace(
      /<img\s+([^>]*?)>/g,
      (match, attrs) => {
        if (attrs.includes('alt=')) return match;

        const srcMatch = attrs.match(/src=["']([^"']+)["']/);
        let alt = 'Image';

        if (srcMatch) {
          const src = srcMatch[1];
          const filename = src.split('/').pop()?.split('.')[0] || 'image';
          alt = this.humanize(filename);
        }

        this.stats.imagesFixed++;
        return `<img ${attrs} alt="${alt}">`;
      }
    );

    // Fix 6: Nested multi-line inputs (more aggressive)
    const lines = content.split('\n');
    const fixedLines = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check if line contains <input without closing
      if (line.includes('<input') && !line.includes('/>') && !line.includes('aria-label=')) {
        // Look ahead to find the closing >
        let fullInput = line;
        let j = i + 1;
        while (j < lines.length && !fullInput.includes('>')) {
          fullInput += '\n' + lines[j];
          j++;
        }

        // Extract attributes
        const match = fullInput.match(/<input\s+([^>]+)>/);
        if (match) {
          const attrs = match[1];

          // Skip if already has aria-label or is hidden
          if (!attrs.includes('aria-label=') &&
              !attrs.includes('type="hidden"') &&
              !attrs.includes('type="submit"')) {

            // Try to extract label
            const placeholderMatch = attrs.match(/placeholder=["']([^"']+)["']/);
            const nameMatch = attrs.match(/name=["']([^"']+)["']/);
            const valueMatch = attrs.match(/value=\{[^}]*\.(\w+)\}/);

            let label = 'Input';
            if (placeholderMatch) {
              label = placeholderMatch[1];
            } else if (valueMatch) {
              label = this.humanize(valueMatch[1]);
            } else if (nameMatch) {
              label = this.humanize(nameMatch[1]);
            }

            // Insert aria-label before the closing >
            fullInput = fullInput.replace('>', `\n                      aria-label="${label}">`);
            this.stats.nestedInputsFixed++;
          }
        }

        fixedLines.push(fullInput);
        i = j;
      } else {
        fixedLines.push(line);
        i++;
      }
    }

    if (fixedLines.length > 0 && fixedLines.join('\n') !== content) {
      content = fixedLines.join('\n');
    }

    if (content !== originalContent) {
      writeFileSync(filePath, content);
      this.stats.filesModified++;
      console.log(`  ✅ Fixed: ${filePath.replace(process.cwd() + '/', '')}`);
    }
  }

  humanize(str) {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  iconToLabel(iconName) {
    const labels = {
      'Mail': 'Email',
      'Phone': 'Phone',
      'MapPin': 'Location',
      'Facebook': 'Facebook',
      'Twitter': 'Twitter',
      'Linkedin': 'LinkedIn',
      'Instagram': 'Instagram',
      'Youtube': 'YouTube',
      'ExternalLink': 'Open link',
      'Globe': 'Website',
      'MessageCircle': 'Message',
      'Send': 'Send',
      'ArrowRight': 'Go',
      'ArrowLeft': 'Back',
      'Download': 'Download',
      'Upload': 'Upload',
      'Share': 'Share',
      'Edit': 'Edit',
      'Trash': 'Delete',
      'X': 'Close',
      'Plus': 'Add',
      'Check': 'Confirm',
      'Eye': 'View',
      'Search': 'Search',
      'Filter': 'Filter',
      'Calendar': 'Calendar',
      'User': 'Profile'
    };

    return labels[iconName] || iconName.replace(/([A-Z])/g, ' $1').trim();
  }

  printStats() {
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Advanced Accessibility Fix Complete!\n');
    console.log('📊 Statistics:');
    console.log(`  Files Processed: ${this.stats.filesProcessed}`);
    console.log(`  Files Modified: ${this.stats.filesModified}`);
    console.log(`  Links Fixed: ${this.stats.linksFixed}`);
    console.log(`  Textareas Fixed: ${this.stats.textareasFixed}`);
    console.log(`  Selects Fixed: ${this.stats.selectsFixed}`);
    console.log(`  Nested Inputs Fixed: ${this.stats.nestedInputsFixed}`);
    console.log(`  Images Fixed: ${this.stats.imagesFixed}`);
    console.log(`  TOTAL FIXES: ${
      this.stats.linksFixed +
      this.stats.textareasFixed +
      this.stats.selectsFixed +
      this.stats.nestedInputsFixed +
      this.stats.imagesFixed
    }\n`);
  }
}

// Run the fixer
console.log('🚀 Starting Advanced Accessibility Fix...\n');
console.log('Targeting remaining 54 issues');
console.log('='.repeat(60) + '\n');

const fixer = new AdvancedAccessibilityFixer();
const srcPath = join(process.cwd(), 'src');

fixer.fixDirectory(srcPath);
fixer.printStats();

process.exit(0);
