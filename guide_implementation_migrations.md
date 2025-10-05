# Guide d'implémentation de la stratégie de migration et de vérification des schémas pour Siportv3

Ce guide décrit les étapes concrètes pour implémenter la stratégie de gestion des migrations de base de données et de vérification automatique des schémas pour le projet Siportv3.

## 1. Prérequis

Avant de commencer, assurez-vous que les éléments suivants sont en place :

*   **Supabase CLI** : Installé et configuré dans votre environnement de développement local et dans votre environnement CI/CD. Pour l'installation, référez-vous à la documentation officielle de Supabase CLI [1].
*   **Docker** : Nécessaire pour l'exécution locale de Supabase CLI et pour la réinitialisation de la base de données locale (`supabase db reset`).
*   **Fichiers de migration SQL** : Tous les changements de schéma doivent être définis dans des fichiers `.sql` horodatés, situés dans le répertoire `supabase/migrations` du projet.
*   **Variables d'environnement Supabase** : Les `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` doivent être configurées pour les environnements de développement, de staging et de production.

## 2. Implémentation de la vérification locale des migrations

Pour le développement local, l'utilisation de `supabase db reset` est la méthode recommandée pour garantir la cohérence du schéma.

### Étapes :

1.  **Naviguer vers le répertoire racine du projet Siportv3** dans votre terminal.
2.  **Exécuter la commande de réinitialisation de la base de données** :

    ```bash
    npx supabase db reset
    ```

    Cette commande va :
    *   Arrêter et redémarrer les services Supabase locaux (via Docker).
    *   Appliquer toutes les migrations SQL depuis le début.
    *   Exécuter les scripts de `seed` (si présents) pour peupler la base de données avec des données initiales.

    **Note** : Cette étape nécessite que Docker soit en cours d'exécution. En cas de problème, vérifiez votre installation Docker.

## 3. Intégration de la vérification de schéma dans un pipeline CI/CD

L'intégration dans un pipeline CI/CD (par exemple, GitHub Actions, GitLab CI, Jenkins) est essentielle pour automatiser la vérification du schéma avant chaque déploiement. Pour une description détaillée et un exemple de workflow GitHub Actions, veuillez consulter le document "Intégration de la vérification de schéma dans un pipeline CI/CD pour Siportv3" [2].

### Principes clés à suivre :

*   **Déclenchement automatique** : Le pipeline doit être déclenché automatiquement lors des modifications des fichiers de migration (`supabase/migrations/**`) ou des scripts de `seed`.
*   **Environnement isolé** : Utiliser un environnement de base de données temporaire et isolé pour l'application des migrations et la vérification.
*   **Application des migrations** : Utiliser `npx supabase db reset` ou `npx supabase db push` pour appliquer les migrations.
*   **Vérification du schéma** : Comparer le schéma de la base de données après migration avec un schéma de référence ou utiliser des tests de validation de schéma. Des outils comme `apgdiff` ou `pgquarrel` peuvent être utilisés pour la comparaison.
*   **Échec du pipeline** : Le pipeline doit échouer si des incohérences de schéma sont détectées, empêchant ainsi le déploiement de versions non conformes.

## 4. Recommandations supplémentaires

*   **Revue de code des migrations** : Incluez les fichiers de migration dans le processus de revue de code pour s'assurer de leur exactitude et de leur conformité aux standards.
*   **Tests d'intégration** : Développez des tests d'intégration qui s'exécutent sur une base de données avec le schéma le plus récent pour valider le comportement de l'application.
*   **Surveillance** : Mettez en place des alertes pour les erreurs de base de données en production, y compris celles liées au schéma.

## Références

[1] Supabase Docs. *Supabase CLI: Getting Started*. [https://supabase.com/docs/guides/local-development/cli/getting-started](https://supabase.com/docs/guides/local-development/cli/getting-started)
[2] Manuscrit. *Intégration de la vérification de schéma dans un pipeline CI/CD pour Siportv3*. [siportv3/integration_ci_cd_schema_verification.md](siportv3/integration_ci_cd_schema_verification.md)

