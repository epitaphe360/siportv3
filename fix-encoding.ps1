# Script pour corriger tous les problèmes d'encodage UTF-8
$replacements = @(
    @{'From' = 'Ã©'; 'To' = 'é'},
    @{'From' = 'Ã¨'; 'To' = 'è'},
    @{'From' = 'Ã '; 'To' = 'à'},
    @{'From' = 'Ã¢'; 'To' = 'â'},
    @{'From' = 'Ã®'; 'To' = 'î'},
    @{'From' = 'Ã´'; 'To' = 'ô'},
    @{'From' = 'Ã»'; 'To' = 'û'},
    @{'From' = 'Ã§'; 'To' = 'ç'},
    @{'From' = 'ÃŠ'; 'To' = 'É'},
    @{'From' = 'Ã‰'; 'To' = 'É'},
    @{'From' = 'Ã±'; 'To' = 'ñ'},
    @{'From' = 'â€¢'; 'To' = '•'},
    @{'From' = 'â€™'; 'To' = ''''},
    @{'From' = 'â„¹ï¸'; 'To' = 'ℹ️'},
    @{'From' = 'ðŸ'"; 'To' = '🔥'},
    @{'From' = 'ðŸ"«'; 'To' = '🎫'},
    @{'From' = 'ðŸ"¥'; 'To' = '📥'},
    @{'From' = 'ðŸ–¨ï¸'; 'To' = '🖨️'},
    @{'From' = 'ðŸ"„'; 'To' = '📄'},
    @{'From' = 'âœ¨'; 'To' = '✨'},
    @{'From' = 'âœ…'; 'To' = '✅'},
    @{'From' = 'âœ"ï¸'; 'To' = '✔️'},
    @{'From' = 'âš ï¸'; 'To' = '⚠️'},
    @{'From' = 'â„Â¹ï¸'; 'To' = 'ℹ️'},
    @{'From' = 'ðŸ'¡'; 'To' = '💡'}
)

Get-ChildItem -Path 'src' -Filter '*.tsx' -Recurse | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $modified = $false
    
    $replacements | ForEach-Object {
        if ($content -like "*$($_.From)*") {
            $content = $content -replace [regex]::Escape($_.From), $_.To
            $modified = $true
            Write-Host "Replaced: $($_.From) -> $($_.To) in $filePath"
        }
    }
    
    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "[FIXED] $filePath"
    }
}

Write-Host "✅ All files fixed!"
