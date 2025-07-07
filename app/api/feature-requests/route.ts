import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("feature_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching feature requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, priority, status, created_by, user_id } = body

    // Validation
    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    if (!["feature", "enhancement", "bug", "improvement"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    if (!["low", "medium", "high", "critical"].includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
    }

    if (!["pending", "submitted", "in_progress", "completed", "rejected", "on_hold"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from("feature_requests")
      .insert([
        {
          title,
          description,
          category,
          priority,
          status: status || "pending",
          created_by: created_by || "anonymous",
          user_id: user_id || null,
          votes: 0,
          upvotes: 0,
          downvotes: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating feature request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
