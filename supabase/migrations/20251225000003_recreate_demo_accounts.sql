/*
  # Recreate Demo Accounts - Direct SQL Execution
  
  This script creates demo accounts directly using Supabase's PostgreSQL instance.
  It uses crypt() for bcrypt hashing which is compatible with Supabase.
*/

-- Ensure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 1: Delete old demo data
DELETE FROM public.appointments;
DELETE FROM public.time_slots;
DELETE FROM public.messages;
DELETE FROM public.conversations;
DELETE FROM public.connections;
DELETE FROM public.exhibitors;
DELETE FROM public.exhibitor_profiles;
DELETE FROM public.partner_profiles;
DELETE FROM public.visitor_profiles;
DELETE FROM public.notifications;
DELETE FROM public.registration_requests;
DELETE FROM public.user_favorites;
DELETE FROM public.users WHERE email IN (
  'admin.siports@siports.com',
  'exhibitor-54m@test.siport.com',
  'exhibitor-36m@test.siport.com',
  'exhibitor-18m@test.siport.com',
  'exhibitor-9m@test.siport.com',
  'partner-gold@test.siport.com',
  'partner-silver@test.siport.com',
  'partner-platinium@test.siport.com',
  'partner-museum@test.siport.com',
  'partner-porttech@test.siport.com',
  'partner-oceanfreight@test.siport.com',
  'partner-coastal@test.siport.com',
  'visitor-vip@test.siport.com',
  'visitor-premium@test.siport.com',
  'visitor-basic@test.siport.com',
  'visitor-free@test.siport.com'
);

DELETE FROM auth.users WHERE email IN (
  'admin.siports@siports.com',
  'exhibitor-54m@test.siport.com',
  'exhibitor-36m@test.siport.com',
  'exhibitor-18m@test.siport.com',
  'exhibitor-9m@test.siport.com',
  'partner-gold@test.siport.com',
  'partner-silver@test.siport.com',
  'partner-platinium@test.siport.com',
  'partner-museum@test.siport.com',
  'partner-porttech@test.siport.com',
  'partner-oceanfreight@test.siport.com',
  'partner-coastal@test.siport.com',
  'visitor-vip@test.siport.com',
  'visitor-premium@test.siport.com',
  'visitor-basic@test.siport.com',
  'visitor-free@test.siport.com'
);

-- Step 2: Create demo accounts with bcrypt-hashed passwords
-- All accounts use password: Admin123!

-- Admin
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin.siports@siports.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin.siports@siports.com',
  'Admin SIPORTS',
  'admin',
  'active',
  jsonb_build_object('role', 'administrator'),
  NOW(),
  NOW()
);

-- Exhibitors (54m², 36m², 18m², 9m²)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'exhibitor-54m@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000003', 'exhibitor-36m@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000004', 'exhibitor-18m@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000017', 'exhibitor-9m@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'exhibitor-54m@test.siport.com', 'ABB Marine & Ports', 'exhibitor', 'active', jsonb_build_object('sector', 'Technology'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'exhibitor-36m@test.siport.com', 'Advanced Port Systems', 'exhibitor', 'active', jsonb_build_object('sector', 'Automation'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'exhibitor-18m@test.siport.com', 'Maritime Equipment Co', 'exhibitor', 'active', jsonb_build_object('sector', 'Equipment'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000017', 'exhibitor-9m@test.siport.com', 'StartUp Port Innovations', 'exhibitor', 'active', jsonb_build_object('sector', 'IoT'), NOW(), NOW());

-- Partners
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES 
  ('00000000-0000-0000-0000-000000000005', 'partner-gold@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000006', 'partner-silver@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000011', 'partner-platinium@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000012', 'partner-museum@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000013', 'partner-porttech@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000014', 'partner-oceanfreight@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000015', 'partner-coastal@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000005', 'partner-gold@test.siport.com', 'Gold Partner Industries', 'partner', 'active', jsonb_build_object('level', 'gold'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000006', 'partner-silver@test.siport.com', 'Silver Tech Group', 'partner', 'active', jsonb_build_object('level', 'silver'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000011', 'partner-platinium@test.siport.com', 'Platinium Global Corp', 'partner', 'active', jsonb_build_object('level', 'platinium'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', 'partner-museum@test.siport.com', 'Museum Cultural Center', 'partner', 'active', jsonb_build_object('level', 'museum'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000013', 'partner-porttech@test.siport.com', 'PortTech Solutions', 'partner', 'active', jsonb_build_object('level', 'porttech'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000014', 'partner-oceanfreight@test.siport.com', 'OceanFreight Logistics', 'partner', 'active', jsonb_build_object('level', 'oceanfreight'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000015', 'partner-coastal@test.siport.com', 'Coastal Maritime Services', 'partner', 'active', jsonb_build_object('level', 'coastal'), NOW(), NOW());

-- Visitors
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES 
  ('00000000-0000-0000-0000-000000000007', 'visitor-vip@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000008', 'visitor-premium@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000009', 'visitor-basic@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000010', 'visitor-free@test.siport.com', crypt('Admin123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');

INSERT INTO public.users (id, email, name, type, status, profile, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000007', 'visitor-vip@test.siport.com', 'VIP Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'vip'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000008', 'visitor-premium@test.siport.com', 'Premium Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'premium'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000009', 'visitor-basic@test.siport.com', 'Basic Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'basic'), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000010', 'visitor-free@test.siport.com', 'Free Visitor', 'visitor', 'active', jsonb_build_object('visitor_level', 'free'), NOW(), NOW());

-- Verify accounts were created
SELECT COUNT(*) as created_accounts FROM auth.users WHERE email LIKE '%@test.siport.com' OR email LIKE '%@siports.com';
