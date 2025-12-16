-- =====================================================
-- TABLE: payment_requests
-- Description: Gestion des demandes de paiement par virement bancaire
-- Validation par administrateur
-- =====================================================

-- 1. Créer la table
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_level TEXT NOT NULL CHECK (requested_level IN ('free', 'premium')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  
  -- Informations de virement
  payment_reference TEXT, -- Référence du virement fournie par le visiteur
  payment_proof_url TEXT, -- URL vers la preuve de paiement (screenshot, etc.)
  
  -- Validation administrateur
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT, -- Notes de l'admin lors de la validation/rejet
  validated_at TIMESTAMPTZ,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON public.payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON public.payment_requests(created_at DESC);

-- 3. Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_payment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_requests_updated_at
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_requests_updated_at();

-- 4. Row Level Security (RLS) Policies
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Les visiteurs peuvent voir leurs propres demandes
CREATE POLICY "Visiteurs peuvent voir leurs demandes"
  ON public.payment_requests
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Policy: Les visiteurs peuvent créer leurs demandes
CREATE POLICY "Visiteurs peuvent créer des demandes"
  ON public.payment_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    requested_level IN ('free', 'premium')
  );

-- Policy: Les visiteurs peuvent mettre à jour leur référence de paiement (seulement si pending)
CREATE POLICY "Visiteurs peuvent mettre à jour leurs demandes pending"
  ON public.payment_requests
  FOR UPDATE
  USING (
    auth.uid() = user_id AND
    status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id AND
    status = 'pending'
  );

-- Policy: Les admins peuvent tout voir
CREATE POLICY "Admins peuvent voir toutes les demandes"
  ON public.payment_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- Policy: Les admins peuvent valider/rejeter (UPDATE)
CREATE POLICY "Admins peuvent valider les demandes"
  ON public.payment_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );

-- 5. Commentaires pour documentation
COMMENT ON TABLE public.payment_requests IS 'Demandes de passage au pass premium par virement bancaire';
COMMENT ON COLUMN public.payment_requests.user_id IS 'Référence vers l''utilisateur (visiteur)';
COMMENT ON COLUMN public.payment_requests.requested_level IS 'Niveau demandé: free ou premium';
COMMENT ON COLUMN public.payment_requests.amount IS 'Montant du paiement';
COMMENT ON COLUMN public.payment_requests.status IS 'Statut: pending, approved, rejected';
COMMENT ON COLUMN public.payment_requests.payment_reference IS 'Référence du virement fournie par le visiteur';
COMMENT ON COLUMN public.payment_requests.payment_proof_url IS 'URL vers la preuve de paiement';
COMMENT ON COLUMN public.payment_requests.admin_id IS 'Admin qui a validé/rejeté';
COMMENT ON COLUMN public.payment_requests.admin_notes IS 'Notes de l''admin';
COMMENT ON COLUMN public.payment_requests.validated_at IS 'Date de validation/rejet';

-- 6. Fonction pour approuver une demande (met à jour le visitor_level)
CREATE OR REPLACE FUNCTION approve_payment_request(
  request_id UUID,
  admin_user_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  request_record RECORD;
  result JSONB;
BEGIN
  -- Vérifier que l'admin existe et est bien admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = admin_user_id AND type = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: User is not an admin');
  END IF;

  -- Récupérer la demande
  SELECT * INTO request_record
  FROM public.payment_requests
  WHERE id = request_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment request not found');
  END IF;

  IF request_record.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment request is not pending');
  END IF;

  -- Mettre à jour la demande
  UPDATE public.payment_requests
  SET 
    status = 'approved',
    admin_id = admin_user_id,
    admin_notes = notes,
    validated_at = NOW()
  WHERE id = request_id;

  -- Mettre à jour le niveau du visiteur
  UPDATE public.users
  SET 
    visitor_level = request_record.requested_level,
    updated_at = NOW()
  WHERE id = request_record.user_id;

  result := jsonb_build_object(
    'success', true,
    'request_id', request_id,
    'user_id', request_record.user_id,
    'new_level', request_record.requested_level
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Fonction pour rejeter une demande
CREATE OR REPLACE FUNCTION reject_payment_request(
  request_id UUID,
  admin_user_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  request_record RECORD;
  result JSONB;
BEGIN
  -- Vérifier que l'admin existe et est bien admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = admin_user_id AND type = 'admin'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: User is not an admin');
  END IF;

  -- Récupérer la demande
  SELECT * INTO request_record
  FROM public.payment_requests
  WHERE id = request_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment request not found');
  END IF;

  IF request_record.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment request is not pending');
  END IF;

  -- Mettre à jour la demande
  UPDATE public.payment_requests
  SET 
    status = 'rejected',
    admin_id = admin_user_id,
    admin_notes = notes,
    validated_at = NOW()
  WHERE id = request_id;

  result := jsonb_build_object(
    'success', true,
    'request_id', request_id,
    'status', 'rejected'
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.payment_requests TO authenticated;
GRANT EXECUTE ON FUNCTION approve_payment_request TO authenticated;
GRANT EXECUTE ON FUNCTION reject_payment_request TO authenticated;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- Instructions:
-- 1. Copier ce script complet
-- 2. Aller sur https://supabase.com → Votre projet → SQL Editor
-- 3. Coller et exécuter le script
-- 4. Vérifier dans Table Editor que la table est créée avec les RLS policies
-- =====================================================
