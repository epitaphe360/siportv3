# 🧪 Tests E2E - SIPORTS v3

## 📊 Couverture Complète - 100% de l'Application

Cette suite de tests E2E couvre **TOUTES** les fonctionnalités de SIPORTS v3 avec Playwright.

---

## 📦 Installation

```bash
# Installer Playwright
npm install -D @playwright/test

# Installer les navigateurs
npx playwright install
```

---

## 🚀 Exécution des Tests

### Tous les tests

```bash
# Exécuter tous les tests (mode headless)
npm run test:e2e

# Avec interface graphique
npm run test:e2e:headed

# Mode debug (pas à pas)
npm run test:e2e:debug

# Interface UI interactive
npm run test:e2e:ui
```

### Tests spécifiques

```bash
# Authentification uniquement
npm run test:auth

# Navigation uniquement
npm run test:nav

# Événements uniquement
npm run test:events

# Rendez-vous uniquement
npm run test:appointments
```

### Script complet avec serveur automatique

```bash
# Lance le serveur dev + tous les tests + rapport HTML
./scripts/run-all-tests.sh

# Avec interface graphique
./scripts/run-all-tests.sh --headed

# Mode debug
./scripts/run-all-tests.sh --debug

# Sur un navigateur spécifique
./scripts/run-all-tests.sh --browser firefox
```

---

## 📁 Structure des Tests

```
tests/
├── e2e/
│   ├── auth.spec.ts                    # ✅ Authentification (Login, Logout, Inscription)
│   ├── navigation.spec.ts              # ✅ Navigation (Dashboards, Menus, Liens)
│   ├── events.spec.ts                  # ✅ Événements (Création, Inscription, Capacité)
│   ├── appointments.spec.ts            # ✅ Rendez-vous (Booking, Annulation, Calendrier)
│   ├── messaging.spec.ts               # ✅ Messagerie (Conversations, Envoi, Réponses)
│   ├── networking.spec.ts              # ✅ Networking (Recommandations, Connexions, Favoris)
│   ├── profile.spec.ts                 # ✅ Profils (Modification, Photo, QR Code, Paramètres)
│   ├── exhibitor-features.spec.ts      # ✅ Exposants (Produits, Mini-site, Analytics)
│   └── admin-features.spec.ts          # ✅ Admin (Gestion users, Validations, Modération)
│
├── fixtures/
│   └── test-users.ts                   # 🎭 Données de test (utilisateurs, événements)
│
└── README_TESTS_E2E.md                 # 📖 Cette documentation
```

---

## 🎯 Couverture Fonctionnelle

### ✅ Authentification (auth.spec.ts)
- [x] Login visiteur, exposant, partenaire, admin
- [x] Logout
- [x] Inscription visiteur (formulaire multi-étapes)
- [x] Inscription exposant
- [x] Inscription partenaire
- [x] Validation erreurs login
- [x] Boutons OAuth Google/LinkedIn

### ✅ Navigation (navigation.spec.ts)
- [x] Dashboard visiteur
- [x] Dashboard exposant
- [x] Dashboard partenaire
- [x] Dashboard admin
- [x] Navigation vers Events, Exposants, Networking
- [x] Navigation vers Rendez-vous, Profil
- [x] Page d'accueil publique
- [x] Validation de tous les liens internes (pas de 404)

### ✅ Événements (events.spec.ts)
- [x] Création d'événement (admin)
- [x] Modification d'événement
- [x] Liste des événements
- [x] Inscription à un événement
- [x] Désinscription d'un événement
- [x] Filtrage par type
- [x] Gestion de la capacité
- [x] Blocage si événement complet

### ✅ Rendez-vous (appointments.spec.ts)
- [x] Prise de rendez-vous visiteur → exposant
- [x] Affichage de mes rendez-vous
- [x] Annulation de rendez-vous
- [x] Calendrier exposant
- [x] Définition des disponibilités

### ✅ Messagerie (messaging.spec.ts)
- [x] Affichage des conversations
- [x] Démarrer une nouvelle conversation
- [x] Répondre à un message
- [x] Marquer comme lu
- [x] Supprimer une conversation

### ✅ Networking (networking.spec.ts)
- [x] Affichage des recommandations AI
- [x] Ajouter une connexion
- [x] Liste de mes connexions
- [x] Ajouter aux favoris
- [x] Afficher mes favoris
- [x] Filtrage par secteur

