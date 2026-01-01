-- Migration: Restreindre la modification du niveau de sponsoring aux administrateurs uniquement
-- Created: 2026-01-01
-- Description: Empêche les partenaires de modifier leur propre niveau de sponsoring (partnership_level)
--              Seuls les administrateurs peuvent modifier ce champ critique

-- ============================================
-- 1. PARTNER_PROFILES: Restrictions RLS
-- ============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Partners can update their own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Partners can update own profile" ON public.partner_profiles;

-- Nouvelle politique: Les partenaires peuvent mettre à jour leur profil SAUF partnership_level
CREATE POLICY "Partners can update profile except partnership_level"
  ON public.partner_profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'partner'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'partner'
    )
    -- IMPORTANT: Empêcher la modification de partnership_level par les partenaires
    AND (
      (NEW.partnership_level IS NULL AND OLD.partnership_level IS NULL)
      OR (NEW.partnership_level = OLD.partnership_level)
    )
  );

-- Politique: Seuls les administrateurs peuvent modifier partnership_level
CREATE POLICY "Admins can update all partner profile fields"
  ON public.partner_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );

-- ============================================
-- 2. PARTNERS: Restrictions RLS
-- ============================================

-- Vérifier si la table partners existe et ajouter des restrictions similaires
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners' AND table_schema = 'public') THEN
    
    -- Supprimer les anciennes politiques
    DROP POLICY IF EXISTS "Partners can update own data" ON public.partners;
    
    -- Politique: Les partenaires peuvent mettre à jour SAUF sponsorship_level
    EXECUTE '
      CREATE POLICY "Partners can update except sponsorship_level"
        ON public.partners
        FOR UPDATE
        TO authenticated
        USING (
          user_id = auth.uid()
        )
        WITH CHECK (
          user_id = auth.uid()
          AND (
            (NEW.sponsorship_level IS NULL AND OLD.sponsorship_level IS NULL)
            OR (NEW.sponsorship_level = OLD.sponsorship_level)
          )
        )
    ';
    
    RAISE NOTICE 'Politique RLS appliquée à la table partners';
  END IF;
END $$;

-- ============================================
-- 3. COMMENTAIRES POUR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN public.partner_profiles.partnership_level IS 
  'Niveau de partenariat (museum, silver, gold, platinium). RÉSERVÉ AUX ADMINISTRATEURS - les partenaires ne peuvent pas modifier ce champ.';

-- ============================================
-- 4. FONCTION DE VALIDATION (optionnelle)
-- ============================================

-- Créer une fonction de validation pour bloquer les tentatives de modification
CREATE OR REPLACE FUNCTION public.prevent_partner_level_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'utilisateur n'est pas admin et tente de modifier partnership_level
  IF OLD.partnership_level IS DISTINCT FROM NEW.partnership_level THEN
    -- Vérifier si l'utilisateur actuel est un admin
    IF NOT EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    ) THEN
      RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier le niveau de partenariat'
        USING HINT = 'Contactez un administrateur pour modifier votre niveau de sponsoring';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger sur partner_profiles
DROP TRIGGER IF EXISTS enforce_partnership_level_admin_only ON public.partner_profiles;
CREATE TRIGGER enforce_partnership_level_admin_only
  BEFORE UPDATE ON public.partner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_partner_level_modification();

-- Appliquer le trigger sur partners si elle existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners' AND table_schema = 'public') THEN
    EXECUTE '
      DROP TRIGGER IF EXISTS enforce_sponsorship_level_admin_only ON public.partners;
      CREATE TRIGGER enforce_sponsorship_level_admin_only
        BEFORE UPDATE ON public.partners
        FOR EACH ROW
        EXECUTE FUNCTION public.prevent_partner_level_modification()
    ';
    RAISE NOTICE 'Trigger appliqué à la table partners';
  END IF;
END $$;
