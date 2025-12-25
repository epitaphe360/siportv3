import fs from 'fs';

const file = 'src/pages/NetworkingPage.tsx';
console.log('Lecture du fichier...');
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  'AccÃ©dez Ã  des opportunitÃ©s': 'Accédez à des opportunités',
  "L'Ã©cosystÃ¨me SIPORTS Ã  votre portÃ©e": "L'écosystème SIPORTS à votre portée",
  'simplifiÃ©': 'simplifié',
  'Â© 2026 - SIPORTS : Salon International des Ports et de leur Ã‰cosystÃ¨me â€" Tous droits rÃ©servÃ©s': '© 2026 - SIPORTS : Salon International des Ports et de leur Écosystème — Tous droits réservés',
  'GÃ©nÃ©rales': 'Générales',
  'ConfidentialitÃ©': 'Confidentialité',
  'LÃ©gales': 'Légales',
  'Â©': '©'
};

let count = 0;
for (const [old, neu] of Object.entries(replacements)) {
  if (content.includes(old)) {
    content = content.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), neu);
    count++;
    console.log(`✓ Corrigé: ${old.substring(0, 30)}...`);
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log(`\n✅ ${count} corrections appliquées!`);
