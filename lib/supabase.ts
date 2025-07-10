import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client (for API routes)
export const supabaseServer = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)

// Types for our database tables
export interface ConversationLog {
  id: string
  booking_id: string
  user_message: string
  globy_response: string
  response_time_ms: number
  cached: boolean
  created_at: string
  updated_at: string
}

export interface ResponseCache {
  id: string
  booking_id: string
  question_hash: string
  cached_response: string
  created_at: string
  expires_at: string
}

// Database operations
export class ConversationDatabase {
  static async saveConversation(log: Omit<ConversationLog, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("conversation_logs").insert([log]).select().single()

    if (error) throw error
    return data
  }

  static async getConversationHistory(bookingId: string, limit = 50) {
    const { data, error } = await supabase
      .from("conversation_logs")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  static async getCachedResponse(bookingId: string, questionHash: string) {
    const { data, error } = await supabase
      .from("response_cache")
      .select("*")
      .eq("booking_id", bookingId)
      .eq("question_hash", questionHash)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  static async setCachedResponse(cache: Omit<ResponseCache, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("response_cache")
      .upsert([cache], { onConflict: "booking_id,question_hash" })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async cleanupExpiredCache() {
    const { error } = await supabase.rpc("cleanup_expired_cache")
    if (error) throw error
  }
}
