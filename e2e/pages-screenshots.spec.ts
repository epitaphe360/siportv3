import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'pages-screenshots');

// Créer le dossier de screenshots s'il n'existe pas
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Générer un rapport HTML
function generateReport(pages: Array<{name: string; description: string; features: string[]}>) {
  const timestamp = new Date().toLocaleString('fr-FR');
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Présentation SIPORT - Plateforme Salon Virtuel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; color: #333; line-height: 1.6; }
    .container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px; margin-bottom: 40px; text-align: center; }
    header h1 { font-size: 2.5em; margin-bottom: 10px; }
    header p { font-size: 1.1em; opacity: 0.9; }
    .timestamp { text-align: center; color: #666; margin-bottom: 20px; font-size: 0.9em; }
    .pages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 30px; }
    .page-card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s; }
    .page-card:hover { transform: translateY(-5px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .page-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; }
    .page-header h3 { font-size: 1.3em; margin-bottom: 5px; }
    .page-content { padding: 20px; }
    .description { background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin-bottom: 15px; border-radius: 4px; }
    .features { display: flex; flex-wrap: wrap; gap: 8px; }
    .feature { background: #e8eaf6; color: #667eea; padding: 6px 12px; border-radius: 20px; font-size: 0.9em; }
    .screenshot-link { display: inline-block; margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; transition: background 0.3s; }
    .screenshot-link:hover { background: #764ba2; }
    .section-title { font-size: 2em; color: #667eea; margin-top: 40px; margin-bottom: 20px; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
    footer { text-align: center; margin-top: 60px; color: #666; padding: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎪 SIPORT - Plateforme Salon Virtuel</h1>
      <p>Présentation complète de la plateforme pour le Ministère</p>
    </header>
    
    <div class="timestamp">Généré le: ${timestamp}</div>
    
    <h2 class="section-title">📋 Pages Publiques et Informations</h2>
    <div class="pages-grid">
      ${pages.filter(p => p.name.startsWith('0')).map(p => `
        <div class="page-card">
          <div class="page-header">
            <h3>${p.name}</h3>
          </div>
          <div class="page-content">
            <div class="description"><strong>Description:</strong> ${p.description}</div>
            <div class="features">
              ${p.features.map(f => `<span class="feature">✓ ${f}</span>`).join('')}
            </div>
            <a href="#" class="screenshot-link">Voir screenshot</a>
          </div>
        </div>
      `).join('')}
    </div>

    <h2 class="section-title">🎬 Ressources Médias et Contenus</h2>
    <div class="pages-grid">
      ${pages.filter(p => p.name.startsWith('4')).map(p => `
        <div class="page-card">
          <div class="page-header">
            <h3>${p.name}</h3>
          </div>
          <div class="page-content">
            <div class="description"><strong>Description:</strong> ${p.description}</div>
            <div class="features">
              ${p.features.map(f => `<span class="feature">✓ ${f}</span>`).join('')}
            </div>
            <a href="#" class="screenshot-link">Voir screenshot</a>
          </div>
        </div>
      `).join('')}
    </div>

    <footer>
      <p>© 2025 SIPORT - Salon International du Positionnement et du Repositionnement du Tourisme</p>
      <p>Cette présentation a été générée automatiquement par le système de test E2E</p>
    </footer>
  </div>
</body>
</html>
  `;
  
  const reportPath = path.join(SCREENSHOT_DIR, 'presentation-rapport.html');
  fs.writeFileSync(reportPath, html);
  console.log(`\n📊 Rapport HTML généré: ${reportPath}\n`);
}

// Fonction utilitaire pour prendre un screenshot avec timer
async function takeScreenshot(page, name: string) {
  const filename = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`✓ Screenshot: ${name}`);
}

// Fonction pour charger une page avec timer
async function loadPageWithTimer(page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  return loadTime;
}

// Rapport de présentation
const pageDescriptions: Record<string, { description: string; features: string[] }> = {
  '01-home': {
    description: 'Page d\'accueil - Point d\'entrée principal de la plateforme SIPORT. Affiche la présentation générale du salon, les appels à l\'action pour les différents types d\'utilisateurs (visiteur, exposant, partenaire).',
    features: ['Hero section', 'Appels à l\'action', 'Navigation principale', 'Statistiques clés du salon']
  },
  '02-exhibitors': {
    description: 'Annuaire des exposants - Catalogue complet des entreprises exposantes avec moteur de recherche et filtrage. Permet aux visiteurs de découvrir les exposants et d\'accéder à leurs fiches détaillées.',
    features: ['Recherche d\'exposants', 'Filtrage par secteur', 'Grille d\'affichage', 'Fiche détaillée de chaque exposant']
  },
  '03-partners': {
    description: 'Annuaire des partenaires - Répertoire des partenaires stratégiques avec leurs services et offres. Interface pour consulter les collaborations et les prestations offertes.',
    features: ['Liste des partenaires', 'Présentation des services', 'Filtrage par catégorie', 'Contact direct']
  },
  '04-news': {
    description: 'Centre d\'actualités - Publication régulière des informations relatives au salon SIPORT. Permet de suivre les dernières nouvelles, annonces et mises à jour.',
    features: ['Feed d\'actualités', 'Détail article', 'Date de publication', 'Catégorisation']
  },
  '05-media': {
    description: 'Médiathèque - Bibliothèque centralisée de contenus multimédias (webinaires, podcasts, capsules vidéo, témoignages). Plateforme de ressources pédagogiques et informationnelles.',
    features: ['Webinaires', 'Podcasts', 'Capsules vidéo', 'Témoignages', 'Meilleurs moments']
  },
  '06-networking': {
    description: 'Plateforme de networking - Espace de mise en relation entre professionnels pour favoriser les échanges B2B, les partenariats et les opportunités commerciales.',
    features: ['Profils utilisateurs', 'Recommandations', 'Système de match', 'Messagerie intégrée']
  },
  '07-contact': {
    description: 'Formulaire de contact - Canal de communication avec l\'équipe organisatrice pour toute question, demande d\'information ou réclamation sur le salon.',
    features: ['Formulaire de contact', 'Support multicanal', 'Validation des données', 'Confirmation d\'envoi']
  },
  '08-venue': {
    description: 'Localisation et accès - Informations pratiques sur le lieu du salon, plan d\'accès, parking, transports en commun et commodités sur site.',
    features: ['Adresse complète', 'Carte interactive', 'Itinéraires', 'Informations de stationnement']
  },
  '09-partnership': {
    description: 'Devenir partenaire - Page d\'information et d\'engagement pour les organisations souhaitant devenir partenaires du salon SIPORT.',
    features: ['Offres de partenariat', 'Avantages', 'Formulaire d\'engagement', 'Tarification']
  },
  '10-support': {
    description: 'Assistance et support - Centre d\'aide avec FAQ, documentation technique et canaux de support pour les utilisateurs et exposants.',
    features: ['FAQ', 'Guides d\'utilisation', 'Formulaire support', 'Chat en direct']
  },
  '11-privacy': {
    description: 'Politique de confidentialité - Document légal décrivant la protection des données personnelles et les droits des utilisateurs conformément au RGPD.',
    features: ['Clauses légales', 'Protection données', 'Droits utilisateurs', 'Conformité RGPD']
  },
  '12-terms': {
    description: 'Conditions d\'utilisation - Termes et conditions régissant l\'utilisation de la plateforme SIPORT et ses services.',
    features: ['Conditions générales', 'Responsabilités', 'Règles d\'utilisation', 'Limitations légales']
  },
  '13-cookies': {
    description: 'Gestion des cookies - Politique de gestion des cookies et technologies de suivi utilisées pour améliorer l\'expérience utilisateur.',
    features: ['Types de cookies', 'Consentement', 'Préférences', 'Technologie de suivi']
  }
};

test.describe('🏛️ PAGES PUBLIQUES ET INFORMATIONS - Présentation SIPORT', () => {
  test('capture public pages avec descriptions', async ({ page }) => {
    console.log('\n📋 === CAPTURE DES PAGES PUBLIQUES ET INFORMATIONS ===\n');
    
    // HOME
    console.log('1️⃣  Accueil - Page principale du salon');
    console.log('   📝 ' + pageDescriptions['01-home'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['01-home'].features.join(', '));
    const time1 = await loadPageWithTimer(page, '/');
    await takeScreenshot(page, '01-home');
    console.log(`   ⏱️  Temps de chargement: ${time1}ms\n`);

    // EXHIBITORS
    console.log('2️⃣  Annuaire des Exposants');
    console.log('   📝 ' + pageDescriptions['02-exhibitors'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['02-exhibitors'].features.join(', '));
    const time2 = await loadPageWithTimer(page, '/exhibitors');
    await takeScreenshot(page, '02-exhibitors');
    console.log(`   ⏱️  Temps de chargement: ${time2}ms\n`);

    // PARTNERS
    console.log('3️⃣  Annuaire des Partenaires');
    console.log('   📝 ' + pageDescriptions['03-partners'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['03-partners'].features.join(', '));
    const time3 = await loadPageWithTimer(page, '/partners');
    await takeScreenshot(page, '03-partners');
    console.log(`   ⏱️  Temps de chargement: ${time3}ms\n`);

    // NEWS
    console.log('4️⃣  Actualités et Informations');
    console.log('   📝 ' + pageDescriptions['04-news'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['04-news'].features.join(', '));
    const time4 = await loadPageWithTimer(page, '/news');
    await takeScreenshot(page, '04-news');
    console.log(`   ⏱️  Temps de chargement: ${time4}ms\n`);

    // NETWORKING
    console.log('5️⃣  Plateforme de Networking');
    console.log('   📝 ' + pageDescriptions['06-networking'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['06-networking'].features.join(', '));
    const time5 = await loadPageWithTimer(page, '/networking');
    await takeScreenshot(page, '06-networking');
    console.log(`   ⏱️  Temps de chargement: ${time5}ms\n`);

    // CONTACT
    console.log('6️⃣  Formulaire de Contact');
    console.log('   📝 ' + pageDescriptions['07-contact'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['07-contact'].features.join(', '));
    const time6 = await loadPageWithTimer(page, '/contact');
    await takeScreenshot(page, '07-contact');
    console.log(`   ⏱️  Temps de chargement: ${time6}ms\n`);

    // VENUE
    console.log('7️⃣  Localisation et Accès');
    console.log('   📝 ' + pageDescriptions['08-venue'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['08-venue'].features.join(', '));
    const time7 = await loadPageWithTimer(page, '/venue');
    await takeScreenshot(page, '08-venue');
    console.log(`   ⏱️  Temps de chargement: ${time7}ms\n`);

    // PARTNERSHIP
    console.log('8️⃣  Devenir Partenaire');
    console.log('   📝 ' + pageDescriptions['09-partnership'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['09-partnership'].features.join(', '));
    const time8 = await loadPageWithTimer(page, '/partnership');
    await takeScreenshot(page, '09-partnership');
    console.log(`   ⏱️  Temps de chargement: ${time8}ms\n`);

    // SUPPORT
    console.log('9️⃣  Support et Assistance');
    console.log('   📝 ' + pageDescriptions['10-support'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['10-support'].features.join(', '));
    const time9 = await loadPageWithTimer(page, '/support');
    await takeScreenshot(page, '10-support');
    console.log(`   ⏱️  Temps de chargement: ${time9}ms\n`);

    // PRIVACY
    console.log('🔐 Politique de Confidentialité');
    console.log('   📝 ' + pageDescriptions['11-privacy'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['11-privacy'].features.join(', '));
    const time10 = await loadPageWithTimer(page, '/privacy');
    await takeScreenshot(page, '11-privacy');
    console.log(`   ⏱️  Temps de chargement: ${time10}ms\n`);

    // TERMS
    console.log('📜 Conditions d\'Utilisation');
    console.log('   📝 ' + pageDescriptions['12-terms'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['12-terms'].features.join(', '));
    const time11 = await loadPageWithTimer(page, '/terms');
    await takeScreenshot(page, '12-terms');
    console.log(`   ⏱️  Temps de chargement: ${time11}ms\n`);

    // COOKIES
    console.log('🍪 Gestion des Cookies');
    console.log('   📝 ' + pageDescriptions['13-cookies'].description);
    console.log('   ✨ Éléments clés: ' + pageDescriptions['13-cookies'].features.join(', '));
    const time12 = await loadPageWithTimer(page, '/cookies');
    await takeScreenshot(page, '13-cookies');
    console.log(`   ⏱️  Temps de chargement: ${time12}ms\n`);

    const avgTime = Math.round((time1 + time2 + time3 + time4 + time5 + time6 + time7 + time8 + time9 + time10 + time11 + time12) / 12);
    console.log(`\n📊 Temps moyen de chargement: ${avgTime}ms`);
    console.log('✅ Pages publiques capturées avec succès!\n');
  });

  test('capture media library page', async ({ page }) => {
    console.log('\n📚 === CAPTURE DE LA MÉDIATHÈQUE PRINCIPALE ===\n');
    
    console.log('📚 Médiathèque - Accueil');
    console.log('   📝 Bibliothèque centralisée de contenus multimédias regroupant webinaires, podcasts, capsules vidéo et ressources pédagogiques.');
    console.log('   ✨ Éléments clés: Navigation thématique, Recherche, Filtrage par type de contenu, Recommandations');
    const mediaTime = await loadPageWithTimer(page, '/media');
    await takeScreenshot(page, '05-media');
    console.log(`   ⏱️  Temps de chargement: ${mediaTime}ms`);
    console.log('✅ Capture effectuée\n');
  });

  test('capture auth pages', async ({ page }) => {
    console.log('\n🔐 === CAPTURE DES PAGES D\'AUTHENTIFICATION ===\n');
    
    // LOGIN
    console.log('🔓 Connexion');
    const loginTime = await loadPageWithTimer(page, '/login');
    await takeScreenshot(page, '20-login');
    console.log(`   ⏱️  Temps de chargement: ${loginTime}ms\n`);

    // REGISTER
    console.log('📝 Inscription');
    const registerTime = await loadPageWithTimer(page, '/register');
    await takeScreenshot(page, '21-register');
    console.log(`   ⏱️  Temps de chargement: ${registerTime}ms\n`);

    // FORGOT PASSWORD
    console.log('🔑 Mot de passe oublié');
    const forgotTime = await loadPageWithTimer(page, '/forgot-password');
    await takeScreenshot(page, '22-forgot-password');
    console.log(`   ⏱️  Temps de chargement: ${forgotTime}ms\n`);

    // UNAUTHORIZED
    console.log('❌ Non autorisé');
    const unauthorizedTime = await loadPageWithTimer(page, '/unauthorized');
    await takeScreenshot(page, '23-unauthorized');
    console.log(`   ⏱️  Temps de chargement: ${unauthorizedTime}ms\n`);

    // FORBIDDEN
    console.log('🚫 Accès interdit');
    const forbiddenTime = await loadPageWithTimer(page, '/forbidden');
    await takeScreenshot(page, '24-forbidden');
    console.log(`   ⏱️  Temps de chargement: ${forbiddenTime}ms\n`);
  });

  test('capture registration pages', async ({ page }) => {
    console.log('\n📋 === CAPTURE DES PAGES D\'INSCRIPTION ===\n');
    
    // VISITOR FREE REGISTRATION
    console.log('👤 Inscription Visiteur Gratuit');
    const time1 = await loadPageWithTimer(page, '/visitor/register/free');
    await takeScreenshot(page, '30-visitor-free-registration');
    console.log(`   ⏱️  Temps de chargement: ${time1}ms\n`);

    // VISITOR VIP REGISTRATION
    console.log('👑 Inscription Visiteur VIP');
    const time2 = await loadPageWithTimer(page, '/visitor/register/vip');
    await takeScreenshot(page, '31-visitor-vip-registration');
    console.log(`   ⏱️  Temps de chargement: ${time2}ms\n`);

    // EXHIBITOR REGISTRATION
    console.log('🏢 Inscription Exposant');
    const time3 = await loadPageWithTimer(page, '/register/exhibitor');
    await takeScreenshot(page, '32-exhibitor-registration');
    console.log(`   ⏱️  Temps de chargement: ${time3}ms\n`);

    // PARTNER REGISTRATION
    console.log('🤝 Inscription Partenaire');
    const time4 = await loadPageWithTimer(page, '/register/partner');
    await takeScreenshot(page, '33-partner-registration');
    console.log(`   ⏱️  Temps de chargement: ${time4}ms\n`);

    // VISITOR SUBSCRIPTION
    console.log('💳 Abonnement Visiteur');
    const time5 = await loadPageWithTimer(page, '/visitor/subscription');
    await takeScreenshot(page, '34-visitor-subscription');
    console.log(`   ⏱️  Temps de chargement: ${time5}ms\n`);

    // PARTNER UPGRADE
    console.log('⬆️  Mise à jour Partenaire');
    const time6 = await loadPageWithTimer(page, '/partner/upgrade');
    await takeScreenshot(page, '35-partner-upgrade');
    console.log(`   ⏱️  Temps de chargement: ${time6}ms\n`);
  });

  test('capture media pages avec descriptions', async ({ page }) => {
    console.log('\n🎬 === CAPTURE DE LA MÉDIATHÈQUE ET RESSOURCES ===\n');
    
    const mediaDescriptions: Record<string, { description: string; features: string[] }> = {
      '40-webinars': {
        description: 'Webinaires - Bibliothèque de sessions en ligne animées par des experts. Offre un contenu pédagogique et informatif sur des thématiques pertinentes pour le secteur du tourisme et loisirs.',
        features: ['Vidéos en direct', 'Sessions enregistrées', 'Calendrier des événements', 'Accès à la demande']
      },
      '41-podcasts': {
        description: 'Podcasts - Série audio de discussions et interviews avec des professionnels du secteur. Format accessible pour l\'écoute en mobilité et l\'apprentissage continu.',
        features: ['Flux audio', 'Épisodes archivés', 'Transcriptions', 'Lecture continue']
      },
      '42-inside-siport': {
        description: 'Inside SIPORT - Coulisses du salon avec capsules vidéo courtes montrant les coulisses, les préparatifs et les moments clés du salon. Offre une perspective interne et authentique.',
        features: ['Vidéos courtes', 'Coulisses du salon', 'Moments clés', 'Galerie visuelle']
      },
      '43-testimonials': {
        description: 'Témoignages - Retours d\'expérience d\'exposants, partenaires et visiteurs. Véritable preuve sociale montrant l\'impact et la valeur du salon SIPORT.',
        features: ['Témoignages vidéo', 'Études de cas', 'Testimonials texte', 'Étoiles de notation']
      },
      '44-best-moments': {
        description: 'Meilleurs moments - Compilation des moments exceptionnels des éditions précédentes du salon. Galerie de photos et vidéos inspirantes mettant en valeur l\'ambiance et les succès du SIPORT.',
        features: ['Galerie photo', 'Clips vidéo', 'Timeline interactive', 'Filtrage par thème']
      }
    };

    // WEBINARS
    console.log('🎓 Webinaires');
    console.log('   📝 ' + mediaDescriptions['40-webinars'].description);
    console.log('   ✨ Éléments clés: ' + mediaDescriptions['40-webinars'].features.join(', '));
    const time1 = await loadPageWithTimer(page, '/media/webinars');
    await takeScreenshot(page, '40-webinars');
    console.log(`   ⏱️  Temps de chargement: ${time1}ms\n`);

    // PODCASTS
    console.log('🎙️  Podcasts');
    console.log('   📝 ' + mediaDescriptions['41-podcasts'].description);
    console.log('   ✨ Éléments clés: ' + mediaDescriptions['41-podcasts'].features.join(', '));
    const time2 = await loadPageWithTimer(page, '/media/podcasts');
    await takeScreenshot(page, '41-podcasts');
    console.log(`   ⏱️  Temps de chargement: ${time2}ms\n`);

    // INSIDE SIPORT
    console.log('🎬 Inside SIPORT - Coulisses');
    console.log('   📝 ' + mediaDescriptions['42-inside-siport'].description);
    console.log('   ✨ Éléments clés: ' + mediaDescriptions['42-inside-siport'].features.join(', '));
    const time3 = await loadPageWithTimer(page, '/media/inside-siport');
    await takeScreenshot(page, '42-inside-siport');
    console.log(`   ⏱️  Temps de chargement: ${time3}ms\n`);

    // TESTIMONIALS
    console.log('💬 Témoignages');
    console.log('   📝 ' + mediaDescriptions['43-testimonials'].description);
    console.log('   ✨ Éléments clés: ' + mediaDescriptions['43-testimonials'].features.join(', '));
    const time4 = await loadPageWithTimer(page, '/media/testimonials');
    await takeScreenshot(page, '43-testimonials');
    console.log(`   ⏱️  Temps de chargement: ${time4}ms\n`);

    // BEST MOMENTS
    console.log('✨ Meilleurs Moments');
    console.log('   📝 ' + mediaDescriptions['44-best-moments'].description);
    console.log('   ✨ Éléments clés: ' + mediaDescriptions['44-best-moments'].features.join(', '));
    const time5 = await loadPageWithTimer(page, '/media/best-moments');
    await takeScreenshot(page, '44-best-moments');
    console.log(`   ⏱️  Temps de chargement: ${time5}ms\n`);
    
    const avgTime = Math.round((time1 + time2 + time3 + time4 + time5) / 5);
    console.log(`📊 Temps moyen des ressources médias: ${avgTime}ms`);
    console.log('✅ Ressources médias capturées avec succès!\n');
  });

  test('capture other important pages', async ({ page }) => {
    console.log('\n⭐ === CAPTURE D\'AUTRES PAGES IMPORTANTES ===\n');
    
    // BADGE
    console.log('🎫 Badge');
    const time1 = await loadPageWithTimer(page, '/badge');
    await takeScreenshot(page, '50-badge');
    console.log(`   ⏱️  Temps de chargement: ${time1}ms\n`);

    // BADGE DIGITAL
    console.log('📱 Badge Numérique');
    const time2 = await loadPageWithTimer(page, '/badge/digital');
    await takeScreenshot(page, '51-badge-digital');
    console.log(`   ⏱️  Temps de chargement: ${time2}ms\n`);

    // BADGE SCANNER
    console.log('📱 Lecteur de Badge');
    const time3 = await loadPageWithTimer(page, '/badge/scanner');
    await takeScreenshot(page, '52-badge-scanner');
    console.log(`   ⏱️  Temps de chargement: ${time3}ms\n`);

    // AVAILABILITY SETTINGS
    console.log('⚙️  Paramètres de Disponibilité');
    const time4 = await loadPageWithTimer(page, '/availability/settings');
    await takeScreenshot(page, '53-availability-settings');
    console.log(`   ⏱️  Temps de chargement: ${time4}ms\n`);

    // API PAGE
    console.log('🔌 API');
    const time5 = await loadPageWithTimer(page, '/api');
    await takeScreenshot(page, '54-api');
    console.log(`   ⏱️  Temps de chargement: ${time5}ms\n`);
  });
});

// Test de génération du rapport final
test.describe('📊 Génération du Rapport de Présentation', () => {
  test('générer rapport HTML avec descriptions', async () => {
    console.log('\n🎬 Génération du rapport de présentation...\n');
    
    const pagesData = [
      { name: '01-Accueil', description: 'Page d\'entrée principale - Présentation du salon SIPORT avec appels à l\'action', features: ['Hero section', 'Navigation', 'Appels à l\'action', 'Statistiques'] },
      { name: '02-Annuaire Exposants', description: 'Catalogue des exposants avec recherche et filtrage par secteur', features: ['Recherche', 'Filtrage', 'Fiches détaillées', 'Grille d\'affichage'] },
      { name: '03-Annuaire Partenaires', description: 'Répertoire des partenaires stratégiques', features: ['Liste des partenaires', 'Services offerts', 'Filtrage', 'Contact direct'] },
      { name: '04-Actualités', description: 'Flux d\'informations et actualités du salon', features: ['Feed d\'actualités', 'Détail article', 'Catégorisation', 'Archive'] },
      { name: '40-Webinaires', description: 'Bibliothèque de sessions en ligne par experts', features: ['Vidéos directes', 'Sessions enregistrées', 'Calendrier', 'Accès à la demande'] },
      { name: '41-Podcasts', description: 'Série audio de discussions et interviews', features: ['Flux audio', 'Épisodes archivés', 'Transcriptions', 'Lecture continue'] },
      { name: '42-Inside SIPORT', description: 'Coulisses du salon avec capsules vidéo', features: ['Vidéos courtes', 'Coulisses', 'Moments clés', 'Galerie visuelle'] },
      { name: '43-Témoignages', description: 'Retours d\'expérience et études de cas', features: ['Vidéos de témoignage', 'Cas d\'usage', 'Étoiles de notation', 'Preuves sociales'] },
      { name: '44-Meilleurs Moments', description: 'Compilation des moments exceptionnels du salon', features: ['Galerie photo', 'Clips vidéo', 'Timeline interactive', 'Filtrage par thème'] }
    ];
    
    generateReport(pagesData);
    console.log('✅ Rapport généré avec succès!\n');
  });
});
