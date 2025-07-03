import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { micrositeId: string; holidayPackageId: string } },
) {
  try {
    const { micrositeId, holidayPackageId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const lang = searchParams.get("lang") || "nl"

    console.log(`📦 Fetching holiday package ${holidayPackageId} from microsite ${micrositeId}`)

    // Get credentials based on config
    let username, password, actualMicrositeId
    switch (config) {
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
      default:
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    }

    if (!username || !password || !actualMicrositeId) {
      throw new Error(`Missing credentials for config ${config}`)
    }

    // Authenticate with Travel Compositor
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
      const errorText = await authResponse.text()
      throw new Error(`Authentication failed: ${authResponse.status} - ${errorText}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    console.log(`🔑 Authentication successful, trying multiple endpoints for package ${holidayPackageId}`)

    let packageData = null
    let usedEndpoint = ""

    // Try multiple endpoints to find the package data
    const endpoints = [
      // Try the packages endpoint first
      {
        url: `https://online.travelcompositor.com/resources/packages/${actualMicrositeId}?lang=${lang}`,
        name: "packages list",
      },
      // Try the package detail endpoint
      {
        url: `https://online.travelcompositor.com/resources/package/${actualMicrositeId}/${holidayPackageId}?lang=${lang}`,
        name: "package detail",
      },
      // Try the ideas endpoint (travel ideas are often packages)
      {
        url: `https://online.travelcompositor.com/resources/travelideas/${actualMicrositeId}?lang=${lang}`,
        name: "travel ideas",
      },
      // Try the specific travel idea endpoint
      {
        url: `https://online.travelcompositor.com/resources/travelidea/${actualMicrositeId}/${holidayPackageId}?lang=${lang}`,
        name: "travel idea detail",
      },
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Trying endpoint: ${endpoint.name} - ${endpoint.url}`)

        const response = await fetch(endpoint.url, {
          method: "GET",
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Success with ${endpoint.name}:`, JSON.stringify(data, null, 2))

          // If this is a list endpoint, find our specific package
          if (endpoint.name.includes("list") || endpoint.name.includes("ideas")) {
            const packages = data.packages || data.travelIdeas || data.holidayPackages || []
            const foundPackage = packages.find(
              (pkg: any) =>
                pkg.id === holidayPackageId || pkg.packageId === holidayPackageId || pkg.ideaId === holidayPackageId,
            )

            if (foundPackage) {
              packageData = foundPackage
              usedEndpoint = endpoint.name
              break
            }
          } else {
            // This is a detail endpoint
            packageData = data
            usedEndpoint = endpoint.name
            break
          }
        } else {
          console.log(`❌ ${endpoint.name} failed: ${response.status}`)
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name} error:`, error)
        continue
      }
    }

    if (!packageData) {
      // If no package found, try to get destinations and create a basic package structure
      console.log(`🏙️ No package found, trying to get destinations for microsite ${actualMicrositeId}`)

      try {
        const destResponse = await fetch(
          `https://online.travelcompositor.com/resources/destination/${actualMicrositeId}?lang=${lang}`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (destResponse.ok) {
          const destData = await destResponse.json()
          console.log("🏙️ Destinations data:", JSON.stringify(destData, null, 2))

          // Create a basic package from destinations
          const destinations = destData.destination || []
          if (destinations.length > 0) {
            packageData = {
              id: holidayPackageId,
              name: `Travel Package ${holidayPackageId}`,
              destinations: destinations.slice(0, 4), // Take first 4 destinations
              description: `Travel package with ${destinations.length} destinations`,
              micrositeId: actualMicrositeId,
            }
            usedEndpoint = "destinations fallback"
          }
        }
      } catch (error) {
        console.log("❌ Destinations fallback failed:", error)
      }
    }

    if (!packageData) {
      throw new Error(`Holiday package ${holidayPackageId} not found in any endpoint`)
    }

    console.log("🔍 Final package data:", JSON.stringify(packageData, null, 2))

    // Transform the data to our expected format
    const transformedPackage = {
      id: holidayPackageId,
      name: packageData.name || packageData.title || `Package ${holidayPackageId}`,
      description: packageData.description || packageData.shortDescription || "",
      shortDescription: packageData.shortDescription || "",
      imageUrl: packageData.imageUrl || packageData.image || "",
      duration: packageData.duration || packageData.days || 0,
      destinations: packageData.destinations || [],
      themes: packageData.themes || packageData.categories || [],
      priceFrom: packageData.priceFrom || packageData.price || null,
      pricePerPerson: packageData.pricePerPerson || null,
      totalPrice: packageData.totalPrice || packageData.price || null,
      departureDate: packageData.departureDate || "",
      returnDate: packageData.returnDate || "",
      availability: packageData.availability || null,
      inclusions: packageData.inclusions || packageData.included || [],
      exclusions: packageData.exclusions || packageData.excluded || [],
      itinerary: packageData.itinerary || packageData.schedule || [],
      accommodations: packageData.accommodations || packageData.hotels || [],
      transports: packageData.transports || packageData.transport || [],
      activities: packageData.activities || packageData.excursions || [],
      bookingConditions: packageData.bookingConditions || packageData.conditions || null,
      contact: packageData.contact || null,
      searchMethod: `Holiday Package API (${usedEndpoint})`,
      micrositeId: actualMicrositeId,
      rawData: packageData,
    }

    console.log("✅ Transformed package:", JSON.stringify(transformedPackage, null, 2))

    return NextResponse.json({
      success: true,
      package: transformedPackage,
      micrositeId: actualMicrositeId,
      holidayPackageId,
      usedEndpoint,
      method: "GET",
    })
  } catch (error) {
    console.error("❌ Error fetching holiday package:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
