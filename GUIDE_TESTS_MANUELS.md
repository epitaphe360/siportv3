# 🧪 PLAN DE TESTS MANUELS - SIPORTS v3
## (Tests E2E automatiques indisponibles - restrictions réseau)

---

## ❌ PROBLÈMES DÉTECTÉS AVEC TESTS AUTOMATIQUES

1. **Playwright**: Impossible d'installer navigateurs Chromium (restrictions réseau HTTP 403)
2. **Network**: Accès bloqué à cdn.playwright.dev et playwright.download.prss.microsoft.com
3. **Solution**: Tests manuels guidés ci-dessous

---

## ✅ GUIDE DE TESTS MANUELS COMPLET

### 🎯 Objectif
Tester **toutes** les fonctionnalités de SIPORTS v3 manuellement dans le navigateur.

---

## 📋 CHECKLIST COMPLÈTE (70 tests)

### 1. AUTHENTIFICATION (8 tests)

**Comptes de test disponibles :**
- Admin: `admin@siports.com` / `Admin123!`
- Visiteur: `visiteur@siports.com` / `Visit123!`
- Exposant: `exposant@siports.com` / `Expo123!`
- Partenaire: `partenaire@siports.com` / `Partner123!`

**Tests :**
- [ ] 1.1 Login visiteur fonctionne
- [ ] 1.2 Login exposant fonctionne
- [ ] 1.3 Login partenaire fonctionne
- [ ] 1.4 Login admin fonctionne
- [ ] 1.5 Logout fonctionne
- [ ] 1.6 Erreur affichée si mauvais mot de passe
- [ ] 1.7 Bouton OAuth Google visible
- [ ] 1.8 Bouton OAuth LinkedIn visible

---

### 2. INSCRIPTION (6 tests)

- [ ] 2.1 Formulaire inscription visiteur (5 étapes)
- [ ] 2.2 Validation mot de passe fort
- [ ] 2.3 Message succès après inscription
- [ ] 2.4 Formulaire inscription exposant complet
- [ ] 2.5 Formulaire inscription partenaire complet
- [ ] 2.6 reCAPTCHA se déclenche (badge visible)

---

### 3. NAVIGATION GÉNÉRALE (10 tests)

**En tant que VISITEUR :**
- [ ] 3.1 Dashboard visiteur s'affiche
- [ ] 3.2 Menu "Événements" accessible
- [ ] 3.3 Menu "Exposants" accessible
- [ ] 3.4 Menu "Networking" accessible
- [ ] 3.5 Menu "Rendez-vous" accessible
- [ ] 3.6 Menu "Messages" accessible
- [ ] 3.7 Lien "Profil" accessible
- [ ] 3.8 Tous les liens du footer fonctionnent
- [ ] 3.9 Aucune erreur 404
- [ ] 3.10 Breadcrumb/Navigation cohérente

---

### 4. ÉVÉNEMENTS (8 tests)

- [ ] 4.1 Liste événements affichée
- [ ] 4.2 Cliquer sur événement → détails complets
- [ ] 4.3 Bouton "S'inscrire" visible et actif
- [ ] 4.4 Inscription à événement → message succès
- [ ] 4.5 Événement apparaît dans "Mes événements"
- [ ] 4.6 Désinscription fonctionne
- [ ] 4.7 Filtre par type (Conférence/Workshop/etc.)
- [ ] 4.8 Capacité affichée (ex: 45/100 places)

**Admin uniquement :**
- [ ] 4.9 Créer nouvel événement
- [ ] 4.10 Modifier événement existant

---

### 5. RENDEZ-VOUS (6 tests)

- [ ] 5.1 Page rendez-vous accessible
- [ ] 5.2 Liste de mes rendez-vous
- [ ] 5.3 Aller sur profil exposant → bouton "Prendre RDV"
- [ ] 5.4 Calendrier créneaux disponibles affiché
- [ ] 5.5 Réserver créneau → confirmation
- [ ] 5.6 Annuler rendez-vous

**Exposant uniquement :**
- [ ] 5.7 Gérer mes disponibilités
- [ ] 5.8 Voir mes rendez-vous reçus

---

### 6. MESSAGERIE (5 tests)

- [ ] 6.1 Page messages accessible
- [ ] 6.2 Liste conversations affichée
- [ ] 6.3 Ouvrir conversation → messages affichés
- [ ] 6.4 Envoyer nouveau message
- [ ] 6.5 Répondre à message existant
- [ ] 6.6 Badge "non lu" fonctionne
- [ ] 6.7 Supprimer conversation

---

### 7. NETWORKING (6 tests)

- [ ] 7.1 Page networking accessible
- [ ] 7.2 Recommandations AI affichées
- [ ] 7.3 Cliquer recommandation → profil détaillé
- [ ] 7.4 Bouton "Se connecter" fonctionne
- [ ] 7.5 Voir "Mes connexions"
- [ ] 7.6 Ajouter aux favoris (icône étoile/cœur)
- [ ] 7.7 Voir "Mes favoris"
- [ ] 7.8 Filtrer par secteur

---

