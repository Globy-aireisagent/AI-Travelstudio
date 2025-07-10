import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Demo data for travel buddies
    const buddies = [
      {
        id: 1,
        name: "Zuid-Korea Expert",
        client: "Familie Jansen",
        bookingId: "TC-2025-001",
        status: "active",
        conversations: 23,
        lastUsed: "2025-01-05",
        type: "booking-specific",
        description: "AI assistent voor Zuid-Korea reis",
      },
      {
        id: 2,
        name: "Algemene Reis Assistent",
        client: "Alle klanten",
        bookingId: null,
        status: "active",
        conversations: 156,
        lastUsed: "2025-01-05",
        type: "general",
        description: "Algemene reisadvies chatbot",
      },
      {
        id: 3,
        name: "Japan Specialist",
        client: "Diverse klanten",
        bookingId: null,
        status: "draft",
        conversations: 0,
        lastUsed: "Nooit",
        type: "destination-specific",
        description: "Specialist voor Japan reizen",
      },
    ]

    return NextResponse.json({
      success: true,
      buddies,
    })
  } catch (error) {
    console.error("Error fetching travel buddies:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch travel buddies",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, client, type, description, configuration, agentEmail } = body

    // Validate required fields
    if (!name || !type || !agentEmail) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Later: Insert into Supabase
    // const { data, error } = await supabase
    //   .from('travel_buddies')
    //   .insert({
    //     name,
    //     client,
    //     type,
    //     description,
    //     configuration,
    //     agent_email: agentEmail,
    //     status: 'draft',
    //     created_at: new Date().toISOString(),
    //   })
    //   .select()
    //   .single()

    // For now, return mock response
    const newBuddy = {
      id: Date.now(),
      name,
      client: client || "Alle klanten",
      type,
      description: description || "Nieuwe travel buddy",
      configuration: configuration || {},
      agentEmail,
      status: "draft",
      conversations: 0,
      lastUsed: "Nooit",
      createdAt: new Date().toISOString().split("T")[0],
      metrics: {
        averageResponseTime: null,
        satisfactionScore: null,
        resolvedQueries: 0,
        escalations: 0,
      },
    }

    return NextResponse.json({
      success: true,
      buddy: newBuddy,
      message: "Travel buddy successfully created",
    })
  } catch (error) {
    console.error("Error creating travel buddy:", error)
    return NextResponse.json({ success: false, error: "Failed to create travel buddy" }, { status: 500 })
  }
}
