import { type NextRequest, NextResponse } from "next/server"
import { TravelBuddyDatabase } from "@/lib/travelbuddy-database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const config = await TravelBuddyDatabase.getTravelBuddy(params.id)

    if (!config) {
      return NextResponse.json({ error: "TravelBuddy not found" }, { status: 404 })
    }

    // Check if expired
    if (config.expiresAt && new Date() > config.expiresAt) {
      return NextResponse.json({ error: "TravelBuddy expired" }, { status: 410 })
    }

    return NextResponse.json({ config })
  } catch (error) {
    return NextResponse.json({ error: "Failed to retrieve TravelBuddy" }, { status: 500 })
  }
}
