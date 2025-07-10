import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("email") || "demo@agent.com" // Demo data for now

    // For now, return demo data until we have real imported bookings
    const demoBookings = [
      {
        id: 1,
        bookingReference: "TC-2025-001",
        title: "Rondreis Zuid-Korea",
        destination: "Seoul, Busan, Jeju",
        clientName: "Familie Jansen",
        clientEmail: "jansen@email.com",
        departureDate: "2025-03-15",
        returnDate: "2025-03-25",
        totalPrice: 3450,
        status: "confirmed",
        pax: 2,
        createdAt: "2025-01-01",
        importedFrom: "travel-compositor",
      },
      {
        id: 2,
        bookingReference: "TC-2025-002",
        title: "Stedentrip Londen",
        destination: "London, UK",
        clientName: "Meneer de Vries",
        clientEmail: "devries@email.com",
        departureDate: "2025-02-10",
        returnDate: "2025-02-14",
        totalPrice: 1250,
        status: "pending",
        pax: 1,
        createdAt: "2025-01-02",
        importedFrom: "travel-compositor",
      },
      {
        id: 3,
        bookingReference: "TC-2025-003",
        title: "Cruise Middellandse Zee",
        destination: "Barcelona, Rome, Athene",
        clientName: "Familie Peters",
        clientEmail: "peters@email.com",
        departureDate: "2025-05-20",
        returnDate: "2025-05-30",
        totalPrice: 5600,
        status: "confirmed",
        pax: 4,
        createdAt: "2025-01-03",
        importedFrom: "travel-compositor",
      },
    ]

    // Later: Query real bookings from Supabase
    // const { data: bookings, error } = await supabase
    //   .from('imported_bookings')
    //   .select('*')
    //   .eq('agent_email', userEmail)
    //   .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      bookings: demoBookings,
      total: demoBookings.length,
    })
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
  }
}
