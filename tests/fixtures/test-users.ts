/**
 * Fixtures de données pour les tests E2E
 * Contient les utilisateurs de test pour chaque type de compte
 * 
 * ⚠️ IMPORTANT: Les mots de passe sont chargés depuis les variables d'environnement
 * pour des raisons de sécurité. Ne jamais hardcoder les mots de passe en production.
 */

const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

export const TEST_USERS = {
  admin: {
    email: 'admin.siports@siports.com',
    password: TEST_PASSWORD,
    firstName: 'Admin',
    lastName: 'SIPORTS',
    type: 'admin'
  },

  visitor: {
    email: 'visiteur@siports.com',
    password: TEST_PASSWORD,
    firstName: 'Jean',
    lastName: 'Visiteur',
    type: 'visitor',
    company: 'Test Company',
    position: 'Directeur Général / CEO',
    phone: '+33612345678',
    country: 'FR'
  },

  exhibitor: {
    email: 'exposant@siports.com',
    password: TEST_PASSWORD,
    firstName: 'Marie',
    lastName: 'Exposant',
    type: 'exhibitor',
    company: 'Expo Test SA',
    position: 'Responsable Commercial',
    phone: '+33698765432',
    country: 'FR'
  },

  partner: {
    email: 'partenaire@siports.com',
    password: TEST_PASSWORD,
    firstName: 'Pierre',
    lastName: 'Partenaire',
    type: 'partner',
    company: 'Partner Corp',
    position: 'Directeur des Partenariats',
    phone: '+33687654321',
    country: 'FR'
  },

  // Nouveaux utilisateurs pour tests d'inscription
  newVisitor: {
    email: `visitor-${Date.now()}@test.com`,
    password: TEST_PASSWORD,
    firstName: 'Test',
    lastName: 'Visitor',
    type: 'visitor',
    company: 'Test Visitor Company',
    position: 'Consultant',
    phone: '+33611223344',
    country: 'FR',
    description: 'Description de test pour le visiteur avec plus de 50 caractères pour respecter la validation.',
    objectives: ['Découvrir les innovations portuaires', 'Assister aux conférences'],
    accountType: 'visitor'
  },

  newExhibitor: {
    email: `exhibitor-${Date.now()}@test.com`,
    password: 'TestExhibitor123!',
    firstName: 'Test',
    lastName: 'Exhibitor',
    type: 'exhibitor',
    companyName: 'Test Exhibitor Corp',
    position: 'CEO',
    phone: '+33655443322',
    country: 'FR',
    sectors: ['technologie', 'logistique'],
    companyDescription: 'Description de test pour exposant avec au moins 20 caractères minimum.',
    website: 'https://test-exhibitor.com'
  },

  newPartner: {
    email: `partner-${Date.now()}@test.com`,
    password: 'TestPartner123!',
    firstName: 'Test',
    lastName: 'Partner',
    type: 'partner',
    companyName: 'Test Partner Inc',
    position: 'Director',
    phone: '+33644556677',
    country: 'FR',
    sectors: ['finance', 'services'],
    companyDescription: 'Description de test pour partenaire avec au moins 20 caractères.',
    partnershipType: 'institutional',
    website: 'https://test-partner.com'
  }
};

export const TEST_EVENT = {
  title: 'Conférence de Test E2E',
  description: 'Une conférence de test créée automatiquement par les tests E2E',
  type: 'conference',
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2h
  capacity: 100,
  location: 'Salle de test',
  tags: ['test', 'e2e', 'automation']
};

export const TEST_APPOINTMENT = {
  duration: 30, // minutes
  notes: 'Rendez-vous de test créé par les tests E2E'
};
