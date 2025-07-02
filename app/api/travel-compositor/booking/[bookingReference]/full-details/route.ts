import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { bookingReference: string } }) {
  const bookingId = params.bookingReference

  // Placeholder for fetching booking details.  Replace with actual logic.
  const bookingDetails = {
    bookingReference: bookingId,
    status: "Confirmed",
    flights: [
      {
        flightNumber: "XY123",
        departure: "JFK",
        arrival: "LAX",
        date: "2024-01-01",
      },
    ],
    hotel: {
      name: "Example Hotel",
      location: "Los Angeles",
      checkIn: "2024-01-01",
      checkOut: "2024-01-05",
    },
  }

  return NextResponse.json(bookingDetails)
}
