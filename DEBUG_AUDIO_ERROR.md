# Debug: Erreur 500 - Conversion Audio

## Problème Actuel
La fonction Edge `convert-text-to-speech` retourne une erreur 500.

## Corrections Appliquées

### 1. Amélioration du Logging dans la Fonction Edge ✅
- Ajout de logs détaillés à chaque étape
- Affichage des erreurs complètes avec stack trace
- Logs des erreurs de base de données (check, insert, update)

### 2. Amélioration de la Gestion d'Erreurs Côté Client ✅
- Affichage des détails d'erreur dans la console
- Extraction du contexte d'erreur complet
- Meilleure vérification de la réponse

## Comment Vérifier les Logs de l'Edge Function

### Option 1: Via Supabase Dashboard
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Menu "Edge Functions" → "convert-text-to-speech"
4. Onglet "Logs"
5. Activez "Real-time logs"
6. Déclenchez l'erreur et observez les logs

### Option 2: Via l'Application
1. Ouvrez la console du navigateur (F12)
2. Allez sur un article
3. Cliquez sur le bouton audio
4. Dans la console, vous verrez maintenant:
   - Les détails complets de l'erreur
   - Le stack trace si disponible
   - Le message d'erreur détaillé

## Causes Possibles de l'Erreur 500

### 1. Table `articles_audio` Non Créée
**Vérification**:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'articles_audio'
);
```

**Solution**: Appliquer la migration
```bash
# La migration existe déjà dans:
supabase/migrations/20250930212324_create_articles_audio_table.sql
```

### 2. Bucket Storage `article-audio` Non Créé
**Vérification**: Dashboard Supabase → Storage → Buckets

**Solution**: La migration crée automatiquement le bucket

### 3. Permissions RLS Manquantes
**Vérification**:
```sql
SELECT * FROM pg_policies WHERE tablename = 'articles_audio';
```

**Solution**: Déjà inclus dans la migration

### 4. Clé Google TTS Invalide
**Symptôme**: Erreur "Google TTS error: 400"

**Solution**: Vérifier/remplacer `GOOGLE_TTS_API_KEY`

### 5. Article Non Existant
**Symptôme**: Erreur de foreign key

**Solution**: Vérifier que l'article existe:
```sql
SELECT id FROM news_articles WHERE id = 'article-id';
```

## Prochaines Étapes

1. **Vérifier les logs de la fonction Edge** pour voir l'erreur exacte
2. **Vérifier que la table existe** en base de données
3. **Vérifier que le bucket Storage existe**
4. **Tester avec un article qui existe**

## Test Manuel

Vous pouvez tester la fonction directement:

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/convert-text-to-speech' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "articleId": "ARTICLE_ID",
    "text": "Ceci est un test",
    "language": "fr"
  }'
```

## Informations Importantes

- ✅ Fonction Edge déployée avec meilleur logging
- ✅ Service côté client amélioré
- ✅ Migration table `articles_audio` existe
- ✅ Policies RLS configurées
- ✅ Bucket Storage configuré dans la migration

## Build
```
✓ Built successfully in 8.33s
```

L'erreur devrait maintenant afficher plus de détails dans:
1. Les logs de l'Edge Function (Supabase Dashboard)
2. La console du navigateur (avec détails complets)
