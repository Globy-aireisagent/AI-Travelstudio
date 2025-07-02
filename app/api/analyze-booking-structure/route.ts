import type { NextRequest } from "next/server"
import { analyzeBookingData } from "@/lib/booking-data-analyzer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingData } = body

    if (!bookingData) {
      return Response.json({ error: "No booking data provided" }, { status: 400 })
    }

    console.log("🔍 Analyzing booking data structure...")

    const analysis = analyzeBookingData(bookingData)

    return Response.json({
      success: true,
      analysis,
      summary: {
        totalFields: analysis.availableFields.length,
        missingCriticalFields: analysis.missingFields.length,
        dataQualityScore: analysis.dataQuality.completeness,
        topRecommendations: analysis.recommendations.slice(0, 5),
      },
    })
  } catch (error) {
    console.error("❌ Booking structure analysis error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 },
    )
  }
}
