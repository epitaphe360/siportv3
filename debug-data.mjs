import fetch from 'node-fetch';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE';

async function checkExhibitors() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/exhibitors?select=id,company_name,verified,created_at&order=created_at.desc`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });

  const exhibitors = await response.json();
  console.log('--- RECENT EXHIBITORS ---');
  exhibitors.forEach(e => {
    console.log(`[${e.created_at}] ${e.company_name} (Verified: ${e.verified}) ID: ${e.id}`);
  });
}

checkExhibitors();
