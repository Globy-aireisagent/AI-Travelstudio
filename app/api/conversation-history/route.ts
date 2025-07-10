import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get("bookingId")

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is verplicht" }, { status: 400 })
    }

    const { data: conversations, error } = await supabaseServer
      .from("conversation_logs")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Fout bij ophalen gesprekgeschiedenis" }, { status: 500 })
    }

    const totalConversations = conversations?.length || 0
    const cachedResponses = conversations?.filter((c) => c.cached).length || 0
    const avgResponseTime = conversations?.length
      ? Math.round(conversations.reduce((sum, c) => sum + (c.response_time_ms || 0), 0) / conversations.length)
      : 0

    return NextResponse.json({
      conversations: conversations || [],
      stats: {
        total: totalConversations,
        cached: cachedResponses,
        avgResponseTime,
      },
    })
  } catch (err) {
    console.error("Fout bij conversation history:", err)
    return NextResponse.json({ error: "Er ging iets mis" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get("bookingId")

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is verplicht" }, { status: 400 })
    }

    // Delete conversation logs
    await supabaseServer.from("conversation_logs").delete().eq("booking_id", bookingId)

    // Delete cached responses
    await supabaseServer.from("response_cache").delete().eq("booking_id", bookingId)

    return NextResponse.json({ message: "Gesprekgeschiedenis gewist" })
  } catch (err) {
    console.error("Fout bij wissen gesprekgeschiedenis:", err)
    return NextResponse.json({ error: "Er ging iets mis" }, { status: 500 })
  }
}
