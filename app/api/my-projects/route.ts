import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("email") || "demo@agent.com" // Demo data for now

    // For now, return demo data until we have real project tracking
    const demoProjects = [
      {
        id: 1,
        title: "Rondreis Zuid-Korea - Familie Jansen",
        type: "imported",
        source: "travel-compositor",
        status: "active",
        progress: 75,
        lastModified: "2025-01-05",
        client: "Familie Jansen",
        destination: "Seoul, Busan, Jeju",
        createdAt: "2025-01-01",
        description: "Geïmporteerd uit Travel Compositor, bezig met AI content generatie",
        actions: ["roadbook", "travelbuddy", "content"],
        bookingReference: "TC-2025-001",
        totalValue: 3450,
        pax: 2,
      },
      {
        id: 2,
        title: "Authentiek Japan Avontuur",
        type: "manual",
        source: "ai-studio",
        status: "completed",
        progress: 100,
        lastModified: "2025-01-04",
        client: "Nieuwe klant",
        destination: "Tokyo, Kyoto, Osaka",
        createdAt: "2025-01-02",
        description: "Handmatig aangemaakt met AI Travel Content Generator",
        actions: ["roadbook", "share", "duplicate"],
        bookingReference: null,
        totalValue: 2800,
        pax: 2,
      },
      {
        id: 3,
        title: "Cruise Middellandse Zee",
        type: "uploaded",
        source: "pdf-upload",
        status: "draft",
        progress: 25,
        lastModified: "2025-01-03",
        client: "Familie Peters",
        destination: "Barcelona, Rome, Athene",
        createdAt: "2025-01-03",
        description: "Geüpload via PDF, nog niet volledig bewerkt",
        actions: ["edit", "enhance"],
        bookingReference: "TC-2025-003",
        totalValue: 5600,
        pax: 4,
      },
      {
        id: 4,
        title: "Romantisch Parijs Weekend",
        type: "imported",
        source: "travel-compositor",
        status: "paused",
        progress: 50,
        lastModified: "2025-01-02",
        client: "Meneer de Vries",
        destination: "Paris, Frankrijk",
        createdAt: "2025-01-01",
        description: "Geïmporteerd, tijdelijk gepauzeerd",
        actions: ["resume", "edit"],
        bookingReference: "TC-2025-002",
        totalValue: 1250,
        pax: 1,
      },
      {
        id: 5,
        title: "Avontuurlijke Safari Kenya",
        type: "manual",
        source: "ai-studio",
        status: "active",
        progress: 60,
        lastModified: "2025-01-04",
        client: "Familie van der Berg",
        destination: "Masai Mara, Amboseli",
        createdAt: "2025-01-03",
        description: "Handmatig aangemaakt, bezig met uitwerking",
        actions: ["roadbook", "content", "travelbuddy"],
        bookingReference: null,
        totalValue: 4200,
        pax: 4,
      },
    ]

    // Later: Query real projects from Supabase
    // const { data: projects, error } = await supabase
    //   .from('agent_projects')
    //   .select('*')
    //   .eq('agent_email', userEmail)
    //   .order('last_modified', { ascending: false })

    return NextResponse.json({
      success: true,
      projects: demoProjects,
      total: demoProjects.length,
      stats: {
        active: demoProjects.filter((p) => p.status === "active").length,
        completed: demoProjects.filter((p) => p.status === "completed").length,
        paused: demoProjects.filter((p) => p.status === "paused").length,
        draft: demoProjects.filter((p) => p.status === "draft").length,
      },
    })
  } catch (error) {
    console.error("Error fetching user projects:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 })
  }
}
