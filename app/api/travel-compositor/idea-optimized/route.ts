import { type NextRequest, NextResponse } from "next/server"
import { createFastTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    const { id, micrositeConfig = "1" } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "Idea ID is required" })
    }

    console.log(`🔍 Optimized idea search: ${id} (config: ${micrositeConfig})`)

    const client = createFastTravelCompositorClient(Number.parseInt(micrositeConfig))

    // Get idea using the Travel Compositor ideas endpoint
    const response = await client.makeAuthenticatedRequest(`/resources/travelidea/${client.config.micrositeId}/${id}`)

    if (!response.ok) {
      throw new Error(`Idea ${id} niet gevonden`)
    }

    const idea = await response.json()

    return NextResponse.json({
      success: true,
      data: idea,
      metadata: {
        type: "idea",
        micrositeConfig,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Idea import error:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Er is een onverwachte fout opgetreden",
    })
  }
}
