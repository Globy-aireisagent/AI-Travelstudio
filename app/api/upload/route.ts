import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Geen bestand gevonden" }, { status: 400 })
    }

    // In een echte applicatie zou je het bestand uploaden naar een storage service
    // Voor deze demo simuleren we een succesvolle upload
    const fileUrl = `/uploads/${file.name}`

    return NextResponse.json({
      url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload mislukt" }, { status: 500 })
  }
}
