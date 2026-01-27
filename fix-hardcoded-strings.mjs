#!/usr/bin/env node

/**
 * Script pour remplacer automatiquement les textes français dur-codés
 * par les clés de traduction i18n
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping des textes français aux clés i18n
const translations = {
  // Labels
  'Prénom': "{ t('forms.labels.firstName') }",
  'Nom': "{ t('forms.labels.lastName') }",
  'Email': "{ t('forms.labels.email') }",
  'Adresse e-mail': "{ t('forms.labels.emailAddress') }",
  'Mot de passe': "{ t('forms.labels.password') }",
  'Confirmer le mot de passe': "{ t('forms.labels.passwordConfirm') }",
  'Téléphone': "{ t('forms.labels.phone') }",
  'Adresse': "{ t('forms.labels.address') }",
  'Ville': "{ t('forms.labels.city') }",
  'Pays': "{ t('forms.labels.country') }",
  'Entreprise': "{ t('forms.labels.company') }",
  'Nom de l\'entreprise': "{ t('forms.labels.companyName') }",
  'Nom de l\'organisation': "{ t('forms.labels.organizationName') }",
  'Poste': "{ t('forms.labels.position') }",
  'Poste / Fonction': "{ t('forms.labels.positionFunction') }",
  'Fonction': "{ t('forms.labels.function') }",
  'Secteur': "{ t('forms.labels.sector') }",
  'Secteur d\'activité': "{ t('forms.labels.sectorActivity') }",
  'Sujet': "{ t('forms.labels.subject') }",
  'Message': "{ t('forms.labels.message') }",
  'Contenu': "{ t('forms.labels.content') }",
  'Contenu de l\'article': "{ t('forms.labels.articleContent') }",
  'Description': "{ t('forms.labels.description') }",
  'Résumé': "{ t('forms.labels.summary') }",
  'Extrait': "{ t('forms.labels.excerpt') }",
  'Titre': "{ t('forms.labels.title') }",
  'Titre principal': "{ t('forms.labels.titleMain') }",
  'Sous-titre': "{ t('forms.labels.subtitle') }",
  'Site web': "{ t('forms.labels.website') }",
  'URL du site': "{ t('forms.labels.websiteUrl') }",
  'Expertise': "{ t('forms.labels.expertise') }",
  'Expertise (Tags)': "{ t('forms.labels.expertiseTags') }",
  'Nom de l\'intervenant': "{ t('forms.labels.speakerName') }",
  'Intervenant': "{ t('forms.labels.speaker') }",
  'Titre/Poste': "{ t('forms.labels.speakerTitle') }",
  'Localisation': "{ t('forms.labels.location') }",
  'Plateforme': "{ t('forms.labels.platform') }",
  'URL': "{ t('forms.labels.url') }",
  'Image': "{ t('forms.labels.image') }",
  'Image de couverture': "{ t('forms.labels.coverImage') }",
  'Tags': "{ t('forms.labels.tags') }",
  'Durée': "{ t('forms.labels.duration') }",
  'Auteur': "{ t('forms.labels.author') }",
  'URL source': "{ t('forms.labels.sourceUrl') }",

  // Placeholders - ces ne sont pas directement remplaçables, besoin d'utiliser i18n
  'Votre prénom': 'placeholder={t(\'forms.placeholders.enterFirstName\')}',
  'Votre nom': 'placeholder={t(\'forms.placeholders.enterLastName\')}',
  'votre@email.com': 'placeholder={t(\'forms.placeholders.enterEmail\')}',
  'Entrez votre mot de passe': 'placeholder={t(\'forms.placeholders.enterPassword\')}',
  '+33 1 23 45 67 89': 'placeholder={t(\'forms.placeholders.enterPhone\')}',
};

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    Object.entries(translations).forEach(([text, key]) => {
      // Éviter de remplacer dans les strings/commentaires déjà existants
      if (content.includes(text) && !content.includes(key)) {
        // Plus d'un espace pour éviter de remplacer dans les commentaires
        const regex = new RegExp(`(?<!['\"\`])${text}(?!['\"\`])`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, key);
          modified = true;
        }
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
    return false;
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

console.log('🔄 Replacing hardcoded French text with i18n keys...\n');

const srcDir = path.join(__dirname, 'src');
let filesModified = 0;

walkDir(srcDir, (filePath) => {
  if (replaceInFile(filePath)) {
    filesModified++;
    const relPath = filePath.replace(path.join(__dirname, 'src'), 'src');
    console.log(`✅ ${relPath}`);
  }
});

console.log(`\n✨ Done! ${filesModified} files modified`);
console.log('\n⚠️  Note: Manual review and refinement may be needed for complex cases.');
