import { type NextRequest, NextResponse } from "next/server"
import { extractBookingData } from "@/lib/booking-data-extractor"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookingReference = searchParams.get("bookingReference")
  const micrositeId = searchParams.get("micrositeId")

  if (!bookingReference) {
    return NextResponse.json({ error: "Booking reference required" }, { status: 400 })
  }

  try {
    console.log(`🔍 DIRECT: Fetching booking ${bookingReference} directly from API`)

    // Try multiple microsite configs if not specified
    const micrositeConfigs = micrositeId ? [micrositeId] : ["1", "3", "4"]
    let foundData = null
    let foundInConfig = null

    for (const configId of micrositeConfigs) {
      try {
        console.log(`🧪 Trying direct API call with microsite ${configId}`)

        // Get credentials for this config
        const credentials = getCredentialsForConfig(Number.parseInt(configId))
        if (!credentials) {
          console.log(`❌ No credentials for config ${configId}`)
          continue
        }

        // Try different API URL formats
        const possibleUrls = [
          `https://api.travelcompositor.com/booking/getBookings/${credentials.micrositeId}/${bookingReference}`,
          `https://api.travelcompositor.com/booking/${credentials.micrositeId}/${bookingReference}`,
          `https://api.travelcompositor.com/v1/booking/${credentials.micrositeId}/${bookingReference}`,
        ]

        let response = null
        let usedUrl = ""

        for (const apiUrl of possibleUrls) {
          try {
            console.log(`📡 Trying: ${apiUrl}`)

            response = await fetch(apiUrl, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64")}`,
                Accept: "application/json",
                "User-Agent": "TravelAssistant/1.0",
              },
            })

            if (response.ok) {
              usedUrl = apiUrl
              break
            } else {
              console.log(`❌ ${apiUrl} failed: ${response.status} ${response.statusText}`)
            }
          } catch (error) {
            console.log(`❌ ${apiUrl} error:`, error)
          }
        }

        if (!response || !response.ok) {
          console.log(`❌ All API URLs failed for config ${configId}`)
          continue
        }

        const bookingData = await response.json()
        console.log(`✅ Found booking in config ${configId}:`, bookingData.bookingReference)

        foundData = bookingData
        foundInConfig = configId
        break
      } catch (error) {
        console.log(`❌ Config ${configId} failed:`, error)
      }
    }

    if (!foundData) {
      return NextResponse.json(
        {
          success: false,
          error: `Booking ${bookingReference} not found via direct API calls`,
          searchedConfigs: micrositeConfigs,
        },
        { status: 404 },
      )
    }

    // Extract the booking data using our extractor
    const extractedBooking = extractBookingData(foundData)

    // Try to fetch images for hotels
    try {
      console.log(`🖼️ Fetching images for ${extractedBooking.services.hotels.length} hotels...`)

      for (const hotel of extractedBooking.services.hotels) {
        try {
          const imageResponse = await fetch(`${request.nextUrl.origin}/api/travel-compositor/hotel-images`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hotelData: hotel,
              micrositeId: foundInConfig,
            }),
          })

          if (imageResponse.ok) {
            const imageData = await imageResponse.json()
            if (imageData.images?.foundImages) {
              extractedBooking.images.push(...imageData.images.foundImages)
              console.log(`✅ Added ${imageData.images.foundImages.length} images for ${hotel.displayName}`)
            }
          }
        } catch (error) {
          console.log(`⚠️ Could not fetch images for hotel ${hotel.displayName}:`, error)
        }
      }

      // Remove duplicates
      extractedBooking.images = [...new Set(extractedBooking.images)]
    } catch (error) {
      console.log("⚠️ Error fetching images:", error)
    }

    return NextResponse.json({
      success: true,
      booking: extractedBooking,
      foundInConfig,
      method: "direct_api",
      extractionInfo: {
        originalDataType: foundData.hotelservice ? "complete_booking" : "unknown",
        hotelsExtracted: extractedBooking.services.hotels.length,
        imagesFound: extractedBooking.images.length,
        totalPrice: extractedBooking.totalPrice.amount,
        clientName: extractedBooking.client.name,
      },
    })
  } catch (error) {
    console.error("❌ Direct API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

function getCredentialsForConfig(configId: number) {
  const configs = {
    1: {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    },
    3: {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
    },
    4: {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
    },
  }

  return configs[configId as keyof typeof configs] || null
}
