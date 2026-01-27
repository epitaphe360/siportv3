"""
Script pour vérifier l'état des mini-sites dans la base de données Supabase
"""
import os
import json
from supabase import create_client, Client

# Configuration Supabase - À remplir avec vos credentials
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "VOTRE_URL_ICI")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "VOTRE_CLE_ICI")

def check_minisites():
    """Vérifie les mini-sites existants dans la base de données"""
    print("=" * 70)
    print("🔍 VÉRIFICATION DES MINI-SITES DANS LA BASE DE DONNÉES")
    print("=" * 70)
    
    if SUPABASE_URL == "VOTRE_URL_ICI" or SUPABASE_KEY == "VOTRE_CLE_ICI":
        print("\n❌ ERREUR: Variables d'environnement Supabase non configurées!")
        print("\nVeuillez définir:")
        print("  - VITE_SUPABASE_URL")
        print("  - VITE_SUPABASE_ANON_KEY")
        print("\nOu modifiez directement le script avec vos credentials.")
        return
    
    try:
        # Créer le client Supabase
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"\n✅ Connexion Supabase réussie: {SUPABASE_URL}\n")
        
        # 1. Vérifier la table mini_sites
        print("📊 VÉRIFICATION DE LA TABLE 'mini_sites':")
        print("-" * 70)
        
        response = supabase.table('mini_sites').select('*').execute()
        minisites = response.data
        
        if not minisites:
            print("❌ Aucun mini-site trouvé dans la base de données!\n")
            print("💡 Solutions possibles:")
            print("   1. Exécuter le fichier seed_test_data.sql")
            print("   2. Créer un mini-site manuellement depuis le dashboard exposant")
            print("   3. Vérifier que les migrations sont appliquées\n")
        else:
            print(f"✅ {len(minisites)} mini-site(s) trouvé(s)\n")
            
            for i, site in enumerate(minisites, 1):
                print(f"Mini-site #{i}:")
                print(f"  • ID: {site.get('id')}")
                print(f"  • Exhibitor ID: {site.get('exhibitor_id')}")
                print(f"  • Publié: {'✅ OUI' if site.get('is_published') or site.get('published') else '❌ NON'}")
                print(f"  • Vues: {site.get('view_count', site.get('views', 0))}")
                print(f"  • Thème: {site.get('theme', 'N/A')}")
                print(f"  • URL de test: /minisite/{site.get('exhibitor_id')}")
                print()
        
        # 2. Vérifier les exposants associés
        print("\n👥 VÉRIFICATION DES EXPOSANTS:")
        print("-" * 70)
        
        exhibitors_response = supabase.table('exhibitors').select('id, user_id, company_name, stand_size').execute()
        exhibitors = exhibitors_response.data
        
        if exhibitors:
            print(f"✅ {len(exhibitors)} exposant(s) trouvé(s)\n")
            
            for exhib in exhibitors:
                # Vérifier si cet exposant a un mini-site
                has_minisite = any(
                    ms.get('exhibitor_id') == exhib.get('user_id') or 
                    ms.get('exhibitor_id') == exhib.get('id')
                    for ms in minisites
                )
                
                status = "✅ A un mini-site" if has_minisite else "❌ Pas de mini-site"
                print(f"  {exhib.get('company_name', 'N/A')}")
                print(f"    - User ID: {exhib.get('user_id')}")
                print(f"    - Exhibitor ID: {exhib.get('id')}")
                print(f"    - Stand: {exhib.get('stand_size', 'N/A')}")
                print(f"    - Status: {status}")
                print()
        else:
            print("❌ Aucun exposant trouvé dans la base de données!\n")
        
        # 3. Recommandations
        print("\n💡 RECOMMANDATIONS:")
        print("-" * 70)
        
        if not minisites and not exhibitors:
            print("📝 Votre base de données semble vide.")
            print("   Exécutez: supabase/seed_test_data.sql pour créer des données de test")
        elif exhibitors and not minisites:
            print("📝 Vous avez des exposants mais aucun mini-site.")
            print("   1. Connectez-vous en tant qu'exposant")
            print("   2. Créez votre mini-site depuis le dashboard")
        elif minisites:
            unpublished = [ms for ms in minisites if not (ms.get('is_published') or ms.get('published'))]
            if unpublished:
                print(f"⚠️  {len(unpublished)} mini-site(s) non publié(s)")
                print("   Publiez-les depuis le dashboard exposant pour les rendre visibles")
        
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"\n❌ ERREUR lors de la vérification: {str(e)}")
        print(f"\nType d'erreur: {type(e).__name__}")
        
        if "invalid" in str(e).lower() or "authentication" in str(e).lower():
            print("\n💡 Vérifiez vos credentials Supabase (URL et clé API)")
        elif "does not exist" in str(e).lower():
            print("\n💡 La table n'existe pas - exécutez les migrations SQL")

if __name__ == "__main__":
    check_minisites()
