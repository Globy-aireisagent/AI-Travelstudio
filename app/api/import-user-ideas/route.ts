import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"
import { UniversalTravelImporter } from "@/lib/universal-travel-importer"

export async function POST(request: NextRequest) {
  try {
    console.log("💡 Starting user travel ideas import...")

    const { userId, userEmail, micrositeId, limit = 50 } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "User ID and email required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceClient()
    const importer = new UniversalTravelImporter()

    // 1. Haal user op
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
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
        const result = await importIdeaToDatabase(idea, user, supabase)
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

async function importIdeaToDatabase(idea: any, user: any, supabase: any) {
  try {
    // Check of idea al bestaat
    const { data: existing } = await supabase
      .from("travel_ideas")
      .select("id")
      .eq("tc_idea_id", idea.id || idea.ideaId)
      .eq("microsite_id", idea.microsite_id)
      .single()

    if (existing) {
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
      price_per_person: extractPriceObject(idea.pricePerPerson),
      total_price: extractPriceObject(idea.totalPrice),
      themes: idea.themes || [],
      destinations: idea.destinations || [],
      customer: idea.customer || {},
      counters: idea.counters || {},
      original_data: idea,
    }

    // Insert idea
    const { data: newIdea, error: insertError } = await supabase.from("travel_ideas").insert(ideaData).select().single()

    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`)
    }

    return {
      success: true,
      ideaId: idea.id,
      databaseId: newIdea.id,
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
