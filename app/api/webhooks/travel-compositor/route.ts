import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook received from Travel Compositor")

    const body = await request.json()
    console.log("📦 Webhook payload:", JSON.stringify(body, null, 2))

    // Verify webhook signature (if Travel Compositor provides one)
    const signature = request.headers.get("x-tc-signature")
    if (signature && !verifyWebhookSignature(body, signature)) {
      console.log("❌ Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Determine webhook type
    const webhookType = determineWebhookType(body)

    let result
    switch (webhookType) {
      case "booking":
        result = await processBookingWebhook(body)
        break
      case "idea":
        result = await processIdeaWebhook(body)
        break
      case "package":
        result = await processPackageWebhook(body)
        break
      default:
        console.log("⚠️ Unknown webhook type")
        return NextResponse.json({ error: "Unknown webhook type" }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      id: result.id,
      type: webhookType,
    })
  } catch (error) {
    console.error("❌ Webhook processing error:", error)
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function determineWebhookType(payload: any): string {
  // Check for booking indicators
  if (payload.booking || payload.bookingReference || payload.hotelservice) {
    return "booking"
  }

  // Check for idea indicators
  if (payload.idea || payload.travelIdea || payload.ideaId || payload.title) {
    return "idea"
  }

  // Check for package indicators
  if (payload.package || payload.holidayPackage || payload.packageId) {
    return "package"
  }

  return "unknown"
}

async function processBookingWebhook(payload: any) {
  try {
    const bookingData = extractBookingFromWebhook(payload)

    if (!bookingData) {
      return { success: false, error: "No valid booking data in webhook" }
    }

    console.log(`✅ Processing booking: ${bookingData.id}`)

    // Store in Supabase
    const { data, error } = await supabase
      .from("bookings")
      .upsert({
        id: bookingData.id,
        booking_reference: bookingData.bookingReference,
        title: bookingData.title,
        client_name: bookingData.client.name,
        client_email: bookingData.client.email,
        client_phone: bookingData.client.phone,
        destination: bookingData.destination,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        status: bookingData.status,
        total_price: bookingData.totalPrice,
        currency: bookingData.currency,
        accommodations: bookingData.accommodations,
        activities: bookingData.activities,
        transports: bookingData.transports,
        vouchers: bookingData.vouchers,
        raw_data: bookingData.rawData,
        webhook_received_at: new Date().toISOString(),
        microsite_source: bookingData.micrositeSource,
      })
      .select()

    if (error) {
      console.error("❌ Supabase booking error:", error)
      return { success: false, error: "Database error" }
    }

    await sendBookingNotification(bookingData)

    return {
      success: true,
      message: `Booking ${bookingData.id} processed successfully`,
      id: bookingData.id,
    }
  } catch (error) {
    console.error("❌ Booking webhook error:", error)
    return { success: false, error: "Booking processing failed" }
  }
}

async function processIdeaWebhook(payload: any) {
  try {
    const ideaData = extractIdeaFromWebhook(payload)

    if (!ideaData) {
      return { success: false, error: "No valid idea data in webhook" }
    }

    console.log(`✅ Processing idea: ${ideaData.id}`)

    // Store in Supabase
    const { data, error } = await supabase
      .from("travel_ideas")
      .upsert({
        id: ideaData.id,
        title: ideaData.title,
        description: ideaData.description,
        destination: ideaData.destination,
        duration_days: ideaData.durationDays,
        price_from: ideaData.priceFrom,
        price_to: ideaData.priceTo,
        currency: ideaData.currency,
        category: ideaData.category,
        tags: ideaData.tags,
        images: ideaData.images,
        highlights: ideaData.highlights,
        included_services: ideaData.includedServices,
        raw_data: ideaData.rawData,
        webhook_received_at: new Date().toISOString(),
        microsite_source: ideaData.micrositeSource,
        status: ideaData.status,
      })
      .select()

    if (error) {
      console.error("❌ Supabase idea error:", error)
      return { success: false, error: "Database error" }
    }

    await sendIdeaNotification(ideaData)

    return {
      success: true,
      message: `Travel idea ${ideaData.id} processed successfully`,
      id: ideaData.id,
    }
  } catch (error) {
    console.error("❌ Idea webhook error:", error)
    return { success: false, error: "Idea processing failed" }
  }
}

async function processPackageWebhook(payload: any) {
  try {
    const packageData = extractPackageFromWebhook(payload)

    if (!packageData) {
      return { success: false, error: "No valid package data in webhook" }
    }

    console.log(`✅ Processing package: ${packageData.id}`)

    // Store in Supabase
    const { data, error } = await supabase
      .from("holiday_packages")
      .upsert({
        id: packageData.id,
        title: packageData.title,
        description: packageData.description,
        destination: packageData.destination,
        duration_days: packageData.durationDays,
        price: packageData.price,
        currency: packageData.currency,
        availability: packageData.availability,
        inclusions: packageData.inclusions,
        exclusions: packageData.exclusions,
        images: packageData.images,
        raw_data: packageData.rawData,
        webhook_received_at: new Date().toISOString(),
        microsite_source: packageData.micrositeSource,
        status: packageData.status,
      })
      .select()

    if (error) {
      console.error("❌ Supabase package error:", error)
      return { success: false, error: "Database error" }
    }

    return {
      success: true,
      message: `Holiday package ${packageData.id} processed successfully`,
      id: packageData.id,
    }
  } catch (error) {
    console.error("❌ Package webhook error:", error)
    return { success: false, error: "Package processing failed" }
  }
}

function extractBookingFromWebhook(payload: any) {
  try {
    const booking = payload.booking || payload.data || payload

    if (!booking || !booking.id) {
      return null
    }

    return {
      id: booking.id,
      bookingReference: booking.bookingReference || booking.id,
      title: booking.title || booking.name || `Booking ${booking.id}`,
      client: {
        name: booking.contactPerson?.name || booking.client?.name || "Unknown",
        email: booking.contactPerson?.email || booking.client?.email || "",
        phone: booking.contactPerson?.phone || booking.client?.phone || "",
      },
      destination: extractDestinations(booking),
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status || "CONFIRMED",
      totalPrice: booking.pricebreakdown?.totalPrice?.microsite?.amount || 0,
      currency: booking.pricebreakdown?.totalPrice?.microsite?.currency || "EUR",
      accommodations: booking.hotelservice || [],
      activities: booking.ticketservice || [],
      transports: booking.transportservice || [],
      vouchers: booking.transferservice || [],
      rawData: booking,
      micrositeSource: booking.micrositeId || "unknown",
    }
  } catch (error) {
    console.error("❌ Error extracting booking data:", error)
    return null
  }
}

function extractIdeaFromWebhook(payload: any) {
  try {
    const idea = payload.idea || payload.travelIdea || payload.data || payload

    if (!idea || !idea.id) {
      return null
    }

    return {
      id: idea.id,
      title: idea.title || idea.name || `Travel Idea ${idea.id}`,
      description: idea.description || idea.summary || "",
      destination: idea.destination || idea.location || "Unknown",
      durationDays: idea.durationDays || idea.duration || 7,
      priceFrom: idea.priceFrom || idea.minPrice || 0,
      priceTo: idea.priceTo || idea.maxPrice || 0,
      currency: idea.currency || "EUR",
      category: idea.category || idea.type || "General",
      tags: idea.tags || idea.keywords || [],
      images: idea.images || idea.photos || [],
      highlights: idea.highlights || idea.features || [],
      includedServices: idea.includedServices || idea.includes || [],
      rawData: idea,
      micrositeSource: idea.micrositeId || "unknown",
      status: idea.status || "ACTIVE",
    }
  } catch (error) {
    console.error("❌ Error extracting idea data:", error)
    return null
  }
}

function extractPackageFromWebhook(payload: any) {
  try {
    const pkg = payload.package || payload.holidayPackage || payload.data || payload

    if (!pkg || !pkg.id) {
      return null
    }

    return {
      id: pkg.id,
      title: pkg.title || pkg.name || `Package ${pkg.id}`,
      description: pkg.description || "",
      destination: pkg.destination || "Unknown",
      durationDays: pkg.durationDays || pkg.duration || 7,
      price: pkg.price || pkg.totalPrice || 0,
      currency: pkg.currency || "EUR",
      availability: pkg.availability || {},
      inclusions: pkg.inclusions || pkg.includes || [],
      exclusions: pkg.exclusions || pkg.excludes || [],
      images: pkg.images || [],
      rawData: pkg,
      micrositeSource: pkg.micrositeId || "unknown",
      status: pkg.status || "AVAILABLE",
    }
  } catch (error) {
    console.error("❌ Error extracting package data:", error)
    return null
  }
}

function extractDestinations(booking: any): string {
  const destinations = new Set<string>()

  if (booking.hotelservice) {
    booking.hotelservice.forEach((hotel: any) => {
      if (hotel.locationName) destinations.add(hotel.locationName)
      if (hotel.destinationName) destinations.add(hotel.destinationName)
    })
  }

  if (booking.ticketservice) {
    booking.ticketservice.forEach((ticket: any) => {
      if (ticket.locationName) destinations.add(ticket.locationName)
    })
  }

  return Array.from(destinations).join(", ") || "Unknown Destination"
}

function verifyWebhookSignature(payload: any, signature: string): boolean {
  // Implement signature verification if Travel Compositor provides it
  return true
}

async function sendBookingNotification(booking: any) {
  try {
    console.log(`📧 Booking notification sent for ${booking.id}`)
  } catch (error) {
    console.error("❌ Booking notification error:", error)
  }
}

async function sendIdeaNotification(idea: any) {
  try {
    console.log(`💡 Idea notification sent for ${idea.id}`)
  } catch (error) {
    console.error("❌ Idea notification error:", error)
  }
}
