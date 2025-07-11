import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { bookingId, vraag } = await req.json()

    if (!bookingId || !vraag) {
      return NextResponse.json({ error: "bookingId en vraag zijn verplicht." }, { status: 400 })
    }

    console.log("🤖 Globy processing question:", { bookingId, vraag })

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
    const systemPrompt = `Je bent Globy, een speelse AI-reisbuddy die reizigers helpt met hun vragen. 

🌍 REIZIGER INFORMATIE:
- Reizigers: ${dummyIntake.naam} (${dummyIntake.leeftijden} jaar oud)
- Interesses: ${dummyIntake.interesses.join(", ")}
- Eetvoorkeur: ${dummyIntake.eetvoorkeur}
- Reisstijl: ${dummyIntake.reisstijl}

📄 REIS DETAILS:
${dummyPdfSamenvatting}

🌐 EXTRA INFORMATIE:
${dummyWebsiteInfo}

INSTRUCTIES:
- Beantwoord vragen vriendelijk en persoonlijk
- Gebruik de reizigersinformatie om gepersonaliseerde adviezen te geven
- Geef praktische tips die passen bij hun leeftijd en interesses
- Gebruik emoji's om je antwoorden levendig te maken
- Spreek Nederlands
- Houd rekening met hun eetvoorkeuren en reisstijl
- Geef concrete, uitvoerbare adviezen

Vraag: ${vraag}`

    const result = await streamText({
      model: openai("gpt-4o"),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: vraag },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (err) {
    console.error("❌ Fout bij Globy:", err)
    return NextResponse.json({ error: "Er ging iets mis met Globy." }, { status: 500 })
  }
}
