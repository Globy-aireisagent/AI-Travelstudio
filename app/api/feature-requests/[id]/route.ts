import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/neon-client"

// Helpers
function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/* ---------- GET ---------- */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const { rows } = await sql`SELECT * FROM feature_requests WHERE id = ${id}`

  if (rows.length === 0) return jsonError("Feature request not found", 404)

  return NextResponse.json(rows[0])
}

/* ---------- PATCH ---------- */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { title, description, category, priority, status } = body

  const validCategory = ["feature", "enhancement", "bug", "improvement"]
  const validPriority = ["low", "medium", "high", "critical"]
  const validStatus = ["pending", "submitted", "in_progress", "completed", "rejected", "on_hold"]

  if (category && !validCategory.includes(category)) return jsonError("Invalid category")
  if (priority && !validPriority.includes(priority)) return jsonError("Invalid priority")
  if (status && !validStatus.includes(status)) return jsonError("Invalid status")

  // Dynamisch UPDATE-statement opbouwen
  const updates: string[] = []
  const values: any[] = []
  let i = 1
  for (const [key, value] of Object.entries({
    title,
    description,
    category,
    priority,
    status,
  })) {
    if (value !== undefined) {
      updates.push(`${key} = $${i++}`)
      values.push(value)
    }
  }
  if (updates.length === 0) return jsonError("Nothing to update")

  values.push(params.id) // laatste placeholder voor WHERE

  const query = `
    UPDATE feature_requests
    SET ${updates.join(", ")}, updated_at = NOW()
    WHERE id = $${i}
    RETURNING *
  `
  const { rows } = await sql.unsafe(query, values)

  if (rows.length === 0) return jsonError("Feature request not found", 404)

  return NextResponse.json(rows[0])
}

/* ---------- DELETE ---------- */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  await sql`DELETE FROM feature_votes WHERE feature_id = ${id}`
  await sql`DELETE FROM feature_comments WHERE feature_id = ${id}`
  const { rowCount } = await sql`DELETE FROM feature_requests WHERE id = ${id}`

  if (rowCount === 0) return jsonError("Feature request not found", 404)

  return NextResponse.json({ message: "Feature request deleted successfully" })
}
