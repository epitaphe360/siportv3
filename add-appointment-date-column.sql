-- Migration: Ajouter la colonne appointment_date à la table appointments
-- Date: 15 décembre 2025

-- Ajouter la colonne appointment_date si elle n'existe pas
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_date date;

-- Ajouter un commentaire pour documentation
COMMENT ON COLUMN appointments.appointment_date IS 'Date du rendez-vous (format date uniquement)';

-- Optionnel: Migrer les données existantes si elles utilisent un autre format
-- UPDATE appointments SET appointment_date = date::date WHERE appointment_date IS NULL AND date IS NOT NULL;
