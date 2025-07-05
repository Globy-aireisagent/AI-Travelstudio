import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"

const supabase = getSupabaseServiceClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { data: comments, error } = await supabase
      .from("feature_comments")
      .select("*")
      .eq("feature_request_id", id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching comments:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      comments: comments || [],
    })
  } catch (error) {
    console.error("Error in comments API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { comment, commenterEmail, commenterName } = body

    if (!comment || !commenterEmail) {
      return NextResponse.json({ success: false, error: "Comment and commenter email are required" }, { status: 400 })
    }

    const { data: newComment, error } = await supabase
      .from("feature_comments")
      .insert({
        feature_request_id: id,
        comment,
        commenter_email: commenterEmail,
        commenter_name: commenterName,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding comment:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: "Comment added successfully!",
    })
  } catch (error) {
    console.error("Error in comments POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
