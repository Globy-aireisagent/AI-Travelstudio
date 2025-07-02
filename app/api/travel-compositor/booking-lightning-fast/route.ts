import type { NextRequest } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"
import { bookingFastCache } from "@/lib/booking-fast-cache"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get("bookingId")
    const configNumber = Number.parseInt(searchParams.get("config") || "1")
    const forceRefresh = searchParams.get("refresh") === "true"

    if (!bookingId) {
      return Response.json({ success: false, error: "Missing bookingId parameter" })
    }

    console.log(`⚡ LIGHTNING FAST BOOKING: ${bookingId}`)

    // 1. INSTANT cache check (sub 10ms)
    if (!forceRefresh) {
      const cachedBooking = bookingFastCache.searchBooking(bookingId)
      if (cachedBooking) {
        const responseTime = Date.now() - startTime
        console.log(`🎯 CACHE HIT in ${responseTime}ms`)

        return Response.json({
          success: true,
          booking: cachedBooking,
          method: "instant_cache",
          responseTime: `${responseTime}ms`,
          performance: "LIGHTNING_FAST",
        })
      }
    }

    // 2. PARALLEL multi-config search for maximum speed
    console.log(`🔥 PARALLEL SEARCH across all configs...`)

    const searchPromises = [1, 2, 3, 4].map(async (config) => {
      try {
        const client = createTravelCompositorClient(config)
        const booking = await client.getBooking(bookingId)
        return { booking, config, success: true }
      } catch (error) {
        return { booking: null, config, success: false, error }
      }
    })

    // Race all configs - first successful response wins
    const results = await Promise.allSettled(searchPromises)

    let foundBooking = null
    let winningConfig = null

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.success && result.value.booking) {
        foundBooking = result.value.booking
        winningConfig = result.value.config
        break
      }
    }

    const responseTime = Date.now() - startTime

    if (foundBooking) {
      // Cache for next time
      bookingFastCache.setBooking(bookingId, foundBooking)

      console.log(`🎯 FOUND via parallel search in ${responseTime}ms (config ${winningConfig})`)

      return Response.json({
        success: true,
        booking: foundBooking,
        method: "parallel_search",
        responseTime: `${responseTime}ms`,
        winningConfig,
        performance: responseTime < 1000 ? "LIGHTNING_FAST" : responseTime < 3000 ? "FAST" : "NORMAL",
      })
    } else {
      console.log(`❌ NOT FOUND after ${responseTime}ms`)
      return Response.json({
        success: false,
        error: "Booking not found in any microsite",
        method: "parallel_search_failed",
        responseTime: `${responseTime}ms`,
        searchedConfigs: [1, 2, 3, 4],
      })
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`❌ Lightning search failed in ${responseTime}ms:`, error)

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: `${responseTime}ms`,
      },
      { status: 500 },
    )
  }
}
