import { type NextRequest, NextResponse } from "next/server"
import { UniversalTravelImporter } from "@/lib/universal-travel-importer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const importer = new UniversalTravelImporter()

    // Single import
    if (body.type && body.id) {
      console.log(`🚀 Single import: ${body.type} ${body.id}`)

      const result = await importer.import({
        type: body.type,
        id: body.id,
        micrositeId: body.micrositeId,
      })

      return NextResponse.json(result)
    }

    // Batch import
    if (body.requests && Array.isArray(body.requests)) {
      console.log(`🚀 Batch import: ${body.requests.length} items`)

      const results = await importer.batchImport(body.requests)

      return NextResponse.json({
        success: true,
        results,
        summary: {
          total: results.length,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      })
    }

    return NextResponse.json({ success: false, error: "Invalid request format" }, { status: 400 })
  } catch (error) {
    console.error("❌ Universal import error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
