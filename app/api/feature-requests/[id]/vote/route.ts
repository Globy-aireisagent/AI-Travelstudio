import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { vote_type, user_id } = body

    // Validation
    if (!vote_type || !["up", "down"].includes(vote_type)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if feature request exists
    const { data: feature, error: featureError } = await supabase
      .from("feature_requests")
      .select("id")
      .eq("id", params.id)
      .single()

    if (featureError || !feature) {
      return NextResponse.json({ error: "Feature request not found" }, { status: 404 })
    }

    // Check if user has already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from("feature_votes")
      .select("*")
      .eq("feature_id", params.id)
      .eq("user_id", user_id)
      .single()

    if (voteCheckError && voteCheckError.code !== "PGRST116") {
      console.error("Error checking existing vote:", voteCheckError)
      return NextResponse.json({ error: "Error checking existing vote" }, { status: 500 })
    }

    if (existingVote) {
      // Update existing vote
      const { error: updateError } = await supabase
        .from("feature_votes")
        .update({ vote_type })
        .eq("id", existingVote.id)

      if (updateError) {
        console.error("Error updating vote:", updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    } else {
      // Create new vote
      const { error: insertError } = await supabase.from("feature_votes").insert([
        {
          feature_id: params.id,
          user_id,
          vote_type,
        },
      ])

      if (insertError) {
        console.error("Error creating vote:", insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    // Get updated vote counts
    const { data: upvotes } = await supabase
      .from("feature_votes")
      .select("id")
      .eq("feature_id", params.id)
      .eq("vote_type", "up")

    const { data: downvotes } = await supabase
      .from("feature_votes")
      .select("id")
      .eq("feature_id", params.id)
      .eq("vote_type", "down")

    const upvoteCount = upvotes?.length || 0
    const downvoteCount = downvotes?.length || 0
    const netVotes = upvoteCount - downvoteCount

    // Update feature request with new vote counts
    const { data: updatedFeature, error: updateFeatureError } = await supabase
      .from("feature_requests")
      .update({
        upvotes: upvoteCount,
        downvotes: downvoteCount,
        votes: netVotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (updateFeatureError) {
      console.error("Error updating feature vote counts:", updateFeatureError)
      return NextResponse.json({ error: updateFeatureError.message }, { status: 500 })
    }

    return NextResponse.json(updatedFeature)
  } catch (error) {
    console.error("Error processing vote:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
