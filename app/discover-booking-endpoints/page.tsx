import BookingEndpointDiscoverer from "@/components/booking-endpoint-discoverer"

export default function DiscoverBookingEndpointsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Booking Endpoint Discovery</h1>
          <p className="text-gray-600 mt-2">
            Discover which booking endpoints work and find sample bookings to understand how to import them
          </p>
        </div>

        <BookingEndpointDiscoverer />
      </div>
    </div>
  )
}
