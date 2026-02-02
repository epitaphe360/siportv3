
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUsers() {
    let output = '--- USERS CHECK ---\n';
    const { data: users, error } = await supabase.from('users').select('id, email, name, type');
    if (error) {
        output += `Error: ${error.message}\n`;
    } else {
        users.forEach(u => output += `- ${u.name} (${u.email}) [${u.type}]\n`);
    }
    fs.writeFileSync('users_output.txt', output);
    console.log('Output written to users_output.txt');
}

checkUsers();
