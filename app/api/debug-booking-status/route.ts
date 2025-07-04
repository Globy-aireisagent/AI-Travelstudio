import { NextResponse } from "next/server"
import { createMultiMicrositeClient } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId") || "RRP-9263"

  console.log(`🔍 Debug booking status for: ${bookingId}`)

  try {
    const multiClient = createMultiMicrositeClient()
    const allClients = multiClient.getAllClients()

    const results = []

    for (let i = 0; i < allClients.length; i++) {
      const client = allClients[i]
      const configName = `Config ${i + 1}`

      try {
        console.log(`🔍 Testing ${configName}...`)

        // Test authentication first
        await client.authenticate()
        console.log(`✅ ${configName} authentication OK`)

        // Test booking search
        const booking = await client.getBooking(bookingId)

        results.push({
          config: configName,
          micrositeId: client.config.micrositeId,
          authStatus: "✅ OK",
          bookingFound: booking ? "✅ FOUND" : "❌ NOT FOUND",
          bookingData: booking
            ? {
                id: booking.id,
                title: booking.title || booking.name,
                client: booking.client?.name || booking.contactPerson?.name,
              }
            : null,
          error: null,
        })
      } catch (error) {
        console.error(`❌ ${configName} failed:`, error)
        results.push({
          config: configName,
          micrositeId: client.config.micrositeId,
          authStatus: "❌ FAILED",
          bookingFound: "❌ ERROR",
          bookingData: null,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        totalConfigs: results.length,
        workingConfigs: results.filter((r) => r.authStatus === "✅ OK").length,
        foundBooking: results.filter((r) => r.bookingFound === "✅ FOUND").length,
      },
    })
  } catch (error) {
    console.error("❌ Debug booking status error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        bookingId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
