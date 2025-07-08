import { type NextRequest, NextResponse } from "next/server"
import { getSqlClient, isDatabaseAvailable } from "@/lib/neon-client"
import { UniversalTravelImporter } from "@/lib/universal-travel-importer"

export async function POST(request: NextRequest) {
  try {
    console.log("💡 Starting user travel ideas import...")

    // Check if database is available
    if (!isDatabaseAvailable) {
      return NextResponse.json(
        {
          error: "Database not configured - check DATABASE_URL environment variable",
          demo: true,
        },
        { status: 500 },
      )
    }

    const { userId, userEmail, micrositeId, limit = 50 } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "User ID and email required" }, { status: 400 })
    }

    const sql = getSqlClient()
    const importer = new UniversalTravelImporter()

    // 1. Haal user op
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`
    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`👤 Importing travel ideas for user: ${user.email}`)

    // 2. Haal ideas op van Travel Compositor
    const microsites = micrositeId ? [micrositeId] : [user.microsite_id]
    let allIdeas: any[] = []

    for (const msId of microsites) {
      if (!msId) continue

      try {
        const ideas = await importer.getUserIdeas(msId, userEmail)
        allIdeas.push(...ideas.map((i) => ({ ...i, microsite_id: msId })))
        console.log(`💡 Found ${ideas.length} travel ideas in microsite ${msId}`)
      } catch (error) {
        console.log(`⚠️ Failed to get ideas from microsite ${msId}:`, error)
        continue
      }
    }

    // 3. Limiteer aantal ideas
    if (allIdeas.length > limit) {
      allIdeas = allIdeas.slice(0, limit)
      console.log(`⚠️ Limited to ${limit} travel ideas`)
    }

    // 4. Importeer ideas naar database
    const importResults = []

    for (const idea of allIdeas) {
      try {
        const result = await importIdeaToDatabase(idea, user, sql)
        importResults.push(result)
      } catch (error) {
        console.error(`❌ Failed to import idea ${idea.id}:`, error)
        importResults.push({
          success: false,
          ideaId: idea.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const successful = importResults.filter((r) => r.success).length

    console.log(`✅ Travel ideas import complete: ${successful}/${allIdeas.length} imported`)

    return NextResponse.json({
      success: true,
      results: importResults,
      summary: {
        total: allIdeas.length,
        successful,
        failed: allIdeas.length - successful,
        userId,
        userEmail,
      },
    })
  } catch (error) {
    console.error("❌ Travel ideas import failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

async function importIdeaToDatabase(idea: any, user: any, sql: any) {
  try {
    // Check of idea al bestaat
    const existing = await sql`
      SELECT id FROM travel_ideas 
      WHERE tc_idea_id = ${idea.id || idea.ideaId}
      AND microsite_id = ${idea.microsite_id}
    `

    if (existing.length > 0) {
      return {
        success: false,
        ideaId: idea.id,
        error: "Travel idea already exists",
      }
    }

    // Transform idea data
    const ideaData = {
      user_id: user.id,
      tc_idea_id: idea.id || idea.ideaId || idea.travelIdeaId,
      microsite_id: idea.microsite_id,
      title: idea.title || idea.largeTitle || `Travel Idea ${idea.id}`,
      description: idea.description || idea.shortDescription || "",
      image_url: idea.imageUrl || idea.image || "",
      creation_date: idea.creationDate || idea.created,
      departure_date: idea.departureDate || idea.departure,
      price_per_person: JSON.stringify(extractPriceObject(idea.pricePerPerson)),
      total_price: JSON.stringify(extractPriceObject(idea.totalPrice)),
      themes: JSON.stringify(idea.themes || []),
      destinations: JSON.stringify(idea.destinations || []),
      customer: JSON.stringify(idea.customer || {}),
      counters: JSON.stringify(idea.counters || {}),
      original_data: JSON.stringify(idea),
    }

    // Insert idea
    await sql`INSERT INTO travel_ideas ${sql(ideaData)}`

    return {
      success: true,
      ideaId: idea.id,
    }
  } catch (error) {
    return {
      success: false,
      ideaId: idea.id,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function extractPriceObject(priceData: any): { amount: number; currency: string } {
  if (!priceData) return { amount: 0, currency: "EUR" }

  if (typeof priceData === "number") {
    return { amount: priceData, currency: "EUR" }
  }

  if (priceData.amount !== undefined) {
    return {
      amount: priceData.amount || 0,
      currency: priceData.currency || "EUR",
    }
  }

  return { amount: 0, currency: "EUR" }
}
