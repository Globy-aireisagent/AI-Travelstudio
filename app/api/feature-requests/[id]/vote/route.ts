import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { vote_type, user_id } = body
    const feature_id = params.id

    if (!vote_type || !user_id || !feature_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!["up", "down"].includes(vote_type)) {
      return NextResponse.json({ success: false, error: "Invalid vote type" }, { status: 400 })
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from("feature_votes")
      .select("*")
      .eq("feature_id", feature_id)
      .eq("user_id", user_id)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Remove vote if clicking the same vote type
        const { error: deleteError } = await supabase
          .from("feature_votes")
          .delete()
          .eq("feature_id", feature_id)
          .eq("user_id", user_id)

        if (deleteError) {
          console.error("Delete vote error:", deleteError)
          return NextResponse.json({ success: false, error: "Failed to remove vote" }, { status: 500 })
        }
      } else {
        // Update vote type if different
        const { error: updateError } = await supabase
          .from("feature_votes")
          .update({ vote_type })
          .eq("feature_id", feature_id)
          .eq("user_id", user_id)

        if (updateError) {
          console.error("Update vote error:", updateError)
          return NextResponse.json({ success: false, error: "Failed to update vote" }, { status: 500 })
        }
      }
    } else {
      // Insert new vote
      const { error: insertError } = await supabase.from("feature_votes").insert([
        {
          feature_id,
          user_id,
          vote_type,
        },
      ])

      if (insertError) {
        console.error("Insert vote error:", insertError)
        return NextResponse.json({ success: false, error: "Failed to add vote" }, { status: 500 })
      }
    }

    // Get updated vote count
    const { data: votes } = await supabase.from("feature_votes").select("vote_type").eq("feature_id", feature_id)

    const upVotes = votes?.filter((v) => v.vote_type === "up").length || 0
    const downVotes = votes?.filter((v) => v.vote_type === "down").length || 0
    const totalVotes = upVotes - downVotes

    // Update the feature request vote count
    await supabase.from("feature_requests").update({ votes: totalVotes }).eq("id", feature_id)

    return NextResponse.json({
      success: true,
      votes: totalVotes,
      user_vote: existingVote?.vote_type === vote_type ? null : vote_type,
    })
  } catch (error) {
    console.error("Vote API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id") || "anonymous"
    const feature_id = params.id

    // Remove user's vote
    const { error: deleteError } = await supabase
      .from("feature_votes")
      .delete()
      .eq("feature_id", feature_id)
      .eq("user_id", user_id)

    if (deleteError) {
      console.error("Delete vote error:", deleteError)
      return NextResponse.json({ error: "Failed to remove vote" }, { status: 500 })
    }

    // Get updated vote count
    const { data: votes } = await supabase.from("feature_votes").select("vote_type").eq("feature_id", feature_id)

    const upVotes = votes?.filter((v) => v.vote_type === "up").length || 0
    const downVotes = votes?.filter((v) => v.vote_type === "down").length || 0
    const totalVotes = upVotes - downVotes

    // Update feature request vote count
    await supabase.from("feature_requests").update({ votes: totalVotes }).eq("id", feature_id)

    return NextResponse.json({
      success: true,
      votes: totalVotes,
      user_vote: null,
      message: "Vote removed successfully",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    const feature_id = params.id

    // Get vote counts
    const { data: votes } = await supabase.from("feature_votes").select("vote_type").eq("feature_id", feature_id)

    const upVotes = votes?.filter((v) => v.vote_type === "up").length || 0
    const downVotes = votes?.filter((v) => v.vote_type === "down").length || 0
    const totalVotes = upVotes - downVotes

    let userVote = null
    if (user_id) {
      const { data: userVoteData } = await supabase
        .from("feature_votes")
        .select("vote_type")
        .eq("feature_id", feature_id)
        .eq("user_id", user_id)
        .single()

      userVote = userVoteData?.vote_type || null
    }

    return NextResponse.json({
      success: true,
      votes: totalVotes,
      upVotes,
      downVotes,
      userVote,
    })
  } catch (error) {
    console.error("Get votes API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
