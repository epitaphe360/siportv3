# 🔧 Instructions de Configuration des Comptes de Démo

## Problème
Les comptes de démo ne sont pas synchronisés avec Supabase. Les migrations SQL pour créer les comptes n'ont pas été appliquées en production.

## Solution - Exécuter manuellement le SQL

Accédez au SQL Editor de Supabase et exécutez le contenu du fichier:
```
supabase/migrations/20251225000003_recreate_demo_accounts.sql
```

### Étapes:
1. Aller à https://app.supabase.com
2. Sélectionner le projet "siportv3"
3. Aller à "SQL Editor"
4. Créer une nouvelle query
5. Copier-coller le contenu de la migration
6. Exécuter (Run)

## Comptes de Démo Créés

Tous les comptes utiliseront: **`Admin123!`**

### Admin
- Email: `admin.siports@siports.com`

### Exposants (4 comptes)
- `exhibitor-54m@test.siport.com` - 54m²
- `exhibitor-36m@test.siport.com` - 36m²
- `exhibitor-18m@test.siport.com` - 18m²
- `exhibitor-9m@test.siport.com` - 9m²

### Partenaires (7 comptes)
- `partner-gold@test.siport.com` - Gold
- `partner-silver@test.siport.com` - Silver
- `partner-platinium@test.siport.com` - Platinum
- `partner-museum@test.siport.com` - Museum
- `partner-porttech@test.siport.com` - PortTech
- `partner-oceanfreight@test.siport.com` - OceanFreight
- `partner-coastal@test.siport.com` - Coastal

### Visiteurs (4 comptes)
- `visitor-vip@test.siport.com` - VIP
- `visitor-premium@test.siport.com` - Premium
- `visitor-basic@test.siport.com` - Basic
- `visitor-free@test.siport.com` - Free

## Vérification

Après exécution, vérifiez que les comptes ont été créés:

```bash
npm exec -- tsx scripts/list_users.ts
```

Vous devez voir environ 16 nouveaux comptes avec les domaines `@test.siport.com` et `@siports.com`.

## Alternative si SQL Editor ne fonctionne pas

Si le SQL Editor de Supabase ne permet pas d'exécuter la migration complète, vous pouvez:

1. Créer manuellement chaque compte via le Supabase Dashboard > Authentication > Add User
2. Définir le mot de passe à `Admin123!` pour chaque compte
3. Configurer les champs user_id et email correctement

Ou utiliser la CLI Supabase si elle est linkée:
```bash
supabase db push
```

## Notes Importantes

- Les comptes existants (`admin2@siports.com`, `admin-test@siports.com`) peuvent être supprimés
- L'authentification Supabase utilise bcrypt pour le hachage des mots de passe
- Les migrations SQL utilisent `crypt('password', gen_salt('bf'))` pour générer des hashes bcrypt compatibles
