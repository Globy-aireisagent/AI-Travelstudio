import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { TRAVEL_TERMINOLOGY, analyzeJourneyStructure } from "@/lib/travel-terminology"

const TravelDataSchema = z.object({
  title: z.string().describe("The title of the trip"),
  description: z.string().describe("Description of the trip"),
  shortDescription: z.string().optional().describe("Short description"),
  bookingReference: z.string().optional().describe("Booking reference number"),
  startDate: z.string().optional().describe("Start date in ISO format"),
  endDate: z.string().optional().describe("End date in ISO format"),
  totalPrice: z
    .object({
      amount: z.number(),
      currency: z.string(),
    })
    .optional()
    .describe("Total price"),
  clientName: z.string().optional().describe("Client name"),
  clientEmail: z.string().optional().describe("Client email"),
  clientPhone: z.string().optional().describe("Client phone"),
  destinations: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
      }),
    )
    .describe("All destinations visited"),
  accommodations: z
    .array(
      z.object({
        name: z.string(),
        type: z.string().optional().describe("Type: hotel, resort, lodge, B&B, apartment, etc."),
        location: z.string().optional(),
        description: z.string().optional(),
        checkInDate: z.string().optional(),
        checkOutDate: z.string().optional(),
        nights: z.number().optional(),
        phase: z.string().optional().describe("Journey phase: pre-cruise, cruise, post-cruise, etc."),
        images: z.array(z.string()).optional(),
      }),
    )
    .describe("ALL accommodations including hotels, resorts, lodges, B&Bs, apartments, etc."),
  flights: z
    .array(
      z.object({
        type: z.string().describe("Type: outbound, return, internal, connecting"),
        from: z.string().optional(),
        to: z.string().optional(),
        departureDate: z.string().optional(),
        arrivalDate: z.string().optional(),
        airline: z.string().optional(),
      }),
    )
    .optional()
    .describe("All flights counted separately"),
  transports: z
    .array(
      z.object({
        type: z.string().describe("Type: flight, car, bus, train, transfer, etc."),
        description: z.string().optional(),
        departureDate: z.string().optional(),
        arrivalDate: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        phase: z.string().optional().describe("Journey phase when used"),
      }),
    )
    .optional()
    .describe("All transport options"),
  cruises: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        departurePort: z.string().optional(),
        arrivalPort: z.string().optional(),
        duration: z.string().optional(),
        shipName: z.string().optional(),
        images: z.array(z.string()).optional(),
      }),
    )
    .optional()
    .describe("Cruise components"),
  cars: z
    .array(
      z.object({
        type: z.string().describe("Type: rental car, private transfer, chauffeur, etc."),
        description: z.string().optional(),
        pickupLocation: z.string().optional(),
        dropoffLocation: z.string().optional(),
        duration: z.string().optional(),
        carType: z.string().optional(),
        phase: z.string().optional().describe("When in journey: post-cruise, etc."),
      }),
    )
    .optional()
    .describe("Car rentals and private transfers"),
  activities: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        images: z.array(z.string()).optional(),
      }),
    )
    .optional()
    .describe("Activities and excursions"),
  images: z.array(z.string()).describe("All relevant travel image URLs - NO logos, icons, or website graphics"),
  highlights: z.array(z.string()).optional().describe("Trip highlights"),
  inclusions: z.array(z.string()).optional().describe("What's included"),
  exclusions: z.array(z.string()).optional().describe("What's not included"),
  notes: z.array(z.string()).optional().describe("Additional notes"),
  journeyStructure: z
    .object({
      pattern: z.string().optional().describe("Detected journey pattern"),
      phases: z.array(z.string()).optional().describe("Journey phases identified"),
      totalDuration: z.string().optional().describe("Total trip duration"),
    })
    .optional()
    .describe("Journey structure analysis"),
})

// Website-specific extraction rules
const WEBSITE_RULES = {
  "rondreis-planner.nl": {
    selectors: {
      title: "h1, .trip-title, .idea-title",
      description: ".trip-description, .idea-description, .content-description",
      price: ".price, .total-price, .trip-price",
      images: ".trip-images img, .gallery img, .slideshow img",
      accommodations: ".hotel, .accommodation, .stay",
      itinerary: ".itinerary, .day-by-day, .schedule",
      inclusions: ".inclusions, .included, .what-included",
      highlights: ".highlights, .trip-highlights",
    },
    patterns: {
      nights: /(\d+)\s*(?:nights?|nachten)/i,
      days: /(\d+)\s*(?:days?|dagen)/i,
      price: /€\s*(\d+(?:[.,]\d{2})?)/,
      dates: /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/g,
    },
  },
}

