import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { voterEmail, voterName, action } = body
    const featureId = params.id

    if (!voterEmail) {
      return NextResponse.json({ error: "Voter email is required" }, { status: 400 })
    }

    if (action === "vote") {
      // Add vote
      const { data, error } = await supabase
        .from("feature_votes")
        .insert([
          {
            feature_id: featureId,
            voter_email: voterEmail,
            voter_name: voterName,
          },
        ])
        .select()

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          return NextResponse.json({ error: "You have already voted for this feature" }, { status: 409 })
        }
        console.error("Error adding vote:", error)
        return NextResponse.json({ error: "Failed to add vote" }, { status: 500 })
      }

      return NextResponse.json({ success: true, voted: true })
    } else if (action === "unvote") {
      // Remove vote
      const { error } = await supabase
        .from("feature_votes")
        .delete()
        .eq("feature_id", featureId)
        .eq("voter_email", voterEmail)

      if (error) {
        console.error("Error removing vote:", error)
        return NextResponse.json({ error: "Failed to remove vote" }, { status: 500 })
      }

      return NextResponse.json({ success: true, voted: false })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in vote API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const voterEmail = searchParams.get("voterEmail")
    const featureId = params.id

    if (!voterEmail) {
      return NextResponse.json({ error: "Voter email is required" }, { status: 400 })
    }

    // Check if user has voted
    const { data, error } = await supabase
      .from("feature_votes")
      .select("id")
      .eq("feature_id", featureId)
      .eq("voter_email", voterEmail)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking vote status:", error)
      return NextResponse.json({ error: "Failed to check vote status" }, { status: 500 })
    }

    return NextResponse.json({ hasVoted: !!data })
  } catch (error) {
    console.error("Error in vote check API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
