import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/** Returns a browser/edge-safe Supabase client (anon key) */
export function getBrowserSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("❌ Supabase env-vars NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing")
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client (voor API routes)
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

export interface Booking {
  id: string
  user_id: string
  tc_booking_id: string
  booking_reference?: string
  microsite_id?: string
  title?: string
  destination?: string
  start_date?: string
  end_date?: string
  status: string
  client_name?: string
  client_email?: string
  client_phone?: string
  total_price?: number
  currency: string
  accommodations: any[]
  activities: any[]
  transports: any[]
  vouchers: any[]
  imported_at: string
  original_data?: any
  created_at: string
  updated_at: string
}

export interface TravelIdea {
  id: string
  user_id: string
  tc_idea_id: string
  microsite_id?: string
  title?: string
  description?: string
  image_url?: string
  creation_date?: string
  departure_date?: string
  price_per_person: { amount: number; currency: string }
  total_price: { amount: number; currency: string }
  themes: any[]
  destinations: any[]
  customer: any
  counters: any
  imported_at: string
  original_data?: any
  created_at: string
  updated_at: string
}
