# Intégration de la vérification de schéma dans un pipeline CI/CD pour Siportv3

L'intégration de la vérification automatique du schéma de base de données dans un pipeline d'intégration continue/déploiement continu (CI/CD) est une étape cruciale pour maintenir la cohérence et la stabilité de la base de données de Siportv3. Cela permet de détecter rapidement les problèmes de schéma avant qu'ils n'atteignent les environnements de production.

## Principes clés

1.  **Automatisation** : La vérification doit être entièrement automatisée et déclenchée à chaque modification du code lié à la base de données.
2.  **Détection précoce** : Les problèmes de schéma doivent être identifiés le plus tôt possible dans le cycle de développement.
3.  **Échec rapide** : Le pipeline doit échouer immédiatement si une incohérence de schéma est détectée, empêchant ainsi le déploiement d'une base de données instable.

## Étapes d'intégration dans un pipeline CI/CD

Voici les étapes typiques pour intégrer la vérification de schéma dans un pipeline CI/CD, en utilisant Supabase CLI et des outils de comparaison de schémas :

### 1. Configuration de l'environnement CI/CD

Le pipeline CI/CD doit être configuré pour avoir accès à :

*   **Supabase CLI** : Installé et configuré pour interagir avec les projets Supabase.
*   **Docker** : Pour permettre à Supabase CLI de démarrer une base de données locale temporaire pour les tests.
*   **Variables d'environnement** : Les clés d'API et les URL de Supabase pour les environnements de test et de staging.

### 2. Application des migrations

Avant toute vérification, le pipeline doit appliquer les migrations de base de données. Pour un environnement de test temporaire, cela peut se faire en utilisant `supabase db reset`.

```bash
# Dans le répertoire racine du projet Supabase
npx supabase db reset
```

Cette commande va :
*   Démarrer une base de données PostgreSQL locale via Docker.
*   Appliquer toutes les migrations SQL définies dans le dossier `supabase/migrations`.
*   Exécuter les scripts de `seed` si présents, pour peupler la base de données avec des données de test.

### 3. Vérification du schéma

Une fois les migrations appliquées, le schéma de la base de données résultant doit être vérifié. Plusieurs méthodes peuvent être utilisées :

#### 3.1. Utilisation de `supabase db diff`

Bien que principalement conçu pour générer de nouvelles migrations, `supabase db diff` peut être utilisé pour comparer le schéma actuel de la base de données locale (après application des migrations) avec un schéma de référence ou avec l'état de la base de données de staging/production. Si des différences inattendues sont détectées, le pipeline doit échouer.

```bash
# Comparer le schéma local avec un schéma de référence (par exemple, un fichier SQL)
npx supabase db diff --schema-file ./reference_schema.sql

# Ou comparer avec une base de données distante (nécessite une configuration d'accès)
npx supabase db diff --db-url "postgresql://user:password@host:port/database"
```

#### 3.2. Outils de comparaison de schémas PostgreSQL

Des outils comme `apgdiff` ou `pgquarrel` peuvent être intégrés pour une comparaison plus robuste. Ces outils génèrent un script de différences (diff) entre deux schémas de base de données. Si le diff n'est pas vide (et ne contient pas de changements attendus), cela indique une dérive de schéma.

```bash
# Exemple avec apgdiff (nécessite l'installation de apgdiff)
apgdiff <(pg_dump -s db_reference) <(pg_dump -s db_test)
```

Le pipeline devrait analyser la sortie de ces outils et échouer si des différences non autorisées sont trouvées.

#### 3.3. Tests de validation de schéma

Des tests unitaires ou d'intégration peuvent être écrits pour interroger directement le schéma de la base de données et vérifier la présence de tables, colonnes, index ou contraintes spécifiques. Ces tests peuvent être exécutés après l'application des migrations.

```javascript
// Exemple conceptuel en JavaScript/TypeScript
import { Pool } from 'pg';

async function validateSchema() {
  const pool = new Pool(/* ... config ... */);
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'scraping_logs');");
    if (!res.rows[0].exists) {
      throw new Error('Table scraping_logs is missing!');
    }
    // Ajouter d'autres vérifications de colonnes, index, etc.
  } finally {
    client.release();
  }
}

validateSchema().catch(err => {
  console.error('Schema validation failed:', err);
  process.exit(1);
});
```

### 4. Déploiement conditionnel

Le déploiement de l'application et des services backend ne doit se produire que si toutes les étapes de vérification du schéma ont réussi. En cas d'échec, le pipeline doit s'arrêter et alerter les développeurs.

## Exemple de workflow CI/CD (GitHub Actions)

```yaml
name: CI/CD Database Schema Verification

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'
      - 'supabase/seed.sql'

jobs:
  schema-verification:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Supabase CLI
        run: npm install supabase --save-dev

      - name: Start Supabase local services and apply migrations
        run: npx supabase start
        # Note: For CI, you might need to configure Docker services or use a dedicated Supabase test instance

      - name: Run local database reset and apply migrations
        run: npx supabase db reset
        env:
          SUPABASE_DB_URL: ${{ secrets.SUPABASE_TEST_DB_URL }} # URL d'une base de données de test temporaire

      - name: Verify schema against reference (example using apgdiff)
        # Cette étape nécessiterait l'installation de apgdiff ou un script personnalisé
        run: |
          # Télécharger ou générer un schéma de référence
          # pg_dump -s -h localhost -p 54322 -U postgres postgres > reference_schema.sql
          # npx supabase db diff --schema-file reference_schema.sql
          echo "Schema verification step placeholder"

      - name: Deploy to Staging (if schema verification passes)
        if: success()
        run: |
          echo "Deploying to staging..."
          # Commandes de déploiement ici, incluant l'application des migrations distantes
          # npx supabase db push --linked --url "${{ secrets.SUPABASE_STAGING_URL }}"

  # Autres jobs de CI/CD (tests unitaires, tests d'intégration, déploiement frontend/backend)
```

## Conclusion

En intégrant ces étapes dans le pipeline CI/CD de Siportv3, l'équipe de développement peut s'assurer que les modifications de schéma sont correctement appliquées et validées à chaque déploiement, réduisant ainsi les risques d'erreurs et améliorant la robustesse de l'application.
