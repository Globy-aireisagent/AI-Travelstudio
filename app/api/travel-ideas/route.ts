import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const destination = searchParams.get("destination")
    const category = searchParams.get("category")

    let query = supabase
      .from("travel_ideas")
      .select("*")
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (destination) {
      query = query.ilike("destination", `%${destination}%`)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("❌ Error fetching travel ideas:", error)
      return NextResponse.json({ error: "Failed to fetch travel ideas" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("❌ Travel ideas API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("travel_ideas")
      .insert({
        title: body.title,
        description: body.description,
        destination: body.destination,
        duration_days: body.durationDays || 7,
        price_from: body.priceFrom || 0,
        price_to: body.priceTo || 0,
        currency: body.currency || "EUR",
        category: body.category || "General",
        tags: body.tags || [],
        images: body.images || [],
        highlights: body.highlights || [],
        included_services: body.includedServices || [],
        microsite_source: body.micrositeSource || "manual",
        status: "ACTIVE",
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Error creating travel idea:", error)
      return NextResponse.json({ error: "Failed to create travel idea" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: "Travel idea created successfully",
    })
  } catch (error) {
    console.error("❌ Travel ideas POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
