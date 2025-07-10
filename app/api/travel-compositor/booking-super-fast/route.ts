import type { NextRequest } from "next/server"
import { client } from "@/lib/graphql"

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get("bookingId")

    if (!bookingId) {
      return Response.json({ success: false, error: "Booking ID is required" }, { status: 400 })
    }

    // Add timeout and proper error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const booking = await client.getBooking(bookingId, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!booking) {
        return Response.json(
          {
            success: false,
            error: "Booking niet gevonden",
            bookingId,
          },
          { status: 404 },
        )
      }

      return Response.json({
        success: true,
        booking,
        method: "super-fast",
        responseTime: Date.now() - startTime,
      })
    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === "AbortError") {
        return Response.json(
          {
            success: false,
            error: "Request timeout - probeer opnieuw",
          },
          { status: 408 },
        )
      }

      throw error
    }
  } catch (error) {
    console.error("❌ Booking Super Fast Error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Onbekende fout",
      },
      { status: 500 },
    )
  }
}
