import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "votes"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    let query = supabase.from("feature_requests").select("*")

    // Apply filters
    if (category && category !== "all") {
      query = query.eq("category", category)
    }
    if (status && status !== "all") {
      query = query.eq("status", status)
    }
    if (priority && priority !== "all") {
      query = query.eq("priority", priority)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      // Return demo data as fallback
      return NextResponse.json({
        success: true,
        data: getDemoFeatureRequests(),
        source: "demo",
      })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      source: "database",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({
      success: true,
      data: getDemoFeatureRequests(),
      source: "demo",
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { title, description, category, priority, user_id } = body

    if (!title || !description || !category || !priority) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("feature_requests")
      .insert([
        {
          title,
          description,
          category,
          priority,
          user_id: user_id || "anonymous",
          status: "open",
          votes: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to create feature request" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

function getDemoFeatureRequests() {
  return [
    {
      id: "550e8400-e29b-41d4-a716-446655440021",
      title: "Advanced Booking Search",
      description:
        "Add more sophisticated search filters for bookings including date ranges, destinations, and price ranges.",
      user_id: "agent@demo.com",
      category: "enhancement",
      priority: "high",
      status: "in_progress",
      votes: 15,
      created_at: "2025-01-01T10:00:00Z",
      updated_at: "2025-01-15T14:30:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440022",
      title: "Mobile App Integration",
      description: "Develop a mobile application that syncs with the web platform for on-the-go access.",
      user_id: "admin@demo.com",
      category: "feature",
      priority: "medium",
      status: "open",
      votes: 8,
      created_at: "2025-01-02T09:15:00Z",
      updated_at: "2025-01-10T16:45:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440023",
      title: "Real-time Notifications",
      description: "Implement push notifications for booking updates, payment confirmations, and travel alerts.",
      user_id: "client@demo.com",
      category: "enhancement",
      priority: "medium",
      status: "open",
      votes: 12,
      created_at: "2025-01-03T11:20:00Z",
      updated_at: "2025-01-12T13:10:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440024",
      title: "Multi-language Support",
      description: "Add support for multiple languages including Dutch, German, French, and Spanish.",
      user_id: "agent@demo.com",
      category: "feature",
      priority: "low",
      status: "open",
      votes: 6,
      created_at: "2025-01-04T08:30:00Z",
      updated_at: "2025-01-08T12:00:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440025",
      title: "Automated Reporting",
      description: "Generate automated monthly reports for agencies with booking statistics and revenue data.",
      user_id: "admin@demo.com",
      category: "enhancement",
      priority: "high",
      status: "completed",
      votes: 20,
      created_at: "2024-12-15T14:00:00Z",
      updated_at: "2025-01-20T10:30:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440026",
      title: "Calendar Integration",
      description: "Integrate with popular calendar applications like Google Calendar and Outlook.",
      user_id: "client@demo.com",
      category: "feature",
      priority: "medium",
      status: "on_hold",
      votes: 4,
      created_at: "2025-01-05T15:45:00Z",
      updated_at: "2025-01-18T09:20:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440027",
      title: "Dark Mode Theme",
      description: "Add a dark mode option for better user experience during evening hours.",
      user_id: "agent@demo.com",
      category: "improvement",
      priority: "low",
      status: "open",
      votes: 9,
      created_at: "2025-01-06T12:15:00Z",
      updated_at: "2025-01-14T17:40:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440028",
      title: "Export to PDF",
      description: "Allow users to export booking details and itineraries as PDF documents.",
      user_id: "admin@demo.com",
      category: "enhancement",
      priority: "medium",
      status: "in_progress",
      votes: 11,
      created_at: "2025-01-07T10:30:00Z",
      updated_at: "2025-01-16T14:15:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440029",
      title: "Social Media Sharing",
      description: "Enable sharing of travel experiences and bookings on social media platforms.",
      user_id: "client@demo.com",
      category: "feature",
      priority: "low",
      status: "rejected",
      votes: 2,
      created_at: "2025-01-08T13:45:00Z",
      updated_at: "2025-01-19T11:30:00Z",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440030",
      title: "Advanced Analytics Dashboard",
      description: "Create comprehensive analytics with charts, trends, and predictive insights.",
      user_id: "super@demo.com",
      category: "feature",
      priority: "critical",
      status: "open",
      votes: 18,
      created_at: "2025-01-09T16:00:00Z",
      updated_at: "2025-01-21T08:45:00Z",
    },
  ]
}
