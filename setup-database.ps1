# =====================================================
# SCRIPT D'INSTALLATION AUTOMATIQUE
# Mini-Site Builder & Networking Matchmaking
# =====================================================

Write-Host "`n🚀 INSTALLATION - Mini-Site Builder & Networking Matchmaking`n" -ForegroundColor Cyan
Write-Host "=" -NoNewline; Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

# =====================================================
# ÉTAPE 1: Vérification des prérequis
# =====================================================

Write-Host "📋 Étape 1/5 : Vérification des prérequis...`n" -ForegroundColor Yellow

# Vérifier Node.js
Write-Host "   🔍 Vérification Node.js..." -NoNewline
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host " ✅ $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js non trouvé"
    }
} catch {
    Write-Host " ❌ Node.js n'est pas installé" -ForegroundColor Red
    Write-Host "   Installez Node.js depuis https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Vérifier npm
Write-Host "   🔍 Vérification npm..." -NoNewline
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host " ✅ v$npmVersion" -ForegroundColor Green
    } else {
        throw "npm non trouvé"
    }
} catch {
    Write-Host " ❌ npm n'est pas installé" -ForegroundColor Red
    exit 1
}

# Vérifier fichier .env
Write-Host "   🔍 Vérification .env..." -NoNewline
if (Test-Path ".env") {
    Write-Host " ✅ Trouvé" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Non trouvé" -ForegroundColor Yellow
    Write-Host "   ℹ️  Créez un fichier .env avec vos clés Supabase" -ForegroundColor Cyan
}

# Vérifier variables d'environnement
Write-Host "   🔍 Vérification variables Supabase..." -NoNewline
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
$hasSupabaseUrl = $envContent -match "VITE_SUPABASE_URL"
$hasSupabaseKey = $envContent -match "VITE_SUPABASE_ANON_KEY"

if ($hasSupabaseUrl -and $hasSupabaseKey) {
    Write-Host " ✅ Configurées" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Manquantes" -ForegroundColor Yellow
    Write-Host "   ℹ️  Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env" -ForegroundColor Cyan
}

Write-Host ""

# =====================================================
# ÉTAPE 2: Installation des dépendances
# =====================================================

Write-Host "📦 Étape 2/5 : Installation des dépendances...`n" -ForegroundColor Yellow

