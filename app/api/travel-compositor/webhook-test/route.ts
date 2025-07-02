import { webhookBookingStore } from "@/lib/webhook-booking-store"

export async function POST() {
  try {
    // Test webhook with RRP-9263 data
    const testBookingData = {
      id: "RRP-9263",
      bookingReference: "RRP-9263",
      customBookingReference: "00009263",
      status: "BOOKED",
      tripType: "TRIP_PLANNER",
      startDate: "2025-07-28T00:00:00",
      endDate: "2025-08-04",
      contactPerson: {
        name: "Seppe",
        lastName: "Thijssen",
        email: "2go@travelcompany.nl",
      },
      // Simplified test data
      testData: true,
    }

    // Store test booking
    webhookBookingStore.storeBooking(testBookingData, "rondreis-planner")

    return Response.json({
      success: true,
      message: "Test booking stored via webhook simulation",
      bookingId: "RRP-9263",
      stats: webhookBookingStore.getStats(),
    })
  } catch (error) {
    console.error("❌ Webhook test error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
