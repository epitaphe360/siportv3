$files = @(
    "BestMomentsPage",
    "CapsulesPage",
    "LiveStudioPage",
    "MediaLibraryPage",
    "TestimonialsPage"
)

foreach ($file in $files) {
    $path = "src/pages/media/$file.tsx"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        if ($content -notmatch "export default $file") {
            Add-Content -Path $path -Value "`nexport default $file;"
            Write-Host "[✓] Ajouté export default à $file.tsx" -ForegroundColor Green
        } else {
            Write-Host "[OK] $file.tsx a déjà un export default" -ForegroundColor Cyan
        }
    }
}
