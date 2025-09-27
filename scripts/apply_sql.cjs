#!/usr/bin/env node
require('dotenv').config();
const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');
const { Client } = require('pg');

async function main() {
  // allow CLI override --database-url
  const argv = process.argv;
  const dbIdx = argv.indexOf('--database-url');
  const databaseUrl = (dbIdx !== -1 && argv[dbIdx + 1]) ? argv[dbIdx + 1] : (process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL);
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL or SUPABASE_DATABASE_URL must be set in the environment');
    console.error('You can set it in a .env file or export it in your shell. Example (PowerShell):');
    console.error('\n$env:DATABASE_URL = "postgres://..."; node scripts/apply_sql.cjs\n');
    process.exit(2);
  }

  // Diagnostic: show a masked version of the DATABASE_URL to help detect malformed placeholders
  try {
    const masked = databaseUrl.replace(/(postgres:\/\/)([^:]+):([^@]+)@/, (m, p, user, pass) => `${p}${user}:****@`);
    console.log('Using DATABASE_URL:', masked);
  } catch (e) {
    console.warn('Could not mask DATABASE_URL (non-standard format)');
  }

  // Basic validation: ensure the URL parses via URL constructor
  try {
    new URL(databaseUrl);
  } catch (err) {
    console.error('ERROR: DATABASE_URL does not appear to be a valid URL. Raw value:');
    console.error(databaseUrl);
    console.error('If you are using placeholder text (host:port), replace with a real connection string or set DATABASE_URL in your shell.');
    process.exit(3);
  }

  const continueOnError = process.argv.includes('--continue-on-error');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const sqlDir = join(__dirname, '..', 'supabase');
  const files = readdirSync(sqlDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const path = join(sqlDir, file);
    console.log('\n--- Applying', file, '---');
    const sql = readFileSync(path, 'utf8');
    console.log('Preview:', sql.slice(0, 200).replace(/\n/g, ' ') + (sql.length > 200 ? '...': ''));
    try {
      await client.query(sql);
      console.log('Applied', file);
    } catch (err) {
      console.error('Error applying', file, '\n', (err && err.message) || err);
      if (!continueOnError) {
        await client.end();
        process.exit(3);
      } else {
        console.warn('Continuing despite error ( --continue-on-error ).');
      }
    }
  }

  await client.end();
  console.log('\nAll SQL files processed. If errors occurred, review logs above.');
}

main().catch(err => { console.error(err); process.exit(1); });
