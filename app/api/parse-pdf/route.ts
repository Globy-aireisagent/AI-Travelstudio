import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("📥 PDF upload request received")

    const formData = await request.formData()
    const file = formData.get("pdf") as File

    if (!file) {
      console.log("❌ No PDF file provided")
      return Response.json({ error: "No PDF file provided" }, { status: 400 })
    }

    console.log("📄 PDF file details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log("💾 Buffer created, size:", buffer.length)

    // Extract text from PDF using multiple methods
    const text = await extractTextFromPDF(buffer, file.name)
    console.log("📝 Text extraction result:", {
      length: text.length,
      hasContent: text.trim().length > 0,
      preview: text.substring(0, 300),
    })

    if (!text || text.trim().length < 10) {
      console.log("⚠️ PDF text too short or empty")
      return Response.json({
        error: "PDF bevat geen leesbare tekst. Mogelijk is het een gescande PDF of bevat het alleen afbeeldingen.",
        success: false,
        extractedLength: text?.length || 0,
        extractedText: text || "",
      })
    }

    console.log("🤖 Starting AI extraction...")
    // AI-powered extraction of travel information
    const travelInfo = await extractTravelInfoWithAI(text)
    console.log("✅ AI extraction completed:", travelInfo)

    return Response.json({
      success: true,
      extractedText: text, // Return full text for debugging
      textLength: text.length,
      travelInfo,
    })
  } catch (error) {
    console.error("💥 PDF parsing error:", error)
    return Response.json(
      {
        error: "Kon PDF niet verwerken",
        details: error instanceof Error ? error.message : String(error),
        success: false,
      },
      { status: 500 },
    )
  }
}

