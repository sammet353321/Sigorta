import { supabase } from '../lib/supabase';

export async function logActivity(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: any
) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      // ip_address and user_agent are handled by RLS or trigger usually, 
      // but if we want to store them explicitly we need to fetch them.
      // For now, we'll store user_agent from browser.
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
