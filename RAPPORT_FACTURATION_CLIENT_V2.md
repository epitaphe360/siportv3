# RAPPORT DE FACTURATION - SIPORT 2026 (VERSION 2 - AJUSTÉ)
**Date:** 1 Janvier 2026 | **Mise à jour:** 2 Janvier 2026
**Période analysée:** Novembre 2025 - Janvier 2026 (2 mois)
**Événement:** SIPORT 2026 (1er - 3 Avril 2026)

---

## ⚠️ MISES À JOUR 2 JANVIER 2026 - ÉTAT RÉEL

### 🔴 PROBLÈMES IDENTIFIÉS NON RÉSOLUS

**1. Erreur 409 - Création créneaux horaires ❌ CRITIQUE**
- **Symptôme:** Impossible d'ajouter créneaux dans calendrier disponibilités
- **État:** Non résolu malgré corrections tentées
- **Impact:** Fonctionnalité RDV B2B partiellement bloquée
- **Besoin:** Diagnostic client + structure table Supabase

**2. Calendrier disponibilités ⚠️ NON TESTÉ**
- **État:** Code créé mais jamais testé visuellement
- **Risque:** Design peut ne pas s'afficher correctement
- **Action requise:** Client doit tester et confirmer visibilité

**3. Application Android 🚧 80% SEULEMENT**
- **État réel:** Configuration faite, build APK non finalisé
- **Bloque:** Publication Google Play impossible en l'état
- **Reste:** 15h de finalisation (Phase 2)

**4. Bugs performance détectés**
- ChatBot re-renders excessifs
- Time slots API appelée 2×
- Auth loading peut boucler

### 💰 AJUSTEMENT FACTURATION

**Montant initial annoncé:** 47,378 DH
**Ajustement Android (80% vs 100%):** -600 DH
**NOUVEAU MONTANT Phase 1.5:** **46,778 DH**

**Calendrier non testé:** Aucune réduction (client doit valider)
**Bugs mineurs:** Corrections incluses Phase 2 sans surcoût

---

## 📊 RÉSUMÉ EXÉCUTIF (AJUSTÉ)

**Contrat Initial (Phase 1):** 42,000 DH
- Développement application de base
- Abonnement Supabase jusqu'à Mai 2026
- Livraison: Novembre 2025 ✅

**Développements Additionnels (Novembre-Janvier):** Phase 1.5
**Ampleur:** 61 commits, 233 fichiers modifiés, +42,649 lignes de code
**Montant ajusté:** 46,778 DH (au lieu de 47,378 DH)

**Phase 2 (À venir):** Android finalisé + Badges + Corrections bugs - 15,600 DH

---

## 🆕 NOUVELLES FONCTIONNALITÉS DÉVELOPPÉES (Phase 1.5)
### Période: Novembre 2025 - Janvier 2026

### 1. SYSTÈME MÉDIA COMPLET (20% du travail)
**Valeur ajoutée:** Plateforme média professionnelle type Netflix

#### Fonctionnalités développées:
- ✅ **6 types de médias:** Webinars, Podcasts, Capsules, Live Studio, Best Moments, Témoignages
- ✅ **Lecteurs vidéo/audio** avec contrôles avancés
- ✅ **Upload & modération** admin
- ✅ **Bibliothèque média** avec filtres avancés
- ✅ **Analytics** visionnage par média

#### Fichiers créés:
- 7 pages détail média (2,500+ lignes)
- Composants lecteurs (467 lignes)
- Admin média management (717 lignes)
- Upload system (284 lignes)

**Heures estimées:** 40h
**Valeur:** 6,000 DH

---

### 2. WORDPRESS PLUGIN + ELEMENTOR PRO (15% du travail)
**Valeur ajoutée:** Intégration site WordPress client

#### Fonctionnalités développées:
- ✅ **Plugin WordPress complet** avec API REST
- ✅ **2 widgets Elementor Pro** (Articles + Médias)
- ✅ **Système shortcodes** [siports-article id="X"]
- ✅ **Synchronisation auto** contenus
- ✅ **Cache intelligent**
- ✅ **Style CSS personnalisé** (944 lignes)

#### Fichiers créés:
- Plugin PHP complet (737 lignes)
- 2 widgets Elementor (622 lignes)
- Documentation installation (1,076 lignes)

**Heures estimées:** 30h
**Valeur:** 4,500 DH

---

### 3. APPLICATION MOBILE iOS (10% du travail)
**Valeur ajoutée:** App native iOS pour visiteurs

