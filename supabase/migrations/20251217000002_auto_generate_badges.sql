-- Trigger pour générer automatiquement un badge lors de la création d'un utilisateur
-- ou lorsque son statut/niveau change

CREATE OR REPLACE FUNCTION auto_generate_user_badge()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name text;
  v_company_name text;
  v_position text;
  v_email text;
  v_phone text;
  v_avatar_url text;
  v_stand_number text;
  v_user_level text;
  v_exhibitor_id uuid;
  v_partner_id uuid;
BEGIN
  -- Construire le nom complet
  v_full_name := COALESCE(
    (NEW.profile::jsonb)->>'firstName' || ' ' || (NEW.profile::jsonb)->>'lastName',
    NEW.name,
    NEW.email
  );

  -- Récupérer les informations du profil
  v_email := NEW.email;
  v_phone := (NEW.profile::jsonb)->>'phone';
  v_avatar_url := (NEW.profile::jsonb)->>'avatar';
  v_position := (NEW.profile::jsonb)->>'position';
  v_user_level := NEW.visitor_level;

  -- Si c'est un exposant, récupérer les infos de la table exhibitors
  IF NEW.type = 'exhibitor' THEN
    SELECT id, "companyName", "standNumber"
    INTO v_exhibitor_id, v_company_name, v_stand_number
    FROM exhibitors
    WHERE "userId" = NEW.id
    LIMIT 1;

    -- Si pas d'entreprise trouvée dans exhibitors, utiliser le profil
    v_company_name := COALESCE(v_company_name, (NEW.profile::jsonb)->>'company');
  END IF;

  -- Si c'est un partenaire, récupérer les infos de la table partners
  IF NEW.type = 'partner' THEN
    SELECT id, "organizationName"
    INTO v_partner_id, v_company_name
    FROM partners
    WHERE "userId" = NEW.id
    LIMIT 1;

    -- Si pas d'entreprise trouvée dans partners, utiliser le profil
    v_company_name := COALESCE(v_company_name, (NEW.profile::jsonb)->>'company');
  END IF;

  -- Si c'est un visiteur, utiliser les infos du profil
  IF NEW.type = 'visitor' THEN
    v_company_name := (NEW.profile::jsonb)->>'company';
  END IF;

  -- Générer ou mettre à jour le badge
  PERFORM upsert_user_badge(
    p_user_id := NEW.id,
    p_user_type := NEW.type,
    p_user_level := v_user_level,
    p_full_name := v_full_name,
    p_company_name := v_company_name,
    p_position := v_position,
    p_email := v_email,
    p_phone := v_phone,
    p_avatar_url := v_avatar_url,
    p_stand_number := v_stand_number
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les insertions d'utilisateurs
DROP TRIGGER IF EXISTS trigger_auto_generate_badge_on_insert ON users;
CREATE TRIGGER trigger_auto_generate_badge_on_insert
  AFTER INSERT ON users
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION auto_generate_user_badge();

-- Créer le trigger pour les mises à jour d'utilisateurs
-- (quand le statut devient 'active' ou quand visitor_level change)
DROP TRIGGER IF EXISTS trigger_auto_generate_badge_on_update ON users;
CREATE TRIGGER trigger_auto_generate_badge_on_update
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (
    (NEW.status = 'active' AND OLD.status != 'active')
    OR (NEW.visitor_level IS DISTINCT FROM OLD.visitor_level)
    OR (NEW.profile IS DISTINCT FROM OLD.profile)
  )
  EXECUTE FUNCTION auto_generate_user_badge();

-- Trigger pour mettre à jour le badge quand l'exposant est créé/modifié
CREATE OR REPLACE FUNCTION auto_update_badge_from_exhibitor()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le badge de l'utilisateur lié
  IF NEW."userId" IS NOT NULL THEN
    PERFORM upsert_user_badge(
      p_user_id := NEW."userId",
      p_user_type := 'exhibitor',
      p_user_level := NULL,
      p_full_name := (SELECT name FROM users WHERE id = NEW."userId"),
      p_company_name := NEW."companyName",
      p_position := (SELECT (profile::jsonb)->>'position' FROM users WHERE id = NEW."userId"),
      p_email := (SELECT email FROM users WHERE id = NEW."userId"),
      p_phone := (SELECT (profile::jsonb)->>'phone' FROM users WHERE id = NEW."userId"),
      p_avatar_url := (SELECT (profile::jsonb)->>'avatar' FROM users WHERE id = NEW."userId"),
      p_stand_number := NEW."standNumber"
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_badge_from_exhibitor ON exhibitors;
CREATE TRIGGER trigger_update_badge_from_exhibitor
  AFTER INSERT OR UPDATE ON exhibitors
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_badge_from_exhibitor();

-- Trigger pour mettre à jour le badge quand le partenaire est créé/modifié
CREATE OR REPLACE FUNCTION auto_update_badge_from_partner()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le badge de l'utilisateur lié
  IF NEW."userId" IS NOT NULL THEN
    PERFORM upsert_user_badge(
      p_user_id := NEW."userId",
      p_user_type := 'partner',
      p_user_level := NULL,
      p_full_name := (SELECT name FROM users WHERE id = NEW."userId"),
      p_company_name := NEW."organizationName",
      p_position := (SELECT (profile::jsonb)->>'position' FROM users WHERE id = NEW."userId"),
      p_email := (SELECT email FROM users WHERE id = NEW."userId"),
      p_phone := (SELECT (profile::jsonb)->>'phone' FROM users WHERE id = NEW."userId"),
      p_avatar_url := (SELECT (profile::jsonb)->>'avatar' FROM users WHERE id = NEW."userId"),
      p_stand_number := NULL
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_badge_from_partner ON partners;
CREATE TRIGGER trigger_update_badge_from_partner
  AFTER INSERT OR UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_badge_from_partner();

-- Commentaires
COMMENT ON FUNCTION auto_generate_user_badge() IS 'Génère automatiquement un badge pour un utilisateur lors de sa création ou mise à jour';
COMMENT ON FUNCTION auto_update_badge_from_exhibitor() IS 'Met à jour le badge quand les informations exposant changent';
COMMENT ON FUNCTION auto_update_badge_from_partner() IS 'Met à jour le badge quand les informations partenaire changent';
