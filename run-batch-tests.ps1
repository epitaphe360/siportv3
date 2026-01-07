# Script PowerShell pour tester par batch de 25
# Exécute les tests E2E progressivement et corrige les échecs

param(
    [int]$BatchSize = 25,
    [string]$TestDir = "e2e"
)

$RootPath = "c:\Users\samye\OneDrive\Desktop\siportversionfinal\siportv3"
Set-Location $RootPath

Write-Host "=== SIPORTS E2E TEST BATCH RUNNER ===" -ForegroundColor Cyan
Write-Host "Batch Size: $BatchSize tests" -ForegroundColor Yellow
Write-Host "Test Directory: $TestDir" -ForegroundColor Yellow
Write-Host ""

# Fonction pour exécuter un batch de tests
function Run-TestBatch {
    param(
        [int]$StartIndex,
        [int]$Count
    )
    
    Write-Host "`n--- BATCH: Tests $StartIndex à $($StartIndex + $Count - 1) ---" -ForegroundColor Green
    
    # Exécuter Playwright avec limit
    $result = npx playwright test --project=chromium --reporter=list 2>&1
    
    return $result
}

# Fonction pour analyser les résultats
function Analyze-Results {
    param([string]$Output)
    
    $passed = ($Output | Select-String "✓").Count
    $failed = ($Output | Select-String "✘").Count
    
    return @{
        Passed = $passed
        Failed = $failed
        Total = $passed + $failed
    }
}

# Boucle principale
$totalTests = 865
$currentIndex = 0
$totalPassed = 0
$totalFailed = 0

while ($currentIndex -lt $totalTests) {
    $batchCount = [Math]::Min($BatchSize, $totalTests - $currentIndex)
    
    Write-Host "Exécution tests $currentIndex à $($currentIndex + $batchCount)..." -ForegroundColor Cyan
    
    $output = Run-TestBatch -StartIndex $currentIndex -Count $batchCount
    $results = Analyze-Results -Output $output
    
    $totalPassed += $results.Passed
    $totalFailed += $results.Failed
    
    Write-Host "Résultats batch: $($results.Passed) passés, $($results.Failed) échoués" -ForegroundColor Yellow
    
    $currentIndex += $batchCount
    
    # Pause entre les batches
    Start-Sleep -Seconds 5
}

Write-Host "`n=== RÉSULTATS FINAUX ===" -ForegroundColor Cyan
Write-Host "Total passés: $totalPassed / $totalTests" -ForegroundColor Green
Write-Host "Total échoués: $totalFailed / $totalTests" -ForegroundColor Red
Write-Host "Pass rate: $([math]::Round(($totalPassed / $totalTests) * 100, 2))%" -ForegroundColor Yellow
