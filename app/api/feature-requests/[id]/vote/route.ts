import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable, safeQuery } from "@/lib/neon-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    const featureId = params.id

    if (!isDatabaseAvailable()) {
      return NextResponse.json({
        success: true,
        votes: Math.floor(Math.random() * 50),
        upVotes: Math.floor(Math.random() * 30),
        downVotes: Math.floor(Math.random() * 10),
        userVote: null,
      })
    }

    const result = await safeQuery(
      async () => {
        // Get total votes for the feature
        const { rows: voteRows } = await sql`
          SELECT 
            COUNT(*) as total_votes,
            COUNT(CASE WHEN vote_type = 'up' THEN 1 END) as up_votes,
            COUNT(CASE WHEN vote_type = 'down' THEN 1 END) as down_votes
          FROM feature_votes 
          WHERE feature_id = ${featureId}
        `

        let userVote = null
        if (userId) {
          const { rows: userVoteRows } = await sql`
            SELECT vote_type FROM feature_votes 
            WHERE feature_id = ${featureId} AND user_id = ${userId}
          `
          userVote = userVoteRows[0]?.vote_type || null
        }

        const voteData = voteRows[0] || { total_votes: 0, up_votes: 0, down_votes: 0 }

        return {
          votes: Number.parseInt(voteData.total_votes) || 0,
          upVotes: Number.parseInt(voteData.up_votes) || 0,
          downVotes: Number.parseInt(voteData.down_votes) || 0,
          userVote,
        }
      },
      {
        votes: 0,
        upVotes: 0,
        downVotes: 0,
        userVote: null,
      },
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Error fetching vote data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch vote data",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { vote_type, user_id } = body
    const featureId = params.id

    if (!vote_type || !user_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Vote type and user ID are required",
        },
        { status: 400 },
      )
    }

    if (!["up", "down"].includes(vote_type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid vote type",
        },
        { status: 400 },
      )
    }

    if (!isDatabaseAvailable()) {
      return NextResponse.json({
        success: true,
        votes: Math.floor(Math.random() * 50),
        user_vote: vote_type,
      })
    }

    const result = await safeQuery(
      async () => {
        // Check if user already voted
        const { rows: existingVote } = await sql`
          SELECT vote_type FROM feature_votes 
          WHERE feature_id = ${featureId} AND user_id = ${user_id}
        `

        if (existingVote.length > 0) {
          // Update existing vote
          await sql`
            UPDATE feature_votes 
            SET vote_type = ${vote_type}
            WHERE feature_id = ${featureId} AND user_id = ${user_id}
          `
        } else {
          // Insert new vote
          await sql`
            INSERT INTO feature_votes (feature_id, user_id, vote_type, created_at)
            VALUES (${featureId}, ${user_id}, ${vote_type}, NOW())
          `
        }

        // Get updated vote count
        const { rows: voteCount } = await sql`
          SELECT COUNT(*) as total_votes
          FROM feature_votes 
          WHERE feature_id = ${featureId}
        `

        // Update feature request vote count
        const totalVotes = Number.parseInt(voteCount[0]?.total_votes) || 0
        await sql`
          UPDATE feature_requests 
          SET votes = ${totalVotes}
          WHERE id = ${featureId}
        `

        return {
          votes: totalVotes,
          user_vote: vote_type,
        }
      },
      {
        votes: Math.floor(Math.random() * 50),
        user_vote: vote_type,
      },
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Error recording vote:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to record vote",
      },
      { status: 500 },
    )
  }
}
