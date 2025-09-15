import fs from 'fs';
import path from 'path';

// Créer un script simple pour télécharger les fichiers
const downloadScript = `
<!DOCTYPE html>
<html>
<head>
    <title>SIPORTS 2026 - Téléchargement</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .download-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .btn { background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🚢 SIPORTS 2026 - Téléchargement Direct</h1>
    
    <div class="download-item">
        <h3>📋 Instructions</h3>
        <p>Pour récupérer le projet complet :</p>
        <ol>
            <li>Cliquez sur "Télécharger le projet" dans l'interface Bolt</li>
            <li>Ou utilisez Git : <code>git clone [url-du-repo]</code></li>
            <li>Ou copiez manuellement les fichiers depuis l'interface</li>
        </ol>
    </div>
    
    <div class="download-item">
        <h3>🎭 Comptes de Démonstration</h3>
        <ul>
            <li><strong>Admin:</strong> admin@siports.com / demo123</li>
            <li><strong>Exposant:</strong> exposant@siports.com / demo123</li>
            <li><strong>Partenaire:</strong> partenaire@siports.com / demo123</li>
            <li><strong>Visiteur:</strong> visiteur@siports.com / demo123</li>
        </ul>
    </div>
    
    <div class="download-item">
        <h3>🚀 Démarrage Rapide</h3>
        <pre>
npm install
npm run dev
        </pre>
    </div>
    
    <a href="https://blank-duplicated-o8cy.bolt.host" class="btn">🌐 Voir la Démo Live</a>
</body>
</html>
`;

fs.writeFileSync('public/simple-download.html', downloadScript);
console.log('✅ Page de téléchargement créée : public/simple-download.html');