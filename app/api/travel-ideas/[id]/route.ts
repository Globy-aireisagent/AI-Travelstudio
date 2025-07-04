import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ideaId = params.id
    console.log(`💡 Fetching travel idea: ${ideaId}`)

    const { data, error } = await supabase.from("travel_ideas").select("*").eq("id", ideaId).single()

    if (error) {
      console.error("❌ Supabase error:", error)
      return NextResponse.json({ error: "Travel idea not found" }, { status: 404 })
    }

    if (!data) {
      return NextResponse.json({ error: "Travel idea not found" }, { status: 404 })
    }

    console.log(`✅ Travel idea found: ${data.id}`)

    return NextResponse.json({
      success: true,
      idea: {
        id: data.id,
        title: data.title,
        description: data.description,
        destination: data.destination,
        durationDays: data.duration_days,
        priceFrom: data.price_from,
        priceTo: data.price_to,
        currency: data.currency,
        category: data.category,
        tags: data.tags,
        images: data.images,
        highlights: data.highlights,
        includedServices: data.included_services,
        webhookReceivedAt: data.webhook_received_at,
        micrositeSource: data.microsite_source,
        status: data.status,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching travel idea:", error)
    return NextResponse.json({ error: "Failed to fetch travel idea" }, { status: 500 })
  }
}
