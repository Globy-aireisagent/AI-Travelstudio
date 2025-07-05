import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("email") || "demo@agent.com" // Demo data for now

    // Demo clients data
    const demoClients = [
      {
        id: 1,
        name: "Familie Jansen",
        email: "jansen@email.com",
        phone: "+31 6 12345678",
        bookingCount: 3,
        totalValue: 8750,
        lastBookingDate: "2025-01-05",
        firstBookingDate: "2024-03-15",
        status: "active",
        preferences: ["Azië", "Cultuur", "Familie reizen"],
        notes: "Houdt van authentieke ervaringen, reist graag met kinderen",
        averageBookingValue: 2917,
        loyaltyLevel: "gold",
        communicationPreference: "email",
        birthDate: "1985-06-15",
        address: {
          street: "Hoofdstraat 123",
          city: "Amsterdam",
          postalCode: "1000 AB",
          country: "Nederland",
        },
        emergencyContact: {
          name: "Oma Jansen",
          phone: "+31 6 87654321",
          relation: "Moeder",
        },
      },
      {
        id: 2,
        name: "Meneer de Vries",
        email: "devries@email.com",
        phone: "+31 6 23456789",
        bookingCount: 1,
        totalValue: 1250,
        lastBookingDate: "2025-01-02",
        firstBookingDate: "2025-01-02",
        status: "new",
        preferences: ["Europa", "Romantisch", "Stedentrips"],
        notes: "Eerste keer klant, zoekt romantische weekendjes weg",
        averageBookingValue: 1250,
        loyaltyLevel: "bronze",
        communicationPreference: "phone",
        birthDate: "1978-11-22",
        address: {
          street: "Kerkstraat 45",
          city: "Utrecht",
          postalCode: "3500 CD",
          country: "Nederland",
        },
        emergencyContact: {
          name: "Partner de Vries",
          phone: "+31 6 34567890",
          relation: "Partner",
        },
      },
      {
        id: 3,
        name: "Familie Peters",
        email: "peters@email.com",
        phone: "+31 6 34567890",
        bookingCount: 2,
        totalValue: 12400,
        lastBookingDate: "2025-01-03",
        firstBookingDate: "2024-07-10",
        status: "active",
        preferences: ["Cruise", "Familie", "Middellandse Zee"],
        notes: "Familie met 2 kinderen (8 en 12 jaar), houdt van cruise vakanties",
        averageBookingValue: 6200,
        loyaltyLevel: "silver",
        communicationPreference: "email",
        birthDate: "1980-04-08",
        address: {
          street: "Dorpsplein 67",
          city: "Eindhoven",
          postalCode: "5600 EF",
          country: "Nederland",
        },
        emergencyContact: {
          name: "Opa Peters",
          phone: "+31 6 45678901",
          relation: "Vader",
        },
      },
      {
        id: 4,
        name: "Familie van der Berg",
        email: "vandenberg@email.com",
        phone: "+31 6 45678901",
        bookingCount: 1,
        totalValue: 4200,
        lastBookingDate: "2025-01-04",
        firstBookingDate: "2025-01-04",
        status: "new",
        preferences: ["Afrika", "Safari", "Avontuur"],
        notes: "Avontuurlijke familie, eerste safari reis",
        averageBookingValue: 4200,
        loyaltyLevel: "bronze",
        communicationPreference: "whatsapp",
        birthDate: "1982-09-30",
        address: {
          street: "Bergweg 89",
          city: "Den Haag",
          postalCode: "2500 GH",
          country: "Nederland",
        },
        emergencyContact: {
          name: "Zus van der Berg",
          phone: "+31 6 56789012",
          relation: "Zus",
        },
      },
      {
        id: 5,
        name: "Mevrouw Bakker",
        email: "bakker@email.com",
        phone: "+31 6 56789012",
        bookingCount: 5,
        totalValue: 15600,
        lastBookingDate: "2024-12-20",
        firstBookingDate: "2023-05-12",
        status: "vip",
        preferences: ["Luxe", "Wellness", "Europa"],
        notes: "VIP klant, houdt van luxe wellness reizen",
        averageBookingValue: 3120,
        loyaltyLevel: "platinum",
        communicationPreference: "phone",
        birthDate: "1965-12-03",
        address: {
          street: "Prinsengracht 234",
          city: "Amsterdam",
          postalCode: "1000 IJ",
          country: "Nederland",
        },
        emergencyContact: {
          name: "Dochter Bakker",
          phone: "+31 6 67890123",
          relation: "Dochter",
        },
      },
    ]

    // Later: Query real clients from Supabase
    // const { data: clients, error } = await supabase
    //   .from('clients')
    //   .select('*')
    //   .eq('agent_email', userEmail)
    //   .order('last_booking_date', { ascending: false })

    const stats = {
      total: demoClients.length,
      active: demoClients.filter((c) => c.status === "active").length,
      new: demoClients.filter((c) => c.status === "new").length,
      vip: demoClients.filter((c) => c.status === "vip").length,
      totalValue: demoClients.reduce((sum, c) => sum + c.totalValue, 0),
      averageValue: demoClients.reduce((sum, c) => sum + c.totalValue, 0) / demoClients.length,
      totalBookings: demoClients.reduce((sum, c) => sum + c.bookingCount, 0),
      loyaltyDistribution: {
        bronze: demoClients.filter((c) => c.loyaltyLevel === "bronze").length,
        silver: demoClients.filter((c) => c.loyaltyLevel === "silver").length,
        gold: demoClients.filter((c) => c.loyaltyLevel === "gold").length,
        platinum: demoClients.filter((c) => c.loyaltyLevel === "platinum").length,
      },
    }

    return NextResponse.json({
      success: true,
      clients: demoClients,
      stats,
    })
  } catch (error) {
    console.error("Error fetching user clients:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      preferences = [],
      notes = "",
      communicationPreference = "email",
      birthDate,
      address,
      emergencyContact,
    } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 })
    }

    // For now, return success with demo data
    // Later: Insert into Supabase
    const newClient = {
      id: Date.now(), // Temporary ID
      name,
      email,
      phone: phone || "",
      bookingCount: 0,
      totalValue: 0,
      lastBookingDate: null,
      firstBookingDate: new Date().toISOString().split("T")[0],
      status: "new",
      preferences,
      notes,
      averageBookingValue: 0,
      loyaltyLevel: "bronze",
      communicationPreference,
      birthDate: birthDate || null,
      address: address || null,
      emergencyContact: emergencyContact || null,
    }

    return NextResponse.json({
      success: true,
      client: newClient,
      message: "Klant toegevoegd",
    })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ success: false, error: "Failed to create client" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing client ID" }, { status: 400 })
    }

    // For now, return success
    // Later: Update in Supabase
    return NextResponse.json({
      success: true,
      message: "Klant bijgewerkt",
    })
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ success: false, error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing client ID" }, { status: 400 })
    }

    // For now, return success
    // Later: Delete from Supabase (soft delete recommended)
    return NextResponse.json({
      success: true,
      message: "Klant verwijderd",
    })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ success: false, error: "Failed to delete client" }, { status: 500 })
  }
}
