import BookingEndpointDiscoverer from "@/components/booking-endpoint-discoverer"

export default function DiscoverBookingEndpointsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Booking Endpoint Discovery</h1>
          <p className="text-xl text-gray-600">Find working booking endpoints and discover sample bookings</p>
        </div>

        <BookingEndpointDiscoverer />
      </div>
    </div>
  )
}
