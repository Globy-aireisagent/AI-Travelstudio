import { type NextRequest, NextResponse } from "next/server"

interface GPTConfig {
  id: string
  name: string
  contentType: string
  writingStyle: string
  prompt: string
  status: "generated" | "customized" | "active"
  lastModified: string
  usageCount: number
}

interface CloudGPTStorage {
  userId: string
  gpts: GPTConfig[]
  lastSync: string
}

// Simuleer cloud storage (in productie zou dit een echte database zijn)
const cloudStorage = new Map<string, CloudGPTStorage>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "default-user"

    const userData = cloudStorage.get(userId)

    return NextResponse.json({
      success: true,
      gpts: userData?.gpts || [],
      lastSync: userData?.lastSync || null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load GPTs from cloud",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, gpts } = await request.json()

    if (!userId || !gpts) {
      return NextResponse.json(
        {
          success: false,
          error: "userId and gpts are required",
        },
        { status: 400 },
      )
    }

    const userData: CloudGPTStorage = {
      userId,
      gpts,
      lastSync: new Date().toISOString(),
    }

    cloudStorage.set(userId, userData)

    return NextResponse.json({
      success: true,
      message: `${gpts.length} GPTs saved to cloud`,
      lastSync: userData.lastSync,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save GPTs to cloud",
      },
      { status: 500 },
    )
  }
}
