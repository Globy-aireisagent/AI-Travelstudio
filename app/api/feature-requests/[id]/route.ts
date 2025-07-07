import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id } = params

    const { data, error } = await supabase.from("feature_requests").select("*").eq("id", id).single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Feature request not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await request.json()

    const allowedFields = ["status", "priority", "category", "title", "description"]
    const updateData: Record<string, any> = {}

    // Only allow updating specific fields
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 })
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase.from("feature_requests").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to update feature request" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Feature request updated successfully",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id } = params

    // First delete related votes and comments
    await supabase.from("feature_votes").delete().eq("feature_id", id)
    await supabase.from("feature_comments").delete().eq("feature_id", id)

    // Then delete the feature request
    const { error } = await supabase.from("feature_requests").delete().eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to delete feature request" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Feature request deleted successfully",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
