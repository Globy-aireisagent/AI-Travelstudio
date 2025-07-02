import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "Geen audio bestand gevonden" }, { status: 400 })
    }

    // Convert File to Buffer for OpenAI Whisper API
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Use OpenAI Whisper for transcription
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: (() => {
        const formData = new FormData()
        formData.append("file", new Blob([buffer], { type: "audio/wav" }), "audio.wav")
        formData.append("model", "whisper-1")
        formData.append("language", "nl") // Dutch language
        return formData
      })(),
    })

    if (!response.ok) {
      throw new Error("Transcriptie mislukt")
    }

    const result = await response.json()

    return NextResponse.json({ text: result.text })
  } catch (error) {
    console.error("Transcription error:", error)
    return NextResponse.json({ error: "Transcriptie mislukt" }, { status: 500 })
  }
}