#### Fonctionnalités développées:
- ✅ **Configuration Capacitor** complète
- ✅ **Push notifications natives** iOS
- ✅ **Mode hors-ligne**
- ✅ **Scanner QR badges** mobile
- ✅ **Guide déploiement** App Store

#### Fichiers créés:
- Guide iOS (303 lignes)
- Services natifs (544 lignes)
- Configuration Capacitor

**Heures estimées:** 25h
**Valeur:** 5,000 DH

---

### 4. MARKETING DASHBOARD COMPLET (12% du travail)
**Valeur ajoutée:** Outil marketing autonome

#### Fonctionnalités développées:
- ✅ **Gestion articles** avec éditeur riche
- ✅ **Gestion médias** (upload, modération)
- ✅ **Génération shortcodes** auto
- ✅ **Analytics campagnes**
- ✅ **Statistiques temps réel**
- ✅ **Export rapports** PDF/CSV

#### Fichiers créés:
- MarketingDashboard (1,012 lignes)
- ShortcodeRenderer (223 lignes)
- Documentation (365 lignes)

**Heures estimées:** 20h
**Valeur:** 3,000 DH

---

### 5. MINI-SITE BUILDER AVANCÉ (15% du travail)
**Valeur ajoutée:** Builder visuel type Wix/Squarespace

#### Fonctionnalités développées:
- ✅ **10 templates professionnels** pré-faits
- ✅ **Éditeur drag & drop** sections
- ✅ **Bibliothèque images** intégrée
- ✅ **Prévisualisation mobile** temps réel
- ✅ **Éditeur SEO** (meta, OG, Twitter cards)
- ✅ **Service templates cloud**
- ✅ **Export/Import** templates

#### Fichiers créés:
- SiteBuilder complet (1,735 lignes)
- 10 templates (502 lignes)
- Service templates (526 lignes)

**Heures estimées:** 35h
**Valeur:** 5,250 DH

---

### 6. NETWORKING & MATCHMAKING IA (8% du travail)
**Valeur ajoutée:** Algorithme matchmaking intelligent

#### Fonctionnalités développées:
- ✅ **Algorithme IA matchmaking** (scoring similarité)
- ✅ **Salles networking virtuelles** par secteur
- ✅ **Speed networking** avec timer automatique
- ✅ **Historique interactions**
- ✅ **Recommandations personnalisées**

#### Fichiers créés:
- Algorithme matchmaking (342 lignes)
- Composants networking (1,174 lignes)

**Heures estimées:** 25h
**Valeur:** 4,500 DH

---

### 7. SYSTÈME NOTIFICATIONS COMPLET (10% du travail)
**Valeur ajoutée:** Communication multi-canal

#### Fonctionnalités développées:
- ✅ **Web Push** (PWA notifications)
- ✅ **2FA multi-méthodes** (TOTP, SMS, Email)
- ✅ **Notifications in-app** temps réel
- ✅ **Préférences granulaires** utilisateur
- ✅ **Service Worker** complet PWA
- ✅ **3 Edge Functions** Supabase

#### Fichiers créés:
- Services notifications (1,258 lignes)
- Service Worker (230 lignes)
- Edge Functions (334 lignes)

**Heures estimées:** 28h
**Valeur:** 5,040 DH

---

### 8. SERVICES BACKEND AVANCÉS (8% du travail)
**Valeur ajoutée:** Infrastructure niveau entreprise

#### Services créés:
- ✅ **analyticsService** (493 lignes) - Export CSV/PDF/XLSX
- ✅ **auditService** (450 lignes) - Logs RGPD
- ✅ **searchService** (412 lignes) - Recherche full-text
- ✅ **featureFlagService** (393 lignes) - Feature flags
- ✅ **chatFileUploadService** (402 lignes) - Upload fichiers
- ✅ **cdnService** (311 lignes) - CDN multi-provider
- ✅ **nativeFeaturesService** (307 lignes) - Features mobiles

**Heures estimées:** 35h
**Valeur:** 5,250 DH

---

### 9. BASE DE DONNÉES (7% du travail)
**Valeur ajoutée:** Architecture robuste scalable

#### Développements:
- ✅ **12 nouvelles tables** SQL
- ✅ **4 migrations majeures** (2,500+ lignes)
- ✅ **Scripts setup** automatisés
- ✅ **Seed data complet** (10+ comptes test)
- ✅ **RLS policies** sécurité

**Heures estimées:** 20h
**Valeur:** 3,000 DH

