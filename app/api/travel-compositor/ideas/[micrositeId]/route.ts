import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { micrositeId: string } }) {
  try {
    const { micrositeId } = params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const userRole = searchParams.get("userRole") || "agent"
    const userEmail = searchParams.get("userEmail") || ""
    const agencyId = searchParams.get("agencyId") || ""

    console.log(`🔍 Fetching ideas from microsite ${micrositeId} for ${userRole}: ${userEmail}`)

    // Permission check
    if (!userEmail) {
      return NextResponse.json({ error: "User email required" }, { status: 401 })
    }

    // Get credentials for this microsite
    let username, password, actualMicrositeId

    switch (micrositeId) {
      case "1":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
        break
      case "2":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME_2
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD_2
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2
        break
      case "3":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME_3
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD_3
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3
        break
      case "4":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME_4
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD_4
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4
        break
      default:
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    }

    if (!username || !password || !actualMicrositeId) {
      throw new Error(`Missing credentials for microsite ${micrositeId}`)
    }

    // Authenticate first
    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        micrositeId: actualMicrositeId,
      }),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Fetch travel ideas with role-based filtering
    let ideasUrl = `https://online.travelcompositor.com/resources/travelideas/${actualMicrositeId}?first=${offset}&limit=${limit}&lang=nl`

    // For agents, filter by their email to only show their own ideas
    if (userRole === "agent") {
      ideasUrl += `&clientEmail=${encodeURIComponent(userEmail)}`
    }

    console.log(`📡 Fetching from: ${ideasUrl}`)

    const ideasResponse = await fetch(ideasUrl, {
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!ideasResponse.ok) {
      throw new Error(`Failed to fetch ideas: ${ideasResponse.status}`)
    }

    const ideasData = await ideasResponse.json()
    let ideas = ideasData.travelIdea || ideasData.ideas || []

    // Additional filtering for agents (double check)
    if (userRole === "agent") {
      ideas = ideas.filter((idea: any) => {
        const ideaOwnerEmail = idea.customer?.email || idea.clientEmail || idea.user
        return ideaOwnerEmail === userEmail
      })
    }

    // Filter by search term if provided
    if (search) {
      ideas = ideas.filter(
        (idea: any) =>
          idea.title?.toLowerCase().includes(search.toLowerCase()) ||
          idea.largeTitle?.toLowerCase().includes(search.toLowerCase()) ||
          idea.description?.toLowerCase().includes(search.toLowerCase()) ||
          idea.destinations?.some((dest: any) => dest.name?.toLowerCase().includes(search.toLowerCase())),
      )
    }

    // Transform to lightweight format with permission info
    const lightweightIdeas = ideas.map((idea: any) => {
      const ideaOwnerEmail = idea.customer?.email || idea.clientEmail || idea.user

      return {
        id: idea.id?.toString(),
        title: idea.title || idea.largeTitle,
        shortDescription: idea.description
          ? idea.description.substring(0, 150) + (idea.description.length > 150 ? "..." : "")
          : "Geen beschrijving beschikbaar",
        destinations:
          idea.destinations?.map((dest: any) => ({
            name: dest.name || dest.city || dest.location,
          })) || [],
        pricePerPerson: idea.pricePerPerson || { amount: 0, currency: "EUR" },
        departureDate: idea.departureDate,
        themes: idea.themes || [],
        imageUrl: idea.imageUrl, // Keep remote URL
        creationDate: idea.creationDate,
        counters: idea.counters || {},

        // Permission and ownership info
        ownerEmail: ideaOwnerEmail,
        agencyName: idea.agencyName || idea.agency?.name,
        canImport: canUserImportIdea(idea, userRole, userEmail),
        clientEmail: ideaOwnerEmail, // For API compatibility
      }
    })

    console.log(`✅ Found ${lightweightIdeas.length} ideas for ${userRole} ${userEmail}`)

    return NextResponse.json({
      success: true,
      ideas: lightweightIdeas,
      total: lightweightIdeas.length,
      micrositeId: actualMicrositeId,
      search,
      limit,
      offset,
      userRole,
      userEmail,
      filtered: userRole === "agent" ? "Only your own ideas" : "All accessible ideas",
    })
  } catch (error) {
    console.error("❌ Error fetching remote ideas:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        ideas: [],
      },
      { status: 500 },
    )
  }
}

// Helper function to check import permissions
function canUserImportIdea(idea: any, userRole: string, userEmail: string): boolean {
  // Super admins can import everything
  if (userRole === "super_admin") return true

  // Admins can import everything from their accessible microsites
  if (userRole === "admin") return true

  // Agents can only import their own ideas
  if (userRole === "agent") {
    const ideaOwnerEmail = idea.customer?.email || idea.clientEmail || idea.user
    return ideaOwnerEmail === userEmail
  }

  return false
}
