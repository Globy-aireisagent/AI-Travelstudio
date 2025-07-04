import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const destination = searchParams.get("destination")
    const category = searchParams.get("category")
    const status = searchParams.get("status") || "ACTIVE"

    console.log(`💡 Fetching travel ideas (limit: ${limit}, offset: ${offset})`)

    let query = supabase
      .from("travel_ideas")
      .select("*")
      .eq("status", status)
      .order("webhook_received_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (destination) {
      query = query.ilike("destination", `%${destination}%`)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("❌ Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch travel ideas" }, { status: 500 })
    }

    console.log(`✅ Found ${data?.length || 0} travel ideas`)

    return NextResponse.json({
      success: true,
      ideas:
        data?.map((idea) => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          destination: idea.destination,
          durationDays: idea.duration_days,
          priceFrom: idea.price_from,
          priceTo: idea.price_to,
          currency: idea.currency,
          category: idea.category,
          tags: idea.tags,
          images: idea.images,
          highlights: idea.highlights,
          includedServices: idea.included_services,
          webhookReceivedAt: idea.webhook_received_at,
          micrositeSource: idea.microsite_source,
        })) || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching travel ideas:", error)
    return NextResponse.json({ error: "Failed to fetch travel ideas" }, { status: 500 })
  }
}