---

### 10. PAGES PARTENAIRES & EXPOSANTS (5% du travail)
**Valeur ajoutée:** Expérience utilisateur premium

#### Améliorations:
- ✅ **Page détail partenaire** enrichie (1,138 lignes)
- ✅ **Modal produit avancée** avec galerie
- ✅ **Profil édition** complet (722 lignes)
- ✅ **Analytics exposants** individuelles

**Heures estimées:** 18h
**Valeur:** 2,700 DH

---

### 11. OUTILS DÉVELOPPEMENT & TESTS (3% du travail)
**Valeur ajoutée:** Productivité maximale

#### Outils créés:
- ✅ **DevSubscriptionSwitcher** - Test tous types abonnements
- ✅ **Page comptes démo** accès rapide
- ✅ **20+ scripts** enrichissement données
- ✅ **Scripts migration** automatisés

**Heures estimées:** 10h
**Valeur:** 1,200 DH

---

### 12. DOCUMENTATION TECHNIQUE (2% du travail)
**Valeur ajoutée:** Maintenance facilitée

#### Documents créés:
- ✅ **24 fichiers documentation** (8,000+ lignes)
- ✅ API Documentation complète
- ✅ Guides déploiement
- ✅ Guides installation
- ✅ Tutoriels WordPress, iOS, etc.

**Heures estimées:** 15h
**Valeur:** 1,800 DH

---

## 📈 STATISTIQUES GLOBALES PHASE 1.5

| Métrique | Valeur |
|----------|--------|
| **Commits** | 61 |
| **Fichiers modifiés** | 233 |
| **Lignes ajoutées** | 42,649 |
| **Lignes supprimées** | 1,096 |
| **Nouveaux composants** | 85+ |
| **Nouveaux services** | 15 |
| **Nouvelles pages** | 40+ |
| **Migrations SQL** | 6 |
| **Tables créées** | 12 |
| **Edge Functions** | 3 |
| **Documentation** | 24 fichiers |

**TOTAL HEURES:** 301 heures
**TAUX MOYEN:** 150 DH/heure (spécialisé à 180-200 DH)

---

## 💰 FACTURE 2 - DÉVELOPPEMENTS PHASE 1.5 (AJUSTÉE)

| Catégorie | Heures | Taux | Montant | Statut |
|-----------|--------|------|---------|--------|
| Système Média Complet | 40h | 150 DH | 6,000 DH | ✅ Livré |
| WordPress Plugin + Elementor | 30h | 150 DH | 4,500 DH | ✅ Livré |
| Application Mobile iOS | 25h | 200 DH | 5,000 DH | ✅ Livré (100%) |
| Marketing Dashboard | 20h | 150 DH | 3,000 DH | ✅ Livré |
| Mini-Site Builder Avancé | 35h | 150 DH | 5,250 DH | ✅ Livré |
| Networking & Matchmaking IA | 25h | 180 DH | 4,500 DH | ✅ Livré |
| Notifications + 2FA | 28h | 180 DH | 5,040 DH | ✅ Livré |
| Services Backend | 35h | 150 DH | 5,250 DH | ✅ Livré |
| Base de données | 20h | 150 DH | 3,000 DH | ✅ Livré |
| Pages Partenaires | 18h | 150 DH | 2,700 DH | ✅ Livré |
| Outils Développement | 10h | 120 DH | 1,200 DH | ✅ Livré |
| Documentation | 15h | 120 DH | 1,800 DH | ✅ Livré |
| **SOUS-TOTAL** | **301h** | | **47,240 DH** | |

### Ajustements:
- **Tests & Intégration:** +2,500 DH
- **Remise fidélité:** -5% (-2,362 DH)
- **⚠️ Ajustement Android (80% au lieu de 100%):** -600 DH

### **TOTAL FACTURE 2 AJUSTÉ: 46,778 DH**

**Paiement suggéré:**
- 50% à la signature: 23,389 DH
- 50% après validation client: 23,389 DH

**⚠️ IMPORTANT:**
- Calendrier disponibilités non testé visuellement (client doit valider)
- Erreur 409 création créneaux non résolue (diagnostic client requis)
- Corrections bugs mineurs incluses Phase 2 sans surcoût

---

## 🚧 PHASE 2 - NON INCLUSE (À Facturer Séparément)

### CONTENU PHASE 2 (Février-Mars 2026): 15,600 DH

