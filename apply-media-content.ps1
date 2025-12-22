# Script PowerShell pour appliquer le seed de données média enrichi
# Enrichissement du contenu des pages média SIPORT

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  SIPORT - Media Content Seed  " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Supabase CLI est installé
Write-Host "🔍 Vérification de Supabase CLI..." -ForegroundColor Yellow
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI n'est pas installé." -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour installer Supabase CLI:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Supabase CLI détecté" -ForegroundColor Green
Write-Host ""

# Afficher les statistiques du contenu
Write-Host "📊 Statistiques du contenu ajouté:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🎥 Webinaires:        10 contenus (~30h)" -ForegroundColor White
Write-Host "  🎙️ Podcasts:          10 épisodes (~20h)" -ForegroundColor White
Write-Host "  📹 Capsules Inside:    10 capsules (~35min)" -ForegroundColor White
Write-Host "  🎬 Live Studio:        10 interviews (~23h)" -ForegroundColor White
Write-Host "  ⭐ Best Moments:       10 highlights (~50min)" -ForegroundColor White
Write-Host "  💬 Testimonials:       11 témoignages (~20min)" -ForegroundColor White
Write-Host "  ─────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  📦 TOTAL:              61 contenus (~74h 45min)" -ForegroundColor Green
Write-Host ""

# Options disponibles
Write-Host "Options disponibles:" -ForegroundColor Yellow
Write-Host "  1. Reset complet de la base de données (recommandé)" -ForegroundColor White
Write-Host "  2. Appliquer uniquement les seeds" -ForegroundColor White
Write-Host "  3. Afficher le fichier de seed" -ForegroundColor White
Write-Host "  4. Annuler" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Votre choix (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "⚠️  ATTENTION: Cette opération va:" -ForegroundColor Yellow
        Write-Host "    - Supprimer toutes les données existantes" -ForegroundColor Red
        Write-Host "    - Recréer les tables" -ForegroundColor Yellow
        Write-Host "    - Importer le nouveau contenu enrichi" -ForegroundColor Green
        Write-Host ""
        $confirm = Read-Host "Êtes-vous sûr? (oui/non)"
        
        if ($confirm -eq "oui") {
            Write-Host ""
            Write-Host "🔄 Reset de la base de données en cours..." -ForegroundColor Cyan
            npx supabase db reset
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Base de données réinitialisée avec succès!" -ForegroundColor Green
                Write-Host ""
                Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
                Write-Host "  1. Démarrer l'application: npm run dev" -ForegroundColor White
                Write-Host "  2. Visiter les pages média:" -ForegroundColor White
                Write-Host "     - http://localhost:5173/media/webinars" -ForegroundColor Gray
                Write-Host "     - http://localhost:5173/media/podcasts" -ForegroundColor Gray
                Write-Host "     - http://localhost:5173/media/capsules" -ForegroundColor Gray
                Write-Host "     - http://localhost:5173/media/live-studio" -ForegroundColor Gray
                Write-Host "     - http://localhost:5173/media/best-moments" -ForegroundColor Gray
                Write-Host "     - http://localhost:5173/media/testimonials" -ForegroundColor Gray
                Write-Host ""
            } else {
                Write-Host ""
                Write-Host "❌ Erreur lors du reset de la base de données" -ForegroundColor Red
                Write-Host ""
            }
        } else {
            Write-Host ""
            Write-Host "❌ Opération annulée" -ForegroundColor Yellow
            Write-Host ""
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🌱 Application des seeds..." -ForegroundColor Cyan
        npx supabase db seed
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Seeds appliqués avec succès!" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "❌ Erreur lors de l'application des seeds" -ForegroundColor Red
            Write-Host ""
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "📄 Affichage du fichier de seed..." -ForegroundColor Cyan
        Write-Host ""
        $seedFile = "supabase\migrations\20250220000001_seed_media_data.sql"
        
        if (Test-Path $seedFile) {
            Get-Content $seedFile | Select-Object -First 100
            Write-Host ""
            Write-Host "... (fichier tronqué - 100 premières lignes affichées)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "Fichier complet: $seedFile" -ForegroundColor Cyan
            Write-Host ""
        } else {
            Write-Host "❌ Fichier non trouvé: $seedFile" -ForegroundColor Red
            Write-Host ""
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "❌ Opération annulée" -ForegroundColor Yellow
        Write-Host ""
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Choix invalide" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
