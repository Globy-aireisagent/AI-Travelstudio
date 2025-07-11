import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const WebsiteDataSchema = z.object({
  title: z.string().describe("The title of the webpage"),
  summary: z.string().describe("A brief summary of the webpage content in Dutch"),
  accommodations: z.array(z.string()).optional().describe("Hotels or accommodations mentioned on the page"),
  activities: z.array(z.string()).optional().describe("Activities, attractions or excursions mentioned"),
  restaurants: z.array(z.string()).optional().describe("Restaurants or dining options mentioned"),
  practicalInfo: z
    .array(z.string())
    .optional()
    .describe("Practical travel information like transport, opening hours, etc."),
  prices: z.array(z.string()).optional().describe("Price information found on the page"),
  contactInfo: z
    .object({
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
    })
    .optional()
    .describe("Contact information if available"),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "Geen URL opgegeven" }, { status: 400 })
    }

    console.log("🌐 Scraping URL:", url)

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    console.log("📄 HTML content length:", html.length)

    // Extract text content from HTML
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove styles
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "") // Remove navigation
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "") // Remove footer
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "") // Remove header
      .replace(/<[^>]+>/g, " ") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()

    // Limit content length for AI processing
    const limitedContent = textContent.substring(0, 8000)

    // Use AI to extract structured travel information
    const { object: websiteData } = await generateObject({
      model: openai("gpt-4o"),
      schema: WebsiteDataSchema,
      prompt: `Analyseer deze website content en extraheer relevante reisinformatie.

URL: ${url}
Content: ${limitedContent}

Extraheer:
1. Titel van de pagina
2. Nederlandse samenvatting van de content
3. Accommodaties (hotels, B&Bs, etc.)
4. Activiteiten en attracties
5. Restaurants en eetgelegenheden
6. Praktische informatie (transport, openingstijden, etc.)
7. Prijsinformatie
8. Contactgegevens

Focus alleen op reisgerelateerde informatie die nuttig is voor toeristen.`,
    })

    console.log("✅ Website scraping successful:", {
      url,
      title: websiteData.title,
      accommodations: websiteData.accommodations?.length || 0,
      activities: websiteData.activities?.length || 0,
      restaurants: websiteData.restaurants?.length || 0,
    })

    // Create readable text summary
    const scrapedText = `
WEBSITE: ${url}
TITEL: ${websiteData.title}

SAMENVATTING: ${websiteData.summary}

ACCOMMODATIES:
${websiteData.accommodations?.map((acc) => `- ${acc}`).join("\n") || "Geen accommodaties gevonden"}

ACTIVITEITEN:
${websiteData.activities?.map((act) => `- ${act}`).join("\n") || "Geen activiteiten gevonden"}

RESTAURANTS:
${websiteData.restaurants?.map((rest) => `- ${rest}`).join("\n") || "Geen restaurants gevonden"}

PRAKTISCHE INFORMATIE:
${websiteData.practicalInfo?.map((info) => `- ${info}`).join("\n") || "Geen praktische informatie gevonden"}

PRIJZEN:
${websiteData.prices?.map((price) => `- ${price}`).join("\n") || "Geen prijsinformatie gevonden"}

${websiteData.contactInfo?.phone ? `TELEFOON: ${websiteData.contactInfo.phone}` : ""}
${websiteData.contactInfo?.email ? `EMAIL: ${websiteData.contactInfo.email}` : ""}
${websiteData.contactInfo?.address ? `ADRES: ${websiteData.contactInfo.address}` : ""}
    `.trim()

    return new Response(scrapedText, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (error) {
    console.error("❌ Error scraping URL:", error)

    return new Response(
      `Fout bij het ophalen van de website: ${error instanceof Error ? error.message : "Onbekende fout"}`,
      {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        status: 500,
      },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: "URL is required",
        },
        { status: 400 },
      )
    }

    console.log("🌐 Advanced scraping URL:", url)

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    console.log("📄 HTML content length:", html.length)

    // Extract text content from HTML (simple approach)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove styles
      .replace(/<[^>]+>/g, " ") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()

    // Limit content length for AI processing
    const limitedContent = textContent.substring(0, 8000)

    // Use AI to extract structured travel information
    const { object: websiteData } = await generateObject({
      model: openai("gpt-4o"),
      schema: WebsiteDataSchema,
      prompt: `Analyseer deze website content en extraheer relevante reisinformatie.

URL: ${url}
Content: ${limitedContent}

Extraheer:
1. Titel van de pagina
2. Nederlandse samenvatting van de content
3. Accommodaties (hotels, B&Bs, etc.)
4. Activiteiten en attracties
5. Restaurants en eetgelegenheden
6. Praktische informatie (transport, openingstijden, etc.)
7. Prijsinformatie
8. Contactgegevens

Focus alleen op reisgerelateerde informatie die nuttig is voor toeristen.`,
    })

    console.log("✅ Website scraping successful:", {
      url,
      title: websiteData.title,
      accommodations: websiteData.accommodations?.length || 0,
      activities: websiteData.activities?.length || 0,
      restaurants: websiteData.restaurants?.length || 0,
    })

    return NextResponse.json({
      success: true,
      url,
      data: websiteData,
      scrapedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error scraping URL:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred while scraping URL",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}
