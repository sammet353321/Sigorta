// supabase/functions/auto-delete-documents/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  try {
    const { data: policies, error: fetchError } = await supabase
      .from('policies')
      .select('quote_id')
      .lt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // 1 hour ago

    if (fetchError) throw fetchError;
    
    if (!policies || policies.length === 0) {
      return new Response('No policies to process', { status: 200 });
    }

    const results = [];

    for (const policy of policies) {
      // 1. Delete document URL from quotes
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ document_url: null, document_uploaded_at: null })
        .eq('id', policy.quote_id);
      
      if (updateError) {
        console.error(`Error updating quote ${policy.quote_id}:`, updateError);
        continue;
      }

      // 2. Delete from storage (assuming file path structure)
      // Note: We need to know the file path. In our schema, we only store document_url.
      // If the path is predictable like `quote_id/filename`, we can try to list and delete.
      // Here we assume we list files in the folder named after quote_id
      
      const { data: files, error: listError } = await supabase.storage
        .from('documents')
        .list(`${policy.quote_id}`);

      if (listError) {
        console.error(`Error listing files for ${policy.quote_id}:`, listError);
        continue;
      }

      if (files && files.length > 0) {
        const filesToRemove = files.map(f => `${policy.quote_id}/${f.name}`);
        const { error: removeError } = await supabase.storage
          .from('documents')
          .remove(filesToRemove);
          
        if (removeError) {
          console.error(`Error removing files for ${policy.quote_id}:`, removeError);
        } else {
          results.push(`Cleaned up quote ${policy.quote_id}`);
        }
      }
    }
    
    return new Response(JSON.stringify({ message: 'Cleanup complete', results }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Schedule with cron: 0 * * * * (every hour)
