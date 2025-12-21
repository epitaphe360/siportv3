# Script pour appliquer les données de test à Supabase (Windows)
# Usage: powershell -ExecutionPolicy Bypass -File apply-test-data.ps1

Write-Host "🚀 Applying test data to Supabase..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier les variables d'environnement
if (-not $env:SUPABASE_DATABASE_URL) {
    Write-Host "❌ ERROR: SUPABASE_DATABASE_URL not set" -ForegroundColor Red
    Write-Host "   Please set the environment variable with your Supabase database connection string" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database URL found" -ForegroundColor Green
Write-Host ""

# Vérifier si psql est installé
try {
    $psqlVersion = psql --version 2>$null
    Write-Host "✅ psql found: $psqlVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ ERROR: psql not found. Please install PostgreSQL tools." -ForegroundColor Red
    Write-Host "   Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Appliquer le seed data
Write-Host "📝 Applying seed_test_data.sql..." -ForegroundColor Yellow
$seedContent = Get-Content "supabase\seed_test_data.sql" -Raw
$seedContent | psql "$env:SUPABASE_DATABASE_URL"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ seed_test_data.sql applied successfully" -ForegroundColor Green
}
else {
    Write-Host "❌ Error applying seed_test_data.sql" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Appliquer le compte admin
Write-Host "📝 Applying admin test account..." -ForegroundColor Yellow
$adminContent = Get-Content "supabase\add-admin-test-account.sql" -Raw
$adminContent | psql "$env:SUPABASE_DATABASE_URL"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Admin test account created successfully" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Warning: Admin account creation had issues (may already exist)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ All test data applied!" -ForegroundColor Green
Write-Host ""
Write-Host "Test accounts created:" -ForegroundColor Cyan
Write-Host "  📧 visitor-free@test.siport.com" -ForegroundColor Green
Write-Host "  📧 visitor-vip@test.siport.com" -ForegroundColor Green
Write-Host "  📧 partner-museum@test.siport.com" -ForegroundColor Green
Write-Host "  📧 partner-silver@test.siport.com" -ForegroundColor Green
Write-Host "  📧 partner-gold@test.siport.com" -ForegroundColor Green
Write-Host "  📧 partner-platinium@test.siport.com" -ForegroundColor Green
Write-Host "  📧 exhibitor-9m@test.siport.com" -ForegroundColor Green
Write-Host "  📧 exhibitor-18m@test.siport.com" -ForegroundColor Green
Write-Host "  📧 exhibitor-36m@test.siport.com" -ForegroundColor Green
Write-Host "  📧 exhibitor-54m@test.siport.com" -ForegroundColor Green
Write-Host "  📧 admin-test@test.siport.com" -ForegroundColor Green
Write-Host ""
Write-Host "🔑 Password for all: Test@1234567" -ForegroundColor Yellow
Write-Host ""
