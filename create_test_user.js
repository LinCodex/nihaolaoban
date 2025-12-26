
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load env vars
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY from process.env');
    // Try manual read
    try {
        const envConfig = fs.readFileSync('.env', 'utf8');
        for (const line of envConfig.split('\n')) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    } catch (e) {
        console.error('Failed to read .env manually');
    }
}

// Re-check
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('FATAL: Missing env vars.');
    process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
    console.log('Creating test user (test@nihaolaoban.com)...');

    const { data, error } = await supabase.auth.signUp({
        email: 'test@nihaolaoban.com',
        password: 'test123',
        options: {
            data: {
                full_name: 'NY A+ TEAM',
                role: 'dealer'
            }
        }
    });

    if (error) {
        console.error('Signup Error:', error.message);
    } else {
        console.log('Signup Successful!');
        console.log('User ID:', data.user?.id);
    }

    console.log('\nrun this SQL to ensure permissions:');
    console.log(`UPDATE profiles SET role = 'dealer', full_name = 'NY A+ TEAM' WHERE email = 'test@nihaolaoban.com';`);
}

run();
