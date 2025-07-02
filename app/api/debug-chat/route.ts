import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  console.log("🔍 Debug endpoint called")

  try {
    // Test the travel-content-chat API
    const testBody = {
      messages: [{ role: "user", content: "Test bericht voor Amsterdam" }],
      contentType: "destination",
      writingStyle: "speels",
    }

    console.log("📤 Sending test request to travel-content-chat API")

    const response = await fetch(`${request.nextUrl.origin}/api/travel-content-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testBody),
    })

    console.log("📥 Response received:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    const responseText = await response.text()
    console.log("📄 Response body:", responseText.slice(0, 500))

    return Response.json({
      success: true,
      apiResponse: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText.slice(0, 1000),
      },
    })
  } catch (error: any) {
    console.error("❌ Debug error:", error)

    return Response.json({
      success: false,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
    })
  }
}
