import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const filename = `${Date.now()}-${file.name}`
    const filepath = path.join(process.cwd(), "uploads", filename)

    // Save file
    await writeFile(filepath, buffer)

    // In production, upload to cloud storage (Vercel Blob, AWS S3, etc.)

    return NextResponse.json({
      success: true,
      filename,
      url: `/uploads/${filename}`,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
