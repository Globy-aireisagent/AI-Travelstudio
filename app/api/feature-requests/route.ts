import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const missingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (missingEnv) {
    return NextResponse.json({ success: true, data: [] })
  }

  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("feature_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ success: false, error: "Supabase configuration error" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error("Error fetching feature requests:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const missingEnv = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  try {
    const body = await request.json()
    const { title, description, category, priority, status, created_by, user_id } = body

    // Validation
    if (!title || !description) {
      return NextResponse.json({ success: false, error: "Title and description are required" }, { status: 400 })
    }

    // Validate category
    const validCategories = ["ai", "mobile", "feature", "ui", "analytics", "technical", "integration", "general"]
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ success: false, error: "Invalid category" }, { status: 400 })
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high", "urgent", "critical"]
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ success: false, error: "Invalid priority" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["pending", "submitted", "in_progress", "completed", "rejected", "on_hold"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
    }

    if (missingEnv) {
      return NextResponse.json({
        success: true,
        data: {
          id: crypto.randomUUID(),
          title,
          description,
          category: category || "feature",
          priority: priority || "medium",
          status: status || "pending",
          votes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: created_by || "anonymous",
        },
      })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("feature_requests")
      .insert([
        {
          title: title.trim(),
          description: description.trim(),
          category: category || "feature",
          priority: priority || "medium",
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
      return NextResponse.json({ success: false, error: "Supabase configuration error" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error("Error creating feature request:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
