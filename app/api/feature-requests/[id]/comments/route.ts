import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable, safeQuery } from "@/lib/neon-client"

function jsonError(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!isDatabaseAvailable()) {
      return NextResponse.json([]) // Return empty array when database not available
    }

    const result = await safeQuery(async () => {
      const { rows } = await sql`
          SELECT * FROM feature_comments 
          WHERE feature_id = ${id} 
          ORDER BY created_at ASC
        `
      return rows
    }, [])

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { comment, user_id, user_name } = body

    if (!comment?.trim()) {
      return jsonError("Comment is required")
    }
    if (!user_id) {
      return jsonError("User ID is required")
    }

    if (!isDatabaseAvailable()) {
      // Return demo response when database not available
      const newComment = {
        id: crypto.randomUUID(),
        feature_id: params.id,
        user_id,
        user_name: user_name || "Demo User",
        comment: comment.trim(),
        created_at: new Date().toISOString(),
      }
      return NextResponse.json(newComment, { status: 201 })
    }

    // Check if feature request exists
    const featureExists = await safeQuery(async () => {
      const { rowCount } = await sql`SELECT 1 FROM feature_requests WHERE id = ${params.id}`
      return rowCount > 0
    }, false)

    if (!featureExists) {
      return jsonError("Feature request not found", 404)
    }

    const result = await safeQuery(async () => {
      const { rows } = await sql`
          INSERT INTO feature_comments (feature_id, user_id, user_name, comment, created_at)
          VALUES (${params.id}, ${user_id}, ${user_name || "Anonymous"}, ${comment.trim()}, NOW())
          RETURNING *
        `
      return rows[0]
    }, null)

    if (!result) {
      return jsonError("Failed to create comment", 500)
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return jsonError("Internal server error", 500)
  }
}
