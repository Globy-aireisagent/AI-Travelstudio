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
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

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
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Server-side client creation function
export function createServerClient() {
  if (!supabaseServiceKey) {
    console.warn("Missing SUPABASE_SERVICE_ROLE_KEY, falling back to anon key")
    return createSupabaseClient(supabaseUrl, supabaseAnonKey)
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceKey)
}

// Default export for backward compatibility
export default createClient()

// Database types
export type Database = {
  public: {
    Tables: {
      feature_requests: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          priority: "low" | "medium" | "high"
          status: "pending" | "in_progress" | "completed" | "rejected"
          votes: number
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          priority?: "low" | "medium" | "high"
          status?: "pending" | "in_progress" | "completed" | "rejected"
          votes?: number
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          priority?: "low" | "medium" | "high"
          status?: "pending" | "in_progress" | "completed" | "rejected"
          votes?: number
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      feature_comments: {
        Row: {
          id: string
          feature_request_id: string
          comment: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          feature_request_id: string
          comment: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          feature_request_id?: string
          comment?: string
          created_at?: string
          created_by?: string
        }
      }
      feature_votes: {
        Row: {
          id: string
          feature_request_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          feature_request_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          feature_request_id?: string
          user_id?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: "user" | "admin" | "super_admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: "user" | "admin" | "super_admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: "user" | "admin" | "super_admin"
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          booking_reference: string
          user_id: string
          title: string
          description: string
          status: "pending" | "confirmed" | "cancelled" | "completed"
          total_amount: number
          currency: string
          travel_date: string
          created_at: string
          updated_at: string
          booking_data: any
        }
        Insert: {
          id?: string
          booking_reference: string
          user_id: string
          title: string
          description?: string
          status?: "pending" | "confirmed" | "cancelled" | "completed"
          total_amount?: number
          currency?: string
          travel_date: string
          created_at?: string
          updated_at?: string
          booking_data?: any
        }
        Update: {
          id?: string
          booking_reference?: string
          user_id?: string
          title?: string
          description?: string
          status?: "pending" | "confirmed" | "cancelled" | "completed"
          total_amount?: number
          currency?: string
          travel_date?: string
          created_at?: string
          updated_at?: string
          booking_data?: any
        }
      }
      travel_ideas: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          destination: string
          duration: number
          budget: number
          currency: string
          status: "draft" | "published" | "archived"
          created_at: string
          updated_at: string
          idea_data: any
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          destination: string
          duration: number
          budget?: number
          currency?: string
          status?: "draft" | "published" | "archived"
          created_at?: string
          updated_at?: string
          idea_data?: any
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          destination?: string
          duration?: number
          budget?: number
          currency?: string
          status?: "draft" | "published" | "archived"
          created_at?: string
          updated_at?: string
          idea_data?: any
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
