import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon-client"

function jsonError(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

/* ---------- GET ---------- */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const { rows } = await sql`SELECT * FROM feature_comments WHERE feature_id = ${id} ORDER BY created_at ASC`

  return NextResponse.json(rows)
}

/* ---------- POST ---------- */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { comment, user_id } = body as { comment?: string; user_id?: string }

  if (!comment?.trim()) return jsonError("Comment is required")
  if (!user_id) return jsonError("User ID is required")

  // Bestaat feature?
  const { rowCount: featureExists } = await sql`SELECT 1 FROM feature_requests WHERE id = ${params.id}`
  if (!featureExists) return jsonError("Feature request not found", 404)

  const { rows } = await sql`
    INSERT INTO feature_comments (feature_id, user_id, comment)
    VALUES (${params.id}, ${user_id}, ${comment.trim()})
    RETURNING *
  `
  return NextResponse.json(rows[0], { status: 201 })
}
