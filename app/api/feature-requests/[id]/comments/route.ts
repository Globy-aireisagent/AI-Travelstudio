import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const featureId = params.id

    const { data, error } = await supabase
      .from("feature_comments")
      .select("*")
      .eq("feature_id", featureId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching comments:", error)
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
    }

    return NextResponse.json({ comments: data })
  } catch (error) {
    console.error("Error in comments GET API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { comment, commenterEmail, commenterName } = body
    const featureId = params.id

    if (!comment || !commenterEmail) {
      return NextResponse.json({ error: "Comment and email are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("feature_comments")
      .insert([
        {
          feature_id: featureId,
          comment,
          commenter_email: commenterEmail,
          commenter_name: commenterName,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding comment:", error)
      return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
    }

    return NextResponse.json({ comment: data }, { status: 201 })
  } catch (error) {
    console.error("Error in comments POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
