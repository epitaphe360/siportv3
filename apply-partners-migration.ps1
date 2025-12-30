# Script pour appliquer la migration partners à Supabase
# Exécuter depuis la racine du projet

Write-Host "=== Migration Partners Table ===" -ForegroundColor Cyan
Write-Host ""

# Charger les variables d'environnement
$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $key = $matches[1]
            $value = $matches[2]
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$SUPABASE_URL = $env:VITE_SUPABASE_URL
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SUPABASE_SERVICE_KEY) {
    Write-Host "Erreur: Variables d'environnement manquantes" -ForegroundColor Red
    Write-Host "Assurez-vous que VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env" -ForegroundColor Yellow
    exit 1
}

Write-Host "URL Supabase: $SUPABASE_URL" -ForegroundColor Green

# Lecture du fichier SQL
$sqlFile = "supabase/migrations/20251229_enhance_partners_table.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "Erreur: Fichier SQL non trouvé: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Lecture de la migration: $sqlFile" -ForegroundColor Green

# Afficher les colonnes qui seront ajoutées
Write-Host ""
Write-Host "Colonnes à ajouter:" -ForegroundColor Yellow
Write-Host "  - mission (text)" -ForegroundColor White
Write-Host "  - vision (text)" -ForegroundColor White
Write-Host "  - values (jsonb)" -ForegroundColor White
Write-Host "  - certifications (jsonb)" -ForegroundColor White
Write-Host "  - awards (jsonb)" -ForegroundColor White
Write-Host "  - social_media (jsonb)" -ForegroundColor White
Write-Host "  - key_figures (jsonb)" -ForegroundColor White
Write-Host "  - testimonials (jsonb)" -ForegroundColor White
Write-Host "  - news (jsonb)" -ForegroundColor White
Write-Host "  - expertise (jsonb)" -ForegroundColor White
Write-Host "  - clients (jsonb)" -ForegroundColor White
Write-Host "  - video_url (text)" -ForegroundColor White
Write-Host "  - gallery (jsonb)" -ForegroundColor White
Write-Host "  - established_year (integer)" -ForegroundColor White
Write-Host "  - employees (text)" -ForegroundColor White
Write-Host "  - country (text)" -ForegroundColor White
Write-Host ""

# Demander confirmation
$response = Read-Host "Voulez-vous appliquer cette migration? (oui/non)"
if ($response -ne "oui" -and $response -ne "o" -and $response -ne "yes" -and $response -ne "y") {
    Write-Host "Migration annulée." -ForegroundColor Yellow
    exit 0
}

# Exécuter la migration via l'API REST de Supabase
Write-Host ""
Write-Host "Application de la migration..." -ForegroundColor Cyan

# Extraire le project ref de l'URL
if ($SUPABASE_URL -match "https://([^.]+)\.supabase\.co") {
    $projectRef = $matches[1]
    Write-Host "Project Ref: $projectRef" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pour appliquer manuellement cette migration:" -ForegroundColor Yellow
Write-Host "1. Allez sur https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Sélectionnez votre projet" -ForegroundColor White
Write-Host "3. Allez dans 'SQL Editor'" -ForegroundColor White
Write-Host "4. Copiez et exécutez le contenu de:" -ForegroundColor White
Write-Host "   $sqlFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ou utilisez Supabase CLI:" -ForegroundColor Yellow
Write-Host "   supabase db push" -ForegroundColor Cyan
Write-Host ""

# Afficher le contenu SQL simplifié (juste les ALTER TABLE)
Write-Host "=== Commandes SQL essentielles ===" -ForegroundColor Magenta
Write-Host @"
ALTER TABLE partners
ADD COLUMN IF NOT EXISTS mission text,
ADD COLUMN IF NOT EXISTS vision text,
ADD COLUMN IF NOT EXISTS values jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS awards jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS key_figures jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS testimonials jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS news jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS expertise jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS clients jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS gallery jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS established_year integer,
ADD COLUMN IF NOT EXISTS employees text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'Maroc';
"@ -ForegroundColor Gray

Write-Host ""
Write-Host "Migration script ready!" -ForegroundColor Green
