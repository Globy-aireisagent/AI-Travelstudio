import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

// Configure Fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = "fotorealistisch" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log("🎨 Generating image with Flux Pro:", prompt)

    // Style-specific prompt modifications
    const stylePrompts = {
      fotorealistisch: "photorealistic, high quality, detailed, professional travel photography",
      artistiek: "artistic, painterly, creative interpretation, artistic style",
      vintage: "vintage travel poster style, retro, aged, nostalgic aesthetic",
      modern: "modern, contemporary, clean, minimalist, sleek design",
      dramatisch: "dramatic lighting, high contrast, cinematic, moody atmosphere",
      drone: "aerial view, drone photography, bird's eye view, landscape perspective",
    }

    const styleModifier = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.fotorealistisch
    const enhancedPrompt = `${prompt}, ${styleModifier}, travel photography, beautiful composition, high quality`

    // Generate image using Flux Pro
    const result = await fal.subscribe("fal-ai/flux-pro", {
      input: {
        prompt: enhancedPrompt,
        image_size: "landscape_4_3",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      },
    })

    const imageUrl = result.data?.images?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image URL returned from Fal.ai")
    }

    console.log("✅ Image generated successfully with Flux Pro!")

    return NextResponse.json({
      imageUrl,
      prompt: enhancedPrompt,
      style,
      provider: "flux",
    })
  } catch (error: any) {
    console.error("❌ Flux image generation error:", error)

    return NextResponse.json(
      {
        error: "Failed to generate image with Flux",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
