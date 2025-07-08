import { neon } from "@neondatabase/serverless"

// Sanitize DATABASE_URL (strip optional "psql " prefix and surrounding quotes)
const raw = process.env.DATABASE_URL ?? ""
const sanitized = raw
  .trim()
  .replace(/^psql\s+/, "") // verwijder eventueel "psql "
  .replace(/^['"]|['"]$/g, "") // verwijder omringende quotes

const sql = neon(sanitized)

if (!/^postgres(ql)?:\/\//.test(sanitized)) {
  console.error("❌  DATABASE_URL lijkt niet op een geldige PostgreSQL-URL:", sanitized)
}

export { sql }

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return !!process.env.DATABASE_URL
}

// Safe query wrapper
export async function safeQuery<T = any>(
  query: string,
  params: any[] = [],
): Promise<{ data: T[] | null; error: string | null }> {
  try {
    if (!isDatabaseAvailable()) {
      return { data: null, error: "Database not configured" }
    }

    const result = await sql(query, params)
    return { data: result as T[], error: null }
  } catch (error) {
    console.error("Database query error:", error)
    return { data: null, error: error instanceof Error ? error.message : "Unknown database error" }
  }
}

// Database schema types
export interface User {
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

export interface Booking {
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

export interface TravelIdea {
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

export interface FeatureRequest {
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
