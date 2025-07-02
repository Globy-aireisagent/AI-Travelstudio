import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    console.log("🎨 Starting image generation API call...")

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY not found in environment variables")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const body = await request.json()
    console.log("📝 Request body:", body)

    const { prompt, style = "natural" } = body

    if (!prompt) {
      console.error("❌ No prompt provided")
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log("🎨 Generating image with prompt:", prompt, "style:", style)

    // Enhanced prompt based on style
    let enhancedPrompt = prompt

    switch (style) {
      case "photorealistic":
        enhancedPrompt = `Beautiful, photorealistic travel photography of ${prompt}, high quality, professional photography, vibrant colors, good lighting, 4K resolution`
        break
      case "artistic":
        enhancedPrompt = `Artistic interpretation of ${prompt}, creative composition, beautiful colors, travel art style, painterly effect`
        break
      case "vintage":
        enhancedPrompt = `Vintage travel poster style of ${prompt}, retro colors, classic travel advertisement aesthetic, nostalgic feel`
        break
      case "modern":
        enhancedPrompt = `Modern minimalist travel photography of ${prompt}, clean composition, contemporary style, sleek design`
        break
      case "dramatic":
        enhancedPrompt = `Dramatic travel photography of ${prompt}, strong contrasts, moody lighting, cinematic composition`
        break
      case "drone":
        enhancedPrompt = `Aerial drone view of ${prompt}, bird's eye perspective, landscape photography, wide angle view`
        break
      default:
        enhancedPrompt = `Travel photography of ${prompt}, high quality, professional`
    }

    console.log("✨ Enhanced prompt:", enhancedPrompt)

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    })

    console.log("📡 OpenAI response received")

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      console.error("❌ No image URL received from OpenAI")
      throw new Error("No image URL received from OpenAI")
    }

    console.log("✅ Image generated successfully:", imageUrl.slice(0, 50) + "...")

    return NextResponse.json({
      imageUrl,
      prompt: enhancedPrompt,
    })
  } catch (error: any) {
    console.error("❌ Image generation error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause,
    })

    // More specific error handling
    if (error.code === "insufficient_quota") {
      return NextResponse.json(
        {
          error: "OpenAI API quota exceeded",
          details: "Please check your OpenAI billing and usage limits",
        },
        { status: 429 },
      )
    }

    if (error.code === "invalid_api_key") {
      return NextResponse.json(
        {
          error: "Invalid OpenAI API key",
          details: "Please check your API key configuration",
        },
        { status: 401 },
      )
    }

    if (error.message?.includes("content_policy_violation")) {
      return NextResponse.json(
        {
          error: "Content policy violation",
          details: "The prompt violates OpenAI's content policy. Please try a different description.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
