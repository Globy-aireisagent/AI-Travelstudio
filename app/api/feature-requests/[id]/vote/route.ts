import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"

const supabase = getSupabaseServiceClient()

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { voterEmail, voterName, action } = body

    if (!voterEmail) {
      return NextResponse.json({ success: false, error: "Voter email is required" }, { status: 400 })
    }

    if (action === "vote") {
      // Add vote
      const { error: voteError } = await supabase.from("feature_votes").insert({
        feature_request_id: id,
        voter_email: voterEmail,
        voter_name: voterName,
      })

      if (voteError) {
        if (voteError.code === "23505") {
          // Unique constraint violation
          return NextResponse.json(
            { success: false, error: "You have already voted for this feature" },
            { status: 400 },
          )
        }
        console.error("Error adding vote:", voteError)
        return NextResponse.json({ success: false, error: voteError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Vote added successfully!",
      })
    } else if (action === "unvote") {
      // Remove vote
      const { error: removeError } = await supabase
        .from("feature_votes")
        .delete()
        .eq("feature_request_id", id)
        .eq("voter_email", voterEmail)

      if (removeError) {
        console.error("Error removing vote:", removeError)
        return NextResponse.json({ success: false, error: removeError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Vote removed successfully!",
      })
    } else {
      return NextResponse.json({ success: false, error: "Invalid action. Use 'vote' or 'unvote'" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in vote API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
