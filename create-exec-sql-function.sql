-- Fonction SQL directe pour mettre à jour les mini-sites
-- Permet de contourner le problème du trigger qui cherche updated_at

-- Fonction pour exécuter du SQL avec des paramètres 
CREATE OR REPLACE FUNCTION exec_sql(sql text, params jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE sql || ' RETURNING to_jsonb(*)' INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;
