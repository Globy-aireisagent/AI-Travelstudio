import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    const { serviceData, serviceType, micrositeId } = await request.json()

    console.log(
      `🔍 Fetching images and details for ${serviceType}: ${serviceData.name || serviceData.ticketName || serviceData.vehicleName}`,
    )

    const client = createTravelCompositorClient()
    const token = await client.authenticate()

    const searchResults = {
      foundImages: [] as string[],
      description: null as string | null,
      features: [] as string[],
      details: {} as any,
      searchMethods: [] as any[],
      referenceNumber: null as string | null,
    }

    // Extract reference number if available
    if (serviceData.referenceNumber) {
      searchResults.referenceNumber = serviceData.referenceNumber
    } else if (serviceData.bookingReference) {
      searchResults.referenceNumber = serviceData.bookingReference
    } else if (serviceData.confirmationNumber) {
      searchResults.referenceNumber = serviceData.confirmationNumber
    } else if (serviceData.reference) {
      searchResults.referenceNumber = serviceData.reference
    }

    // Add any existing images from the service data
    if (serviceData.imageUrl) searchResults.foundImages.push(serviceData.imageUrl)
    if (serviceData.imageUrls && Array.isArray(serviceData.imageUrls)) {
      searchResults.foundImages.push(...serviceData.imageUrls)
    }
    if (serviceData.image) searchResults.foundImages.push(serviceData.image)
    if (serviceData.images && Array.isArray(serviceData.images)) {
      searchResults.foundImages.push(...serviceData.images)
    }

    // Add description if available
    if (serviceData.description) {
      searchResults.description = serviceData.description
    }

    // Search based on service type
    switch (serviceType) {
      case "ticket":
        await searchTicketImages(serviceData, token, micrositeId, searchResults)
        break
      case "car":
        await searchCarImages(serviceData, token, micrositeId, searchResults)
        break
      case "transport":
        await searchTransportImages(serviceData, token, micrositeId, searchResults)
        break
      case "transfer":
        await searchTransferImages(serviceData, token, micrositeId, searchResults)
        break
      case "tour":
        await searchTourImages(serviceData, token, micrositeId, searchResults)
        break
      default:
        searchResults.searchMethods.push({
          method: "Generic Search",
          success: false,
          error: "Unsupported service type",
        })
    }

    // Clean up and deduplicate results
    searchResults.foundImages = [...new Set(searchResults.foundImages.filter(Boolean))]
    searchResults.features = [...new Set(searchResults.features.filter(Boolean))]

    console.log(`✅ ${serviceType} search complete:`)
    console.log(`   - Images: ${searchResults.foundImages.length}`)
    console.log(`   - Description: ${searchResults.description ? "Yes" : "No"}`)
    console.log(`   - Features: ${searchResults.features.length}`)
    console.log(`   - Reference Number: ${searchResults.referenceNumber || "Not found"}`)

    return NextResponse.json({
      success: true,
      images: searchResults,
      service: serviceData.name || serviceData.ticketName || serviceData.vehicleName,
    })
  } catch (error) {
    console.error("❌ Error in service images API:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        images: {
          foundImages: [],
          description: null,
          features: [],
          details: {},
          searchMethods: [
            {
              method: "API Error",
              success: false,
              error: error instanceof Error ? error.message : String(error),
            },
          ],
          referenceNumber: null,
        },
      },
      { status: 500 },
    )
  }
}

