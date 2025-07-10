import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Client-side Supabase client (uses anon key)
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Server-side Supabase client (uses service role key)
export const supabaseAdmin = supabaseServiceKey
  ? createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Returns a server-side Supabase client that uses the service-role key.
 * Useful inside API routes, Server Actions, etc.
 */
export function getSupabaseServiceClient() {
  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Client-side Supabase client creation function
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Server-side client creation function
export function createServerClient() {
  if (!supabaseServiceKey) {
    console.warn("Missing SUPABASE_SERVICE_ROLE_KEY, falling back to anon key")
    return createSupabaseClient(supabaseUrl, supabaseAnonKey)
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Default export for backward compatibility
export default supabase

// Database types
export type Database = {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string
          name: string
          code: string | null
          contact_email: string | null
          contact_phone: string | null
          address: any
          settings: any
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: any
          settings?: any
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: any
          settings?: any
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          name: string | null
          role: "admin" | "agent" | "client" | "super_admin"
          status: "active" | "inactive" | "pending_verification" | "suspended"
          travel_compositor_id: string | null
          agency_name: string | null
          agency_id: string | null
          microsite_id: string | null
          email_verified: boolean
          password_reset_required: boolean
          import_source: string | null
          import_date: string | null
          last_login: string | null
          profile_data: any
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          name?: string | null
          role?: "admin" | "agent" | "client" | "super_admin"
          status?: "active" | "inactive" | "pending_verification" | "suspended"
          travel_compositor_id?: string | null
          agency_name?: string | null
          agency_id?: string | null
          microsite_id?: string | null
          email_verified?: boolean
          password_reset_required?: boolean
          import_source?: string | null
          import_date?: string | null
          last_login?: string | null
          profile_data?: any
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          name?: string | null
          role?: "admin" | "agent" | "client" | "super_admin"
          status?: "active" | "inactive" | "pending_verification" | "suspended"
          travel_compositor_id?: string | null
          agency_name?: string | null
          agency_id?: string | null
          microsite_id?: string | null
          email_verified?: boolean
          password_reset_required?: boolean
          import_source?: string | null
          import_date?: string | null
          last_login?: string | null
          profile_data?: any
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      feature_requests: {
        Row: {
          id: string
          title: string
          description: string | null
          user_id: string
          category: "enhancement" | "bug" | "feature" | "improvement"
          priority: "low" | "medium" | "high" | "critical"
          status: "open" | "in_progress" | "completed" | "rejected" | "on_hold"
          votes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          user_id: string
          category?: "enhancement" | "bug" | "feature" | "improvement"
          priority?: "low" | "medium" | "high" | "critical"
          status?: "open" | "in_progress" | "completed" | "rejected" | "on_hold"
          votes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          user_id?: string
          category?: "enhancement" | "bug" | "feature" | "improvement"
          priority?: "low" | "medium" | "high" | "critical"
          status?: "open" | "in_progress" | "completed" | "rejected" | "on_hold"
          votes?: number
          created_at?: string
          updated_at?: string
        }
      }
      feature_votes: {
        Row: {
          id: string
          feature_id: string
          user_id: string
          vote_type: "up" | "down"
          created_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          user_id: string
          vote_type: "up" | "down"
          created_at?: string
        }
        Update: {
          id?: string
          feature_id?: string
          user_id?: string
          vote_type?: "up" | "down"
          created_at?: string
        }
      }
      feature_comments: {
        Row: {
          id: string
          feature_id: string
          user_id: string
          user_name: string
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          feature_id: string
          user_id: string
          user_name: string
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          feature_id?: string
          user_id?: string
          user_name?: string
          comment?: string
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          booking_reference: string | null
          user_id: string | null
          agency_id: string | null
          status: "active" | "cancelled" | "completed" | "pending"
          destination: string | null
          microsite_source: string | null
          start_date: string | null
          end_date: string | null
          total_price: number
          currency: string
          accommodations: any
          activities: any
          transports: any
          vouchers: any
          raw_data: any
          webhook_received_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_reference?: string | null
          user_id?: string | null
          agency_id?: string | null
          status?: "active" | "cancelled" | "completed" | "pending"
          destination?: string | null
          microsite_source?: string | null
          start_date?: string | null
          end_date?: string | null
          total_price?: number
          currency?: string
          accommodations?: any
          activities?: any
          transports?: any
          vouchers?: any
          raw_data?: any
          webhook_received_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_reference?: string | null
          user_id?: string | null
          agency_id?: string | null
          status?: "active" | "cancelled" | "completed" | "pending"
          destination?: string | null
          microsite_source?: string | null
          start_date?: string | null
          end_date?: string | null
          total_price?: number
          currency?: string
          accommodations?: any
          activities?: any
          transports?: any
          vouchers?: any
          raw_data?: any
          webhook_received_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      travel_ideas: {
        Row: {
          id: string
          title: string
          description: string | null
          destination: string | null
          duration_days: number | null
          price_from: number
          price_to: number
          currency: string
          category: string | null
          tags: any
          images: any
          highlights: any
          included_services: any
          raw_data: any
          webhook_received_at: string
          microsite_source: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          destination?: string | null
          duration_days?: number | null
          price_from?: number
          price_to?: number
          currency?: string
          category?: string | null
          tags?: any
          images?: any
          highlights?: any
          included_services?: any
          raw_data?: any
          webhook_received_at?: string
          microsite_source?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          destination?: string | null
          duration_days?: number | null
          price_from?: number
          price_to?: number
          currency?: string
          category?: string | null
          tags?: any
          images?: any
          highlights?: any
          included_services?: any
          raw_data?: any
          webhook_received_at?: string
          microsite_source?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      webhook_events: {
        Row: {
          id: string
          event_type: string
          source: string
          payload: any
          processed: boolean
          processed_at: string | null
          error_message: string | null
          retry_count: number
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          source: string
          payload: any
          processed?: boolean
          processed_at?: string | null
          error_message?: string | null
          retry_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          source?: string
          payload?: any
          processed?: boolean
          processed_at?: string | null
          error_message?: string | null
          retry_count?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
