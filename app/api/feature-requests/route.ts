import { type NextRequest, NextResponse } from "next/server"
import { getSqlClient, isDatabaseAvailable, safeQuery } from "@/lib/neon-client"

export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
          demo: true,
        },
        { status: 500 },
      )
    }

    const result = await safeQuery(async () => {
      const sql = getSqlClient()
      return await sql`
        SELECT fr.*, u.name as user_name, u.email as user_email
        FROM feature_requests fr
        LEFT JOIN users u ON fr.user_id = u.id
        ORDER BY fr.created_at DESC
      `
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      requests: result.data || [],
    })
  } catch (error) {
    console.error("Error fetching feature requests:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch feature requests",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
          demo: true,
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { title, description, category = "feature", priority = "medium", userId } = body

    if (!title || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and userId are required",
        },
        { status: 400 },
      )
    }

    const result = await safeQuery(async () => {
      const sql = getSqlClient()
      return await sql`
        INSERT INTO feature_requests (title, description, category, priority, user_id, status, votes)
        VALUES (${title}, ${description}, ${category}, ${priority}, ${userId}, 'open', 0)
        RETURNING *
      `
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      request: result.data[0],
    })
  } catch (error) {
    console.error("Error creating feature request:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create feature request",
      },
      { status: 500 },
    )
  }
}
