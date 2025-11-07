# 🚀 Test Rapide : Inscription Partenaire

## ⚡ Configuration Express (5 minutes)

### Étape 1 : Vérifier que le serveur tourne

Le serveur de développement est déjà lancé sur **http://localhost:5000** ✅

### Étape 2 : Vérifier la configuration Supabase

```bash
# Dans la console du navigateur (F12), taper :
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase configuré:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
```

**⚠️ Si vous voyez des warnings Supabase** :
- Le fichier `.env` n'existe pas ou est mal configuré
- Voir la section "Configuration .env" ci-dessous

---

## 🧪 Test Manuel (2 minutes)

### Option 1 : Test avec Supabase configuré

1. **Ouvrir le navigateur**
   ```
   http://localhost:5000/register/partner
   ```

2. **Remplir le formulaire** :
   - **Nom organisation** : Test Partner Corp
   - **Secteur** : Technologie
   - **Pays** : Cameroun
   - **Site web** : https://example.com
   - **Description** : Description de test pour le partenaire (minimum 20 caractères)
   - **Prénom** : Jean
   - **Nom** : Dupont
   - **Poste** : Directeur Commercial
   - **Email** : test.partner@example.com
   - **Téléphone** : +237612345678
   - **Mot de passe** : Test1234!
   - **Confirmation** : Test1234!
   - **Type partenariat** : Institutionnel

3. **Cliquer sur "Demander à devenir partenaire"**

4. **Résultat attendu** :
   - ✅ Message de succès
   - ✅ Redirection vers `/signup-success`
   - ✅ Nouveau compte créé dans Supabase

### Option 2 : Test sans Supabase (Mode dégradé)

Si Supabase n'est pas configuré, l'application fonctionne en mode dégradé :
- Le formulaire s'affiche ✅
- La validation des champs fonctionne ✅
- La soumission échouera avec un message clair ⚠️

---

## 🔧 Configuration .env (Si nécessaire)

### Si vous voyez ce warning :
```
Supabase env vars missing or invalid. Some features requiring Supabase will be disabled
```

### Créer le fichier .env :

1. **Copier le template**
   ```powershell
   Copy-Item .env.example .env
   ```

2. **Obtenir vos clés Supabase**
   - Aller sur https://supabase.com
   - Se connecter à votre projet
   - Aller dans **Settings** > **API**
   - Copier :
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public key** → `VITE_SUPABASE_ANON_KEY`

3. **Éditer le fichier .env**
   ```bash
   VITE_SUPABASE_URL=https://votre-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_clé_anon_ici
   ```

4. **Redémarrer le serveur**
   ```powershell
   # Arrêter le serveur actuel (Ctrl+C dans le terminal)
   npm run dev
   ```

---

## ✅ Vérifications Rapides

### Dans le navigateur (F12 → Console) :

```javascript
// 1. Vérifier que la page charge
console.log('Page chargée:', window.location.pathname)

// 2. Vérifier Supabase
console.log('Supabase ready:', typeof supabase !== 'undefined')

// 3. Vérifier le store d'authentification
console.log('Auth store:', useAuthStore.getState())
```

### Dans Supabase (après inscription) :

1. **Ouvrir Table Editor**
2. **Vérifier la table `users`**
   - Nouveau user avec type='partner'
   - Status='pending'
3. **Vérifier la table `registration_requests`**
   - Nouvelle demande avec status='pending'

---

## 🐛 Dépannage Express

### Problème : "Email ou mot de passe requis"
**Cause** : Formulaire incomplet  
**Solution** : Remplir tous les champs obligatoires

### Problème : "Supabase non configuré"
**Cause** : Fichier `.env` manquant ou invalide  
**Solution** : Suivre la section "Configuration .env" ci-dessus

### Problème : "Les mots de passe ne correspondent pas"
**Cause** : Champs password et confirmPassword différents  
**Solution** : Vérifier la saisie

### Problème : "Le mot de passe doit contenir au moins 8 caractères"
**Cause** : Mot de passe trop court  
**Solution** : Utiliser minimum 8 caractères

### Problème : "L'URL du site web est invalide"
**Cause** : URL mal formatée  
**Solution** : Utiliser le format `https://example.com` ou laisser vide

---

## 📊 Résultats Attendus

### ✅ Cas de succès :

**Console navigateur** :
```
🔄 Inscription utilisateur: test.partner@example.com
✅ Utilisateur créé: test.partner@example.com
📝 Création demande d'inscription...
📧 Email de confirmation à envoyer: { ... }
```

**Interface utilisateur** :
- Toast de succès : "Inscription réussie ! Votre compte est en attente de validation."
- Redirection automatique vers `/signup-success`

**Base de données** :
- Nouvel enregistrement dans `users`
- Nouvel enregistrement dans `registration_requests`

### ❌ Cas d'erreur (avec messages clairs) :

- "Email déjà utilisé"
- "Connexion à Supabase impossible"
- "Échec de la création de l'utilisateur"

---

## 🎯 Checklist Rapide

- [ ] Serveur lancé sur http://localhost:5000
- [ ] Page `/register/partner` accessible
- [ ] Formulaire s'affiche correctement
- [ ] Validation des champs fonctionne
- [ ] Soumission crée un compte (si Supabase configuré)
- [ ] Message de succès affiché
- [ ] Redirection vers page de succès

---

## 📞 Besoin d'aide ?

### Voir les logs détaillés :

```javascript
// Dans la console du navigateur
localStorage.debug = '*'
location.reload()
```

### Vérifier l'état de l'application :

```javascript
// État de l'authentification
console.log(useAuthStore.getState())

// Configuration Supabase
console.log({
  url: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
})
```

---

**Temps total de test** : ~7 minutes  
**Prérequis** : Serveur de dev lancé  
**Recommandé** : Configuration Supabase pour test complet
