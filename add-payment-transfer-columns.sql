-- Ajouter les colonnes manquantes pour les informations de virement
ALTER TABLE payment_requests 
ADD COLUMN IF NOT EXISTS transfer_date timestamptz,
ADD COLUMN IF NOT EXISTS transfer_reference text,
ADD COLUMN IF NOT EXISTS transfer_proof_url text;

-- Commentaires
COMMENT ON COLUMN payment_requests.transfer_date IS 'Date du virement bancaire effectué par le visiteur';
COMMENT ON COLUMN payment_requests.transfer_reference IS 'Référence du virement fournie par le visiteur';
COMMENT ON COLUMN payment_requests.transfer_proof_url IS 'URL du justificatif de virement (optionnel)';
