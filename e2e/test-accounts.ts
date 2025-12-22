/**
 * Comptes de test existants dans Supabase
 * Ces comptes sont déjà créés et prêts à être utilisés pour les tests E2E
 * Mot de passe par défaut: Test@1234567
 */

export const TEST_ACCOUNTS = {
  // Visiteurs
  visitor: {
    email: 'visitor1@test.com',
    password: 'Test@1234567',
    name: 'Sophie Bernard',
    type: 'visitor' as const
  },
  visitor2: {
    email: 'visitor2@test.com', 
    password: 'Test@1234567',
    name: 'Michel Leroy',
    type: 'visitor' as const
  },
  
  // Exposants par taille de stand
  exhibitor_9m: {
    email: 'exhibitor-9m@test.siport.com',
    password: 'Test@1234567',
    name: 'Thomas Dubois',
    type: 'exhibitor' as const,
    standArea: 9
  },
  exhibitor_18m: {
    email: 'exhibitor-18m@test.siport.com',
    password: 'Test@1234567',
    name: 'Sophie Lefebvre',
    type: 'exhibitor' as const,
    standArea: 18
  },
  exhibitor_36m: {
    email: 'exhibitor-36m@test.siport.com',
    password: 'Test@1234567',
    name: 'David Chen',
    type: 'exhibitor' as const,
    standArea: 36
  },
  exhibitor_54m: {
    email: 'exhibitor-54m@test.siport.com',
    password: 'Test@1234567',
    name: 'Lars Svensson',
    type: 'exhibitor' as const,
    standArea: 54
  },
  
  // Exposants génériques
  exhibitor: {
    email: 'exhibitor1@test.com',
    password: 'Test@1234567',
    name: 'Maritime Solutions Inc',
    type: 'exhibitor' as const
  },
  exhibitor2: {
    email: 'exhibitor2@test.com',
    password: 'Test@1234567', 
    name: 'Port Tech Systems',
    type: 'exhibitor' as const
  },
  
  // Partenaires
  partner: {
    email: 'nathalie.robert1@partner.com',
    password: 'Test@1234567',
    name: 'Nathalie Robert Consulting',
    type: 'partner' as const
  },
  partner2: {
    email: 'pierre.laurent2@partner.com',
    password: 'Test@1234567',
    name: 'Pierre Laurent Consulting',
    type: 'partner' as const
  },
  
  // Admin
  admin: {
    email: 'admin@siports.com',
    password: 'Test@1234567',
    name: 'Admin SIPORTS',
    type: 'admin' as const
  },
  adminTest: {
    email: 'admin-test@test.siport.com',
    password: 'Test@1234567',
    name: 'Admin Test',
    type: 'admin' as const
  }
};

// Mapping pour les anciens noms de comptes utilisés dans les tests
export const ACCOUNT_ALIASES = {
  'visitor-free@test.siport.com': TEST_ACCOUNTS.visitor,
  'visitor-vip@test.siport.com': TEST_ACCOUNTS.visitor2,
  'exhibitor-18m@test.siport.com': TEST_ACCOUNTS.exhibitor_18m,
  'admin-test@test.siport.com': TEST_ACCOUNTS.adminTest,
};

export type TestAccountKey = keyof typeof TEST_ACCOUNTS;
