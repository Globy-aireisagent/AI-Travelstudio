import { NextResponse } from "next/server"
import { bookingCache } from "@/lib/booking-cache"

export async function GET() {
  return NextResponse.json({
    success: true,
    stats: bookingCache.getStats(),
  })
}

export async function DELETE() {
  bookingCache.clear()
  return NextResponse.json({
    success: true,
    message: "Cache cleared",
  })
}
