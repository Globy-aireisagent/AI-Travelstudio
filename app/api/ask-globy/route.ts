import { NextResponse } from "next/server"
import { OpenAI } from "openai"
import { supabaseServer } from "@/lib/supabase"
import crypto from "crypto"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { bookingId, vraag } = await req.json()

    if (!bookingId || !vraag) {
      return NextResponse.json({ error: "bookingId en vraag zijn verplicht." }, { status: 400 })
    }

    const startTime = Date.now()

    // Generate hash for caching
    const questionHash = crypto.createHash("md5").update(vraag.toLowerCase().trim()).digest("hex")

    // Check cache first
    const { data: cachedResponse } = await supabaseServer
      .from("response_cache")
      .select("cached_response")
      .eq("booking_id", bookingId)
      .eq("question_hash", questionHash)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (cachedResponse) {
      // Log cached response
      await supabaseServer.from("conversation_logs").insert({
        booking_id: bookingId,
        user_message: vraag,
        globy_response: cachedResponse.cached_response,
        response_time_ms: Date.now() - startTime,
        cached: true,
      })

      return NextResponse.json(
        {
          antwoord: cachedResponse.cached_response,
          cached: true,
          responseTime: Date.now() - startTime,
        },
        { status: 200 },
      )
    }

    // 🧠 Simulatie ophalen van intake/PDF/URL (straks uit Supabase of DB)
    const dummyIntake = {
      naam: "Nova & Zyam",
      leeftijden: "11 en 13",
      interesses: ["dieren", "TikTok", "foto's maken"],
      eetvoorkeur: "pizza, salade, geen vis",
      reisstijl: "actief maar relaxed",
    }

    const dummyPdfSamenvatting =
      "Roadtrip West-USA, met overnachtingen in San Francisco, Yosemite, Las Vegas, Grand Canyon, Joshua Tree en Los Angeles."
    const dummyWebsiteInfo =
      "De klant heeft een voorkeur voor korte wandelingen (max 5km) en activiteiten die geschikt zijn voor kinderen."

    // ✏️ Prompt genereren
    const systemPrompt = `Je bent Globy, een speelse AI-reisbuddy. Jouw taak is om te antwoorden op vragen van reizigers gebaseerd op hun intake, reisdocumenten en website info.

🌍 Reizigers: ${dummyIntake.naam} (${dummyIntake.leeftijden})
🎒 Interesses: ${dummyIntake.interesses.join(", ")}
🍴 Eetvoorkeur: ${dummyIntake.eetvoorkeur}
✨ Reisstijl: ${dummyIntake.reisstijl}

📄 PDF samenvatting:
${dummyPdfSamenvatting}

🌐 Website info:
${dummyWebsiteInfo}

Beantwoord de volgende vraag vriendelijk, duidelijk, en in Globy-stijl (met eventueel emoji's of tips):

Vraag: ${vraag}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: vraag },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const antwoord = completion.choices[0].message.content || "Oeps, ik weet het even niet..."
    const responseTime = Date.now() - startTime

    // Cache the response
    await supabaseServer.from("response_cache").upsert({
      booking_id: bookingId,
      question_hash: questionHash,
      cached_response: antwoord,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    })

    // Log the conversation
    await supabaseServer.from("conversation_logs").insert({
      booking_id: bookingId,
      user_message: vraag,
      globy_response: antwoord,
      response_time_ms: responseTime,
      cached: false,
    })

    return NextResponse.json(
      {
        antwoord,
        cached: false,
        responseTime,
        bookingId,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("Fout bij Globy:", err)
    return NextResponse.json({ error: "Er ging iets mis met Globy." }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Gebruik POST om vragen te stellen aan Globy." }, { status: 405 })
}
