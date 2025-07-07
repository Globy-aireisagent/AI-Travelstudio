import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase.from("travel_ideas").select("*").eq("id", params.id).single()

    if (error) {
      console.error("❌ Error fetching travel idea:", error)
      return NextResponse.json({ error: "Travel idea not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("❌ Travel idea GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("travel_ideas")
      .update({
        title: body.title,
        description: body.description,
        destination: body.destination,
        duration_days: body.durationDays,
        price_from: body.priceFrom,
        price_to: body.priceTo,
        currency: body.currency,
        category: body.category,
        tags: body.tags,
        images: body.images,
        highlights: body.highlights,
        included_services: body.includedServices,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("❌ Error updating travel idea:", error)
      return NextResponse.json({ error: "Failed to update travel idea" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: "Travel idea updated successfully",
    })
  } catch (error) {
    console.error("❌ Travel idea PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("travel_ideas").delete().eq("id", params.id)

    if (error) {
      console.error("❌ Error deleting travel idea:", error)
      return NextResponse.json({ error: "Failed to delete travel idea" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Travel idea deleted successfully",
    })
  } catch (error) {
    console.error("❌ Travel idea DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
