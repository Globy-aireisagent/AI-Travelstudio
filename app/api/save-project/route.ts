import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json()

    // In a real app, you would save to a database
    // For now, we'll return success and let the frontend handle localStorage

    return NextResponse.json({
      success: true,
      message: "Project saved successfully",
      project: projectData,
    })
  } catch (error) {
    console.error("Error saving project:", error)
    return NextResponse.json({ success: false, error: "Failed to save project" }, { status: 500 })
  }
}
