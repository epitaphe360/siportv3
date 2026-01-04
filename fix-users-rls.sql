-- ============================================================
-- CORRECTION DES RLS POLICIES POUR LA TABLE USERS
-- ============================================================
-- PROBLÈME: Les utilisateurs ne peuvent voir que leur propre profil
-- SOLUTION: Autoriser tous les authentifiés à lire tous les profils
-- ============================================================

-- 1️⃣ POLICY: Tous les utilisateurs authentifiés peuvent LIRE tous les profils
--    (Nécessaire pour le networking, recommandations, recherche)
DROP POLICY IF EXISTS "users_select_all_authenticated" ON users;
CREATE POLICY "users_select_all_authenticated"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- 2️⃣ POLICY: Chaque utilisateur peut MODIFIER uniquement son propre profil
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3️⃣ POLICY: Les admins peuvent tout faire (CRUD complet)
DROP POLICY IF EXISTS "users_all_admin" ON users;
CREATE POLICY "users_all_admin"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );

-- 4️⃣ S'assurer que RLS est activé sur la table
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