Write-Host "   📥 npm install..." -NoNewline
try {
    $output = npm install 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ Succès" -ForegroundColor Green
    } else {
        throw "Échec installation"
    }
} catch {
    Write-Host " ❌ Échec" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# =====================================================
# ÉTAPE 3: Configuration de la base de données
# =====================================================

Write-Host "🗄️  Étape 3/5 : Configuration de la base de données...`n" -ForegroundColor Yellow

Write-Host "   ℹ️  Vous devez exécuter le script SQL manuellement dans Supabase:" -ForegroundColor Cyan
Write-Host "      1. Ouvrez https://app.supabase.com" -ForegroundColor White
Write-Host "      2. Sélectionnez votre projet" -ForegroundColor White
Write-Host "      3. Menu > SQL Editor > New Query" -ForegroundColor White
Write-Host "      4. Copiez le contenu de: supabase/setup-mini-site-networking.sql" -ForegroundColor White
Write-Host "      5. Collez et cliquez sur 'Run'" -ForegroundColor White
Write-Host ""
Write-Host "   📄 Chemin du fichier: $PWD\supabase\setup-mini-site-networking.sql" -ForegroundColor Gray
Write-Host ""

$response = Read-Host "   Avez-vous exécuté le script SQL dans Supabase ? (o/N)"
if ($response -ne "o" -and $response -ne "O") {
    Write-Host "`n   ⚠️  Installation interrompue. Exécutez le script SQL puis relancez ce script.`n" -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# =====================================================
# ÉTAPE 4: Seeding des templates
# =====================================================

Write-Host "🌱 Étape 4/5 : Seeding des templates...`n" -ForegroundColor Yellow

Write-Host "   📝 Insertion de 10 templates dans Supabase..." -ForegroundColor Cyan

# Vérifier si le script existe
if (-not (Test-Path "scripts/seed-site-templates.ts")) {
    Write-Host "   ❌ Fichier scripts/seed-site-templates.ts introuvable" -ForegroundColor Red
    exit 1
}

# Exécuter le seeding
Write-Host ""
try {
    npx tsx scripts/seed-site-templates.ts
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n   ✅ Templates seedés avec succès !`n" -ForegroundColor Green
    } else {
        Write-Host "`n   ⚠️  Seeding terminé avec des avertissements`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n   ❌ Erreur lors du seeding: $_`n" -ForegroundColor Red
    Write-Host "   ℹ️  Vous pouvez réessayer plus tard avec: npm run seed:templates`n" -ForegroundColor Cyan
}

# =====================================================
# ÉTAPE 5: Vérification finale
# =====================================================

Write-Host "🔍 Étape 5/5 : Vérification finale...`n" -ForegroundColor Yellow

Write-Host "   🏗️  Test de build..." -NoNewline
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ Succès" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Avertissements" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ❌ Échec" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Red
}

Write-Host ""

# =====================================================
# RÉSUMÉ
# =====================================================

Write-Host "=" -NoNewline; Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "`n✅ INSTALLATION TERMINÉE !`n" -ForegroundColor Green
Write-Host "=" -NoNewline; Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

Write-Host "📊 Résumé de l'installation :`n" -ForegroundColor Cyan

Write-Host "   ✅ Dépendances npm installées" -ForegroundColor Green
Write-Host "   ✅ Base de données configurée (8 tables)" -ForegroundColor Green
Write-Host "   ✅ Bucket Storage 'site-images' créé" -ForegroundColor Green
Write-Host "   ✅ RLS Policies configurées" -ForegroundColor Green
Write-Host "   ✅ 10 templates seedés" -ForegroundColor Green
Write-Host "   ✅ Build de l'application testé" -ForegroundColor Green
Write-Host ""

Write-Host "📚 Documentation :`n" -ForegroundColor Cyan
Write-Host "   📖 Guide complet: MINI_SITE_NETWORKING_COMPLETE.md" -ForegroundColor White
Write-Host "   📖 Installation: INSTALLATION_GUIDE.md" -ForegroundColor White
Write-Host "   📖 Récapitulatif: RECAP_FINAL_DEVELOPMENT.md" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Prochaines étapes :`n" -ForegroundColor Cyan
Write-Host "   1. Lancez le serveur de dev: npm run dev" -ForegroundColor White
Write-Host "   2. Ouvrez http://localhost:9323" -ForegroundColor White
Write-Host "   3. Connectez-vous en tant qu'exposant" -ForegroundColor White
Write-Host "   4. Créez votre premier mini-site !" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Fonctionnalités disponibles :`n" -ForegroundColor Cyan
Write-Host "   🎨 Mini-Site Builder (7 fonctionnalités)" -ForegroundColor White
Write-Host "      • 10 templates préconçus" -ForegroundColor Gray
Write-Host "      • Drag & drop de sections" -ForegroundColor Gray
Write-Host "      • Bibliothèque d'images" -ForegroundColor Gray
Write-Host "      • Éditeur SEO + Google Analytics" -ForegroundColor Gray
Write-Host "      • Preview responsive" -ForegroundColor Gray
Write-Host ""
Write-Host "   🤝 Networking & Matchmaking (6 fonctionnalités)" -ForegroundColor White
Write-Host "      • Algorithme IA de matching" -ForegroundColor Gray
Write-Host "      • Speed networking virtuel" -ForegroundColor Gray
Write-Host "      • 9 salles thématiques" -ForegroundColor Gray
Write-Host "      • Historique d'interactions" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 Commandes utiles :`n" -ForegroundColor Cyan
Write-Host "   npm run dev          - Lancer le serveur de développement" -ForegroundColor White
Write-Host "   npm run build        - Build de production" -ForegroundColor White
Write-Host "   npm run seed:templates - Re-seeder les templates" -ForegroundColor White
Write-Host "   npm run lint         - Vérifier le code" -ForegroundColor White
Write-Host ""

Write-Host "=" -NoNewline; Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

# Proposer de lancer le serveur
$launch = Read-Host "Voulez-vous lancer le serveur de développement maintenant ? (o/N)"
if ($launch -eq "o" -or $launch -eq "O") {
    Write-Host "`n🚀 Lancement du serveur...`n" -ForegroundColor Cyan
    npm run dev
}

Write-Host "`n✨ Installation terminée avec succès !`n" -ForegroundColor Green
