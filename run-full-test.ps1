# Script PowerShell pour exécuter tous les tests et générer les rapports

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   TESTS COMPLETS SIPORT v3" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que le serveur dev tourne
Write-Host "1. Vérification du serveur de développement..." -ForegroundColor Yellow
$process = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like "*Vite*"}

if (-not $process) {
    Write-Host "   ⚠️  Le serveur dev n'est pas démarré" -ForegroundColor Red
    Write-Host "   Démarrage du serveur..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
    Start-Sleep -Seconds 10
}
Write-Host "   ✅ Serveur dev actif" -ForegroundColor Green
Write-Host ""

# 2. Scanner le bug admin
Write-Host "2. Analyse du bug admin auto-connecté..." -ForegroundColor Yellow
npx ts-node scripts/fix-admin-auto-login.ts
Write-Host ""

# 3. Compiler le script de test
Write-Host "3. Compilation du script de test..." -ForegroundColor Yellow
if (Test-Path "scripts/test-all-pages.js") {
    Remove-Item "scripts/test-all-pages.js"
}
npx tsc scripts/test-all-pages.ts --module commonjs --target es2020 --esModuleInterop --resolveJsonModule
Write-Host "   ✅ Script compilé" -ForegroundColor Green
Write-Host ""

# 4. Exécuter les tests complets
Write-Host "4. Exécution des tests sur toutes les pages..." -ForegroundColor Yellow
Write-Host "   (Cela peut prendre plusieurs minutes)" -ForegroundColor Gray
Write-Host ""
node scripts/test-all-pages.js http://localhost:5173
Write-Host ""

# 5. Afficher le dernier rapport
Write-Host "5. Ouverture du rapport..." -ForegroundColor Yellow
$latestReport = Get-ChildItem -Path "test-reports" -Directory | Sort-Object CreationTime -Descending | Select-Object -First 1
if ($latestReport) {
    $reportPath = Join-Path $latestReport.FullName "REPORT.md"
    if (Test-Path $reportPath) {
        Write-Host "   📄 Rapport: $reportPath" -ForegroundColor Green
        code $reportPath
    }
    
    $fixesPath = Join-Path $latestReport.FullName "FIXES_NEEDED.md"
    if (Test-Path $fixesPath) {
        Write-Host "   🔧 Corrections: $fixesPath" -ForegroundColor Green
        code $fixesPath
    }
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Tests terminés!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Consultez les rapports dans le dossier test-reports" -ForegroundColor Yellow
Write-Host ""

# Demander si on veut appliquer les corrections automatiquement
$apply = Read-Host "Voulez-vous appliquer les corrections automatiquement? (o/N)"
if ($apply -eq "o" -or $apply -eq "O") {
    Write-Host ""
    Write-Host "🔧 Application des corrections..." -ForegroundColor Yellow
    npx ts-node scripts/apply-fixes.ts
}