async function extractTextFromPDF(buffer: Buffer, filename: string): Promise<string> {
  try {
    console.log("🔍 Starting PDF text extraction for:", filename)

    // Method 1: Try to extract as UTF-8 text
    let text = buffer.toString("utf8")
    console.log("📄 UTF-8 extraction length:", text.length)

    // Method 2: Try Latin-1 encoding if UTF-8 doesn't work well
    if (text.length < 100 || !text.includes("PDF")) {
      text = buffer.toString("latin1")
      console.log("📄 Latin-1 extraction length:", text.length)
    }

    // Method 3: Extract readable text patterns
    const textPatterns = text.match(/[A-Za-z0-9\s\-.,:;!?$$$$[\]/\\]{10,}/g) || []
    const extractedText = textPatterns.join(" ")
    console.log("📋 Pattern extraction length:", extractedText.length)

    // Clean up the text
    let cleanText = extractedText
      .replace(/[^\x20-\x7E\n\r\t]/g, " ") // Remove non-printable chars but keep newlines and tabs
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/(.)\1{5,}/g, "$1") // Remove repeated characters (5+ times)
      .trim()

    // Try to find PDF content markers and extract text around them
    const pdfMarkers = [/stream\s*(.*?)\s*endstream/gs, /BT\s*(.*?)\s*ET/gs, /Tj\s*\[(.*?)\]/gs, /$$(.*?)$$\s*Tj/gs]

    let markerText = ""
    for (const marker of pdfMarkers) {
      const matches = text.match(marker)
      if (matches) {
        markerText += matches.join(" ") + " "
      }
    }

    if (markerText.length > cleanText.length) {
      cleanText = markerText
        .replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    }

    console.log("✨ Final clean text length:", cleanText.length)
    console.log("📋 First 500 chars:", cleanText.substring(0, 500))

    // If we still don't have good text, try a different approach
    if (cleanText.length < 50) {
      // Look for any readable strings in the buffer
      const readableStrings = []
      let currentString = ""

      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i]
        if ((char >= 32 && char <= 126) || char === 10 || char === 13) {
          currentString += String.fromCharCode(char)
        } else {
          if (currentString.length > 3) {
            readableStrings.push(currentString)
          }
          currentString = ""
        }
      }

      if (currentString.length > 3) {
        readableStrings.push(currentString)
      }

      const stringText = readableStrings.join(" ").replace(/\s+/g, " ").trim()
      console.log("🔤 String extraction length:", stringText.length)

      if (stringText.length > cleanText.length) {
        cleanText = stringText
      }
    }

    return cleanText
  } catch (error) {
    console.error("❌ PDF text extraction failed:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

async function extractTravelInfoWithAI(text: string) {
  console.log("🤖 AI extraction starting with text length:", text.length)
  console.log("🔑 OpenAI API key available:", !!process.env.OPENAI_API_KEY)

  if (!process.env.OPENAI_API_KEY) {
    console.log("❌ No OpenAI API key found")
    return {
      error: "AI service niet beschikbaar - geen API key",
      destinations: [],
      dates: "Niet gevonden",
      hotels: [],
      activities: [],
      transport: "Niet gevonden",
      clientName: "Niet gevonden",
      rawText: text.substring(0, 1000), // Include raw text for debugging
    }
  }

  try {
    console.log("📤 Sending request to OpenAI...")
    console.log("📝 Text preview being sent:", text.substring(0, 200))

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Je bent een expert in het analyseren van reisdocumenten. Extraheer ALLEEN informatie die daadwerkelijk in de tekst staat.

BELANGRIJKE REGELS:
- Als informatie niet duidelijk staat: gebruik "Niet gevonden"
- GEEN gissingen of aannames
- ALLEEN letterlijke informatie uit de tekst
- Zoek naar: bestemmingen, datums, hotelnamen, activiteiten, transport, klantnamen

Return JSON format:
{
  "destinations": ["array van bestemmingen die letterlijk genoemd worden"],
  "dates": "datums zoals ze in tekst staan of 'Niet gevonden'",
  "hotels": ["array van hotelnamen die letterlijk genoemd worden"],
  "activities": ["array van activiteiten die letterlijk genoemd worden"],
  "transport": "transport informatie of 'Niet gevonden'",
  "clientName": "klant naam of 'Niet gevonden'",
  "bookingReference": "booking referentie of 'Niet gevonden'",
  "totalPrice": "prijs informatie of 'Niet gevonden'"
}`,
          },
          {
            role: "user",
            content: `Analyseer deze reisdocument tekst en extraheer de informatie:

${text}`,
          },
        ],
        temperature: 0,
        max_tokens: 1500,
      }),
    })

    console.log("📥 OpenAI response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ OpenAI API error:", response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    console.log("💬 AI response content:", content)

    try {
      const extracted = JSON.parse(content)
      console.log("✅ Successfully parsed AI response:", extracted)

      return {
        destinations: Array.isArray(extracted.destinations) ? extracted.destinations : [],
        dates: extracted.dates || "Niet gevonden",
        hotels: Array.isArray(extracted.hotels) ? extracted.hotels : [],
        activities: Array.isArray(extracted.activities) ? extracted.activities : [],
        transport: extracted.transport || "Niet gevonden",
        clientName: extracted.clientName || "Niet gevonden",
        bookingReference: extracted.bookingReference || "Niet gevonden",
        totalPrice: extracted.totalPrice || "Niet gevonden",
        rawText: text.substring(0, 1000), // Include for debugging
      }
    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", parseError)
      console.log("🔍 Raw AI content:", content)
      return {
        error: "AI response kon niet worden verwerkt",
        destinations: [],
        dates: "Niet gevonden",
        hotels: [],
        activities: [],
        transport: "Niet gevonden",
        clientName: "Niet gevonden",
        rawText: text.substring(0, 1000),
        aiResponse: content, // Include raw AI response for debugging
      }
    }
  } catch (error) {
    console.error("💥 AI extraction failed:", error)
    return {
      error: "AI analyse mislukt: " + (error instanceof Error ? error.message : String(error)),
      destinations: [],
      dates: "Niet gevonden",
      hotels: [],
      activities: [],
      transport: "Niet gevonden",
      clientName: "Niet gevonden",
      rawText: text.substring(0, 1000),
    }
  }
}
