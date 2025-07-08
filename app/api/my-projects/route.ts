import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Safe helper – returns a Supabase client **only** when the required env
 * vars are present.  This prevents build-time crashes on Vercel.
 */
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) return null
  if (!serviceKey && !anonKey) return null

  return createClient(
    url,
    // Prefer service-role for server work, otherwise fall back to anon key.
    serviceKey ?? anonKey!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("email") ?? "demo@agent.com"

    /* ------------------------------------------------------------------ */
    /* 1. Demo data (returned when we don’t have DB credentials)          */
    /* ------------------------------------------------------------------ */
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
        description: "Geïmporteerd uit Travel Compositor, bezig met AI-content",
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

    /* ------------------------------------------------------------------ */
    /* 2. Real data (only if DB creds are available)                      */
    /* ------------------------------------------------------------------ */
    let projects = demoProjects
    const supabase = getSupabase()

    if (supabase) {
      const { data, error } = await supabase
        .from("agent_projects")
        .select("*")
        .eq("agent_email", userEmail)
        .order("last_modified", { ascending: false })

      if (error) {
        console.warn("Supabase query error, falling back to demo data:", error.message)
      } else if (data) {
        projects = data as typeof demoProjects
      }
    }

    return NextResponse.json({
      success: true,
      projects,
      total: projects.length,
      stats: {
        active: projects.filter((p) => p.status === "active").length,
        completed: projects.filter((p) => p.status === "completed").length,
        paused: projects.filter((p) => p.status === "paused").length,
        draft: projects.filter((p) => p.status === "draft").length,
      },
    })
  } catch (err) {
    console.error("Error in /api/my-projects:", err)
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 })
  }
}
