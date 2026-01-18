import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// We need SERVICE_ROLE_KEY to create users directly without confirmation
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhaHljem1heGV0dm1nbmxxdWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzUzNTI2OCwiZXhwIjoyMDgzMTExMjY4fQ.HqCYLlzmkYtDzxw4_XHQa15EP_EuQlY702h5mqAnUdQ'; 

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedAdmin() {
  const email = 'admin@sigorta.com';
  const password = 'admin123'; // Basit bir şifre
  const full_name = 'Sistem Yöneticisi';
  
  console.log(`Creating admin user: ${email}...`);

  try {
    // 1. Create Auth User
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'admin' }
    });

    if (createError) {
      console.error('Error creating auth user:', createError.message);
      return;
    }

    if (!user) {
      console.error('User creation failed (no user returned)');
      return;
    }

    console.log('Auth user created. ID:', user.id);

    // 2. Create Public Profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email,
        full_name,
        role: 'admin',
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating public profile:', profileError.message);
    } else {
      console.log('Public profile created successfully!');
      console.log('-----------------------------------');
      console.log('Login credentials:');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('-----------------------------------');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

seedAdmin();
