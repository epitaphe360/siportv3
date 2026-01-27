#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns à chercher pour les textes dur-codés
const patterns = [
  // Labels de formulaires en français
  /label[^>]*>([^<]+?(?:Nom|Prénom|Email|Adresse|Téléphone|Ville|Pays|Poste|Fonction|Entreprise|Secteur|Mot de passe|Sujet|Message|Résumé|Contenu|Expertise|Titre|Description|Site|Intervenant|Localisation|Plateforme|URL|Compagnie|Nom de l'intervenant|Titre de|Extraction|Répertoire|Accord|Oui|Non|Logo|Sélectionnez|Choisir|Détails|Contacter|Ajouter|Retirer|Modifier|Supprimer|Annuler|Soumettre|Envoyer|Charger|Télécharger|Importer|Exporter|Actualiser|Réinitialiser|Créer|Générer|Valider|Confirmer|Retour|Suivant|Précédent|Afficher|Masquer|Plus|Moins|Tous|Aucun|Oui|Non|Débuter|Démarrer|Activer|Désactiver|Approuver|Rejeter|Approuvé|Rejeté|En attente|Complété|En cours|Erreur|Succès|Avertissement|Information|Nouveau|Actif|Inactif|Supprimé|Archivé|Publié|Brouillon)(?:[\s*]|<|$)/gi,
  // Placeholders en français
  /placeholder=["']([^"']*(?:Nom|Prénom|Email|entreprise|Adresse|Téléphone|Ville|Pays|Poste|Fonction|exemple|ex:|Ex:|votre|Votre|la fiche|le texte|texte|Saisir|Entrez|Remplissez)[^"']*)["']/gi,
  // Aria-label en français
  /aria-label=["']([^"']*(?:Nom|Prénom|Email|Adresse|Téléphone|Ville|Pays|Poste|Fonction|Entreprise|Secteur|Mot de passe|Sujet|Message)[^"']*)["']/gi,
];

// Clés de traduction validées à ignorer (déjà dans i18n)
const ignoredPatterns = [
  'Requis',
  'Optionnel',
  'Soumettre',
  'Annuler',
  'Enregistrer',
  'Rechercher',
  'Loading',
  'Error',
  'Success',
];

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

      // Search for hardcoded French text
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const text = match[1] || match[0];
          
          // Check if text should be translated
          if (shouldTranslate(text)) {
            issues.push({
              line: index + 1,
              text: text.slice(0, 100),
              type: pattern.source.includes('placeholder') ? 'placeholder' : 
                    pattern.source.includes('aria-label') ? 'aria-label' : 'label',
            });
            
            // Track missing keys
            results.missingTranslationKeys.add(text.trim());
          }
        }
      });
    });

    if (issues.length > 0) {
      results.files[filePath] = issues;
      results.totalIssues += issues.length;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
}

function shouldTranslate(text) {
  const trimmed = text.trim();
  
  // Ignore empty strings
  if (!trimmed || trimmed.length < 2) return false;
  
  // Ignore ignored patterns
  if (ignoredPatterns.some(p => trimmed.includes(p))) return false;
  
  // Should be French text with certain patterns
  return /[àâäçèéêëîïôöùûüœæ]/i.test(trimmed) || 
         /^(Nom|Prénom|Email|Adresse|Téléphone|Ville|Pays|Poste|Fonction|Entreprise|Secteur|Mot de passe|Sujet|Message|Résumé|Contenu|Expertise|Titre|Description|Site|Entreprise|Intervenant|exemple|ex:|votre|Votre|la fiche)/.test(trimmed);
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other dirs
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
console.log(`Total issues found: ${results.totalIssues}\n`);

if (results.totalIssues > 0) {
  console.log('📁 Files with issues:\n');
  
  Object.entries(results.files)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20)
    .forEach(([file, issues]) => {
      const relPath = file.replace(__dirname, '.');
      console.log(`\n${relPath} (${issues.length} issues)`);
      issues.slice(0, 5).forEach(issue => {
        console.log(`  Line ${issue.line}: [${issue.type}] "${issue.text}"`);
      });
      if (issues.length > 5) {
        console.log(`  ... and ${issues.length - 5} more`);
      }
    });
}

console.log('\n\n🔑 Missing Translation Keys (Sample):\n');
Array.from(results.missingTranslationKeys)
  .slice(0, 50)
  .sort()
  .forEach(key => {
    console.log(`  - ${key}`);
  });

if (results.missingTranslationKeys.size > 50) {
  console.log(`\n  ... and ${results.missingTranslationKeys.size - 50} more`);
}

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  totalIssues: results.totalIssues,
  filesWithIssues: Object.keys(results.files).length,
  missingKeys: Array.from(results.missingTranslationKeys).sort(),
  details: results.files,
};

fs.writeFileSync(
  path.join(__dirname, 'translation-audit.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n\n✅ Detailed report saved to translation-audit.json');
