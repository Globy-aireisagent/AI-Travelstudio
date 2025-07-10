import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("feature_requests").select("*").eq("id", params.id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Feature request not found" }, { status: 404 })
      }
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching feature request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, description, category, priority, status } = body

    // Validation
    if (category && !["feature", "enhancement", "bug", "improvement"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    if (priority && !["low", "medium", "high", "critical"].includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
    }

    if (status && !["pending", "submitted", "in_progress", "completed", "rejected", "on_hold"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const supabase = createClient()

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (priority !== undefined) updateData.priority = priority
    if (status !== undefined) updateData.status = status
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("feature_requests")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Feature request not found" }, { status: 404 })
      }
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating feature request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    // First delete related votes and comments
    await supabase.from("feature_votes").delete().eq("feature_id", params.id)
    await supabase.from("feature_comments").delete().eq("feature_id", params.id)

    // Then delete the feature request
    const { error } = await supabase.from("feature_requests").delete().eq("id", params.id)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Feature request deleted successfully" })
  } catch (error) {
    console.error("Error deleting feature request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