#### 1. Finalisation Android (3,000 DH)
**Statut:** 80% → 100%
**Reste à faire:**
- ❌ Build Android APK final
- ❌ Tests devices Android (min 3 devices)
- ❌ Configuration Google Play Console
- ❌ Publication Google Play Store
- ❌ Push notifications FCM
- ❌ Tests compatibilité Android 10-14
**Heures:** 15h × 200 DH = 3,000 DH

#### 2. Corrections Bugs Phase 1.5 (3,600 DH) - SANS SURCOÛT
**Inclus dans Phase 2:**
- ✅ Résolution erreur 409 création créneaux (après diagnostic client)
- ✅ Validation visuelle calendrier disponibilités
- ✅ Correction ChatBot re-renders excessifs
- ✅ Optimisation Time slots API (éviter double appel)
- ✅ Fix Auth loading loops
**Heures:** 18h × 200 DH = 3,600 DH (OFFERT - garantie qualité)

#### 3. Application Badges Complète (9,000 DH)
**Statut:** Développée mais non facturée dans Phase 1.5
**Fonctionnalités:**
- ✅ Scanner QR badges avec validation JWT
- ✅ Génération badges dynamiques (30s)
- ✅ Support badges statiques
- ✅ Logs sécurité
- ✅ Version mobile iOS/Android
- ✅ Dashboard admin badges
**Heures:** 45h × 200 DH = 9,000 DH

**TOTAL PHASE 2:** 15,600 DH (12,000 DH facturés car corrections offertes)

---

## 🔧 GESTION TOTALE APPLICATION - 3 FORMULES

### 📦 FORMULE 1: "ESSENTIEL" - 4,500 DH/mois

#### ✅ CE QUI EST INCLUS (Responsabilité Prestataire):

**Infrastructure & Hébergement:**
- ✅ Hébergement Supabase Pro (100k MAU)
- ✅ Gestion serveurs et base de données
- ✅ Backup automatique quotidien (30 jours rétention)
- ✅ Monitoring 24/7 avec alertes
- ✅ Certificats SSL/TLS
- ✅ Mises à jour sécurité mensuelles

**Support Technique:**
- ✅ Support email (réponse < 48h ouvrées)
- ✅ Résolution bugs critiques < 24h
- ✅ Maintenance corrective
- ✅ Rapport mensuel performance

**Développement:**
- ✅ 5 heures/mois ajustements mineurs
- ✅ Corrections bugs
- ✅ Petites modifications texte/traductions

**Limites techniques:**
- Bande passante: 250 GB/mois
- Stockage: 100 GB
- Utilisateurs actifs: jusqu'à 10,000

---

#### ❌ CE QUI N'EST PAS INCLUS (Responsabilité Client):

**Contenu & Données:**
- ❌ Saisie données exposants (nom, description, produits, etc.)
- ❌ Saisie données partenaires (infos entreprise, etc.)
- ❌ Upload logos exposants/partenaires
- ❌ Création articles actualités
- ❌ Upload médias (vidéos, podcasts, etc.)
- ❌ Modération commentaires utilisateurs
- ❌ Gestion inscriptions visiteurs
- ❌ Validation paiements manuels

**Administration:**
- ❌ Configuration événements/conférences
- ❌ Création comptes utilisateurs
- ❌ Attribution badges/accréditations
- ❌ Gestion plannings stands
- ❌ Support utilisateurs finaux (visiteurs/exposants)

**Communication:**
- ❌ Envoi newsletters
- ❌ Rédaction contenus
- ❌ Community management

---

### 🚀 FORMULE 2: "PREMIUM" - 7,500 DH/mois ⭐ RECOMMANDÉ

#### ✅ TOUT DE "ESSENTIEL" +

**Infrastructure avancée:**
- ✅ Hébergement Supabase Pro+ (500k MAU)
- ✅ CDN Cloudflare Premium (cache mondial)
- ✅ Backup toutes les 12h (90 jours rétention)
- ✅ Environnement staging/test

**Support prioritaire:**
- ✅ Support téléphone + WhatsApp (< 12h)
- ✅ Résolution bugs < 6h (critiques)
- ✅ Hotline événement (Mars-Avril)

**Développement:**
- ✅ 15 heures/mois nouvelles features
- ✅ Maintenance évolutive
- ✅ Optimisation performance trimestrielle
- ✅ Rapport analytics mensuel détaillé

**Formation & Assistance:**
- ✅ Formation équipe 2h/mois
- ✅ Assistance saisie données (support uniquement)
- ✅ Configuration initiale événements
- ✅ Documentation personnalisée

