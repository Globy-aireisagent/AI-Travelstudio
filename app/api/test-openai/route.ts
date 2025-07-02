import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function GET() {
  console.log("🧪 Testing OpenAI API...")

  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({
        success: false,
        error: "No OpenAI API key found",
      })
    }

    console.log("🔑 API key found, length:", process.env.OPENAI_API_KEY.length)
    console.log("🔑 API key starts with:", process.env.OPENAI_API_KEY.substring(0, 10) + "...")

    // Test simple generation
    const result = await generateText({
      model: openai("gpt-4o"),
      prompt: "Say hello in Dutch",
      maxTokens: 50,
    })

    console.log("✅ OpenAI test successful:", result.text)

    return Response.json({
      success: true,
      result: result.text,
      usage: result.usage,
    })
  } catch (error: any) {
    console.error("❌ OpenAI test failed:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      name: error.name,
    })

    return Response.json({
      success: false,
      error: error.message,
      details: {
        status: error.status,
        code: error.code,
        type: error.type,
      },
    })
  }
}
