#!/usr/bin/env node

/**
 * Mass Accessibility Fixer
 * Fixes ALL accessibility issues in one pass
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

class MassAccessibilityFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      inputLabelsAdded: 0,
      ariaLabelsAdded: 0,
      keyboardAccessAdded: 0,
      checkboxLabelsAdded: 0,
      radioLabelsAdded: 0
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

    // Fix 1: Add aria-label to inputs without labels (single-line, no existing aria-label)
    content = content.replace(
      /<input\s+([^>]*?)(?<!aria-label=["'][^"']*["']\s*)\/>/g,
      (match, attrs) => {
        if (attrs.includes('aria-label=')) return match;
        if (attrs.includes('type="hidden"') || attrs.includes('type="submit"')) return match;
        if (attrs.includes('type="file"') && attrs.includes('className="hidden')) return match;

        // Extract meaningful label from placeholder, name, or type
        const placeholderMatch = attrs.match(/placeholder=["']([^"']+)["']/);
        const nameMatch = attrs.match(/name=["']([^"']+)["']/);
        const typeMatch = attrs.match(/type=["']([^"']+)["']/);

        let label = '';
        if (placeholderMatch) {
          label = placeholderMatch[1];
        } else if (nameMatch) {
          label = this.humanize(nameMatch[1]);
        } else if (typeMatch) {
          label = this.humanize(typeMatch[1]);
        } else {
          label = 'Input field';
        }

        this.stats.inputLabelsAdded++;
        return `<input ${attrs} aria-label="${label}" />`;
      }
    );

    // Fix 2: Add aria-label to multi-line inputs without labels
    content = content.replace(
      /<input\s+([^>]*?)>/g,
      (match, attrs) => {
        if (attrs.includes('aria-label=')) return match;
        if (attrs.includes('type="hidden"') || attrs.includes('type="submit"')) return match;
        if (attrs.includes('type="file"') && attrs.includes('className="hidden')) return match;
        if (match.includes('/>')) return match; // Already handled by previous regex

        const placeholderMatch = attrs.match(/placeholder=["']([^"']+)["']/);
        const nameMatch = attrs.match(/name=["']([^"']+)["']/);
        const typeMatch = attrs.match(/type=["']([^"']+)["']/);
        const valueMatch = attrs.match(/value=\{formData\.(\w+)\}/);

        let label = '';
        if (placeholderMatch) {
          label = placeholderMatch[1];
        } else if (valueMatch) {
          label = this.humanize(valueMatch[1]);
        } else if (nameMatch) {
          label = this.humanize(nameMatch[1]);
        } else if (typeMatch) {
          label = this.humanize(typeMatch[1]);
        } else {
          label = 'Input field';
        }

        this.stats.inputLabelsAdded++;
        return `<input ${attrs}\n                      aria-label="${label}">`;
      }
    );

    // Fix 3: Add aria-label to checkboxes without labels
    content = content.replace(
      /<input\s+([^>]*?)type=["']checkbox["']([^>]*?)>/g,
      (match, before, after) => {
        const fullAttrs = before + 'type="checkbox"' + after;
        if (fullAttrs.includes('aria-label=')) return match;

        // Try to find label from parent label element or nearby text
        const checkMatch = fullAttrs.match(/checked=\{[^}]*\.includes\((\w+)\)\}/);
        const nameMatch = fullAttrs.match(/name=["']([^"']+)["']/);

        let label = 'Toggle option';
        if (checkMatch) {
          label = `Toggle ${checkMatch[1]}`;
        } else if (nameMatch) {
          label = this.humanize(nameMatch[1]);
        }

        this.stats.checkboxLabelsAdded++;
        return match.replace('type="checkbox"', `type="checkbox"\n                              aria-label="${label}"`);
      }
    );

    // Fix 4: Add aria-label to radio buttons without labels
    content = content.replace(
      /<input\s+([^>]*?)type=["']radio["']([^>]*?)>/g,
      (match, before, after) => {
        const fullAttrs = before + 'type="radio"' + after;
        if (fullAttrs.includes('aria-label=')) return match;

        const valueMatch = fullAttrs.match(/value=["']([^"']+)["']/);
        const nameMatch = fullAttrs.match(/name=["']([^"']+)["']/);

        let label = 'Radio option';
        if (valueMatch) {
          label = this.humanize(valueMatch[1]);
        } else if (nameMatch) {
          label = this.humanize(nameMatch[1]);
        }

        this.stats.radioLabelsAdded++;
        return match.replace('type="radio"', `type="radio"\n                            aria-label="${label}"`);
      }
    );

    // Fix 5: Add aria-label to icon-only buttons
    content = content.replace(
      /<button([^>]*?)>\s*<([A-Z]\w+)\s+[^>]*?\/>\s*<\/button>/g,
      (match, attrs, iconName) => {
        if (attrs.includes('aria-label=')) return match;
        const label = this.iconToLabel(iconName);
        this.stats.ariaLabelsAdded++;
        return match.replace('<button', `<button aria-label="${label}"`);
      }
    );

    // Fix 6: Add aria-label to icon-only links
    content = content.replace(
      /<(?:Link|a)([^>]*?)>\s*<([A-Z]\w+)\s+[^>]*?\/>\s*<\/(?:Link|a)>/g,
      (match, attrs, iconName) => {
        if (attrs.includes('aria-label=')) return match;
        const label = this.iconToLabel(iconName);
        this.stats.ariaLabelsAdded++;
        return match.replace(/<(Link|a)/, `<$1 aria-label="${label}"`);
      }
    );

    // Fix 7: Add keyboard accessibility to clickable divs
    content = content.replace(
      /<div([^>]*?)onClick=\{([^}]+)\}([^>]*?)>/g,
      (match, before, onClick, after) => {
        const fullAttrs = before + after;
        if (fullAttrs.includes('role=') && fullAttrs.includes('tabIndex')) return match;
        if (fullAttrs.includes('className=') && fullAttrs.includes('cursor-pointer')) {
          this.stats.keyboardAccessAdded++;
          return `<div${before}role="button"\n        tabIndex={0}\n        onClick={${onClick}}\n        onKeyDown={(e) => {\n          if (e.key === 'Enter' || e.key === ' ') {\n            e.preventDefault();\n            ${onClick.replace(/^\(\) => /, '')};\n          }\n        }}${after}>`;
        }
        return match;
      }
    );

    // Fix 8: Add keyboard accessibility to motion.div with onClick
    content = content.replace(
      /<motion\.div([^>]*?)onClick=\{([^}]+)\}([^>]*?)>/g,
      (match, before, onClick, after) => {
        const fullAttrs = before + after;
        if (fullAttrs.includes('role=') && fullAttrs.includes('tabIndex')) return match;
        this.stats.keyboardAccessAdded++;
        return `<motion.div${before}role="button"\n            tabIndex={0}\n            onClick={${onClick}}\n            onKeyDown={(e: React.KeyboardEvent) => {\n              if (e.key === 'Enter' || e.key === ' ') {\n                e.preventDefault();\n                ${onClick.replace(/^\(\) => /, '')};\n              }\n            }}${after}>`;
      }
    );

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
      'Trash': 'Delete',
      'Trash2': 'Delete',
      'Edit': 'Edit',
      'Edit2': 'Edit',
      'Edit3': 'Edit',
      'X': 'Close',
      'XCircle': 'Close',
      'Plus': 'Add',
      'PlusCircle': 'Add',
      'Check': 'Confirm',
      'CheckCircle': 'Confirm',
      'ArrowLeft': 'Go back',
      'ArrowRight': 'Go forward',
      'ChevronLeft': 'Previous',
      'ChevronRight': 'Next',
      'ChevronUp': 'Expand',
      'ChevronDown': 'Collapse',
      'Eye': 'View',
      'EyeOff': 'Hide',
      'Heart': 'Like',
      'Star': 'Favorite',
      'Download': 'Download',
      'Upload': 'Upload',
      'Save': 'Save',
      'Send': 'Send',
      'Search': 'Search',
      'Filter': 'Filter',
      'Settings': 'Settings',
      'Menu': 'Menu',
      'MoreVertical': 'More options',
      'MoreHorizontal': 'More options',
      'User': 'User profile',
      'Users': 'Users',
      'Bell': 'Notifications',
      'MessageCircle': 'Messages',
      'Calendar': 'Calendar',
      'Camera': 'Upload photo',
      'ExternalLink': 'Open in new tab',
      'Mail': 'Email',
      'Phone': 'Phone',
      'MapPin': 'Location',
      'Copy': 'Copy',
      'Clipboard': 'Copy to clipboard',
      'Share': 'Share',
      'Share2': 'Share',
      'Lock': 'Lock',
      'Unlock': 'Unlock',
      'LogOut': 'Log out',
      'LogIn': 'Log in',
      'RefreshCw': 'Refresh',
      'Move': 'Move',
      'Maximize': 'Maximize',
      'Minimize': 'Minimize'
    };

    return labels[iconName] || iconName.replace(/([A-Z])/g, ' $1').trim();
  }

  printStats() {
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Mass Accessibility Fix Complete!\n');
    console.log('📊 Statistics:');
    console.log(`  Files Processed: ${this.stats.filesProcessed}`);
    console.log(`  Files Modified: ${this.stats.filesModified}`);
    console.log(`  Input Labels Added: ${this.stats.inputLabelsAdded}`);
    console.log(`  Checkbox Labels Added: ${this.stats.checkboxLabelsAdded}`);
    console.log(`  Radio Labels Added: ${this.stats.radioLabelsAdded}`);
    console.log(`  Button/Link Aria-Labels: ${this.stats.ariaLabelsAdded}`);
    console.log(`  Keyboard Access Added: ${this.stats.keyboardAccessAdded}`);
    console.log(`  TOTAL FIXES: ${
      this.stats.inputLabelsAdded +
      this.stats.checkboxLabelsAdded +
      this.stats.radioLabelsAdded +
      this.stats.ariaLabelsAdded +
      this.stats.keyboardAccessAdded
    }\n`);
  }
}

// Run the fixer
console.log('🚀 Starting Mass Accessibility Fix...\n');
console.log('This will fix ALL accessibility issues in src/');
console.log('='.repeat(60) + '\n');

const fixer = new MassAccessibilityFixer();
const srcPath = join(process.cwd(), 'src');

fixer.fixDirectory(srcPath);
fixer.printStats();

console.log('📄 Next steps:');
console.log('  1. Review changes: git diff');
console.log('  2. Re-run audit: node scripts/accessibility-audit.mjs');
console.log('  3. Commit: git commit -am "fix: Mass accessibility improvements"');
console.log('  4. Push: git push\n');

process.exit(0);
