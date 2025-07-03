import { type NextRequest, NextResponse } from "next/server"

// Simpel wachtwoord - later kunnen we dit verbeteren
const ADMIN_PASSWORD = "TravelStudio2025!"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}
