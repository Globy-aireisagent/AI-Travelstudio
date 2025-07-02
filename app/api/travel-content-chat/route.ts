import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import type { NextRequest } from "next/server"

export const maxDuration = 30

export async function POST(request: NextRequest) {
  console.log("🚀 API Route called at:", new Date().toISOString())

  try {
    // Parse the request body
    let body
    try {
      body = await request.json()
      console.log("📥 Body parsed successfully:", {
        messagesLength: body.messages?.length || 0,
        contentType: body.contentType,
        writingStyle: body.writingStyle,
        routeType: body.routeType,
        days: body.days,
        budgetLevel: body.budgetLevel,
        vacationType: body.vacationType,
        hasCustomGPT: !!body.customGPTPrompt,
      })
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return new Response("Invalid JSON in request body", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Extract data with defaults
    const {
      messages = [],
      contentType = "destination",
      writingStyle = "speels",
      routeType = "gemengd",
      days = "2",
      budgetLevel = "middel",
      vacationType = "algemeen",
      customGPTPrompt,
    } = body

    // Check OpenAI API key
    console.log("🔑 Checking OpenAI API key...")
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ No OpenAI API key found in environment")
      return new Response("OpenAI API key not configured", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    }
    console.log("✅ OpenAI API key found, length:", process.env.OPENAI_API_KEY.length)

    // Validate messages
    if (!Array.isArray(messages)) {
      console.error("❌ Messages is not an array:", typeof messages)
      return new Response("Messages must be an array", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      })
    }

    if (messages.length === 0) {
      console.error("❌ No messages provided")
      return new Response("At least one message is required", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Validate message format
    const validMessages = messages.filter(
      (msg) =>
        msg &&
        typeof msg === "object" &&
        typeof msg.content === "string" &&
        msg.content.trim() &&
        ["user", "assistant"].includes(msg.role),
    )

    if (validMessages.length === 0) {
      console.error("❌ No valid messages found")
      return new Response("No valid messages found", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      })
    }

    console.log("✅ Valid messages:", validMessages.length)
    console.log(
      "📝 Messages preview:",
      validMessages.map((m) => `${m.role}: ${m.content.slice(0, 50)}...`),
    )

    // Build system prompt
    let systemPrompt = ""

    if (customGPTPrompt && typeof customGPTPrompt === "string" && customGPTPrompt.trim()) {
      console.log("🤖 Using custom GPT prompt")
      systemPrompt = customGPTPrompt.trim()
    } else {
      console.log("📝 Using default prompt with all parameters")

      const stylePrompts = {
        speels: "Schrijf in een speelse, vrolijke toon met emoji's. Perfect voor families met kinderen.",
        enthousiast: "Schrijf in een energieke, enthousiaste toon met veel uitroeptekens.",
        zakelijk: "Schrijf in een professionele, zakelijke toon. Kort en krachtig.",
        beknopt: "Schrijf kort maar informatief. Geen lange verhalen.",
      }

      const routeTypePrompts = {
        snelle: "Focus op de snelste route met minimale reistijd. Vermijd files en vertragingen.",
        toeristische:
          "Focus op de mooiste route met bezienswaardigheden, mooie landschappen en interessante stops onderweg.",
        gemengd:
          "Geef een goede balans tussen reistijd en bezienswaardigheden. Combineer efficiëntie met interessante stops.",
      }

      const budgetPrompts = {
        budget: "Focus op betaalbare opties, goedkope accommodaties en gratis activiteiten.",
        middel: "Geef een goede prijs-kwaliteit verhouding met redelijke prijzen.",
        luxe: "Focus op premium ervaringen, luxe accommodaties en exclusieve activiteiten.",
      }

      const vacationTypePrompts = {
        algemeen: "Standaard accommodaties en activiteiten voor alle leeftijden.",
        kindvriendelijk: "Focus op gezinsvriendelijke accommodaties met speeltuinen, glijbanen en kinderactiviteiten.",
        adults_only: "Focus op volwassen-only accommodaties met luxe faciliteiten zoals swim-up kamers en spa's.",
        all_inclusive: "Focus op all-inclusive resorts waar alles inbegrepen is.",
      }

      const styleInstruction = stylePrompts[writingStyle as keyof typeof stylePrompts] || stylePrompts.speels

      // Build content-specific instructions
      let contentInstructions = ""

      if (contentType === "route") {
        const routeInstruction =
          routeTypePrompts[routeType as keyof typeof routeTypePrompts] || routeTypePrompts.gemengd
        contentInstructions = `\n\nROUTE INSTRUCTIES:\n${routeInstruction}\n\nGeef een gedetailleerde routebeschrijving met:\n- Geschatte reistijd\n- Belangrijke wegwijzers\n- Interessante stops onderweg (als van toepassing)\n- Praktische tips voor de reis`
      } else if (contentType === "planning") {
        contentInstructions = `\n\nDAGPLANNING INSTRUCTIES:\nMaak een planning voor ${days} dag${days === "1" ? "" : "en"}.\n\nStructureer als volgt:\n- Ochtend activiteiten\n- Lunch suggesties\n- Middag activiteiten\n- Avond activiteiten\n- Praktische tips en openingstijden`
      } else if (contentType === "hotel") {
        const budgetInstruction = budgetPrompts[budgetLevel as keyof typeof budgetPrompts] || budgetPrompts.middel
        const vacationInstruction =
          vacationTypePrompts[vacationType as keyof typeof vacationTypePrompts] || vacationTypePrompts.algemeen
        contentInstructions = `\n\nHOTEL ZOEK INSTRUCTIES:\nBudget niveau: ${budgetLevel} - ${budgetInstruction}\nVakantie type: ${vacationType} - ${vacationInstruction}\n\nGeef hotel aanbevelingen met:\n- Hotel namen en locaties\n- Prijsklasse indicatie\n- Belangrijkste faciliteiten\n- Waarom geschikt voor de gekozen vakantie type`
      } else if (contentType === "destination") {
        contentInstructions = `\n\nBESTEMMINGS INSTRUCTIES:\nGeef uitgebreide informatie over de bestemming met:\n- Belangrijkste bezienswaardigheden\n- Beste reistijd\n- Lokale cultuur en tradities\n- Praktische reisinformatie\n- Eten en drinken tips\n- Vervoer mogelijkheden`
      }

      systemPrompt = `Je bent een ervaren reisadviseur die reiscontent maakt in het Nederlands.

${styleInstruction}

INSTELLINGEN:
- Content type: ${contentType}
- Schrijfstijl: ${writingStyle}
${contentType === "route" ? `- Route type: ${routeType}` : ""}
${contentType === "planning" ? `- Aantal dagen: ${days}` : ""}
${contentType === "hotel" ? `- Budget niveau: ${budgetLevel}\n- Vakantie type: ${vacationType}` : ""}

${contentInstructions}

Geef altijd praktische, nuttige informatie die past bij de gekozen instellingen.`
    }

    console.log("🔄 Calling OpenAI with:")
    console.log("- System prompt length:", systemPrompt.length)
    console.log("- Messages count:", validMessages.length)
    console.log("- Model: gpt-4o")
    console.log("- Temperature: 0.7")
    console.log("- Max tokens: 2000")

    // Test OpenAI connection first
    try {
      console.log("🧪 Testing OpenAI connection...")

      // Simple test call to verify API key works
      const testResult = await streamText({
        model: openai("gpt-4o"),
        system: "You are a helpful assistant. Respond in Dutch.",
        messages: [{ role: "user", content: "Zeg hallo" }],
        temperature: 0.7,
        maxTokens: 50,
      })

      console.log("✅ OpenAI test successful")

      // Now make the actual call
      console.log("🔄 Making actual OpenAI call...")
      const result = await streamText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        messages: validMessages,
        temperature: 0.7,
        maxTokens: 2000,
      })

      console.log("✅ OpenAI call successful, returning stream")
      return result.toDataStreamResponse()
    } catch (openaiError: any) {
      console.error("❌ OpenAI API Error Details:", {
        message: openaiError.message,
        status: openaiError.status,
        code: openaiError.code,
        type: openaiError.type,
        name: openaiError.name,
        stack: openaiError.stack,
        cause: openaiError.cause,
        fullError: openaiError,
      })

      // Return a plain text error for OpenAI failures
      return new Response(`OpenAI API Error: ${openaiError.message || "Unknown OpenAI error"}`, {
        status: openaiError.status || 500,
        headers: { "Content-Type": "text/plain" },
      })
    }
  } catch (error: any) {
    console.error("❌ Unexpected API Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    })

    // Return a plain text error response
    return new Response(`Server Error: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}
