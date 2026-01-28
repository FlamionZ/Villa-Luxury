import { getSupabaseAdmin } from '@/lib/supabase';

export function getDbConnection() {
  return getSupabaseAdmin();
}

export async function closeDbConnection(): Promise<void> {
  return;
}