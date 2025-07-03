import { type NextRequest, NextResponse } from "next/server"
import { agentProfileSystem } from "@/lib/agent-profile-system"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("id")
    const email = searchParams.get("email")
    const action = searchParams.get("action")

    if (action === "dashboard" && agentId) {
      const dashboard = await agentProfileSystem.getAgentDashboard(agentId)
      if (!dashboard) {
        return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, dashboard })
    }

    if (action === "search") {
      const criteria = {
        specialization: searchParams.get("specialization") || undefined,
        language: searchParams.get("language") || undefined,
        territory: searchParams.get("territory") || undefined,
        agency: searchParams.get("agency") || undefined,
        status: searchParams.get("status") || undefined,
        role: searchParams.get("role") || undefined,
      }

      const agents = await agentProfileSystem.searchAgents(criteria)
      return NextResponse.json({ success: true, agents })
    }

    // Get specific agent
    const identifier = agentId || email
    if (!identifier) {
      return NextResponse.json({ success: false, error: "Agent ID or email required" }, { status: 400 })
    }

    const profile = await agentProfileSystem.getAgentProfile(identifier)
    if (!profile) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error("❌ Agent profile API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    if (action === "create") {
      const profile = await agentProfileSystem.createAgentProfile(data.onboardingData)
      return NextResponse.json({ success: true, profile })
    }

    if (action === "import-from-tc") {
      const profile = await agentProfileSystem.importAgentFromTC(data.tcUser, data.tcAgency)
      return NextResponse.json({ success: true, profile })
    }

    if (action === "update") {
      const profile = await agentProfileSystem.updateAgentProfile(data.id, data.updates)
      if (!profile) {
        return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, profile })
    }

    if (action === "sync-tc") {
      const success = await agentProfileSystem.syncWithTravelCompositor(data.agentId)
      return NextResponse.json({ success, message: success ? "Sync completed" : "Sync failed" })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("❌ Agent profile POST error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
