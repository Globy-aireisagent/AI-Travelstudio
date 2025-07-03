import { type NextRequest, NextResponse } from "next/server"

const ADMIN_PASSWORD = "TravelStudio2025!"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })

      // Set cookie voor 24 uur
      response.cookies.set("admin-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24 uur
      })

      return response
    } else {
      return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}
