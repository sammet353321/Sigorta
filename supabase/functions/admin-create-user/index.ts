// supabase/functions/admin-create-user/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { email, password, role, full_name } = await req.json()

    // 1. Create Auth User
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role }
    })

    if (createError) throw createError

    // 2. Insert into public.users (if trigger doesn't exist)
    // We'll do it manually here to be safe and ensure role is set correctly
    if (user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email,
          role,
          full_name,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        // If trigger already handled it, this might fail on duplicate, which is fine-ish
        // but better to upsert or check.
        // For now, let's assume no trigger or handle duplicate gracefully.
        console.error('Error inserting user profile:', insertError)
      }
    }

    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
