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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabase()

    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    const { data: idea, error } = await supabase.from("travel_ideas").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching travel idea:", error)
      return NextResponse.json({ success: false, error: "Travel idea not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      idea,
    })
  } catch (error) {
    console.error("Error in travel idea API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabase()

    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()

    const { data: idea, error } = await supabase.from("travel_ideas").update(body).eq("id", params.id).select().single()

    if (error) {
      console.error("Error updating travel idea:", error)
      return NextResponse.json({ success: false, error: "Failed to update travel idea" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      idea,
    })
  } catch (error) {
    console.error("Error updating travel idea:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabase()

    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    const { error } = await supabase.from("travel_ideas").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting travel idea:", error)
      return NextResponse.json({ success: false, error: "Failed to delete travel idea" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Travel idea deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting travel idea:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
