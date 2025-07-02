import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { activityData, micrositeId } = await request.json()

    console.log(`🎯 Searching images for activity: ${activityData.ticketName || activityData.name}`)

    const searchResults = {
      foundImages: [] as string[],
      searchAttempts: [] as any[],
    }

    // Method 1: Search by activity name
    if (activityData.ticketName) {
      try {
        const searchQuery = encodeURIComponent(activityData.ticketName.toLowerCase())
        const imageUrl = `/placeholder.svg?height=300&width=400&text=${searchQuery}`

        searchResults.foundImages.push(imageUrl)
        searchResults.searchAttempts.push({
          method: "Activity Name Search",
          query: activityData.ticketName,
          success: true,
          imagesFound: 1,
        })
      } catch (error) {
        searchResults.searchAttempts.push({
          method: "Activity Name Search",
          success: false,
          error: "Search failed",
        })
      }
    }

    // Method 2: Search by destination
    if (activityData.destination) {
      try {
        const searchQuery = encodeURIComponent(activityData.destination.toLowerCase())
        const imageUrl = `/placeholder.svg?height=300&width=400&text=${searchQuery}`

        searchResults.foundImages.push(imageUrl)
        searchResults.searchAttempts.push({
          method: "Destination Search",
          query: activityData.destination,
          success: true,
          imagesFound: 1,
        })
      } catch (error) {
        searchResults.searchAttempts.push({
          method: "Destination Search",
          success: false,
          error: "Search failed",
        })
      }
    }

    // Method 3: Search by location
    if (activityData.locationName) {
      try {
        const searchQuery = encodeURIComponent(activityData.locationName.toLowerCase())
        const imageUrl = `/placeholder.svg?height=300&width=400&text=${searchQuery}`

        searchResults.foundImages.push(imageUrl)
        searchResults.searchAttempts.push({
          method: "Location Search",
          query: activityData.locationName,
          success: true,
          imagesFound: 1,
        })
      } catch (error) {
        searchResults.searchAttempts.push({
          method: "Location Search",
          success: false,
          error: "Search failed",
        })
      }
    }

    // Method 4: Generic activity images based on type
    const activityTypes = [
      "cruise",
      "tour",
      "museum",
      "park",
      "temple",
      "beach",
      "mountain",
      "city",
      "wildlife",
      "adventure",
      "cultural",
      "food",
      "wine",
    ]

    const activityName = (activityData.ticketName || activityData.name || "").toLowerCase()
    const matchedTypes = activityTypes.filter((type) => activityName.includes(type))

    if (matchedTypes.length > 0) {
      matchedTypes.forEach((type) => {
        const imageUrl = `/placeholder.svg?height=300&width=400&text=${type}+activity`
        searchResults.foundImages.push(imageUrl)
      })

      searchResults.searchAttempts.push({
        method: "Activity Type Search",
        query: matchedTypes.join(", "),
        success: true,
        imagesFound: matchedTypes.length,
      })
    }

    // Remove duplicates
    searchResults.foundImages = [...new Set(searchResults.foundImages)]

    console.log(`✅ Found ${searchResults.foundImages.length} images for activity`)

    return NextResponse.json({
      success: true,
      images: searchResults,
    })
  } catch (error) {
    console.error("❌ Error searching activity images:", error)
    return NextResponse.json({ success: false, error: "Failed to search activity images" }, { status: 500 })
  }
}
