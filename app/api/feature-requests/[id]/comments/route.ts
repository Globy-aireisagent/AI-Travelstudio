import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("feature_comments")
      .select("*")
      .eq("feature_id", params.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { comment, user_id } = body

    // Validation
    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if feature request exists
    const { data: feature, error: featureError } = await supabase
      .from("feature_requests")
      .select("id")
      .eq("id", params.id)
      .single()

    if (featureError || !feature) {
      return NextResponse.json({ error: "Feature request not found" }, { status: 404 })
    }

    // Create comment
    const { data, error } = await supabase
      .from("feature_comments")
      .insert([
        {
          feature_id: params.id,
          user_id,
          comment: comment.trim(),
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
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
