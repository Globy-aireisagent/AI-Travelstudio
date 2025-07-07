import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const feature_id = params.id

    const { data, error } = await supabase
      .from("feature_comments")
      .select("*")
      .eq("feature_id", feature_id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({
        success: true,
        data: getDemoComments(feature_id),
        source: "demo",
      })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      source: "database",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({
      success: true,
      data: getDemoComments(params.id),
      source: "demo",
    })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { comment, user_id, user_name } = body
    const feature_id = params.id

    if (!comment || !user_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("feature_comments")
      .insert([
        {
          feature_id,
          user_id,
          user_name: user_name || "Anonymous",
          comment,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to add comment" }, { status: 500 })
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

function getDemoComments(featureId: string) {
  const commentMap: Record<string, any[]> = {
    "550e8400-e29b-41d4-a716-446655440021": [
      {
        id: "comment-1",
        feature_id: featureId,
        user_id: "agent@demo.com",
        user_name: "Demo Agent",
        comment:
          "This would really help with finding specific bookings quickly. Currently it takes too long to locate older bookings.",
        created_at: "2025-01-15T10:30:00Z",
      },
      {
        id: "comment-2",
        feature_id: featureId,
        user_id: "admin@demo.com",
        user_name: "Demo Admin",
        comment: "Agreed! We should also include filters for booking status and agency.",
        created_at: "2025-01-15T14:45:00Z",
      },
    ],
    "550e8400-e29b-41d4-a716-446655440022": [
      {
        id: "comment-3",
        feature_id: featureId,
        user_id: "client@demo.com",
        user_name: "Demo Client",
        comment: "A mobile app would be fantastic for checking bookings while traveling.",
        created_at: "2025-01-10T16:20:00Z",
      },
    ],
    "550e8400-e29b-41d4-a716-446655440023": [
      {
        id: "comment-4",
        feature_id: featureId,
        user_id: "admin@demo.com",
        user_name: "Demo Admin",
        comment: "Real-time notifications are essential for keeping clients informed about their travel plans.",
        created_at: "2025-01-12T09:15:00Z",
      },
    ],
    "550e8400-e29b-41d4-a716-446655440024": [
      {
        id: "comment-5",
        feature_id: featureId,
        user_id: "agent@demo.com",
        user_name: "Demo Agent",
        comment: "Multi-language support would help us serve international clients better.",
        created_at: "2025-01-08T11:30:00Z",
      },
    ],
    "550e8400-e29b-41d4-a716-446655440025": [
      {
        id: "comment-6",
        feature_id: featureId,
        user_id: "super@demo.com",
        user_name: "Super Admin",
        comment: "The automated reporting feature has been completed and is working great!",
        created_at: "2025-01-20T08:00:00Z",
      },
    ],
    "550e8400-e29b-41d4-a716-446655440027": [
      {
        id: "comment-7",
        feature_id: featureId,
        user_id: "client@demo.com",
        user_name: "Demo Client",
        comment: "Dark mode would be much easier on the eyes during late-night planning sessions.",
        created_at: "2025-01-14T20:30:00Z",
      },
    ],
    "550e8400-e29b-41d4-a716-446655440030": [
      {
        id: "comment-8",
        feature_id: featureId,
        user_id: "admin@demo.com",
        user_name: "Demo Admin",
        comment: "Advanced analytics would provide valuable insights for business decisions.",
        created_at: "2025-01-21T07:45:00Z",
      },
    ],
  }

  return commentMap[featureId] || []
}
