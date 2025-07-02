import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient, createMultiMicrositeClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug: Analyzing why multi-microsite works but single doesn't...")

    // Test single microsite client
    const singleResults = await testSingleMicrosite()

    // Test multi-microsite client
    const multiResults = await testMultiMicrosite()

    // Compare and analyze
    const conclusion = analyzeResults(singleResults, multiResults)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      conclusion,
      authComparison: {
        singleClientBaseUrl: singleResults.baseUrl,
        singleClientMicrositeId: singleResults.micrositeId,
        tokenPresent: !!singleResults.token,
        tokenPreview: singleResults.token ? `${singleResults.token.substring(0, 20)}...` : null,
      },
      results: {
        singleMicrosite: singleResults,
        multiMicrosite: multiResults,
      },
    })
  } catch (error) {
    console.error("❌ Debug working endpoints error:", error)

    // Return a safe error response
    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          message: error instanceof Error ? error.message : String(error),
          type: error instanceof Error ? error.constructor.name : "Unknown",
          stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
        },
      },
      { status: 500 },
    )
  }
}

async function testSingleMicrosite() {
  const results = {
    baseUrl: "",
    micrositeId: "",
    token: null as string | null,
    tests: [] as any[],
    authError: null as string | null,
  }

  try {
    console.log("🔍 Testing single microsite client...")

    const client = createTravelCompositorClient(1)
    results.baseUrl = client.config.baseUrl || ""
    results.micrositeId = client.config.micrositeId || ""

    // Test authentication first
    try {
      console.log("🔐 Attempting authentication...")
      const token = await client.authenticate()
      results.token = token
      console.log("✅ Single microsite auth successful")
    } catch (authError) {
      const errorMessage = authError instanceof Error ? authError.message : String(authError)
      console.error("❌ Single microsite auth failed:", errorMessage)
      results.authError = errorMessage

      results.tests.push({
        endpoint: "Authentication",
        success: false,
        error: errorMessage,
        status: "AUTH_FAILED",
      })
      return results
    }

    // Test booking endpoints only if auth succeeded
    const testEndpoints = [
      `/resources/booking/getBookings?microsite=${results.micrositeId}&from=20250101&to=20251231&firstResult=0&maxResults=10`,
      `/resources/booking/getBookings?microsite=${results.micrositeId}&firstResult=0&maxResults=10`,
      `/resources/booking/getBookings?firstResult=0&maxResults=10`,
    ]

    for (const endpoint of testEndpoints) {
      await testSingleEndpoint(client, endpoint, results)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("❌ Single microsite test failed:", errorMessage)
    results.tests.push({
      endpoint: "General Test",
      success: false,
      error: errorMessage,
      status: "FAILED",
    })
  }

  return results
}

async function testSingleEndpoint(client: any, endpoint: string, results: any) {
  try {
    console.log(`🧪 Testing single: ${endpoint}`)
    const response = await client.makeAuthenticatedRequest(endpoint)

    let responseData = null
    let responsePreview = ""
    let error = null

    // Always read the response as text first
    const responseText = await response.text()
    responsePreview = responseText.substring(0, 200)

    if (response.ok) {
      // Try to parse as JSON only if it looks like JSON
      if (responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
        try {
          responseData = JSON.parse(responseText)
        } catch (parseError) {
          error = `JSON parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`
        }
      } else {
        error = `Non-JSON response: ${responseText.substring(0, 100)}`
      }
    } else {
      error = `HTTP ${response.status}: ${responseText.substring(0, 200)}`
    }

    results.tests.push({
      endpoint,
      success: response.ok && !error,
      status: response.status,
      responsePreview,
      error,
      bookingCount: responseData?.bookedTrip?.length || 0,
      contentType: response.headers.get("content-type"),
    })
  } catch (requestError) {
    const errorMessage = requestError instanceof Error ? requestError.message : String(requestError)
    results.tests.push({
      endpoint,
      success: false,
      error: errorMessage,
      status: "REQUEST_FAILED",
    })
  }
}

async function testMultiMicrosite() {
  const results = {
    tests: [] as any[],
  }

  try {
    console.log("🔍 Testing multi-microsite client...")

    const multiClient = createMultiMicrositeClient()

    // Test search for a specific booking with timeout
    try {
      console.log("🔍 Searching for booking RRP-9200...")

      // Add a timeout to prevent hanging
      const searchPromise = multiClient.searchBookingAcrossAllMicrosites("RRP-9200")
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Search timeout after 30 seconds")), 30000),
      )

      const searchResult = (await Promise.race([searchPromise, timeoutPromise])) as any

      results.tests.push({
        method: "searchBookingAcrossAllMicrosites('RRP-9200')",
        success: !!searchResult.booking,
        foundIn: searchResult.foundInMicrosite,
        searchResults: searchResult.searchResults,
      })
    } catch (searchError) {
      const errorMessage = searchError instanceof Error ? searchError.message : String(searchError)
      results.tests.push({
        method: "searchBookingAcrossAllMicrosites('RRP-9200')",
        success: false,
        error: errorMessage,
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("❌ Multi-microsite test failed:", errorMessage)
    results.tests.push({
      method: "General Test",
      success: false,
      error: errorMessage,
    })
  }

  return results
}

function analyzeResults(singleResults: any, multiResults: any) {
  const singleWorks = singleResults.tests.some((t: any) => t.success && t.bookingCount > 0)
  const multiWorks = multiResults.tests.some((t: any) => t.success)

  const possibleIssues = []

  if (singleResults.authError) {
    possibleIssues.push(`Single microsite authenticatie fout: ${singleResults.authError}`)
  }

  if (!singleWorks && multiWorks) {
    possibleIssues.push("Single microsite client heeft endpoint problemen na authenticatie")
    possibleIssues.push("Multi-microsite client gebruikt mogelijk andere configuratie")
  }

  if (!singleWorks && !multiWorks) {
    possibleIssues.push("Beide clients hebben problemen - mogelijk API down of credentials verkeerd")
  }

  if (singleWorks && !multiWorks) {
    possibleIssues.push("Multi-microsite client heeft timeout of configuratie problemen")
  }

  // Add specific error analysis
  const singleErrors = singleResults.tests.filter((t: any) => !t.success).map((t: any) => t.error)
  const multiErrors = multiResults.tests.filter((t: any) => !t.success).map((t: any) => t.error)

  return {
    singleMicrositeWorks: singleWorks,
    multiMicrositeWorks: multiWorks,
    possibleIssues,
    singleErrors,
    multiErrors,
  }
}