**Limites techniques:**
- Bande passante: 1 TB/mois
- Stockage: 500 GB
- Utilisateurs actifs: jusqu'à 50,000

---

#### ❌ CE QUI N'EST PAS INCLUS (Responsabilité Client):

**Contenu (saisie manuelle):**
- ❌ Saisie données exposants (vous saisissez ou exposants s'inscrivent)
- ❌ Saisie données partenaires (vous saisissez ou partenaires s'inscrivent)
- ❌ Upload médias quotidiens
- ❌ Rédaction articles
- ❌ Modération quotidienne

**Administration quotidienne:**
- ❌ Gestion inscriptions jour par jour
- ❌ Support visiteurs/exposants
- ❌ Validation manuelle inscriptions
- ❌ Attribution badges individuels

**Note:** Formation fournie pour que votre équipe fasse ces tâches efficacement

---

### 💎 FORMULE 3: "ENTERPRISE" - 12,000 DH/mois

#### ✅ TOUT DE "PREMIUM" +

**Infrastructure dédiée:**
- ✅ Infrastructure dédiée (pas partagée)
- ✅ CDN Multi-région (Maroc, France, USA)
- ✅ SLA 99.9% uptime garanti
- ✅ Backup temps réel + archivage annuel
- ✅ Disaster recovery < 1h

**Support 24/7:**
- ✅ Support téléphone/WhatsApp 24/7/365
- ✅ Ingénieur dédié pendant événement (1-3 Avril)
- ✅ Résolution bugs < 2h (critiques)
- ✅ Intervention sur site possible (frais déplacement en sus)

**Développement:**
- ✅ 30 heures/mois nouvelles features
- ✅ Consultant technique dédié
- ✅ Réunions hebdomadaires suivi projet
- ✅ Audit sécurité trimestriel
- ✅ Audit performance trimestriel

**Services additionnels:**
- ✅ **Import automatique données exposants** (depuis Excel/CSV)
- ✅ **Import automatique données partenaires** (depuis Excel/CSV)
- ✅ **Scripts d'import personnalisés**
- ✅ Configuration complète événements
- ✅ Formation avancée équipe (8h/mois)
- ✅ Support niveau 2 pour vos utilisateurs finaux

**Limites techniques:**
- Bande passante: Illimitée
- Stockage: 2 TB (extensible)
- Utilisateurs actifs: Illimité
- Scaling automatique

---

#### ❌ CE QUI N'EST PAS INCLUS (Responsabilité Client):

**Vous fournissez les données, nous les importons:**
- ❌ Rédaction descriptions exposants (mais on importe vos fichiers)
- ❌ Rédaction contenus marketing
- ❌ Décisions stratégiques contenus

**Administration métier:**
- ❌ Validation commerciale partenariats
- ❌ Négociations tarifaires avec exposants
- ❌ Décisions éditoriales
- ❌ Stratégie communication

**Note:** Nous importons et configurons, vous décidez du contenu

---

## 📊 TABLEAU COMPARATIF RESPONSABILITÉS

| Tâche | Essentiel | Premium | Enterprise |
|-------|-----------|---------|------------|
| **Infrastructure & Serveurs** | ✅ Prestataire | ✅ Prestataire | ✅ Prestataire |
| **Mises à jour sécurité** | ✅ Prestataire | ✅ Prestataire | ✅ Prestataire |
| **Monitoring & Alertes** | ✅ Prestataire | ✅ Prestataire | ✅ Prestataire |
| **Backup & Restoration** | ✅ Prestataire | ✅ Prestataire | ✅ Prestataire |
| **Corrections bugs** | ✅ Prestataire | ✅ Prestataire | ✅ Prestataire |
| **Optimisation performance** | ⚠️ Sur demande | ✅ Prestataire | ✅ Prestataire |
| **Formation équipe** | ❌ Client | ✅ 2h/mois | ✅ 8h/mois |
| **Saisie données exposants** | ❌ Client | ❌ Client (formé) | ⚠️ Import auto fichiers fournis |
| **Saisie données partenaires** | ❌ Client | ❌ Client (formé) | ⚠️ Import auto fichiers fournis |
| **Upload médias** | ❌ Client | ❌ Client (formé) | ❌ Client (interface simplifiée) |
| **Création articles** | ❌ Client | ❌ Client (formé) | ❌ Client (support rédaction) |
| **Modération contenus** | ❌ Client | ❌ Client (alertes auto) | ⚠️ Modération auto + client |
| **Support visiteurs finaux** | ❌ Client | ❌ Client | ⚠️ Niveau 2 prestataire |
| **Configuration événements** | ❌ Client | ⚠️ Assistance | ✅ Prestataire |
| **Gestion inscriptions** | ❌ Client | ❌ Client | ❌ Client (tableau bord) |
| **Développements custom** | 5h/mois | 15h/mois | 30h/mois |

**Légende:**
- ✅ Prestataire = Responsabilité complète prestataire
- ❌ Client = Responsabilité complète client
- ⚠️ = Partagé (détails dans contrat)

---

## 🎯 RECOMMANDATION POUR SIPORT 2026

### SCÉNARIO OPTIMAL

**Janvier - Mars 2026:** FORMULE PREMIUM (3 mois)
- Préparation événement
- Formation équipe intensive
- Développements ajustements
- **Coût:** 7,500 DH × 3 = 22,500 DH

**Avril 2026:** FORMULE ENTERPRISE (1 mois événement)
- Support 24/7 pendant événement
- Ingénieur dédié sur site/remote
- Import automatique dernières données
- **Coût:** 12,000 DH

**Mai - Décembre 2026:** FORMULE ESSENTIEL (8 mois)
- Maintenance standard
- Support email
- **Coût:** 4,500 DH × 8 = 36,000 DH

**TOTAL ANNÉE 2026:** 70,500 DH

---

### ALTERNATIVE: ENGAGEMENT ANNUEL

**FORMULE PREMIUM - Engagement 12 mois**
- Prix mensuel: 7,500 DH
- **Prix annuel:** 90,000 DH → **81,000 DH** (remise -10%)
- **Économie:** 9,000 DH
- **Bonus:** Upgrade ENTERPRISE gratuit pour Avril 2026 (valeur 4,500 DH)

**Avantages:**
- ✅ Support constant premium
- ✅ 15h développement/mois toute l'année
- ✅ Formation continue équipe
- ✅ Pas de changement de formule

**TOTAL ANNÉE 2026:** 81,000 DH
**ÉCONOMIE vs À la carte:** 9,000 DH + 4,500 DH = **13,500 DH**

---

## 💡 PROPOSITION GLOBALE CLIENT - 2026 (AJUSTÉE)

### PACKAGE COMPLET

1. **Facture 2 - Phase 1.5 (ajustée):** 46,778 DH
2. **Gestion Premium annuelle:** 81,000 DH
3. **Upgrade Enterprise Avril:** OFFERT (valeur 4,500 DH)
4. **Corrections bugs Phase 1.5:** OFFERTES (valeur 3,600 DH)

**TOTAL 2026:** 127,778 DH (-600 DH ajustement)

**Soit:** 10,648 DH/mois

**BONUS OFFERTS:**
- 3,600 DH corrections bugs (garantie qualité)
- 4,500 DH upgrade Enterprise Avril
**TOTAL OFFERT:** 8,100 DH

---

### PLAN DE PAIEMENT ÉCHELONNÉ (AJUSTÉ)

| Mois | Détail | Montant | Cumulé |
|------|--------|---------|--------|
| Janvier | Acompte 50% Facture 2 | 23,389 DH | 23,389 DH |
| Février | Solde Facture 2 | 23,389 DH | 46,778 DH |
| Mars | Trimestre 1 gestion (Jan-Mar) | 22,500 DH | 69,278 DH |
| Avril | Inclus dans trimestre | 0 DH | 69,278 DH |
| Mai | Trimestre 2 gestion (Avr-Juin) | 19,500 DH | 88,778 DH |
| Septembre | Trimestre 3 gestion (Jul-Sep) | 19,500 DH | 108,278 DH |
| Décembre | Trimestre 4 gestion (Oct-Dec) | 19,500 DH | 127,778 DH |

**Avantages paiement trimestriel:**
- Meilleur flux trésorerie
- Moins de factures
- Remise fidélité incluse
- **Corrections bugs Phase 1.5 offertes** (3,600 DH)

---

## 📋 DÉTAIL COÛTS INFRASTRUCTURE MENSUELS

### Inclus dans les formules (coûts réels prestataire):

| Service | Essentiel | Premium | Enterprise |
|---------|-----------|---------|------------|
| Supabase Database | 250 DH | 600 DH | 2,500 DH |
| CDN (Cloudflare) | - | 200 DH | 800 DH |
| Monitoring (Sentry) | 70 DH | 260 DH | 600 DH |
| Backup (AWS S3) | 50 DH | 150 DH | 500 DH |
| Email (Resend) | 50 DH | 200 DH | 400 DH |
| SMS 2FA (Twilio) | - | 500 DH | 1,000 DH |
| Uptime monitoring | 20 DH | 70 DH | 200 DH |
| **Total infra** | **440 DH** | **1,980 DH** | **6,000 DH** |
| **Marge prestataire** | 4,060 DH | 5,520 DH | 6,000 DH |

**Note:** Ces coûts peuvent varier selon usage réel (bande passante, SMS envoyés, etc.)

---

## 🔐 CONDITIONS CONTRACTUELLES

### Propriété & Accès

**Propriété Client:**
- ✅ Code source complet
- ✅ Base de données
- ✅ Contenus et médias
- ✅ Compte Supabase (accès admin)
- ✅ Documentation

**Accès Prestataire:**
- ⚠️ Accès technique pour maintenance
- ⚠️ Révoqué si contrat résilié

### Durée & Résiliation

**Engagement minimum:**
- Formule Essentiel: Aucun
- Formule Premium: 3 mois
- Formule Enterprise: 6 mois

**Résiliation:**
- Préavis: 30 jours
- Sans pénalités après engagement minimum
- Export données garanti sous 7 jours

### Garanties

**SLA (Service Level Agreement):**
- Essentiel: 99% uptime
- Premium: 99.5% uptime
- Enterprise: 99.9% uptime garanti

**Temps résolution bugs:**
- Critique: 24h (Essentiel), 6h (Premium), 2h (Enterprise)
- Majeur: 48h (Essentiel), 24h (Premium), 12h (Enterprise)
- Mineur: 7 jours (tous)

### Exclusions

**Non couvert par toutes formules:**
- ❌ Force majeure (catastrophes naturelles, guerres, etc.)
- ❌ Attaques DDoS massives (> 1M req/s)
- ❌ Modifications client de l'infrastructure
- ❌ Données perdues par actions client
- ❌ Bugs causés par modifications client du code

---

## 📅 CALENDRIER ÉVÉNEMENT SIPORT 2026

### Dates clés:

**Janvier 2026:**
- ✅ Signature contrat gestion
- ✅ Formation équipe (si Premium/Enterprise)
- ✅ Finalisation développements Phase 1.5

**Février 2026:**
- Configuration événement (dates, programme, etc.)
- Import données exposants (si Enterprise)
- Tests charge

**Mars 2026:**
- Import final données (semaine 1-2)
- Tests finaux (semaine 3)
- Upgrade Enterprise (semaine 4)
- Formation équipe événement

**1-3 Avril 2026: ÉVÉNEMENT**
- Support 24/7
- Monitoring temps réel
- Résolution incidents < 30 min

**4-15 Avril 2026:**
- Rapport post-événement
- Analytics complet
- Retour formule standard

---

## 🎓 FORMATION ÉQUIPE INCLUSE

### FORMULE PREMIUM (2h/mois):

**Mois 1 - Bases:**
- Interface admin
- Gestion utilisateurs
- Configuration événements

**Mois 2 - Contenus:**
- Création articles
- Upload médias
- Modération

**Mois 3 - Événement:**
- Gestion inscriptions
- Badges
- Support utilisateurs

### FORMULE ENTERPRISE (8h/mois):

**Tout de Premium +**
- Import automatique données
- Analytics avancées
- Configuration avancée
- Troubleshooting
- Sessions personnalisées

---

## 📞 PROCHAINES ÉTAPES

### 1. VALIDATION FACTURE 2 (Cette semaine)
- [ ] Revue développements Phase 1.5
- [ ] Approbation montant 47,378 DH
- [ ] Signature acceptation

### 2. CHOIX FORMULE GESTION (Cette semaine)
- [ ] Essentiel / Premium / Enterprise?
- [ ] Mensuel ou annuel?
- [ ] Date début: 1er Février ou 1er Mars?

### 3. SIGNATURE CONTRAT (Semaine prochaine)
- [ ] Contrat gestion annuelle
- [ ] Plan paiement échelonné
- [ ] Coordonnées facturation

### 4. PAIEMENT INITIAL (Janvier 2026)
- [ ] Acompte 50% Facture 2: 23,689 DH
- [ ] Premier trimestre gestion (selon formule)

### 5. DÉMARRAGE (Février 2026)
- [ ] Formation équipe (si Premium/Enterprise)
- [ ] Configuration événement
- [ ] Import données

---

## ❓ QUESTIONS FRÉQUENTES

### Puis-je changer de formule en cours d'année?
✅ Oui, moyennant préavis 30 jours. Upgrade sans frais, downgrade possible après engagement minimum.

### Que se passe-t-il si je dépasse les limites?
⚠️ Facturation au réel des dépassements ou upgrade formule supérieure suggéré.

### Les heures de développement non utilisées sont-elles reportées?
❌ Non, elles ne sont pas cumulables d'un mois à l'autre. Utilisez-les ou perdez-les.

### Puis-je avoir un mix des formules?
✅ Oui! Exemple: Premium 11 mois + Enterprise en Avril.

### Le code source reste-t-il ma propriété même après résiliation?
✅ Absolument. Vous avez un accès complet au code et à la base de données en permanence.

### Puis-je gérer moi-même l'infrastructure après résiliation?
✅ Oui, documentation fournie + session transfert connaissances (facturable séparément: 5,000 DH forfait).

---

## 📞 CONTACT

**Pour validation de cette proposition:**
- **Email:** [votre email]
- **Téléphone:** [votre numéro]
- **WhatsApp:** [votre WhatsApp]
- **Disponibilité:** Lun-Ven 9h-18h

**Validité offre:** 15 jours (jusqu'au 15 Janvier 2026)

**Remises possibles:**
- Paiement cash intégral 2026: -5% supplémentaire
- Recommandation nouveau client: -3,000 DH sur année suivante

---

## 📝 ANNEXES

### Documents à fournir pour démarrage:

**Par le client:**
- [ ] Coordonnées facturation complètes
- [ ] Logo haute résolution
- [ ] Charte graphique (si existante)
- [ ] Liste contacts équipe technique
- [ ] Accès compte Supabase existant
- [ ] Fichier Excel exposants (si Enterprise)
- [ ] Fichier Excel partenaires (si Enterprise)

**Par le prestataire:**
- [ ] Contrat gestion détaillé
- [ ] SLA document
- [ ] Documentation technique
- [ ] Accès dashboards
- [ ] Planning formations

---

---

## 🚨 AVANT FACTURATION - ACTIONS REQUISES

### 📋 DIAGNOSTIC CLIENT (URGENT)

**Pour résoudre erreur 409:**
1. ✅ Tester création créneau dans calendrier disponibilités
2. ✅ Partager TOUS les logs console (rechercher 🔍 et ❌)
3. ✅ Screenshot structure table `time_slots` dans Supabase Dashboard
4. ✅ Tester INSERT SQL manuel (query fournie dans ANALYSE_PROBLEMES_REELS.md)

**Pour validation visuelle:**
5. ✅ Vider cache navigateur (Ctrl+Shift+Delete)
6. ✅ Hard reload (Ctrl+F5)
7. ✅ Screenshot calendrier disponibilités actuel
8. ✅ Vérifier visibilité DevSubscriptionSwitcher (bouton ⚡ en mode dev)

### ✅ GARANTIES QUALITÉ

**Corrections offertes en Phase 2 (3,600 DH):**
- Résolution erreur 409 (après diagnostic)
- Validation visuelle calendrier
- Optimisations performance
- Corrections bugs mineurs

**Engagement:**
- Application 100% fonctionnelle avant événement (1er Avril 2026)
- Support prioritaire Phase 2 (Février-Mars)
- Tests complets avant mise en production

---

**Document préparé le 1er Janvier 2026**
**Mis à jour le 2 Janvier 2026 avec ajustements honnêtes**

**Projet:** SIPORT 2026 - Salon International des Ports
**Période analysée:** Novembre 2025 - Janvier 2026 (2 mois)
**Phase:** 1.5 (Développements additionnels)
**Phase 2:** Android finalisé + Badges + Corrections (À facturer séparément)

**Développeur:** [Votre nom/société]
**Client:** [Nom du client]

**Note:** Cette version reflète l'état RÉEL du développement avec ajustements de facturation pour Android non finalisé et garantie corrections bugs.

---

**Signature Prestataire:**

_______________________
Date: ___/___/2026

**Signature Client (pour accord):**

_______________________
Date: ___/___/2026

**☑️ J'ai lu et compris que:**
- [ ] Android est à 80% (finalisation Phase 2)
- [ ] Erreur 409 non résolue (diagnostic requis de ma part)
- [ ] Calendrier non testé visuellement (je dois valider)
- [ ] Corrections bugs offertes en Phase 2 (3,600 DH)
