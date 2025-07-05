import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"

const supabase = getSupabaseServiceClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const sortBy = searchParams.get("sortBy") || "vote_count"
    const order = searchParams.get("order") || "desc"

    let query = supabase.from("feature_requests").select("*")

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    // Sort by vote count, created date, or priority
    if (sortBy === "vote_count") {
      query = query.order("vote_count", { ascending: order === "asc" })
    } else if (sortBy === "created_at") {
      query = query.order("created_at", { ascending: order === "asc" })
    } else if (sortBy === "priority") {
      query = query.order("priority", { ascending: order === "asc" })
    }

    const { data: features, error } = await query

    if (error) {
      console.error("Error fetching feature requests:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Get vote counts and user votes
    const userEmail = searchParams.get("userEmail")
    let userVotes = []

    if (userEmail) {
      const { data: votes } = await supabase
        .from("feature_votes")
        .select("feature_request_id")
        .eq("voter_email", userEmail)

      userVotes = votes?.map((v) => v.feature_request_id) || []
    }

    return NextResponse.json({
      success: true,
      features: features || [],
      userVotes,
    })
  } catch (error) {
    console.error("Error in feature requests API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, priority, submitterEmail, submitterName } = body

    // Validate required fields
    if (!title || !description || !submitterEmail) {
      return NextResponse.json(
        { success: false, error: "Title, description, and submitter email are required" },
        { status: 400 },
      )
    }

    // Insert new feature request
    const { data: feature, error } = await supabase
      .from("feature_requests")
      .insert({
        title,
        description,
        category: category || "general",
        priority: priority || "medium",
        submitted_by_email: submitterEmail,
        submitted_by_name: submitterName,
        status: "pipeline",
        eta: "To be determined",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating feature request:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      feature,
      message: "Feature request submitted successfully!",
    })
  } catch (error) {
    console.error("Error in feature requests POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
