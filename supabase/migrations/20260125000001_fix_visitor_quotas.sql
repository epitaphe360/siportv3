-- Migration pour corriger les quotas visiteurs selon le cahier des charges
-- FREE: 0 RDV | VIP/PREMIUM: 10 RDV

-- 1. Mettre à jour les quotas pour le niveau FREE (0 rendez-vous)
UPDATE visitor_levels
SET 
  features = '{"appointments": 0, "connections": 10, "minisite_views": true, "chat": true}'::jsonb,
  quotas = '{"appointments": 0, "connections_per_day": 10, "favorites": 20}'::jsonb
WHERE level = 'free';

-- 2. Mettre à jour les quotas pour le niveau VIP (10 rendez-vous)
UPDATE visitor_levels
SET 
  name = 'Pass VIP Premium',
  description = 'Accès VIP avec 10 rendez-vous B2B et tous les avantages premium - 700€ TTC',
  price_monthly = 700.00,
  price_annual = 700.00,
  features = '{"appointments": 10, "connections": 9999, "minisite_views": true, "chat": true, "priority_support": true, "concierge": true, "private_lounge": true}'::jsonb,
  quotas = '{"appointments": 10, "connections_per_day": 9999, "favorites": 9999}'::jsonb,
  display_order = 2
WHERE level = 'vip';

-- 3. Mettre à jour PREMIUM pour être un alias de VIP (10 rendez-vous)
UPDATE visitor_levels
SET 
  name = 'Pass VIP Premium (alias)',
  description = 'Alias pour le Pass VIP Premium - 700€ TTC',
  price_monthly = 700.00,
  price_annual = 700.00,
  features = '{"appointments": 10, "connections": 9999, "minisite_views": true, "chat": true, "priority_support": true, "concierge": true, "private_lounge": true}'::jsonb,
  quotas = '{"appointments": 10, "connections_per_day": 9999, "favorites": 9999}'::jsonb,
  display_order = 3
WHERE level = 'premium';

-- 4. Vérification des valeurs (commentaire pour référence)
-- SELECT level, name, (quotas->>'appointments')::int as rdv_quota 
-- FROM visitor_levels 
-- ORDER BY display_order;
-- 
-- Résultat attendu:
-- free     | Pass Gratuit              | 0
-- vip      | Pass VIP Premium          | 10
-- premium  | Pass VIP Premium (alias)  | 10
