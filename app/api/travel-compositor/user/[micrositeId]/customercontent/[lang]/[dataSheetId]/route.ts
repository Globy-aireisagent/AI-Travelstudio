import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { micrositeId: string; lang: string; dataSheetId: string } },
) {
  try {
    const { micrositeId, lang, dataSheetId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"

    console.log(`🗑️ Deleting custom content datasheet ${dataSheetId} (${lang}) from microsite ${micrositeId}`)

    // Get credentials and authenticate
    let username, password, actualMicrositeId
    switch (config) {
      case "1":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
        break
      default:
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    }

    if (!username || !password || !actualMicrositeId) {
      throw new Error(`Missing credentials for config ${config}`)
    }

    // Authenticate
    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        micrositeId: actualMicrositeId,
      }),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Delete custom content
    const response = await fetch(
      `https://online.travelcompositor.com/resources/user/${actualMicrositeId}/customercontent/${lang}/${dataSheetId}`,
      {
        method: "DELETE",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Delete custom content failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      result,
      micrositeId: actualMicrositeId,
      lang,
      dataSheetId,
      action: "deleted",
    })
  } catch (error) {
    console.error("❌ Error deleting custom content:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
