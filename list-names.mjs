
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listExhibitors() {
    let output = '--- EXHIBITORS TABLE ---\n';
    const { data: exhibitors, error } = await supabase.from('exhibitors').select('id, company_name');
    if (error) {
        output += `Error: ${error.message}\n`;
    } else {
        exhibitors.forEach(e => output += `- ${e.company_name} (ID: ${e.id})\n`);
        output += `Total: ${exhibitors.length}\n`;
    }

    output += '\n--- EXHIBITOR_PROFILES TABLE ---\n';
    const { data: profiles, error: pError } = await supabase.from('exhibitor_profiles').select('id, company_name');
    if (pError) {
        output += `Error: ${pError.message}\n`;
    } else {
        profiles.forEach(p => output += `- ${p.company_name} (ID: ${p.id})\n`);
        output += `Total: ${profiles.length}\n`;
    }

    fs.writeFileSync('names_output.txt', output);
    console.log('Output written to names_output.txt');
}

listExhibitors();
