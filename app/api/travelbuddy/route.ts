import { type NextRequest, NextResponse } from "next/server"
import { TravelBuddyDatabase } from "@/lib/travelbuddy-database"

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()

    // Generate unique ID
    const id = Math.random().toString(36).substring(2, 15)

    // Save to database
    await TravelBuddyDatabase.saveTravelBuddy({
      ...config,
      id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    })

    return NextResponse.json({
      success: true,
      id,
      url: `${process.env.NEXT_PUBLIC_WEBSITE_BASE_URL}/travelbuddy/${id}`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create TravelBuddy" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  try {
    const config = await TravelBuddyDatabase.getTravelBuddy(id)

    if (!config) {
      return NextResponse.json({ error: "TravelBuddy not found" }, { status: 404 })
    }

    return NextResponse.json({ config })
  } catch (error) {
    return NextResponse.json({ error: "Failed to retrieve TravelBuddy" }, { status: 500 })
  }
}
