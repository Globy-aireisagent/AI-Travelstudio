import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client (singleton pattern)
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return supabaseClient
}

// Server-side Supabase client (service role)
export function getSupabaseServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Database types
export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role: "agent" | "admin" | "super_admin"
  status: "pending_verification" | "active" | "inactive" | "suspended"
  travel_compositor_id?: string
  agency_name?: string
  agency_id?: string
  microsite_id?: string
  email_verified: boolean
  password_reset_required: boolean
  import_source?: string
  import_date?: string
  created_at: string
  updated_at: string
  last_login?: string
}

export interface ImportedBooking {
  id: string
  user_id: string
  tc_booking_id: string
  tc_microsite_id: string
  booking_reference?: string
  title?: string
  destination?: string
  start_date?: string
  end_date?: string
  status?: string
  total_price?: number
  currency?: string
  client_name?: string
  client_email?: string
  client_phone?: string
  imported_at: string
  last_synced: string
  full_data?: any
}

export interface ImportedTravelIdea {
  id: string
  user_id: string
  tc_idea_id: string
  tc_microsite_id: string
  title?: string
  description?: string
  image_url?: string
  destination?: string
  departure_date?: string
  price_per_person?: number
  currency?: string
  imported_at: string
  last_synced: string
  full_data?: any
}
