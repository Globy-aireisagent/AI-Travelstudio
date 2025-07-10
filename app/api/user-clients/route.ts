import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Demo data for clients
    const clients = [
      {
        id: 1,
        name: "Familie Jansen",
        email: "jansen@email.com",
        phone: "+31 6 12345678",
        bookingCount: 3,
        lastBookingDate: "2025-01-05",
        totalValue: 8500,
        status: "active",
      },
      {
        id: 2,
        name: "Familie Peters",
        email: "peters@email.com",
        phone: "+31 6 87654321",
        bookingCount: 1,
        lastBookingDate: "2025-01-03",
        totalValue: 5600,
        status: "active",
      },
      {
        id: 3,
        name: "Meneer de Vries",
        email: "devries@email.com",
        phone: "+31 6 11223344",
        bookingCount: 2,
        lastBookingDate: "2025-01-02",
        totalValue: 3200,
        status: "active",
      },
    ]

    return NextResponse.json({
      success: true,
      clients,
    })
  } catch (error) {
    console.error("Error fetching user clients:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user clients",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, preferences, emergencyContact, notes, agentEmail } = body

    // Validate required fields
    if (!name || !email || !agentEmail) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Later: Insert into Supabase
    // const { data, error } = await supabase
    //   .from('clients')
    //   .insert({
    //     name,
    //     email,
    //     phone,
    //     address,
    //     preferences,
    //     emergency_contact: emergencyContact,
    //     notes,
    //     agent_email: agentEmail,
    //     loyalty_level: 'Bronze',
    //     booking_count: 0,
    //     total_value: 0,
    //     created_at: new Date().toISOString(),
    //   })
    //   .select()
    //   .single()

    // For now, return mock response
    const newClient = {
      id: Date.now(),
      name,
      email,
      phone: phone || "",
      address: address || "",
      bookingCount: 0,
      totalValue: 0,
      lastBookingDate: null,
      firstBookingDate: new Date().toISOString().split("T")[0],
      loyaltyLevel: "Bronze",
      agentEmail,
      preferences: preferences || {},
      emergencyContact: emergencyContact || {},
      notes: notes || "",
      tags: ["Nieuwe klant"],
      communication: {
        preferredMethod: "Email",
        language: "Nederlands",
        frequency: "Regelmatig",
      },
      bookings: [],
    }

    return NextResponse.json({
      success: true,
      client: newClient,
      message: "Client successfully created",
    })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ success: false, error: "Failed to create client" }, { status: 500 })
  }
}
