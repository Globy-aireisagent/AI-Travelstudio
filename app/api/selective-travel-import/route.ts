import { type NextRequest, NextResponse } from "next/server"
import { SelectiveTravelCompositorImporter } from "@/lib/selective-travel-compositor-importer"
import { agentProfileSystem } from "@/lib/agent-profile-system"

export async function POST(request: NextRequest) {
  try {
    const { action, filter } = await request.json()
    const importer = new SelectiveTravelCompositorImporter()

    if (action === "preview") {
      console.log("🔍 Generating import preview...")
      const preview = await importer.previewImport(filter)

      return NextResponse.json({
        success: true,
        preview,
      })
    }

    if (action === "import") {
      console.log("🚀 Starting selective import...")
      const result = await importer.executeSelectiveImport(filter)

      // Convert imported users to agent profiles
      const agentProfiles = []
      for (const user of result.data.users) {
        const agency = result.data.agencies.find((a: any) => a.id === user.agencyId)
        const profile = await agentProfileSystem.importAgentFromTC(user, agency)
        agentProfiles.push(profile)
      }

      return NextResponse.json({
        success: true,
        result: {
          ...result,
          agentProfiles: agentProfiles.length,
        },
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("❌ Selective import error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
