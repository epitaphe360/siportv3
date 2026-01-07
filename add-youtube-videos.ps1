# Script PowerShell pour ajouter des vidéos YouTube maritimes aux webinaires

$ErrorActionPreference = "Stop"

Write-Host "🎥 Ajout de vidéos YouTube maritimes aux webinaires SIPORT" -ForegroundColor Cyan
Write-Host ""

# Définir les variables d'environnement
$env:SUPABASE_URL = "https://eqjoqgpbxhsfgcovipgu.supabase.co"
$env:SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo"

# Exécuter le script Node.js
Write-Host "📊 Exécution du script..." -ForegroundColor Yellow

try {
    node scripts/add-video-urls-to-webinars.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Vidéos YouTube ajoutées avec succès !" -ForegroundColor Green
        Write-Host "🌐 Visitez http://localhost:9323/media/webinars pour voir les webinaires" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors de l'exécution du script" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    exit 1
}
