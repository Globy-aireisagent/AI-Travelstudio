import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable, safeQuery } from "@/lib/neon-client"

// Helpers
function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/* ---------- GET ---------- */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!isDatabaseAvailable()) {
      return jsonError("Database not available", 503)
    }

    const result = await safeQuery(async () => {
      const { rows } = await sql`SELECT * FROM feature_requests WHERE id = ${id}`
      return rows[0]
    }, null)

    if (!result) {
      return jsonError("Feature request not found", 404)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching feature request:", error)
    return jsonError("Internal server error", 500)
  }
}

/* ---------- PATCH ---------- */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, description, category, priority, status } = body

    // Validation
    const validCategories = [
      "feature",
      "enhancement",
      "bug",
      "improvement",
      "ai",
      "mobile",
      "ui",
      "analytics",
      "technical",
      "integration",
      "general",
    ]
    const validPriorities = ["low", "medium", "high", "critical"]
    const validStatuses = ["open", "in_progress", "completed", "rejected", "on_hold", "planned"]

    if (category && !validCategories.includes(category)) {
      return jsonError("Invalid category")
    }
    if (priority && !validPriorities.includes(priority)) {
      return jsonError("Invalid priority")
    }
    if (status && !validStatuses.includes(status)) {
      return jsonError("Invalid status")
    }

    if (!isDatabaseAvailable()) {
      return jsonError("Database not available", 503)
    }

    // Build dynamic UPDATE statement
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries({ title, description, category, priority, status })) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex++}`)
        values.push(value)
      }
    }

    if (updates.length === 0) {
      return jsonError("Nothing to update")
    }

    values.push(params.id) // Add ID for WHERE clause

    const query = `
      UPDATE feature_requests
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await safeQuery(async () => {
      const { rows } = await sql.unsafe(query, values)
      return rows[0]
    }, null)

    if (!result) {
      return jsonError("Feature request not found", 404)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating feature request:", error)
    return jsonError("Internal server error", 500)
  }
}

/* ---------- DELETE ---------- */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!isDatabaseAvailable()) {
      return jsonError("Database not available", 503)
    }

    const result = await safeQuery(async () => {
      // Delete related records first
      await sql`DELETE FROM feature_votes WHERE feature_id = ${id}`
      await sql`DELETE FROM feature_comments WHERE feature_id = ${id}`

      // Delete the feature request
      const { rowCount } = await sql`DELETE FROM feature_requests WHERE id = ${id}`
      return rowCount
    }, 0)

    if (result === 0) {
      return jsonError("Feature request not found", 404)
    }

    return NextResponse.json({ message: "Feature request deleted successfully" })
  } catch (error) {
    console.error("Error deleting feature request:", error)
    return jsonError("Internal server error", 500)
  }
}
