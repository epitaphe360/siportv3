#!/bin/bash

# Script pour appliquer les données de test à Supabase
# Usage: bash apply-test-data.sh

echo "🚀 Applying test data to Supabase..."
echo "=========================================="

# Vérifier les variables d'environnement
if [ -z "$SUPABASE_DATABASE_URL" ]; then
  echo "❌ ERROR: SUPABASE_DATABASE_URL not set"
  echo "   Please set the environment variable with your Supabase database connection string"
  exit 1
fi

echo "✅ Database URL found"
echo ""

# Appliquer le seed data
echo "📝 Applying seed_test_data.sql..."
psql "$SUPABASE_DATABASE_URL" < supabase/seed_test_data.sql

if [ $? -eq 0 ]; then
  echo "✅ seed_test_data.sql applied successfully"
else
  echo "❌ Error applying seed_test_data.sql"
  exit 1
fi

echo ""

# Appliquer le compte admin
echo "📝 Applying admin test account..."
psql "$SUPABASE_DATABASE_URL" < supabase/add-admin-test-account.sql

if [ $? -eq 0 ]; then
  echo "✅ Admin test account created successfully"
else
  echo "⚠️  Warning: Admin account creation had issues (may already exist)"
fi

echo ""
echo "=========================================="
echo "✅ All test data applied!"
echo ""
echo "Test accounts created:"
echo "  📧 visitor-free@test.siport.com"
echo "  📧 visitor-vip@test.siport.com"
echo "  📧 partner-museum@test.siport.com"
echo "  📧 partner-silver@test.siport.com"
echo "  📧 partner-gold@test.siport.com"
echo "  📧 partner-platinium@test.siport.com"
echo "  📧 exhibitor-9m@test.siport.com"
echo "  📧 exhibitor-18m@test.siport.com"
echo "  📧 exhibitor-36m@test.siport.com"
echo "  📧 exhibitor-54m@test.siport.com"
echo "  📧 admin-test@test.siport.com"
echo ""
echo "🔑 Password for all: Test@1234567"
echo ""
