$ErrorActionPreference = 'Stop'
$file = 'src/pages/NetworkingPage.tsx'

Write-Host "Lecture du fichier..." -ForegroundColor Yellow
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

Write-Host "Application des corrections..." -ForegroundColor Yellow
$replacements = @{
    'AccÃ©dez Ã  des opportunitÃ©s' = 'Accédez à des opportunités'
    "L'Ã©cosystÃ¨me SIPORTS Ã  votre portÃ©e" = "L'écosystème SIPORTS à votre portée"
    'simplifiÃ©' = 'simplifié'
    'Â© 2026 - SIPORTS : Salon International des Ports et de leur Ã‰cosystÃ¨me â€" Tous droits rÃ©servÃ©s' = '© 2026 - SIPORTS : Salon International des Ports et de leur Écosystème — Tous droits réservés'
    'GÃ©nÃ©rales' = 'Générales'
    'ConfidentialitÃ©' = 'Confidentialité'
    'LÃ©gales' = 'Légales'
}

$count = 0
foreach ($key in $replacements.Keys) {
    if ($content.Contains($key)) {
        $content = $content.Replace($key, $replacements[$key])
        $count++
        Write-Host "  ✓ Corrigé: $key" -ForegroundColor Green
    }
}

Write-Host "Écriture du fichier..." -ForegroundColor Yellow
[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)

Write-Host "`n✅ $count corrections appliquées avec succès!" -ForegroundColor Green
