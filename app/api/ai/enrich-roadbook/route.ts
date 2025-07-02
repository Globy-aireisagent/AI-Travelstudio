import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { roadbookData } = await request.json()

    // Enrich each day with AI-generated content
    const enrichedDays = await Promise.all(
      roadbookData.days.map(async (day: any) => {
        const enrichedDay = await enrichDayWithAI(day)
        return enrichedDay
      }),
    )

    return Response.json({
      ...roadbookData,
      days: enrichedDays,
    })
  } catch (error) {
    console.error("Error enriching roadbook:", error)
    return Response.json({ error: "Failed to enrich roadbook" }, { status: 500 })
  }
}

async function enrichDayWithAI(day: any) {
  const locations = day.locations.join(", ")

  const prompt = `
Genereer voor een roadbook dag in ${locations} de volgende content in het Nederlands:

BESTAANDE ACTIVITEITEN:
${day.activities.map((a: any) => `- ${a.name} (${a.time})`).join("\n")}

GENEREER:
1. 3-5 extra bezienswaardigheden met tijdsduur en geschatte kosten
2. 2-3 restaurant aanbevelingen (verschillende prijsklassen)
3. 5 praktische tips voor deze locaties
4. Een korte route beschrijving tussen de locaties
5. Beste tijden om drukte te vermijden

Format als JSON:
{
  "highlights": [{"name": "", "duration": "", "price": "", "type": "sightseeing|restaurant|activity", "description": ""}],
  "tips": ["tip1", "tip2", ...],
  "route": "route beschrijving",
  "bestTimes": "aanbevolen tijden"
}
`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system: "Je bent een ervaren reisagent die gedetailleerde, praktische reisinformatie geeft in het Nederlands.",
    })

    const aiContent = JSON.parse(text)

    return {
      ...day,
      highlights: [...(day.highlights || []), ...aiContent.highlights],
      tips: aiContent.tips,
      route: aiContent.route,
      bestTimes: aiContent.bestTimes,
      aiEnriched: true,
    }
  } catch (error) {
    console.error("Error with AI enrichment:", error)
    return day // Return original day if AI fails
  }
}
