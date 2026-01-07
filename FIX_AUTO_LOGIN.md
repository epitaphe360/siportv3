# Problème : Page d'accueil ouvre avec admin connecté

## Causes possibles

1. **Supabase garde la session en cache** - Le navigateur a une session Supabase active
2. **localStorage stocke les données de session** - Même après un redémarrage
3. **Cookies d'authentification persistent** - Les cookies Supabase restent valides

## Solutions

### Option 1 : Déconnectez-vous d'abord (Rapide)
Sur le site : https://siport.up.railway.app/connexion
1. Cliquez sur les 3 barres (menu) en haut à droite
2. Cliquez sur "Déconnexion"
3. Rafraîchissez la page (Ctrl+F5 ou Cmd+Shift+R)

### Option 2 : Videz le cache du navigateur (Recommandé)
**Chrome/Edge:**
1. Appuyez sur `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
2. Sélectionnez "Tous les temps"
3. Cochez "Cookies et autres données de site"
4. Cliquez "Effacer les données"
5. Retournez à https://siport.up.railway.app

**Firefox:**
1. Appuyez sur `Ctrl+Shift+Delete`
2. Sélectionnez "Tout"
3. Cliquez "Effacer"

### Option 3 : Utiliser une fenêtre privée (Immédiat)
- Ouvrez une nouvelle fenêtre de navigation privée/incognito
- Allez sur https://siport.up.railway.app
- La page s'ouvrira SANS session (car pas d'historique)

## Pourquoi cela se produit

Le code `src/App.tsx` appelle `initializeAuth()` au démarrage :
```typescript
React.useEffect(() => {
  initializeAuth().catch(err => {
    console.error('Erreur initialisation auth:', err);
  });
}, []);
```

Cette fonction `initializeAuth()` (dans `src/lib/initAuth.ts`) :
1. Vérifie s'il y a une session Supabase active
2. Si OUI → restaure les données de l'utilisateur
3. Si NON → affiche la page de connexion

## Code concerné
- [src/App.tsx#L149-L155](src/App.tsx#L149-L155) - Initialisation auth au démarrage
- [src/lib/initAuth.ts](src/lib/initAuth.ts) - Logique de restauration de session

## Comportement normal
✅ C'est le comportement attendu ! L'app doit restaurer la session existante pour ne pas obliger l'utilisateur à se reconnecter à chaque rafraîchissement.

**Pour tester avec une session différente**, utilisez une fenêtre incognito ou videz le cache.
