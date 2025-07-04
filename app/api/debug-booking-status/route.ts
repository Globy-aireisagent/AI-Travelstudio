import { NextResponse } from "next/server"
import { createMultiMicrositeClient } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId") || "RRP-9571"

  console.log(`🔍 Debug booking status for: ${bookingId}`)

  try {
    // Set a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Operation timed out after 30 seconds")), 30000)
    })

    const debugPromise = async () => {
      const multiClient = createMultiMicrositeClient()
      const allClients = multiClient.getAllClients()

      console.log(`📋 Testing ${allClients.length} microsite configurations`)

      const results = []

      for (let i = 0; i < allClients.length; i++) {
        const client = allClients[i]
        const configName = `Config ${i + 1}`

        try {
          console.log(`🔍 Testing ${configName} (${client.config.micrositeId})...`)

          // Test authentication with timeout
          const authPromise = client.authenticate()
          const authTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Auth timeout")), 10000)
          })

          await Promise.race([authPromise, authTimeout])
          console.log(`✅ ${configName} authentication successful`)

          // Test booking search with timeout
          const bookingPromise = client.getBooking(bookingId)
          const bookingTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Booking search timeout")), 15000)
          })

          const booking = await Promise.race([bookingPromise, bookingTimeout])

          results.push({
            config: configName,
            micrositeId: client.config.micrositeId,
            authStatus: "✅ SUCCESS",
            bookingFound: booking ? "✅ FOUND" : "❌ NOT FOUND",
            bookingData: booking
              ? {
                  id: booking.id,
                  title: booking.title || booking.name || "No title",
                  client: booking.client?.name || booking.contactPerson?.name || "No client name",
                  status: booking.status || "Unknown status",
                }
              : null,
            error: null,
          })

          console.log(`✅ ${configName} completed - Booking ${booking ? "FOUND" : "NOT FOUND"}`)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          console.error(`❌ ${configName} failed:`, errorMessage)

          results.push({
            config: configName,
            micrositeId: client.config.micrositeId,
            authStatus: errorMessage.includes("Auth") ? "❌ AUTH FAILED" : "❌ ERROR",
            bookingFound: "❌ ERROR",
            bookingData: null,
            error: errorMessage,
          })
        }
      }

      return results
    }

    // Race between the debug operation and timeout
    const results = await Promise.race([debugPromise(), timeoutPromise])

    const summary = {
      totalConfigs: results.length,
      workingConfigs: results.filter((r) => r.authStatus === "✅ SUCCESS").length,
      foundBooking: results.filter((r) => r.bookingFound === "✅ FOUND").length,
    }

    console.log(`📊 Debug completed:`, summary)

    return NextResponse.json({
      success: true,
      bookingId,
      timestamp: new Date().toISOString(),
      results,
      summary,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("❌ Debug booking status error:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        bookingId,
        timestamp: new Date().toISOString(),
        results: [],
        summary: {
          totalConfigs: 0,
          workingConfigs: 0,
          foundBooking: 0,
        },
      },
      { status: 500 },
    )
  }
}
