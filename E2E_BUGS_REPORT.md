# 🐛 BUGS DÉTECTÉS PAR LES TESTS E2E

## ✅ Tests Passés (2/75)
- 1.1 - Login avec email/password valide
- 1.5 - OAuth Google (simulation)

## ❌ Bugs Critiques à Corriger

### 1. Messages d'erreur de login non affichés
**Tests concernés:** 1.2, 1.3
**Problème:** Le message "Email ou mot de passe incorrect" n'apparaît pas à l'écran
**Fichier:** `src/components/auth/LoginPage.tsx`
**Action:** Vérifier que la variable `error` est bien affichée dans le JSX

### 2. Fonction manquante: getUserEventRegistrations
**Console Error:** `SupabaseService.getUserEventRegistrations is not a function`
**Fichier:** `src/services/supabaseService.ts`
**Appelé par:** `src/store/eventStore.ts:89`
**Action:** Implémenter la fonction manquante

### 3. Colonne database incorrecte: start_date vs start_time
**SQL Error:** `column events.start_date does not exist`
**Hint:** `Perhaps you meant to reference the column "events.start_time"`
**Fichiers à corriger:** Tous les services/stores qui utilisent `start_date`
**Action:** Rechercher et remplacer `start_date` par `start_time`

### 4. Page d'inscription - Sélecteurs incorrects
**Test:** 1.4 - Inscription nouveau visiteur
**Problème:** `input[name="email"]` introuvable (timeout 30s)
**Fichier:** `src/components/auth/RegisterPage.tsx` ou similaire
**Action:** Vérifier les noms des champs du formulaire

### 5. Logout - Élément user-menu introuvable
**Test:** 1.6 - Logout
**Problème:** `[data-testid="user-menu"]` introuvable
**Fichier:** Probablement `src/components/layout/Header.tsx` ou `Nav.tsx`
**Action:** Ajouter `data-testid="user-menu"` au bouton du menu utilisateur

### 6. Mot de passe oublié - Message confirmation absent
**Test:** 1.7 - Mot de passe oublié
**Problème:** `text=/Email envoyé/i` introuvable
**Fichier:** Page de réinitialisation du mot de passe
**Action:** Afficher un message de confirmation après l'envoi

## 📊 Statistiques
- **Total tests:** 75
- **Passés:** 2 (2.7%)
- **Échoués:** 5
- **Non exécutés:** 68
- **Taux de réussite actuel:** 2.7%

## 🎯 Priorité de correction
1. **URGENT:** Fonction manquante `getUserEventRegistrations` (bloque dashboard)
2. **URGENT:** Colonne `start_date` → `start_time` (erreurs SQL)
3. **HAUTE:** Messages d'erreur login
4. **HAUTE:** Sélecteurs formulaire inscription
5. **MOYENNE:** data-testid pour logout
6. **MOYENNE:** Message confirmation mot de passe oublié
