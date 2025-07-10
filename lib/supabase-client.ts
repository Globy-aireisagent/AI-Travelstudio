import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Lazily creates a Supabase **service-role** client.
 * Throws a clear runtime error if the required env vars are missing.
 */
export function getSupabaseServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      "❌ Supabase environment variables missing. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
    )
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * OPTIONAL: browser-side anonymous client
 * (not used in these API routes but kept for future frontend use)
 */
export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      "❌ Supabase environment variables missing. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )
  }

  return createClient(url, anonKey)
}
