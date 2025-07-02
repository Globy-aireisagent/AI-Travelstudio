import { type NextRequest, NextResponse } from "next/server"
import { AnalyticsService } from "@/lib/analytics-service"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || "default"

  try {
    const analytics = AnalyticsService.getAnalytics(userId)
    return NextResponse.json(analytics)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json()

    switch (action) {
      case "roadbook_generated":
        await AnalyticsService.trackRoadbookGenerated(userId, data.destination)
        break
      case "media_generated":
        await AnalyticsService.trackMediaGenerated(userId, data.type)
        break
      case "reisbuddy_created":
        await AnalyticsService.trackReisbuddyCreated(userId)
        break
      case "message_sent":
        await AnalyticsService.trackMessage(userId)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to track analytics" }, { status: 500 })
  }
}
