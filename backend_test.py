#!/usr/bin/env python3
"""
SIPORTS 2026 - Tests Backend Complets
Test de toutes les fonctionnalités critiques mentionnées dans la review request
"""

import requests
import sys
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class SiportsBackendTester:
    def __init__(self, base_url="http://localhost:9323"):
        self.base_url = base_url
        self.supabase_url = "https://eqjoqgpbxhsfgcovipgu.supabase.co"
        self.supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Comptes de test fournis
        self.test_accounts = {
            'visitor_free': {'email': 'visitor-free@test.siport.com', 'password': 'Test123456!'},
            'visitor_vip': {'email': 'visitor-vip@test.siport.com', 'password': 'Test123456!'},
            'exhibitor': {'email': 'exhibitor-9m@test.siport.com', 'password': 'Test123456!'},
            'partner_gold': {'email': 'partner-gold@test.siport.com', 'password': 'Test123456!'},
            'admin': {'email': 'admin@siports.com', 'password': 'Test123456!'}
        }
        
        self.auth_tokens = {}

    def log_test(self, name: str, success: bool, details: str = "", error: str = ""):
        """Enregistre le résultat d'un test"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
            if details:
                print(f"   📋 {details}")
        else:
            print(f"❌ {name}")
            if error:
                print(f"   🚨 {error}")
        
        self.test_results.append({
            'name': name,
            'success': success,
            'details': details,
            'error': error,
            'timestamp': datetime.now().isoformat()
        })

    def test_supabase_connection(self) -> bool:
        """Test de connexion à Supabase"""
        try:
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }
            
            # Test simple de lecture sur une table publique
            response = requests.get(
                f"{self.supabase_url}/rest/v1/users?select=count",
                headers=headers,
                timeout=10
            )
            
            success = response.status_code in [200, 206]
            self.log_test(
                "Connexion Supabase",
                success,
                f"Status: {response.status_code}" if success else "",
                f"Erreur HTTP {response.status_code}: {response.text}" if not success else ""
            )
            return success
            
        except Exception as e:
            self.log_test("Connexion Supabase", False, "", str(e))
            return False

    def test_authentication_all_accounts(self) -> bool:
        """Test d'authentification pour tous les comptes de test"""
        all_success = True
        
        for account_type, credentials in self.test_accounts.items():
            try:
                # Test de connexion via Supabase Auth
                auth_data = {
                    'email': credentials['email'],
                    'password': credentials['password']
                }
                
                headers = {
                    'apikey': self.supabase_key,
                    'Content-Type': 'application/json'
                }
                
                response = requests.post(
                    f"{self.supabase_url}/auth/v1/token?grant_type=password",
                    headers=headers,
                    json=auth_data,
                    timeout=10
                )
                
                success = response.status_code == 200
                if success:
                    token_data = response.json()
                    self.auth_tokens[account_type] = token_data.get('access_token')
                    
                self.log_test(
                    f"Auth {account_type.replace('_', ' ').title()}",
                    success,
                    f"Token obtenu: {credentials['email']}" if success else "",
                    f"Échec connexion {credentials['email']}: {response.text}" if not success else ""
                )
                
                if not success:
                    all_success = False
                    
            except Exception as e:
                self.log_test(f"Auth {account_type}", False, "", str(e))
                all_success = False
        
        return all_success

    def test_dashboard_data_access(self) -> bool:
        """Test d'accès aux données des dashboards"""
        all_success = True
        
        # Test pour chaque type d'utilisateur
        dashboard_endpoints = {
            'visitor_free': '/rest/v1/users?select=*,profile:profiles(*)',
            'visitor_vip': '/rest/v1/users?select=*,profile:profiles(*)',
            'exhibitor': '/rest/v1/users?select=*,profile:profiles(*)',
            'partner_gold': '/rest/v1/users?select=*,profile:profiles(*),partner_profiles(*)',
            'admin': '/rest/v1/users?select=count'
        }
        
        for account_type, endpoint in dashboard_endpoints.items():
            if account_type not in self.auth_tokens:
                continue
                
            try:
                headers = {
                    'apikey': self.supabase_key,
                    'Authorization': f'Bearer {self.auth_tokens[account_type]}',
                    'Content-Type': 'application/json'
                }
                
                response = requests.get(
                    f"{self.supabase_url}{endpoint}",
                    headers=headers,
                    timeout=10
                )
                
                success = response.status_code in [200, 206]
                self.log_test(
                    f"Dashboard Data {account_type.replace('_', ' ').title()}",
                    success,
                    f"Données récupérées" if success else "",
                    f"Erreur {response.status_code}: {response.text}" if not success else ""
                )
                
                if not success:
                    all_success = False
                    
            except Exception as e:
                self.log_test(f"Dashboard Data {account_type}", False, "", str(e))
                all_success = False
        
        return all_success

    def test_calendar_appointments_system(self) -> bool:
        """Test du système de calendrier et rendez-vous"""
        all_success = True
        
        # Test des créneaux de disponibilité (1-3 avril 2026)
        try:
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }
            
            # Vérifier les créneaux disponibles
            response = requests.get(
                f"{self.supabase_url}/rest/v1/time_slots?select=*&date=gte.2026-04-01&date=lte.2026-04-03",
                headers=headers,
                timeout=10
            )
            
            success = response.status_code in [200, 206]
            slots_data = response.json() if success else []
            
            self.log_test(
                "Créneaux Calendrier (1-3 avril 2026)",
                success,
                f"{len(slots_data)} créneaux trouvés" if success else "",
                f"Erreur {response.status_code}: {response.text}" if not success else ""
            )
            
            if not success:
                all_success = False
                
        except Exception as e:
            self.log_test("Créneaux Calendrier", False, "", str(e))
            all_success = False
        
        # Test des rendez-vous existants
        try:
            response = requests.get(
                f"{self.supabase_url}/rest/v1/appointments?select=*,visitor:users!visitor_id(*),exhibitor:users!exhibitor_id(*)",
                headers=headers,
                timeout=10
            )
            
            success = response.status_code in [200, 206]
            appointments_data = response.json() if success else []
            
            self.log_test(
                "Rendez-vous Existants",
                success,
                f"{len(appointments_data)} RDV trouvés" if success else "",
                f"Erreur {response.status_code}: {response.text}" if not success else ""
            )
            
            if not success:
                all_success = False
                
        except Exception as e:
            self.log_test("Rendez-vous Existants", False, "", str(e))
            all_success = False
        
        return all_success

    def test_networking_recommendations(self) -> bool:
        """Test du système de recommandations IA pour le réseautage"""
        all_success = True
        
        try:
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }
            
            # Test des recommandations
            response = requests.get(
                f"{self.supabase_url}/rest/v1/networking_recommendations?select=*",
                headers=headers,
                timeout=10
            )
            
            success = response.status_code in [200, 206]
            recommendations_data = response.json() if success else []
            
            self.log_test(
                "Recommandations IA Réseautage",
                success,
                f"{len(recommendations_data)} recommandations trouvées" if success else "",
                f"Erreur {response.status_code}: {response.text}" if not success else ""
            )
            
            if not success:
                all_success = False
                
        except Exception as e:
            self.log_test("Recommandations IA", False, "", str(e))
            all_success = False
        
        # Test des connexions réseau
        try:
            response = requests.get(
                f"{self.supabase_url}/rest/v1/connections?select=*",
                headers=headers,
                timeout=10
            )
            
            success = response.status_code in [200, 206]
            connections_data = response.json() if success else []
            
            self.log_test(
                "Connexions Réseau",
                success,
                f"{len(connections_data)} connexions trouvées" if success else "",
                f"Erreur {response.status_code}: {response.text}" if not success else ""
            )
            
            if not success:
                all_success = False
                
        except Exception as e:
            self.log_test("Connexions Réseau", False, "", str(e))
            all_success = False
        
        return all_success

    def test_mini_site_system(self) -> bool:
        """Test du système de mini-sites exposants"""
        all_success = True
        
        try:
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }
            
            # Test des mini-sites existants
            response = requests.get(
                f"{self.supabase_url}/rest/v1/mini_sites?select=*,exhibitor:users!user_id(*)",
                headers=headers,
                timeout=10
            )
            
            success = response.status_code in [200, 206]
            mini_sites_data = response.json() if success else []
            
            self.log_test(
                "Mini-Sites Exposants",
                success,
                f"{len(mini_sites_data)} mini-sites trouvés" if success else "",
                f"Erreur {response.status_code}: {response.text}" if not success else ""
            )
            
            if not success:
                all_success = False
                
        except Exception as e:
            self.log_test("Mini-Sites Exposants", False, "", str(e))
            all_success = False
        
        return all_success

    def test_partner_profiles_system(self) -> bool:
        """Test du système de profils partenaires"""
        all_success = True
        
        try:
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }
            
            # Test des profils partenaires
            response = requests.get(
                f"{self.supabase_url}/rest/v1/partner_profiles?select=*,user:users!user_id(*)",
                headers=headers,
                timeout=10
            )
            
            success = response.status_code in [200, 206]
            partner_profiles_data = response.json() if success else []
            
            self.log_test(
                "Profils Partenaires",
                success,
                f"{len(partner_profiles_data)} profils partenaires trouvés" if success else "",
                f"Erreur {response.status_code}: {response.text}" if not success else ""
            )
            
            if not success:
                all_success = False
                
        except Exception as e:
            self.log_test("Profils Partenaires", False, "", str(e))
            all_success = False
        
        return all_success

    def test_admin_functions(self) -> bool:
        """Test des fonctions administrateur"""
        all_success = True
        
        if 'admin' not in self.auth_tokens:
            self.log_test("Admin Functions", False, "", "Token admin non disponible")
            return False
        
        try:
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.auth_tokens["admin"]}',
                'Content-Type': 'application/json'
            }
            
            # Test des statistiques globales
            response = requests.get(
                f"{self.supabase_url}/rest/v1/users?select=count",
                headers=headers,
                timeout=10
            )
            
            success = response.status_code in [200, 206]
            self.log_test(
                "Stats Admin - Utilisateurs",
                success,
                "Statistiques récupérées" if success else "",
                f"Erreur {response.status_code}: {response.text}" if not success else ""
            )
            
            if not success:
                all_success = False
                
        except Exception as e:
            self.log_test("Stats Admin", False, "", str(e))
            all_success = False
        
        return all_success

    def test_marketing_dashboard(self) -> bool:
        """Test du Marketing Dashboard avec ReactQuill"""
        all_success = True
        
        try:
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }
            
            # Test des articles/news
            response = requests.get(
                f"{self.supabase_url}/rest/v1/news?select=*",
                headers=headers,
                timeout=10
            )
            
            success = response.status_code in [200, 206]
            news_data = response.json() if success else []
            
            self.log_test(
                "Marketing Dashboard - Articles",
                success,
                f"{len(news_data)} articles trouvés" if success else "",
                f"Erreur {response.status_code}: {response.text}" if not success else ""
            )
            
            if not success:
                all_success = False
                
        except Exception as e:
            self.log_test("Marketing Dashboard", False, "", str(e))
            all_success = False
        
        return all_success

    def run_all_tests(self) -> Dict[str, Any]:
        """Exécute tous les tests backend"""
        print("🚀 SIPORTS 2026 - Tests Backend Complets")
        print("=" * 50)
        
        start_time = time.time()
        
        # Tests de base
        print("\n📡 Tests de Connexion")
        self.test_supabase_connection()
        
        print("\n🔐 Tests d'Authentification")
        self.test_authentication_all_accounts()
        
        print("\n📊 Tests d'Accès aux Données Dashboard")
        self.test_dashboard_data_access()
        
        print("\n📅 Tests Système Calendrier & RDV")
        self.test_calendar_appointments_system()
        
        print("\n🤝 Tests Réseautage IA")
        self.test_networking_recommendations()
        
        print("\n🏢 Tests Mini-Sites Exposants")
        self.test_mini_site_system()
        
        print("\n🤝 Tests Profils Partenaires")
        self.test_partner_profiles_system()
        
        print("\n👑 Tests Fonctions Admin")
        self.test_admin_functions()
        
        print("\n📰 Tests Marketing Dashboard")
        self.test_marketing_dashboard()
        
        # Résultats finaux
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 50)
        print(f"📊 RÉSULTATS FINAUX")
        print(f"Tests réussis: {self.tests_passed}/{self.tests_run}")
        print(f"Taux de réussite: {(self.tests_passed/self.tests_run*100):.1f}%")
        print(f"Durée: {duration:.2f}s")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        return {
            'total_tests': self.tests_run,
            'passed_tests': self.tests_passed,
            'success_rate': success_rate,
            'duration': duration,
            'test_results': self.test_results,
            'timestamp': datetime.now().isoformat()
        }

def main():
    """Point d'entrée principal"""
    tester = SiportsBackendTester()
    
    try:
        results = tester.run_all_tests()
        
        # Sauvegarde des résultats
        with open('/app/backend_test_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # Code de sortie basé sur le taux de réussite
        if results['success_rate'] >= 80:
            return 0  # Succès
        elif results['success_rate'] >= 60:
            return 1  # Avertissement
        else:
            return 2  # Échec critique
            
    except Exception as e:
        print(f"❌ Erreur critique lors des tests: {e}")
        return 3

if __name__ == "__main__":
    sys.exit(main())