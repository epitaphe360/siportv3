import fetch from 'node-fetch';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE';

const response = await fetch(`${SUPABASE_URL}/rest/v1/exhibitors?select=id,company_name,stand_number,stand_level&order=company_name.asc`, {
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`
  }
});

const exhibitors = await response.json();

console.log(`\n=== ${exhibitors.length} EXPOSANTS ===\n`);
exhibitors.forEach((e, i) => {
  console.log(`${i+1}. ${e.company_name} | Stand: ${e.stand_number} | Niveau: ${e.stand_level} | ID: ${e.id}`);
});
