import { NextResponse } from "next/server"

// Simple test function to check if our basic setup works
async function testBasicConnection() {
  try {
    // Test environment variables
    const username1 = process.env.TRAVEL_COMPOSITOR_USERNAME
    const password1 = process.env.TRAVEL_COMPOSITOR_PASSWORD
    const micrositeId1 = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID

    if (!username1 || !password1 || !micrositeId1) {
      throw new Error("Missing primary environment variables")
    }

    return {
      config: "Config 1",
      micrositeId: micrositeId1,
      authStatus: "✅ ENV OK",
      bookingFound: "⏳ PENDING",
      bookingData: null,
      error: null,
    }
  } catch (error) {
    return {
      config: "Config 1",
      micrositeId: "unknown",
      authStatus: "❌ ENV ERROR",
      bookingFound: "❌ ERROR",
      bookingData: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId") || "RRP-9263"

  console.log(`🔍 Debug booking status for: ${bookingId}`)

  try {
    // Start with basic environment check
    const basicTest = await testBasicConnection()

    const results = [basicTest]

    // Try to test additional configs if they exist
    const configs = [
      {
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
        name: "Config 2",
      },
      {
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
        name: "Config 3",
      },
      {
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4,
        name: "Config 4",
      },
    ]

    for (const config of configs) {
      if (config.username && config.password && config.micrositeId) {
        results.push({
          config: config.name,
          micrositeId: config.micrositeId,
          authStatus: "✅ ENV OK",
          bookingFound: "⏳ PENDING",
          bookingData: null,
          error: null,
        })
      } else {
        results.push({
          config: config.name,
          micrositeId: config.micrositeId || "missing",
          authStatus: "❌ ENV MISSING",
          bookingFound: "❌ ERROR",
          bookingData: null,
          error: "Environment variables not configured",
        })
      }
    }

    const summary = {
      totalConfigs: results.length,
      workingConfigs: results.filter((r) => r.authStatus === "✅ ENV OK").length,
      foundBooking: 0, // We're just testing env vars for now
    }

    console.log(`📊 Basic debug completed:`, summary)

    return NextResponse.json({
      success: true,
      bookingId,
      timestamp: new Date().toISOString(),
      results,
      summary,
      note: "This is a basic environment variable test. Full API testing will be added once this works.",
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