### 8. PROFIL UTILISATEUR (7 tests)

- [ ] 8.1 Affichage profil complet (nom, email, etc.)
- [ ] 8.2 Bouton "Modifier profil"
- [ ] 8.3 Modifier bio/description → sauvegarde
- [ ] 8.4 Upload photo de profil (si disponible)
- [ ] 8.5 QR Code visible et téléchargeable
- [ ] 8.6 Paramètres notifications accessibles
- [ ] 8.7 Modifier mot de passe fonctionne

---

### 9. FONCTIONNALITÉS EXPOSANT (7 tests)

**Se connecter avec compte exposant :**

- [ ] 9.1 Dashboard exposant différent du visiteur
- [ ] 9.2 Menu "Mes Produits" accessible
- [ ] 9.3 Liste produits affichée
- [ ] 9.4 Créer nouveau produit → formulaire complet
- [ ] 9.5 Modifier produit existant
- [ ] 9.6 Supprimer produit → confirmation
- [ ] 9.7 Mini-site exposant accessible (URL publique)
- [ ] 9.8 Modifier contenu mini-site
- [ ] 9.9 Analytics/Statistiques visibles
- [ ] 9.10 Graphiques chargent correctement

---

### 10. FONCTIONNALITÉS ADMIN (9 tests)

**Se connecter avec compte admin :**

- [ ] 10.1 Dashboard admin avec statistiques globales
- [ ] 10.2 Menu "Gestion Utilisateurs"
- [ ] 10.3 Liste tous utilisateurs (table)
- [ ] 10.4 Rechercher utilisateur par nom/email
- [ ] 10.5 Cliquer utilisateur → détails complets
- [ ] 10.6 Modifier statut utilisateur (actif/suspendu)
- [ ] 10.7 Menu "Demandes d'inscription"
- [ ] 10.8 Liste inscriptions en attente
- [ ] 10.9 Valider une inscription → confirmation
- [ ] 10.10 Rejeter une inscription → raison requise
- [ ] 10.11 Graphiques tableau de bord affichés

---

### 11. CONSOLE & PERFORMANCE (5 tests)

**Ouvrir Console (F12) :**

- [ ] 11.1 Aucune erreur rouge dans console
- [ ] 11.2 `grecaptcha` défini (reCAPTCHA chargé)
- [ ] 11.3 Aucune erreur 404 (fichiers manquants)
- [ ] 11.4 Aucune erreur CORS
- [ ] 11.5 Page charge en < 3 secondes

---

## 🐛 TEMPLATE RAPPORT DE BUG

Pour chaque bug trouvé :

```
### BUG #[numéro]

**Page/Module** : [Ex: Events / Inscription]
**Gravité** : Critique ⚠️ / Majeur 🔴 / Mineur 🟡

**Steps to reproduce :**
1. [Action 1]
2. [Action 2]
3. [...]

**Attendu** : [Ce qui devrait se passer]
**Résultat** : [Ce qui se passe réellement]

**Console errors** :
```
[Copier erreurs console ici]
```

**Screenshot** : [Joindre si possible]
```

---

## 📊 RAPPORT FINAL À REMPLIR

```
╔══════════════════════════════════════════════════════╗
║        RAPPORT DE TESTS MANUELS SIPORTS v3          ║
╚══════════════════════════════════════════════════════╝

Date: [DATE]
Testeur: [NOM]
Navigateur: [Chrome/Firefox/Safari] v[VERSION]

─────────────────────────────────────────────────────

📊 STATISTIQUES

Tests total: 70
Tests passés: __ / 70
Tests échoués: __
Taux de réussite: __%

─────────────────────────────────────────────────────

🐛 BUGS DÉTECTÉS

Critiques: __
Majeurs: __
Mineurs: __

─────────────────────────────────────────────────────

📝 DÉTAIL DES BUGS

[Utiliser template ci-dessus pour chaque bug]

─────────────────────────────────────────────────────

✅ CONCLUSION

Application fonctionnelle: ☐ OUI  ☐ NON  ☐ PARTIELLEMENT

Prête pour production: ☐ OUI  ☐ NON

Commentaires:
[...]

─────────────────────────────────────────────────────
```

---

## 🚀 COMMENT PROCÉDER

1. **Démarrer l'application** : `npm run dev`
2. **Ouvrir navigateur** : http://localhost:5173
3. **Ouvrir console** : F12 (pour surveiller erreurs)
4. **Suivre checklist** : Cocher chaque test effectué
5. **Noter tous les bugs** : Utiliser template ci-dessus
6. **Remplir rapport final**

---

## 💡 CONSEILS

- ✅ Tester sur plusieurs navigateurs si possible
- ✅ Nettoyer cache entre tests (Ctrl+Shift+Del)
- ✅ Tester en mode incognito aussi
- ✅ Noter TOUTES les erreurs console
- ✅ Prendre screenshots des bugs visuels
- ✅ Tester responsive (mobile/tablet) si temps

---

**Bon courage ! 💪**

_Une fois les tests terminés, partagez le rapport complet pour que je puisse corriger tous les bugs détectés._
