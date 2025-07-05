import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("email") || "demo@agent.com" // Demo data for now

    // Demo travel buddies data
    const demoTravelBuddies = [
      {
        id: 1,
        name: "Zuid-Korea Expert",
        client: "Familie Jansen",
        bookingId: "TC-2025-001",
        status: "active",
        conversations: 23,
        messages: 156,
        lastUsed: "2025-01-05",
        type: "booking-specific",
        description: "AI assistent voor Zuid-Korea reis met lokale tips en praktische informatie",
        createdAt: "2025-01-01",
        rating: 4.8,
        language: "nl",
        features: ["Lokale tips", "Restaurant aanbevelingen", "Transport info", "Weer updates"],
      },
      {
        id: 2,
        name: "Algemene Reis Assistent",
        client: "Alle klanten",
        bookingId: null,
        status: "active",
        conversations: 156,
        messages: 1247,
        lastUsed: "2025-01-05",
        type: "general",
        description: "Algemene reisadvies chatbot voor alle bestemmingen en vragen",
        createdAt: "2024-12-15",
        rating: 4.6,
        language: "nl",
        features: ["Algemene reisadvies", "Visa informatie", "Paklijsten", "Reistips"],
      },
      {
        id: 3,
        name: "Japan Specialist",
        client: "Diverse klanten",
        bookingId: null,
        status: "draft",
        conversations: 0,
        messages: 0,
        lastUsed: "Nooit",
        type: "destination-specific",
        description: "Specialist voor Japan reizen - nog in ontwikkeling",
        createdAt: "2025-01-04",
        rating: null,
        language: "nl",
        features: ["JR Pass info", "Culturele etiquette", "Seizoenen advies", "Accommodatie tips"],
      },
      {
        id: 4,
        name: "Familie Reis Buddy",
        client: "Familie Peters",
        bookingId: "TC-2025-003",
        status: "active",
        conversations: 8,
        messages: 42,
        lastUsed: "2025-01-03",
        type: "booking-specific",
        description: "Speciaal voor families met kinderen op cruise",
        createdAt: "2025-01-03",
        rating: 4.9,
        language: "nl",
        features: ["Kinderactiviteiten", "Familie restaurants", "Veiligheid tips", "Entertainment"],
      },
      {
        id: 5,
        name: "Romantische Reizen Expert",
        client: "Stellen",
        bookingId: null,
        status: "paused",
        conversations: 12,
        messages: 89,
        lastUsed: "2025-01-02",
        type: "theme-specific",
        description: "Specialist voor romantische reizen en huwelijksreizen",
        createdAt: "2024-12-20",
        rating: 4.7,
        language: "nl",
        features: ["Romantische restaurants", "Sunset spots", "Couple activiteiten", "Spa aanbevelingen"],
      },
    ]

    // Later: Query real travel buddies from Supabase
    // const { data: buddies, error } = await supabase
    //   .from('travel_buddies')
    //   .select('*')
    //   .eq('agent_email', userEmail)
    //   .order('last_used', { ascending: false })

    const stats = {
      total: demoTravelBuddies.length,
      active: demoTravelBuddies.filter((b) => b.status === "active").length,
      draft: demoTravelBuddies.filter((b) => b.status === "draft").length,
      paused: demoTravelBuddies.filter((b) => b.status === "paused").length,
      totalConversations: demoTravelBuddies.reduce((sum, b) => sum + b.conversations, 0),
      totalMessages: demoTravelBuddies.reduce((sum, b) => sum + b.messages, 0),
      averageRating: demoTravelBuddies
        .filter((b) => b.rating)
        .reduce((sum, b, _, arr) => sum + b.rating! / arr.length, 0),
    }

    return NextResponse.json({
      success: true,
      buddies: demoTravelBuddies,
      stats,
    })
  } catch (error) {
    console.error("Error fetching travel buddies:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch travel buddies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, client, bookingId, description, features, language = "nl" } = body

    // Validate required fields
    if (!name || !type || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // For now, return success with demo data
    // Later: Insert into Supabase
    const newBuddy = {
      id: Date.now(), // Temporary ID
      name,
      client: client || "Alle klanten",
      bookingId: bookingId || null,
      status: "draft",
      conversations: 0,
      messages: 0,
      lastUsed: "Nooit",
      type,
      description,
      createdAt: new Date().toISOString().split("T")[0],
      rating: null,
      language,
      features: features || [],
    }

    return NextResponse.json({
      success: true,
      buddy: newBuddy,
      message: "Travel Buddy aangemaakt",
    })
  } catch (error) {
    console.error("Error creating travel buddy:", error)
    return NextResponse.json({ success: false, error: "Failed to create travel buddy" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing buddy ID" }, { status: 400 })
    }

    // For now, return success
    // Later: Update in Supabase
    return NextResponse.json({
      success: true,
      message: "Travel Buddy bijgewerkt",
    })
  } catch (error) {
    console.error("Error updating travel buddy:", error)
    return NextResponse.json({ success: false, error: "Failed to update travel buddy" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing buddy ID" }, { status: 400 })
    }

    // For now, return success
    // Later: Delete from Supabase
    return NextResponse.json({
      success: true,
      message: "Travel Buddy verwijderd",
    })
  } catch (error) {
    console.error("Error deleting travel buddy:", error)
    return NextResponse.json({ success: false, error: "Failed to delete travel buddy" }, { status: 500 })
  }
}