// Search for ticket/activity images
async function searchTicketImages(ticketData: any, token: string, micrositeId: string, results: any) {
  try {
    // Method 1: Search by ticket name
    if (ticketData.ticketName || ticketData.name) {
      const searchName = ticketData.ticketName || ticketData.name
      const searchLocation = ticketData.destination || ticketData.locationName || ""

      console.log(`🎫 Searching for ticket: ${searchName} in ${searchLocation}`)

      const searchUrl = `https://online.travelcompositor.com/resources/tickets/search/${micrositeId}?name=${encodeURIComponent(searchName)}&location=${encodeURIComponent(searchLocation)}&lang=nl`

      const searchResponse = await fetch(searchUrl, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        console.log(`✅ Found ${searchData.length || 0} ticket search results`)

        if (searchData && Array.isArray(searchData) && searchData.length > 0) {
          // Find the best match
          const bestMatch =
            searchData.find(
              (ticket: any) =>
                ticket.name?.toLowerCase().includes(searchName.toLowerCase()) ||
                searchName.toLowerCase().includes(ticket.name?.toLowerCase()),
            ) || searchData[0]

          if (bestMatch) {
            extractImages(bestMatch, results)
            extractDescription(bestMatch, results)
            extractFeatures(bestMatch, results)

            // Extract specific ticket details
            if (bestMatch.duration) results.details.duration = bestMatch.duration
            if (bestMatch.language) results.details.language = bestMatch.language
            if (bestMatch.modality) results.details.modality = bestMatch.modality
          }
        }

        results.searchMethods.push({
          method: "Ticket Search",
          success: true,
          results: searchData?.length || 0,
        })
      } else {
        results.searchMethods.push({
          method: "Ticket Search",
          success: false,
          error: `HTTP ${searchResponse.status}`,
        })
      }
    }

    // Method 2: Search by ticket ID if available
    if (ticketData.ticketId) {
      try {
        console.log(`🎟️ Searching for ticket ID: ${ticketData.ticketId}`)

        const ticketResponse = await fetch(
          `https://online.travelcompositor.com/resources/tickets/${ticketData.ticketId}?lang=nl`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (ticketResponse.ok) {
          const ticketDetails = await ticketResponse.json()
          console.log("✅ Ticket details found")

          extractImages(ticketDetails, results)
          extractDescription(ticketDetails, results)
          extractFeatures(ticketDetails, results)

          results.searchMethods.push({
            method: "Ticket ID Lookup",
            success: true,
          })
        } else {
          results.searchMethods.push({
            method: "Ticket ID Lookup",
            success: false,
            error: `HTTP ${ticketResponse.status}`,
          })
        }
      } catch (error) {
        results.searchMethods.push({
          method: "Ticket ID Lookup",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  } catch (error) {
    console.error("❌ Error searching ticket images:", error)
    results.searchMethods.push({
      method: "Ticket Search",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// Search for car rental images
async function searchCarImages(carData: any, token: string, micrositeId: string, results: any) {
  try {
    // Method 1: Search by vehicle name/category
    if (carData.vehicleName || carData.category) {
      const searchName = carData.vehicleName || carData.category
      const searchVendor = carData.vendor || ""

      console.log(`🚗 Searching for car: ${searchName} from ${searchVendor}`)

      const searchUrl = `https://online.travelcompositor.com/resources/cars/search/${micrositeId}?name=${encodeURIComponent(searchName)}&vendor=${encodeURIComponent(searchVendor)}&lang=nl`

      const searchResponse = await fetch(searchUrl, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        console.log(`✅ Found ${searchData.length || 0} car search results`)

        if (searchData && Array.isArray(searchData) && searchData.length > 0) {
          // Find the best match
          const bestMatch =
            searchData.find(
              (car: any) =>
                car.name?.toLowerCase().includes(searchName.toLowerCase()) ||
                searchName.toLowerCase().includes(car.name?.toLowerCase()),
            ) || searchData[0]

          if (bestMatch) {
            extractImages(bestMatch, results)
            extractDescription(bestMatch, results)
            extractFeatures(bestMatch, results)

            // Extract specific car details
            if (bestMatch.category) results.details.category = bestMatch.category
            if (bestMatch.vendor) results.details.vendor = bestMatch.vendor
            if (bestMatch.transmission) results.details.transmission = bestMatch.transmission
            if (bestMatch.fuelType) results.details.fuelType = bestMatch.fuelType
          }
        }

        results.searchMethods.push({
          method: "Car Search",
          success: true,
          results: searchData?.length || 0,
        })
      } else {
        results.searchMethods.push({
          method: "Car Search",
          success: false,
          error: `HTTP ${searchResponse.status}`,
        })
      }
    }

    // Method 2: Search by vendor catalog
    if (carData.vendor) {
      try {
        console.log(`🚙 Searching car vendor catalog: ${carData.vendor}`)

        const vendorResponse = await fetch(
          `https://online.travelcompositor.com/resources/cars/vendors/${encodeURIComponent(carData.vendor)}/${micrositeId}?lang=nl`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (vendorResponse.ok) {
          const vendorData = await vendorResponse.json()
          console.log(`✅ Found vendor catalog with ${vendorData.length || 0} cars`)

          if (vendorData && Array.isArray(vendorData) && vendorData.length > 0) {
            // Find matching car by category or name
            const matchingCar =
              vendorData.find(
                (car: any) =>
                  (carData.vehicleName && car.name?.toLowerCase().includes(carData.vehicleName.toLowerCase())) ||
                  (carData.category && car.category?.toLowerCase().includes(carData.category.toLowerCase())),
              ) || vendorData[0]

            if (matchingCar) {
              extractImages(matchingCar, results)
              extractDescription(matchingCar, results)
              extractFeatures(matchingCar, results)
            }
          }

          results.searchMethods.push({
            method: "Vendor Catalog",
            success: true,
            results: vendorData?.length || 0,
          })
        } else {
          results.searchMethods.push({
            method: "Vendor Catalog",
            success: false,
            error: `HTTP ${vendorResponse.status}`,
          })
        }
      } catch (error) {
        results.searchMethods.push({
          method: "Vendor Catalog",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  } catch (error) {
    console.error("❌ Error searching car images:", error)
    results.searchMethods.push({
      method: "Car Search",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// Search for transport/flight images
async function searchTransportImages(transportData: any, token: string, micrositeId: string, results: any) {
  try {
    // For flights, we can try to get airline logos
    if (transportData.marketingAirlineCode) {
      const airlineCode = transportData.marketingAirlineCode
      console.log(`✈️ Searching for airline: ${airlineCode}`)

      // Add airline logo URL (this is a common pattern for airline logos)
      const airlineLogo = `https://pics.avs.io/200/200/${airlineCode}.png`
      results.foundImages.push(airlineLogo)

      results.details.airline = airlineCode
      if (transportData.flightNumber) results.details.flightNumber = transportData.flightNumber
      if (transportData.departureAirport) results.details.departureAirport = transportData.departureAirport
      if (transportData.arrivalAirport) results.details.arrivalAirport = transportData.arrivalAirport

      results.searchMethods.push({
        method: "Airline Logo",
        success: true,
      })
    }

    // Try to get airport images if available
    if (transportData.departureAirport || transportData.arrivalAirport) {
      // This would require a separate API for airport images
      // For now, we'll just note that we could search for these
      results.searchMethods.push({
        method: "Airport Images",
        success: false,
        note: "Airport image search not implemented",
      })
    }
  } catch (error) {
    console.error("❌ Error searching transport images:", error)
    results.searchMethods.push({
      method: "Transport Search",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// Search for transfer images
async function searchTransferImages(transferData: any, token: string, micrositeId: string, results: any) {
  try {
    // For transfers, we can try to get generic transfer images or specific provider images
    if (transferData.transferType) {
      console.log(`🚕 Searching for transfer type: ${transferData.transferType}`)

      // Add transfer details
      if (transferData.from) results.details.from = transferData.from
      if (transferData.to) results.details.to = transferData.to
      if (transferData.transferType) results.details.transferType = transferData.transferType

      // Try to search for transfer services
      const searchUrl = `https://online.travelcompositor.com/resources/transfers/search/${micrositeId}?from=${encodeURIComponent(transferData.from || "")}&to=${encodeURIComponent(transferData.to || "")}&lang=nl`

      const searchResponse = await fetch(searchUrl, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        console.log(`✅ Found ${searchData.length || 0} transfer search results`)

        if (searchData && Array.isArray(searchData) && searchData.length > 0) {
          // Use the first result or best match
          const bestMatch = searchData[0]

          if (bestMatch) {
            extractImages(bestMatch, results)
            extractDescription(bestMatch, results)
            extractFeatures(bestMatch, results)
          }
        }

        results.searchMethods.push({
          method: "Transfer Search",
          success: true,
          results: searchData?.length || 0,
        })
      } else {
        results.searchMethods.push({
          method: "Transfer Search",
          success: false,
          error: `HTTP ${searchResponse.status}`,
        })
      }
    }
  } catch (error) {
    console.error("❌ Error searching transfer images:", error)
    results.searchMethods.push({
      method: "Transfer Search",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// Search for tour images
async function searchTourImages(tourData: any, token: string, micrositeId: string, results: any) {
  try {
    // Method 1: Search by tour name
    if (tourData.name || tourData.tourName) {
      const searchName = tourData.name || tourData.tourName
      const searchLocation = tourData.destination || tourData.locationName || ""

      console.log(`🧭 Searching for tour: ${searchName} in ${searchLocation}`)

      const searchUrl = `https://online.travelcompositor.com/resources/closedtours/search/${micrositeId}?name=${encodeURIComponent(searchName)}&location=${encodeURIComponent(searchLocation)}&lang=nl`

      const searchResponse = await fetch(searchUrl, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        console.log(`✅ Found ${searchData.length || 0} tour search results`)

        if (searchData && Array.isArray(searchData) && searchData.length > 0) {
          // Find the best match
          const bestMatch =
            searchData.find(
              (tour: any) =>
                tour.name?.toLowerCase().includes(searchName.toLowerCase()) ||
                searchName.toLowerCase().includes(tour.name?.toLowerCase()),
            ) || searchData[0]

          if (bestMatch) {
            extractImages(bestMatch, results)
            extractDescription(bestMatch, results)
            extractFeatures(bestMatch, results)

            // Extract specific tour details
            if (bestMatch.duration) results.details.duration = bestMatch.duration
            if (bestMatch.language) results.details.language = bestMatch.language
            if (bestMatch.modality) results.details.modality = bestMatch.modality
          }
        }

        results.searchMethods.push({
          method: "Tour Search",
          success: true,
          results: searchData?.length || 0,
        })
      } else {
        results.searchMethods.push({
          method: "Tour Search",
          success: false,
          error: `HTTP ${searchResponse.status}`,
        })
      }
    }
  } catch (error) {
    console.error("❌ Error searching tour images:", error)
    results.searchMethods.push({
      method: "Tour Search",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// Helper functions
function extractImages(data: any, results: any) {
  const imageFields = ["images", "gallery", "photos", "imageUrls", "imageUrl", "image", "mainImage", "thumbnailUrl"]

  imageFields.forEach((field) => {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        results.foundImages.push(
          ...data[field].map((img: any) => {
            if (typeof img === "string") return img
            return img.url || img.src || img.href || img.imageUrl
          }),
        )
      } else if (typeof data[field] === "string") {
        results.foundImages.push(data[field])
      } else if (typeof data[field] === "object") {
        results.foundImages.push(data[field].url || data[field].src || data[field].href)
      }
    }
  })
}

function extractDescription(data: any, results: any) {
  if (!results.description) {
    const descriptionFields = ["description", "longDescription", "shortDescription", "detailedDescription", "summary"]

    for (const field of descriptionFields) {
      if (data[field] && typeof data[field] === "string") {
        results.description = data[field]
        break
      }
    }
  }
}

function extractFeatures(data: any, results: any) {
  const featureFields = ["features", "facilities", "amenities", "services", "includes", "highlights", "specifications"]

  featureFields.forEach((field) => {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        results.features.push(
          ...data[field].map((item: any) => {
            if (typeof item === "string") return item
            return item.name || item.description || item.title || String(item)
          }),
        )
      } else if (typeof data[field] === "object") {
        // Handle nested feature objects
        Object.values(data[field]).forEach((item: any) => {
          if (typeof item === "string") {
            results.features.push(item)
          } else if (item && typeof item === "object") {
            results.features.push(item.name || item.description || item.title)
          }
        })
      }
    }
  })
}
