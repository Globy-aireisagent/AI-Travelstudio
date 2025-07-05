import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const buddyData = await request.json()

    // Generate published URL if publishing
    if (buddyData.action === "publish") {
      const publishedUrl = `https://travelbuddy.app/${buddyData.type === "general" ? "general" : buddyData.bookingId || buddyData.id}`

      return NextResponse.json({
        success: true,
        message: "Travel Buddy published successfully",
        buddy: {
          ...buddyData,
          status: "active",
          isPublished: true,
          publishedUrl,
        },
      })
    }

    // Regular save
    return NextResponse.json({
      success: true,
      message: "Travel Buddy saved successfully",
      buddy: buddyData,
    })
  } catch (error) {
    console.error("Error saving travel buddy:", error)
    return NextResponse.json({ success: false, error: "Failed to save travel buddy" }, { status: 500 })
  }
}
