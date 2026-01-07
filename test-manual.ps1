Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   RAPPORT DES ERREURS CONSOLE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Le serveur dev tourne sur: http://localhost:9323`n" -ForegroundColor Yellow

Write-Host "Instructions pour capturer les erreurs:`n" -ForegroundColor White
Write-Host "1. Ouvrir http://localhost:9323 dans le navigateur" -ForegroundColor Gray
Write-Host "2. Appuyer sur F12 pour ouvrir la Console" -ForegroundColor Gray
Write-Host "3. Naviguer sur chaque page:" -ForegroundColor Gray
Write-Host "   - Home (/)" -ForegroundColor Gray
Write-Host "   - Login (/login)" -ForegroundColor Gray
Write-Host "   - Register (/register)" -ForegroundColor Gray
Write-Host "   - Exhibitors (/exhibitors)" -ForegroundColor Gray
Write-Host "   - Products (/products)" -ForegroundColor Gray
Write-Host "   - Dashboard (/dashboard)" -ForegroundColor Gray
Write-Host "4. Noter toutes les erreurs en rouge dans la console`n" -ForegroundColor Gray

Write-Host "Corrections deja appliquees:" -ForegroundColor Green
Write-Host "  [OK] Bug admin auto-connecte corrige" -ForegroundColor Green
Write-Host "  [OK] Erreurs Supabase (connections, messages) corrigees" -ForegroundColor Green
Write-Host "  [OK] Tables manquantes gerees avec try-catch" -ForegroundColor Green
Write-Host "  [OK] Images mini-sites ajoutees (Unsplash)" -ForegroundColor Green
Write-Host "  [OK] Nettoyage localStorage au logout`n" -ForegroundColor Green

Write-Host "Fonctions de debugging disponibles (dans Console F12):" -ForegroundColor Yellow
Write-Host "  checkAuthStatus()  - Verifier l'etat d'authentification" -ForegroundColor Gray
Write-Host "  cleanupAuth()      - Nettoyer le localStorage`n" -ForegroundColor Gray

Write-Host "========================================`n" -ForegroundColor Cyan

# Ouvrir le navigateur
Write-Host "Ouverture du navigateur..." -ForegroundColor Yellow
Start-Process "http://localhost:9323"

Write-Host "`nAppuyez sur une touche pour arreter le serveur dev..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
