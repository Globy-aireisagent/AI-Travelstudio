import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("email") || "demo@agent.com"

    // Demo data for travel ideas
    const demoIdeas = [
      {
        id: 1,
        title: "Authentiek Japan Avontuur",
        destination: "Tokyo, Kyoto, Osaka",
        description:
          "Ontdek het echte Japan met traditionele ryokans, tempels en moderne steden. Een perfecte mix van cultuur en comfort.",
        category: "Cultuur",
        duration: "12 dagen",
        priceFrom: 2800,
        images: ["/placeholder.svg?height=200&width=300&text=Japan"],
        features: ["Ryokan overnachtingen", "Traditionele maaltijden", "Gids inbegrepen"],
        createdAt: "2025-01-01",
        importedFrom: "travel-compositor",
      },
      {
        id: 2,
        title: "Romantisch Parijs Weekend",
        destination: "Paris, Frankrijk",
        description:
          "Perfect voor koppels die willen genieten van de stad van de liefde. Inclusief Seine cruise en Eiffeltoren diner.",
        category: "Romantiek",
        duration: "4 dagen",
        priceFrom: 850,
        images: ["/placeholder.svg?height=200&width=300&text=Paris"],
        features: ["Luxe hotel", "Seine cruise", "Eiffeltoren restaurant"],
        createdAt: "2025-01-02",
        importedFrom: "travel-compositor",
      },
      {
        id: 3,
        title: "Avontuurlijke Safari Kenya",
        destination: "Masai Mara, Amboseli",
        description:
          "Ervaar de Big Five in hun natuurlijke habitat. Inclusief luxe safari lodges en professionele gids.",
        category: "Avontuur",
        duration: "8 dagen",
        priceFrom: 4200,
        images: ["/placeholder.svg?height=200&width=300&text=Safari"],
        features: ["Luxe safari lodges", "Game drives", "Masai cultuur"],
        createdAt: "2025-01-03",
        importedFrom: "travel-compositor",
      },
      {
        id: 4,
        title: "Ontspannen Bali Retreat",
        destination: "Ubud, Seminyak",
        description: "Yoga, wellness en tropische stranden. Perfect voor wie wil ontspannen en tot rust komen.",
        category: "Wellness",
        duration: "10 dagen",
        priceFrom: 1950,
        images: ["/placeholder.svg?height=200&width=300&text=Bali"],
        features: ["Yoga sessies", "Spa behandelingen", "Strandresorts"],
        createdAt: "2025-01-04",
        importedFrom: "travel-compositor",
      },
    ]

    return NextResponse.json({
      success: true,
      ideas: demoIdeas,
      total: demoIdeas.length,
    })
  } catch (error) {
    console.error("Error fetching user ideas:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch travel ideas" }, { status: 500 })
  }
}
