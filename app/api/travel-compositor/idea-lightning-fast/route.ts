import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory cache for ideas
const ideaCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { id, micrositeConfig = "1" } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "Idea ID is required" })
    }

    const cacheKey = `${id}-${micrositeConfig}`
    console.log(`⚡ LIGHTNING FAST IDEA: ${id} (config: ${micrositeConfig})`)

    // 1. INSTANT cache check
    const cached = ideaCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const responseTime = Date.now() - startTime
      console.log(`🎯 IDEA CACHE HIT in ${responseTime}ms`)

      return NextResponse.json({
        success: true,
        data: cached.data,
        method: "instant_cache",
        responseTime: `${responseTime}ms`,
        performance: "LIGHTNING_FAST",
      })
    }

    // 2. PARALLEL multi-config search
    console.log(`🔥 PARALLEL IDEA SEARCH across configs...`)

    const configs = [
      {
        num: "1",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
      },
      {
        num: "2",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
      },
      {
        num: "3",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
      },
      {
        num: "4",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4,
      },
    ]

    const searchPromises = configs.map(async (config) => {
      try {
        if (!config.username || !config.password || !config.micrositeId) {
          return { idea: null, config: config.num, success: false }
        }

        // Authenticate
        const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            username: config.username,
            password: config.password,
            micrositeId: config.micrositeId,
          }),
        })

        if (!authResponse.ok) return { idea: null, config: config.num, success: false }

        const authData = await authResponse.json()
        const token = authData.token

        if (!token) return { idea: null, config: config.num, success: false }

        // Get idea
        const ideaResponse = await fetch(
          `https://online.travelcompositor.com/resources/travelidea/${config.micrositeId}/${id}?lang=nl`,
          {
            method: "GET",
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (!ideaResponse.ok) return { idea: null, config: config.num, success: false }

        const idea = await ideaResponse.json()
        return { idea, config: config.num, success: true }
      } catch (error) {
        return { idea: null, config: config.num, success: false, error }
      }
    })

    // Race all configs
    const results = await Promise.allSettled(searchPromises)

    let foundIdea = null
    let winningConfig = null

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.success && result.value.idea) {
        foundIdea = result.value.idea
        winningConfig = result.value.config
        break
      }
    }

    const responseTime = Date.now() - startTime

    if (foundIdea) {
      // Cache for next time
      ideaCache.set(cacheKey, { data: foundIdea, timestamp: Date.now() })

      console.log(`🎯 IDEA FOUND via parallel search in ${responseTime}ms (config ${winningConfig})`)

      return NextResponse.json({
        success: true,
        data: foundIdea,
        method: "parallel_search",
        responseTime: `${responseTime}ms`,
        winningConfig,
        performance: responseTime < 1000 ? "LIGHTNING_FAST" : responseTime < 3000 ? "FAST" : "NORMAL",
      })
    } else {
      console.log(`❌ IDEA NOT FOUND after ${responseTime}ms`)
      return NextResponse.json({
        success: false,
        error: "Idea not found in any microsite",
        method: "parallel_search_failed",
        responseTime: `${responseTime}ms`,
      })
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`❌ Lightning idea search failed in ${responseTime}ms:`, error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: `${responseTime}ms`,
      },
      { status: 500 },
    )
  }
}
