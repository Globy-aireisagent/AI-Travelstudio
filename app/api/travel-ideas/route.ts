import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) return null
  if (!serviceKey && !anonKey) return null

  return createClient(url, serviceKey ?? anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const destination = searchParams.get("destination")
    const category = searchParams.get("category")

    const supabase = getSupabase()

    if (!supabase) {
      // Return demo data when database is not configured
      const demoIdeas = [
        {
          id: "demo-idea-1",
          title: "Authentiek Japan Avontuur",
          description: "Ontdek de verborgen schatten van Japan",
          destination: "Tokyo, Kyoto, Osaka",
          duration_days: 10,
          price_from: 2500,
          price_to: 3500,
          currency: "EUR",
          category: "cultuur",
          status: "published",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-05T00:00:00Z",
        },
        {
          id: "demo-idea-2",
          title: "Safari Avontuur Kenya",
          description: "Wilde dieren in hun natuurlijke habitat",
          destination: "Masai Mara, Amboseli",
          duration_days: 8,
          price_from: 3800,
          price_to: 4500,
          currency: "EUR",
          category: "natuur",
          status: "published",
          created_at: "2025-01-02T00:00:00Z",
          updated_at: "2025-01-04T00:00:00Z",
        },
      ]

      return NextResponse.json({
        success: true,
        ideas: demoIdeas,
        total: demoIdeas.length,
        page,
        limit,
        totalPages: 1,
      })
    }

    let query = supabase.from("travel_ideas").select("*", { count: "exact" })

    if (destination) {
      query = query.ilike("destination", `%${destination}%`)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: ideas, error, count } = await query.range(from, to).order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching travel ideas:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch travel ideas" }, { status: 500 })
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      ideas: ideas || [],
      total: count || 0,
      page,
      limit,
      totalPages,
    })
  } catch (error) {
    console.error("Error in travel ideas API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()

    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()

    const { data: idea, error } = await supabase.from("travel_ideas").insert(body).select().single()

    if (error) {
      console.error("Error creating travel idea:", error)
      return NextResponse.json({ success: false, error: "Failed to create travel idea" }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        idea,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating travel idea:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
