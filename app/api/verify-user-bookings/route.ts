import { NextResponse } from "next/server"
import { ImprovedUserBookingSyncService } from "@/lib/improved-user-booking-sync"

export async function POST() {
  try {
    console.log("🔍 Starting user-booking verification...")

    // Start de verbeterde sync
    await ImprovedUserBookingSyncService.syncUserBookingsWithVerification()

    // Haal resultaten op
    const allLinks = ImprovedUserBookingSyncService.getAllLinks()

    const summary = {
      totalMicrosites: allLinks.size,
      totalLinks: 0,
      highConfidenceLinks: 0,
      mediumConfidenceLinks: 0,
      lowConfidenceLinks: 0,
      byMicrosite: {} as any,
    }

    for (const [micrositeKey, links] of allLinks.entries()) {
      summary.totalLinks += links.length
      summary.highConfidenceLinks += links.filter((l) => l.confidence >= 90).length
      summary.mediumConfidenceLinks += links.filter((l) => l.confidence >= 70 && l.confidence < 90).length
      summary.lowConfidenceLinks += links.filter((l) => l.confidence < 70).length

      summary.byMicrosite[micrositeKey] = {
        totalLinks: links.length,
        emailLinks: links.filter((l) => l.linkMethod === "email").length,
        userIdLinks: links.filter((l) => l.linkMethod === "userId").length,
        nameLinks: links.filter((l) => l.linkMethod === "name").length,
        manualLinks: links.filter((l) => l.linkMethod === "manual").length,
        averageConfidence: links.reduce((sum, l) => sum + l.confidence, 0) / links.length,
      }
    }

    return NextResponse.json({
      success: true,
      message: "User-booking verification completed",
      summary,
      recommendations: [
        summary.highConfidenceLinks / summary.totalLinks > 0.8
          ? "✅ Goede koppeling kwaliteit"
          : "⚠️ Veel koppelingen hebben lage confidence",
        summary.byMicrosite["microsite-1"]?.emailLinks > 0 ? "✅ Email matching werkt" : "❌ Email matching faalt",
        "Overweeg handmatige verificatie voor lage confidence koppelingen",
      ],
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