function extractStructuredData(html: string) {
  console.log("🔍 Looking for structured data...")

  // Extract JSON-LD
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis
  const jsonLdMatches = [...html.matchAll(jsonLdRegex)]

  const structuredData = []

  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1])
      structuredData.push(data)
      console.log("📊 Found JSON-LD:", data["@type"] || "Unknown type")
    } catch (e) {
      console.log("❌ Invalid JSON-LD found")
    }
  }

  return {
    jsonLd: structuredData,
  }
}

function preprocessHTML(html: string, hostname: string) {
  console.log("🧹 Preprocessing HTML for better AI analysis...")

  // Remove noise
  let cleaned = html
    .replace(/<script[^>]*>.*?<\/script>/gis, "")
    .replace(/<style[^>]*>.*?<\/style>/gis, "")
    .replace(/<!--.*?-->/gis, "")
    .replace(/<nav[^>]*>.*?<\/nav>/gis, "")
    .replace(/<footer[^>]*>.*?<\/footer>/gis, "")
    .replace(/<header[^>]*>.*?<\/header>/gis, "")

  // Keep important sections based on website
  if (hostname.includes("rondreis-planner")) {
    cleaned = cleaned.replace(/<aside[^>]*>.*?<\/aside>/gis, "")
    cleaned = cleaned.replace(/<div[^>]*class=["'][^"']*sidebar[^"']*["'][^>]*>.*?<\/div>/gis, "")
  }

  // Extract main content area
  const mainContentRegex = /<main[^>]*>(.*?)<\/main>/gis
  const mainMatch = cleaned.match(mainContentRegex)
  if (mainMatch) {
    cleaned = mainMatch[0]
    console.log("✅ Extracted main content area")
  }

  // Convert to clean text but preserve structure with ENHANCED MARKERS
  const textContent = cleaned
    .replace(/<h([1-6])[^>]*>/gi, "\n\n### HEADING $1: ")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "")
    // Enhanced markers for travel content
    .replace(/<div[^>]*class=["'][^"']*price[^"']*["'][^>]*>/gi, "\n💰 PRICE: ")
    .replace(/<div[^>]*class=["'][^"']*hotel[^"']*["'][^>]*>/gi, "\n🏨 ACCOMMODATION: ")
    .replace(/<div[^>]*class=["'][^"']*day[^"']*["'][^>]*>/gi, "\n📅 DAY: ")
    .replace(/<div[^>]*class=["'][^"']*cruise[^"']*["'][^>]*>/gi, "\n🚢 CRUISE: ")
    .replace(/<div[^>]*class=["'][^"']*car[^"']*["'][^>]*>/gi, "\n🚗 CAR: ")
    .replace(/<div[^>]*class=["'][^"']*flight[^"']*["'][^>]*>/gi, "\n✈️ FLIGHT: ")
    .replace(/<div[^>]*class=["'][^"']*itinerary[^"']*["'][^>]*>/gi, "\n📋 ITINERARY: ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim()

  console.log("✅ Preprocessed HTML to structured text:", textContent.length, "chars")
  return textContent
}

export async function POST(request: NextRequest) {
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
    const hostname = new URL(url).hostname

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    console.log("📄 HTML content length:", html.length)

    // STEP 1: Extract structured data
    const structuredData = extractStructuredData(html)

    // STEP 2: Preprocess HTML for better AI analysis
    const preprocessedContent = preprocessHTML(html, hostname)

    // STEP 3: Analyze journey structure using terminology
    const journeyAnalysis = analyzeJourneyStructure(preprocessedContent)
    console.log("🗺️ Journey analysis:", journeyAnalysis)

    // STEP 4: Enhanced image extraction
    const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    const imageMatches = [...html.matchAll(imageRegex)]

    const bgImageRegex = /background-image:\s*url$$["']?([^"')]+)["']?$$/gi
    const bgImageMatches = [...html.matchAll(bgImageRegex)]

    const dataSrcRegex = /<img[^>]+data-src=["']([^"']+)["'][^>]*>/gi
    const dataSrcMatches = [...html.matchAll(dataSrcRegex)]

    const pictureRegex = /<source[^>]+srcset=["']([^"']+)["'][^>]*>/gi
    const pictureMatches = [...html.matchAll(pictureRegex)]

    const extractedImages = [
      ...imageMatches.map((match) => match[1]),
      ...bgImageMatches.map((match) => match[1]),
      ...dataSrcMatches.map((match) => match[1]),
      ...pictureMatches.map((match) => match[1].split(",")[0].trim().split(" ")[0]),
    ]
      .filter((src) => {
        if (!src) return false

        const excludePatterns = [
          /favicon/i,
          /logo\.png$/i,
          /logo\.jpg$/i,
          /logo\.svg$/i,
          /icon\.png$/i,
          /icon\.jpg$/i,
          /social\.png$/i,
          /facebook\.com/i,
          /twitter\.com/i,
          /instagram\.com/i,
          /1x1\.gif$/i,
          /tracking/i,
          /analytics/i,
          /pixel\.gif$/i,
          /spacer\.gif$/i,
          /transparent\.gif$/i,
          /blank\.gif$/i,
          /loading\.gif$/i,
          /spinner\.gif$/i,
          /ajax-loader/i,
          /advertisement/i,
          /banner-ad/i,
          /\.svg$/i,
        ]

        return !excludePatterns.some((pattern) => pattern.test(src))
      })
      .map((src) => {
        if (src.startsWith("//")) return "https:" + src
        if (src.startsWith("/")) return new URL(src, url).href
        if (!src.startsWith("http")) return new URL(src, url).href
        return src
      })
      .filter((src) => {
        try {
          new URL(src)
          return true
        } catch {
          return false
        }
      })
      .slice(0, 50) // Increased limit for better image coverage

    console.log("🖼️ Extracted images:", extractedImages.length)

    // STEP 5: Create ENHANCED AI prompt with travel terminology
    const enhancedPrompt = `
You are an expert travel data extractor with deep knowledge of travel industry terminology and journey structures.

WEBSITE: ${hostname}
JOURNEY ANALYSIS: ${JSON.stringify(journeyAnalysis, null, 2)}

TRAVEL TERMINOLOGY GUIDE:
${JSON.stringify(TRAVEL_TERMINOLOGY, null, 2)}

CONTENT TO ANALYZE:
${preprocessedContent.substring(0, 15000)}

AVAILABLE IMAGES:
${extractedImages.slice(0, 30).join("\n")}

CRITICAL EXTRACTION INSTRUCTIONS:

1. **JOURNEY STRUCTURE AWARENESS**:
   ${
     journeyAnalysis.detectedPattern
       ? `
   - DETECTED PATTERN: "${journeyAnalysis.detectedPattern}"
   - This is a multi-phase journey - DO NOT STOP after the cruise!
   - Phases: ${journeyAnalysis.phases.map((p) => p.name).join(" → ")}
   - Continuation clues found: ${journeyAnalysis.continuationClues.join(", ")}
   `
       : ""
   }

2. **ACCOMMODATION COUNTING** (CRITICAL):
   - For "Land & Cruise" trips: Count accommodations in ALL phases
   - Pre-cruise: Miami hotels (1-2 nights)
   - Cruise: Ship accommodation (1 entry, but note duration)
   - POST-CRUISE: Multiple Florida hotels for roadtrip (3-7 hotels)
   - Look for: "after cruise", "pick up car", "drive to", "roadtrip"
   - Each city/location = separate hotel
   - Don't stop counting after cruise ends!

3. **SEQUENTIAL ANALYSIS**:
   - Read the ENTIRE itinerary, not just the first part
   - Look for day-by-day breakdowns
   - Count accommodations for each location mentioned
   - Pay attention to "then", "after", "next", "from there"

4. **CAR RENTAL DETECTION**:
   - Often mentioned AFTER cruise section
   - Look for: "rental car", "pick up car", "self-drive", "roadtrip"
   - Usually starts from cruise port (Miami) for Florida exploration

5. **PHASE-AWARE EXTRACTION**:
   - Tag each service with its journey phase
   - accommodations[].phase: "pre-cruise", "cruise", "post-cruise"
   - cars[].phase: "post-cruise" (usually)
   - transports[].phase: "outbound", "cruise", "post-cruise", "return"

6. **IMAGE SELECTION PRIORITY**:
   - Cruise ships and ocean views
   - Florida destinations (Key West, Everglades, Miami Beach)
   - Hotel exteriors and rooms
   - Rental cars and road trip scenes
   - NO website UI, logos, or navigation elements

7. **CONTINUATION DETECTION**:
   - If you see continuation clues: ${journeyAnalysis.continuationClues.join(", ")}
   - The journey continues beyond what you've analyzed so far
   - Look for additional accommodations and activities

EXAMPLE FOR LAND & CRUISE MIAMI:
- accommodations: [
    {name: "Miami Airport Hotel", phase: "pre-cruise", nights: 1},
    {name: "Cruise Ship", phase: "cruise", nights: 7},
    {name: "Key West Hotel", phase: "post-cruise", nights: 2},
    {name: "Everglades Lodge", phase: "post-cruise", nights: 1},
    {name: "Miami Beach Resort", phase: "post-cruise", nights: 2}
  ]
- cars: [{type: "rental car", phase: "post-cruise", pickupLocation: "Miami Port"}]

Be extremely thorough and analyze the COMPLETE journey, not just the first part!
    `

    const { object: travelData } = await generateObject({
      model: openai("gpt-4o"),
      schema: TravelDataSchema,
      prompt: enhancedPrompt,
    })

    console.log("🤖 AI extracted travel data with journey awareness:", {
      accommodations: travelData.accommodations?.length || 0,
      cars: travelData.cars?.length || 0,
      cruises: travelData.cruises?.length || 0,
      flights: travelData.flights?.length || 0,
      images: travelData.images?.length || 0,
      journeyPattern: travelData.journeyStructure?.pattern,
    })

    // STEP 6: Enhance results with journey structure
    const finalImages = [
      ...(travelData.images || []),
      ...extractedImages.filter((img) => {
        const travelKeywords = [
          /hotel/i,
          /resort/i,
          /beach/i,
          /cruise/i,
          /ship/i,
          /miami/i,
          /bahama/i,
          /florida/i,
          /ocean/i,
          /vacation/i,
          /travel/i,
          /destination/i,
          /room/i,
          /suite/i,
          /pool/i,
          /restaurant/i,
          /view/i,
          /landscape/i,
          /city/i,
          /island/i,
          /palm/i,
          /tropical/i,
          /paradise/i,
          /sunset/i,
          /water/i,
          /tour/i,
          /excursion/i,
          /activity/i,
          /attraction/i,
          /key\s*west/i,
          /everglades/i,
          /rental\s*car/i,
          /roadtrip/i,
        ]
        return travelKeywords.some((keyword) => keyword.test(img))
      }),
    ]
      .filter((img, index, arr) => arr.indexOf(img) === index)
      .slice(0, 35)

    const finalData = {
      ...travelData,
      images: finalImages,
      extractedAt: new Date().toISOString(),
      sourceUrl: url,
      journeyAnalysis,
      extractionMethod: {
        structuredData: structuredData.jsonLd.length > 0,
        journeyAware: true,
        terminologyGuided: true,
        phaseAnalysis: journeyAnalysis.detectedPattern !== null,
      },
    }

    console.log("✅ Final extraction with journey awareness:", {
      accommodations: finalData.accommodations?.length || 0,
      accommodationPhases: finalData.accommodations?.map((a) => a.phase).filter(Boolean) || [],
      cars: finalData.cars?.length || 0,
      carPhases: finalData.cars?.map((c) => c.phase).filter(Boolean) || [],
      cruises: finalData.cruises?.length || 0,
      images: finalData.images?.length || 0,
      journeyPattern: finalData.journeyStructure?.pattern,
    })

    return NextResponse.json({
      success: true,
      data: finalData,
      meta: {
        contentLength: preprocessedContent.length,
        imagesFound: extractedImages.length,
        aiSelectedImages: travelData.images?.length || 0,
        finalImages: finalImages.length,
        journeyAnalysis,
        extractionMethod: finalData.extractionMethod,
        processingTime: Date.now(),
      },
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
