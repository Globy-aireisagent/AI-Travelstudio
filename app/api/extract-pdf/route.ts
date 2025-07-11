import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const PDFDataSchema = z.object({
  title: z.string().describe("The title or name of the trip"),
  summary: z.string().describe("A brief summary of the trip in Dutch"),
  destination: z.string().optional().describe("Main destination(s)"),
  startDate: z.string().optional().describe("Start date if found"),
  endDate: z.string().optional().describe("End date if found"),
  duration: z.string().optional().describe("Trip duration"),
  accommodations: z.array(z.string()).optional().describe("Hotels or accommodations mentioned"),
  activities: z.array(z.string()).optional().describe("Activities or excursions mentioned"),
  transport: z.array(z.string()).optional().describe("Transportation mentioned"),
  bookingReference: z.string().optional().describe("Booking reference number if found"),
  clientName: z.string().optional().describe("Client name if found"),
  totalPrice: z.string().optional().describe("Total price if mentioned"),
  keyDetails: z.array(z.string()).describe("Important details that would be useful for a travel assistant"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fileBase64 } = body

    if (!fileBase64) {
      return NextResponse.json({ error: "Geen PDF data ontvangen" }, { status: 400 })
    }

    console.log("📄 Processing PDF with AI extraction...")

    // Convert base64 to text using AI (since we can't directly parse PDF in browser)
    const { object: pdfData } = await generateObject({
      model: openai("gpt-4o"),
      schema: PDFDataSchema,
      prompt: `Je bent een expert in het analyseren van reisdocumenten. 
      
Analyseer deze PDF content (base64 encoded) en extraheer alle relevante reisinformatie:

${fileBase64.substring(0, 8000)}

Extraheer:
1. Titel/naam van de reis
2. Nederlandse samenvatting van de reis
3. Hoofdbestemming(en)
4. Start- en einddatum
5. Duur van de reis
6. Accommodaties (hotels, resorts, etc.)
7. Activiteiten en excursies
8. Transport (vluchten, auto's, etc.)
9. Boekingsreferentie
10. Klantnaam
11. Totaalprijs
12. Belangrijke details voor een reisassistent

Focus op praktische informatie die nuttig is voor reizigers.`,
    })

    console.log("✅ PDF extraction successful:", {
      title: pdfData.title,
      destination: pdfData.destination,
      accommodations: pdfData.accommodations?.length || 0,
      activities: pdfData.activities?.length || 0,
    })

    // Create a readable text summary
    const extractedText = `
REISTITEL: ${pdfData.title}

SAMENVATTING: ${pdfData.summary}

BESTEMMING: ${pdfData.destination || "Niet gespecificeerd"}

PERIODE: ${pdfData.startDate || "Niet gespecificeerd"} - ${pdfData.endDate || "Niet gespecificeerd"}
DUUR: ${pdfData.duration || "Niet gespecificeerd"}

ACCOMMODATIES:
${pdfData.accommodations?.map((acc) => `- ${acc}`).join("\n") || "Geen accommodaties gevonden"}

ACTIVITEITEN:
${pdfData.activities?.map((act) => `- ${act}`).join("\n") || "Geen activiteiten gevonden"}

TRANSPORT:
${pdfData.transport?.map((trans) => `- ${trans}`).join("\n") || "Geen transport informatie gevonden"}

BELANGRIJKE DETAILS:
${pdfData.keyDetails?.map((detail) => `- ${detail}`).join("\n") || "Geen extra details gevonden"}

${pdfData.bookingReference ? `BOEKINGSREFERENTIE: ${pdfData.bookingReference}` : ""}
${pdfData.clientName ? `KLANT: ${pdfData.clientName}` : ""}
${pdfData.totalPrice ? `PRIJS: ${pdfData.totalPrice}` : ""}
    `.trim()

    return NextResponse.json({
      success: true,
      text: extractedText,
      structuredData: pdfData,
      extractedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error extracting PDF:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Er ging iets mis bij het verwerken van de PDF",
        text: "Fout bij PDF verwerking - probeer het opnieuw of neem contact op voor ondersteuning.",
      },
      { status: 500 },
    )
  }
}
