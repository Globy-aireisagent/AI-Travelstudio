import { type NextRequest, NextResponse } from "next/server"
import { SelectiveTravelImporter } from "@/lib/selective-travel-importer"

export async function POST(request: NextRequest) {
  try {
    const { action, type, id, searchTerm } = await request.json()
    const importer = new SelectiveTravelImporter()

    if (action === "search") {
      const results = await importer.searchItems(type, searchTerm)
      return NextResponse.json({ success: true, results })
    }

    if (action === "import") {
      let data
      switch (type) {
        case "booking":
          data = await importer.importSpecificBooking(id)
          break
        case "idea":
          data = await importer.importSpecificIdea(id)
          break
        case "package":
          data = await importer.importSpecificPackage(id)
          break
        default:
          throw new Error(`Unknown type: ${type}`)
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${type} ${id}`,
        data,
      })
    }

    throw new Error("Invalid action")
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Import failed",
      },
      { status: 500 },
    )
  }
}
