-- ============================================================
-- CORRECTION DES RLS POLICIES POUR LA TABLE USERS
-- ============================================================
-- PROBLÈME: Les utilisateurs ne peuvent voir que leur propre profil
-- SOLUTION: Autoriser tous les authentifiés à lire tous les profils
-- ============================================================

-- ⚠️ D'ABORD : Supprimer TOUTES les policies existantes pour éviter les conflits
DROP POLICY IF EXISTS "users_select_all_authenticated" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_all_admin" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON users;

-- 1️⃣ POLICY: Tous les utilisateurs authentifiés peuvent LIRE tous les profils
--    (Nécessaire pour le networking, recommandations, recherche)
CREATE POLICY "users_select_all"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- 2️⃣ POLICY: Chaque utilisateur peut MODIFIER uniquement son propre profil
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3️⃣ POLICY: Chaque utilisateur peut SUPPRIMER uniquement son propre profil
CREATE POLICY "users_delete_own"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 4️⃣ POLICY: Seuls les utilisateurs authentifiés peuvent créer des profils
CREATE POLICY "users_insert_authenticated"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 5️⃣ S'assurer que RLS est activé sur la table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INSTRUCTIONS D'EXÉCUTION:
-- ============================================================
-- 1. Ouvrez: https://supabase.com/dashboard/project/eqjoqgpbxhsfgcovipgu/sql
-- 2. Copiez tout ce fichier SQL
-- 3. Collez dans l'éditeur SQL
-- 4. Cliquez sur "Run" (bouton vert en haut à droite)
-- 5. Vérifiez les messages de succès
-- 6. Rechargez l'app et testez "Générer mes Recommandations"
-- ============================================================
