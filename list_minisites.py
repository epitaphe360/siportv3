"""
Script pour lister les mini-sites accessibles avec leurs exposants
"""
import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "https://eqjoqgpbxhsfgcovipgu.supabase.co")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE")

def list_accessible_minisites():
    """Liste les mini-sites accessibles avec les noms des exposants"""
    print("=" * 80)
    print("🌐 MINI-SITES ACCESSIBLES DANS L'APPLICATION")
    print("=" * 80)
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Récupérer les mini-sites publiés
        response = supabase.table('mini_sites').select('*').eq('published', True).execute()
        minisites = response.data
        
        if not minisites:
            print("\n❌ Aucun mini-site publié trouvé!")
            return
        
        print(f"\n✅ {len(minisites)} mini-site(s) publié(s) trouvé(s)\n")
        
        # Pour chaque mini-site, récupérer l'exposant
        for i, site in enumerate(minisites, 1):
            exhibitor_id = site.get('exhibitor_id')
            
            # Récupérer d'abord l'exposant (table exhibitors)
            exhibitor_response = supabase.table('exhibitors').select('*').eq('user_id', exhibitor_id).execute()
            exhibitor_data = exhibitor_response.data
            
            # Si pas trouvé par user_id, essayer par ID direct
            if not exhibitor_data:
                exhibitor_response = supabase.table('exhibitors').select('*').eq('id', exhibitor_id).execute()
                exhibitor_data = exhibitor_response.data
            
            # Récupérer aussi l'utilisateur
            user_response = supabase.table('users').select('name, email, type').eq('id', exhibitor_id).execute()
            user_data = user_response.data[0] if user_response.data else None
            
            print(f"Mini-site #{i}")
            print(f"{'─' * 80}")
            
            if exhibitor_data and len(exhibitor_data) > 0:
                exhibitor = exhibitor_data[0]
                print(f"🏢 Entreprise: {exhibitor.get('company_name', 'N/A')}")
                print(f"📂 Catégorie: {exhibitor.get('category', 'N/A')}")
                print(f"🏭 Secteur: {exhibitor.get('sector', 'N/A')}")
                print(f"📝 Description: {exhibitor.get('description', 'N/A')[:100]}...")
                print(f"🔗 Website: {exhibitor.get('website', 'N/A')}")
            elif user_data:
                print(f"👤 Nom: {user_data.get('name', 'N/A')}")
                print(f"📧 Email: {user_data.get('email', 'N/A')}")
                print(f"⚠️  Pas de données exhibitor associées")
            else:
                print(f"⚠️  Aucune information d'exposant trouvée")
            
            print(f"🎨 Thème: {site.get('theme', 'N/A')}")
            print(f"👁️  Vues: {site.get('view_count', 0)}")
            print(f"🆔 Exhibitor ID: {exhibitor_id}")
            
            # URLs d'accès possibles
            print(f"\n🔗 URLs d'accès:")
            print(f"   • Par exhibitor_id: http://localhost:5173/minisite/{exhibitor_id}")
            
            if exhibitor_data and len(exhibitor_data) > 0:
                exhibitor_record_id = exhibitor_data[0].get('id')
                print(f"   • Par exhibitor record ID: http://localhost:5173/minisite/{exhibitor_record_id}")
            
            print()
        
        # Résumé
        print("=" * 80)
        print("📌 RÉSUMÉ:")
        print("   • Pour accéder à un mini-site, utilisez: /minisite/[EXHIBITOR_ID]")
        print("   • Les IDs exhibitor_id ci-dessus sont ceux à utiliser dans l'URL")
        print("   • Si l'erreur persiste, vérifiez que vous utilisez le bon ID")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ ERREUR: {str(e)}")
        print(f"Type: {type(e).__name__}")

if __name__ == "__main__":
    list_accessible_minisites()