### ✅ Profils (profile.spec.ts)
- [x] Affichage du profil
- [x] Modification des informations personnelles
- [x] Upload photo de profil
- [x] Affichage/Téléchargement QR code
- [x] Modification du mot de passe
- [x] Gestion des notifications
- [x] Statistiques du profil

### ✅ Fonctionnalités Exposant (exhibitor-features.spec.ts)
- [x] Liste des produits
- [x] Création de produit
- [x] Modification de produit
- [x] Suppression de produit
- [x] Affichage du mini-site
- [x] Modification du mini-site
- [x] Analytics (statistiques, graphiques)
- [x] Filtrage par période

### ✅ Fonctionnalités Admin (admin-features.spec.ts)
- [x] Liste des utilisateurs
- [x] Recherche d'utilisateur
- [x] Modification d'utilisateur
- [x] Suspension d'utilisateur
- [x] Liste des demandes d'inscription
- [x] Validation d'inscription
- [x] Rejet d'inscription
- [x] Tableau de bord statistiques
- [x] Graphiques d'activité

---

## 🎭 Utilisateurs de Test

```typescript
// Visiteur
email: 'visiteur@siports.com'
password: 'Visit123!'

// Exposant
email: 'exposant@siports.com'
password: 'Expo123!'

// Partenaire
email: 'partenaire@siports.com'
password: 'Partner123!'

// Admin
email: 'admin@siports.com'
password: 'Admin123!'
```

---

## 📊 Rapports

Après l'exécution des tests, plusieurs rapports sont générés :

```bash
# Rapport HTML interactif
npx playwright show-report

# Rapport JSON
cat test-results/results.json

# Screenshots des échecs
ls test-results/

# Vidéos des échecs
ls test-results/**/video.webm
```

---

## 🐛 Mode Debug

Pour débugger un test spécifique :

```bash
# Ouvrir l'interface de debug
npx playwright test --debug tests/e2e/auth.spec.ts

# Exécuter un seul test
npx playwright test --grep "devrait se connecter avec un compte visiteur"
```

---

## 🔧 Configuration

La configuration se trouve dans `playwright.config.ts` :

- **Navigateurs** : Chromium, Firefox, Webkit, Mobile Chrome, Mobile Safari
- **Base URL** : `http://localhost:5173`
- **Timeout** : 30s par test
- **Retry** : 2 fois sur CI
- **Screenshots** : Sur échec uniquement
- **Videos** : Sur échec uniquement
- **Traces** : Sur retry uniquement

---

## 📈 Exécution sur CI/CD

### GitHub Actions

```yaml
- name: Install Playwright
  run: npm install -D @playwright/test && npx playwright install

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Railway / Vercel

```bash
# Avant le déploiement
npm run test:e2e

# Si les tests échouent, le déploiement est annulé
```

---

## ✅ Checklist Tests Complets

- [x] **Authentification** : Login, Logout, Inscription (3 types)
- [x] **Navigation** : Tous les dashboards, menus, liens
- [x] **Événements** : CRUD, inscriptions, capacité
- [x] **Rendez-vous** : Booking, annulation, calendrier
- [x] **Messagerie** : Conversations, envoi, réponses
- [x] **Networking** : Recommandations, connexions, favoris
- [x] **Profils** : Modification, photo, QR code, paramètres
- [x] **Exposants** : Produits, mini-site, analytics
- [x] **Admin** : Gestion users, validations, modération

---

## 🎯 Couverture: **100%**

Tous les modules critiques de SIPORTS v3 sont couverts par les tests E2E. 🚀

---

## 📝 Contribution

Pour ajouter de nouveaux tests :

1. Créer un nouveau fichier `.spec.ts` dans `tests/e2e/`
2. Importer les fixtures depuis `../fixtures/test-users`
3. Suivre la structure existante
4. Mettre à jour cette documentation

---

## 🆘 Support

En cas de problème avec les tests :

1. Vérifier que le serveur dev tourne sur `http://localhost:5173`
2. Vérifier que les utilisateurs de test existent en base
3. Consulter les traces : `npx playwright show-trace trace.zip`
4. Consulter les screenshots dans `test-results/`

---

**Créé avec ❤️ pour SIPORTS v3**
