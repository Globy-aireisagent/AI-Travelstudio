import type { NextRequest } from "next/server"
import { bookingFastCache } from "@/lib/booking-fast-cache"

// Ultra-aggressive caching and optimization
const BOOKING_CACHE = new Map<string, { data: any; timestamp: number; config: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get("bookingId")
    const forceRefresh = searchParams.get("refresh") === "true"

    if (!bookingId) {
      return Response.json({ success: false, error: "Missing bookingId parameter" })
    }

    console.log(`🚀 ULTRA FAST BOOKING: ${bookingId}`)

    // 1. INSTANT memory cache check (sub 5ms)
    if (!forceRefresh) {
      const cached = BOOKING_CACHE.get(bookingId)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        const responseTime = Date.now() - startTime
        console.log(`⚡ MEMORY CACHE HIT in ${responseTime}ms`)

        return Response.json({
          success: true,
          booking: cached.data,
          method: "memory_cache",
          responseTime: `${responseTime}ms`,
          performance: "ULTRA_FAST",
          config: cached.config,
        })
      }

      // 2. Fast cache fallback
      const cachedBooking = bookingFastCache.searchBooking(bookingId)
      if (cachedBooking) {
        const responseTime = Date.now() - startTime
        console.log(`🎯 FAST CACHE HIT in ${responseTime}ms`)

        return Response.json({
          success: true,
          booking: cachedBooking,
          method: "fast_cache",
          responseTime: `${responseTime}ms`,
          performance: "LIGHTNING_FAST",
        })
      }
    }

    // 3. SMART parallel search - start with most likely configs first
    console.log(`🔥 SMART PARALLEL SEARCH...`)

    const configs = [
      {
        num: 1,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
        priority: 1, // Most likely to have the booking
      },
      {
        num: 2,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
        priority: 2,
      },
      {
        num: 3,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
        priority: 3,
      },
      {
        num: 4,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4,
        priority: 4,
      },
    ].filter((config) => config.username && config.password && config.micrositeId)

    // Create search promises with timeout
    const searchPromises = configs.map(async (config) => {
      const configStartTime = Date.now()

      try {
        // Timeout after 30 seconds per config
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Config ${config.num} timeout`)), 30000),
        )

        const searchPromise = (async () => {
          // Authenticate
          const authResponse = await fetch(
            "https://online.travelcompositor.com/resources/authentication/authenticate",
            {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify({
                username: config.username,
                password: config.password,
                micrositeId: config.micrositeId,
              }),
            },
          )

          if (!authResponse.ok) throw new Error(`Auth failed for config ${config.num}`)

          const authData = await authResponse.json()
          const token = authData.token

          if (!token) throw new Error(`No token for config ${config.num}`)

          // Get booking
          const bookingResponse = await fetch(`https://online.travelcompositor.com/resources/booking/${bookingId}`, {
            method: "GET",
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (!bookingResponse.ok) throw new Error(`Booking not found in config ${config.num}`)

          const booking = await bookingResponse.json()
          const configTime = Date.now() - configStartTime

          console.log(`✅ Config ${config.num} found booking in ${configTime}ms`)

          return { booking, config: config.num, success: true, responseTime: configTime }
        })()

        return await Promise.race([searchPromise, timeoutPromise])
      } catch (error) {
        const configTime = Date.now() - configStartTime
        console.log(`❌ Config ${config.num} failed in ${configTime}ms:`, error.message)
        return { booking: null, config: config.num, success: false, error: error.message }
      }
    })

    // Wait for first successful result or all to complete
    const results = await Promise.allSettled(searchPromises)

    let foundBooking = null
    let winningConfig = null
    let winningTime = null

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.success && result.value.booking) {
        foundBooking = result.value.booking
        winningConfig = result.value.config
        winningTime = result.value.responseTime
        break
      }
    }

    const totalResponseTime = Date.now() - startTime

    if (foundBooking) {
      // Cache in both memory and fast cache
      BOOKING_CACHE.set(bookingId, {
        data: foundBooking,
        timestamp: Date.now(),
        config: winningConfig,
      })
      bookingFastCache.setBooking(bookingId, foundBooking)

      console.log(`🎯 BOOKING FOUND in ${totalResponseTime}ms (config ${winningConfig} in ${winningTime}ms)`)

      return Response.json({
        success: true,
        booking: foundBooking,
        method: "smart_parallel_search",
        responseTime: `${totalResponseTime}ms`,
        winningConfig,
        winningConfigTime: `${winningTime}ms`,
        performance:
          totalResponseTime < 1000
            ? "ULTRA_FAST"
            : totalResponseTime < 3000
              ? "LIGHTNING_FAST"
              : totalResponseTime < 10000
                ? "FAST"
                : "NORMAL",
      })
    } else {
      console.log(`❌ BOOKING NOT FOUND after ${totalResponseTime}ms`)
      return Response.json({
        success: false,
        error: "Booking not found in any microsite",
        method: "smart_parallel_search_failed",
        responseTime: `${totalResponseTime}ms`,
        searchedConfigs: configs.map((c) => c.num),
      })
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`❌ Ultra fast search failed in ${responseTime}ms:`, error)

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
