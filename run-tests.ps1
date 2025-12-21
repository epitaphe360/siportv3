# Script pour démarrer le serveur et lancer les tests

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  DÉMARRAGE SERVEUR + TESTS PLAYWRIGHT     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Arrêter les processus Node existants
Write-Host "🛑 Arrêt des serveurs existants..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Étape 2: Démarrer le serveur de développement
Write-Host "🚀 Démarrage du serveur Vite..." -ForegroundColor Green
Start-Process -FilePath "cmd" -ArgumentList "/c npm run dev" -NoNewWindow -PassThru -WindowStyle Hidden
Write-Host "⏳ Attente du démarrage du serveur (30 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Étape 3: Vérifier si le serveur est prêt
Write-Host ""
Write-Host "🔍 Vérification du serveur..." -ForegroundColor Cyan
$maxAttempts = 10
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -Method Head -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            Write-Host "✅ Serveur prêt! (HTTP $($response.StatusCode))" -ForegroundColor Green
        }
    } catch {
        $attempt++
        Write-Host "⏳ Tentative $attempt/$maxAttempts..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $serverReady) {
    Write-Host "❌ Le serveur n'a pas démarré après 30 secondes" -ForegroundColor Red
    Write-Host "Vérifiez les logs du serveur" -ForegroundColor Red
    exit 1
}

# Étape 4: Lancer les tests Playwright
Write-Host ""
Write-Host "🧪 Lancement des tests Playwright..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

npx playwright test

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Tests terminés!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Pour voir le rapport HTML:" -ForegroundColor Cyan
Write-Host "   npx playwright show-report" -ForegroundColor Yellow
