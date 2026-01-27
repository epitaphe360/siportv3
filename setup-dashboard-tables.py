"""
Script pour créer les tables nécessaires au dashboard admin
Exécute le fichier SQL create-missing-tables.sql
"""
import os
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL', 'https://lpvzwynjsjfbrnwtwqac.supabase.co')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwdnp3eW5qc2pmYnJud3R3cWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjQ5MTAsImV4cCI6MjA2MDc0MDkxMH0.xfvZ0MoD_IHHaRE2z0oTcgqmuzE-6K0iCNa5cQmTGqw')

def main():
    # Créer le client Supabase
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("=== Création des tables pour le dashboard admin ===\n")
    
    # Lire le fichier SQL
    with open('create-missing-tables.sql', 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    print("📄 Fichier SQL chargé")
    print("⚠️  Note: L'exécution de SQL brut nécessite les permissions service_role")
    print("    Vous devrez peut-être exécuter ce script manuellement dans Supabase Dashboard\n")
    
    print("📋 Tables à créer/vérifier:")
    print("  - api_logs (logs des appels API)")
    print("  - page_views (tracking du trafic)")
    print("  - admin_logs (journal des actions admin)")
    print("  - Colonnes: users.last_seen, media_content.file_size")
    print("  - Index de performance")
    print("  - Triggers pour last_seen")
    
    print("\n✅ Pour exécuter ce script:")
    print("1. Allez sur https://supabase.com/dashboard")
    print("2. Sélectionnez votre projet SIPORT")
    print("3. Cliquez sur 'SQL Editor'")
    print("4. Copiez le contenu de 'create-missing-tables.sql'")
    print("5. Collez et exécutez\n")
    
    # Vérifier les tables existantes
    try:
        result = supabase.table('admin_logs').select('id').limit(1).execute()
        print("✅ Table admin_logs existe déjà")
    except Exception as e:
        print("❌ Table admin_logs n'existe pas encore")
    
    try:
        result = supabase.table('page_views').select('id').limit(1).execute()
        print("✅ Table page_views existe déjà")
    except Exception as e:
        print("❌ Table page_views n'existe pas encore")
    
    try:
        result = supabase.table('api_logs').select('id').limit(1).execute()
        print("✅ Table api_logs existe déjà")
    except Exception as e:
        print("❌ Table api_logs n'existe pas encore")

if __name__ == '__main__':
    main()
