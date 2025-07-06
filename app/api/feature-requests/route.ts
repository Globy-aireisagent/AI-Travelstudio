import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    let query = supabase.from("feature_requests").select("*")

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching feature requests:", error)
      return NextResponse.json({ error: "Failed to fetch feature requests" }, { status: 500 })
    }

    return NextResponse.json({ features: data })
  } catch (error) {
    console.error("Error in feature requests API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, priority, submitterName, submitterEmail } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("feature_requests")
      .insert([
        {
          title,
          description,
          category: category || "general",
          priority: priority || "medium",
          status: "submitted",
          submitter_name: submitterName,
          submitter_email: submitterEmail,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating feature request:", error)
      return NextResponse.json({ error: "Failed to create feature request" }, { status: 500 })
    }

    return NextResponse.json({ feature: data }, { status: 201 })
  } catch (error) {
    console.error("Error in feature requests POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
