import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"
import { UniversalTravelImporter } from "@/lib/universal-travel-importer"

export async function POST(request: NextRequest) {
  try {
    console.log("💡 Starting user travel ideas import...")

    const { userId, userEmail, micrositeId } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "User ID and email required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceClient()
    const importer = new UniversalTravelImporter()

    // 1. Haal user op
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
      throw new Error("User not found")
    }

    console.log(`👤 Importing travel ideas for user: ${user.email}`)

    // 2. Haal travel ideas op uit Travel Compositor
    const ideas = await fetchUserIdeasFromTC(user, importer)

    console.log(`💡 Found ${ideas.length} travel ideas for ${user.email}`)

    // 3. Importeer ideas naar Supabase
    const importResults = []

    for (const idea of ideas) {
      try {
        // Check of idea al bestaat
        const { data: existingIdea } = await supabase
          .from("imported_travel_ideas")
          .select("id")
          .eq("tc_idea_id", idea.id)
          .eq("tc_microsite_id", user.microsite_id)
          .single()

        if (existingIdea) {
          console.log(`⏭️ Travel idea ${idea.id} already exists, skipping`)
          continue
        }

        // Importeer travel idea
        const ideaData = {
          user_id: user.id,
          tc_idea_id: idea.id,
          tc_microsite_id: user.microsite_id,
          title: idea.title || idea.largeTitle || `Travel Idea ${idea.id}`,
          description: idea.description || "",
          image_url: idea.imageUrl || "",
          destination: idea.destinations?.[0]?.name || "",
          departure_date: idea.departureDate,
          price_per_person: idea.pricePerPerson?.amount || 0,
          currency: idea.pricePerPerson?.currency || "EUR",
          full_data: idea,
        }

        const { error: insertError } = await supabase.from("imported_travel_ideas").insert(ideaData)

        if (insertError) {
          console.error(`❌ Failed to import idea ${idea.id}:`, insertError)
          importResults.push({
            success: false,
            ideaId: idea.id,
            error: insertError.message,
          })
        } else {
          console.log(`✅ Imported travel idea ${idea.id}`)
          importResults.push({
            success: true,
            ideaId: idea.id,
            title: ideaData.title,
          })
        }
      } catch (error) {
        console.error(`❌ Error importing idea ${idea.id}:`, error)
        importResults.push({
          success: false,
          ideaId: idea.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const successful = importResults.filter((r) => r.success).length

    // 4. Log de import actie
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "ideas_import",
      resource_type: "travel_idea",
      details: {
        total_found: ideas.length,
        imported: successful,
        failed: importResults.length - successful,
        microsite_id: user.microsite_id,
      },
    })

    console.log(`✅ Travel ideas import complete: ${successful}/${ideas.length} imported`)

    return NextResponse.json({
      success: true,
      summary: {
        total_found: ideas.length,
        imported: successful,
        failed: importResults.length - successful,
        results: importResults,
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

async function fetchUserIdeasFromTC(user: any, importer: UniversalTravelImporter) {
  try {
    console.log(`🔍 Fetching travel ideas for ${user.email} from microsite ${user.microsite_id}`)

    // Gebruik de Travel Compositor client om ideas op te halen
    const ideas = await importer.getUserIdeas(user.microsite_id, user.email)

    console.log(`💡 Found ${ideas.length} travel ideas for ${user.email}`)

    return ideas
  } catch (error) {
    console.error(`❌ Failed to fetch travel ideas for ${user.email}:`, error)
    return []
  }
}
