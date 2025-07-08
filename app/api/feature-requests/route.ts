import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable, safeQuery } from "@/lib/neon-client"

// Demo data for when database is not available
const demoFeatures = [
  {
    id: "demo-1",
    title: "AI-Powered Trip Planning",
    description:
      "Automatically generate personalized travel itineraries using AI based on user preferences, budget, and travel dates.",
    user_id: "demo-user-1",
    category: "ai",
    priority: "high",
    status: "in_progress",
    votes: 42,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-2",
    title: "Mobile App for Agents",
    description:
      "Native mobile application for travel agents to manage bookings and communicate with clients on the go.",
    user_id: "demo-user-2",
    category: "mobile",
    priority: "medium",
    status: "planned",
    votes: 28,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-3",
    title: "Real-time Analytics Dashboard",
    description:
      "Comprehensive analytics dashboard showing booking trends, revenue metrics, and customer insights in real-time.",
    user_id: "demo-user-3",
    category: "analytics",
    priority: "medium",
    status: "open",
    votes: 35,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-4",
    title: "Enhanced UI/UX Design",
    description: "Modern, intuitive interface redesign with improved user experience and accessibility features.",
    user_id: "demo-user-4",
    category: "ui",
    priority: "low",
    status: "completed",
    votes: 19,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json(demoFeatures)
    }

    const result = await safeQuery(async () => {
      const { rows } = await sql`
          SELECT * FROM feature_requests 
          ORDER BY created_at DESC
        `
      return rows
    }, demoFeatures)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching feature requests:", error)
    return NextResponse.json(demoFeatures)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, priority, status, created_by, user_id } = body

    // Validation
    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    // Validate category
    const validCategories = ["ai", "mobile", "feature", "ui", "analytics", "technical", "integration", "general"]
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high", "urgent", "critical"]
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["pending", "submitted", "in_progress", "completed", "rejected", "on_hold", "open", "planned"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    if (!isDatabaseAvailable()) {
      // Return demo response when database is not available
      const newFeature = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        category: category || "feature",
        priority: priority || "medium",
        status: status || "open",
        votes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user_id || "demo-user",
      }
      return NextResponse.json(newFeature, { status: 201 })
    }

    const result = await safeQuery(async () => {
      const { rows } = await sql`
          INSERT INTO feature_requests (
            title, description, category, priority, status, 
            user_id, votes, created_at, updated_at
          )
          VALUES (
            ${title.trim()}, ${description.trim()}, ${category || "feature"}, 
            ${priority || "medium"}, ${status || "open"}, 
            ${user_id || "anonymous"}, 0, NOW(), NOW()
          )
          RETURNING *
        `
      return rows[0]
    }, null)

    if (!result) {
      return NextResponse.json({ error: "Failed to create feature request" }, { status: 500 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating feature request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
