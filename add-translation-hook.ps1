$pagesPath = "src/pages"
$corrected = 0
$skipped = 0

Get-ChildItem -Path $pagesPath -Filter "*.tsx" -Recurse | ForEach-Object {
    $file = $_
    $content = Get-Content $file.FullName -Raw
    
    # Check if already has useTranslation
    if ($content -match "useTranslation") {
        $skipped++
        return
    }
    
    # Add import if not present
    if ($content -notmatch "import.*useTranslation") {
        # Find last import statement
        $lastImportMatch = [regex]::Match($content, "^import.*?;", "Multiline")
        if ($lastImportMatch.Success) {
            $insertPos = $lastImportMatch.Index + $lastImportMatch.Length
            $content = $content.Insert($insertPos, "`nimport { useTranslation } from '../hooks/useTranslation';")
        }
    }
    
    # Add hook to first component function
    $funcMatch = [regex]::Match($content, "function\s+\w+\s*\([^)]*\)\s*\{")
    if ($funcMatch.Success) {
        $insertPos = $funcMatch.Index + $funcMatch.Length
        $content = $content.Insert($insertPos, "`n  const { t } = useTranslation();")
    }
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    $corrected++
}

Write-Host "✅ Ajout de useTranslation à toutes les pages"
Write-Host "   Corrigées: $corrected"
Write-Host "   Déjà présentes: $skipped"
