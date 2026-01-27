#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let results = {
  files: {},
  totalIssues: 0,
  missingTranslationKeys: new Set(),
};

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];

    lines.forEach((line, index) => {
      // Skip comments and imports
      if (line.trim().startsWith('//') || line.trim().startsWith('import')) {
        return;
      }

      // Look for hardcoded French in labels, placeholders, aria-labels
      if (line.includes('placeholder=') || line.includes('label') || line.includes('aria-label')) {
        const frenchPatterns = [
          /Nom de/gi, /Prénom/gi, /Adresse/gi, /Téléphone/gi, /Ville/gi, 
          /Pays/gi, /Poste/gi, /Fonction/gi, /Entreprise/gi, /Secteur/gi,
          /Mot de passe/gi, /Sujet/gi, /Message/gi, /Résumé/gi, /Contenu/gi,
          /Expertise/gi, /Titre/gi, /Description/gi, /Site/gi, /Intervenant/gi,
          /Localisation/gi, /Plateforme/gi, /votre/gi, /Votre/gi, 
          /exemple/gi, /ex:/gi, /Ex:/gi, /inscrire/gi, /Inscrire/gi,
          /Ajouter/gi, /Retirer/gi, /Modifier/gi, /Supprimer/gi,
          /Envoyer/gi, /Télécharger/gi, /Importer/gi, /Exporter/gi,
          /Actualiser/gi, /Réinitialiser/gi, /Créer/gi, /Générer/gi,
          /Valider/gi, /Confirmer/gi, /Retour/gi, /Suivant/gi, /Précédent/gi
        ];

        frenchPatterns.forEach(pattern => {
          if (pattern.test(line)) {
            const match = line.match(pattern);
            if (match) {
              issues.push({
                line: index + 1,
                text: match[0],
                context: line.slice(0, 120).trim(),
              });
              results.missingTranslationKeys.add(match[0].trim());
            }
          }
        });
      }
    });

    if (issues.length > 0) {
      results.files[filePath] = issues;
      results.totalIssues += issues.length;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      callback(filePath);
    }
  });
}

// Run analysis
console.log('🔍 Analyzing project for missing translations...\n');

const srcDir = path.join(__dirname, 'src');
walkDir(srcDir, analyzeFile);

// Generate report
console.log('📊 Translation Audit Report\n');
console.log(`Total French text instances found: ${results.totalIssues}\n`);

if (results.totalIssues > 0) {
  console.log('📁 Top 15 files with most hardcoded French text:\n');
  
  Object.entries(results.files)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 15)
    .forEach(([file, issues], idx) => {
      const relPath = file.replace(path.join(__dirname, 'src'), 'src');
      console.log(`${idx + 1}. ${relPath} (${issues.length} instances)`);
    });
}

console.log('\n\n🔑 Unique French Terms Found:\n');
const uniqueTerms = Array.from(results.missingTranslationKeys).sort();
uniqueTerms.forEach(term => {
  console.log(`  - "${term}"`);
});

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  totalInstances: results.totalIssues,
  filesWithIssues: Object.keys(results.files).length,
  uniqueTerms: uniqueTerms,
  details: results.files,
};

fs.writeFileSync(
  path.join(__dirname, 'translation-audit.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n\n✅ Detailed report saved to translation-audit.json');
