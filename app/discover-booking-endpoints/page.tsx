import BookingEndpointDiscoverer from "@/components/booking-endpoint-discoverer"

export default function DiscoverBookingEndpointsPage() {
  return (
    <main className="container mx-auto max-w-5xl py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Booking Endpoint Discovery</h1>
      <p className="text-center mb-10 text-muted-foreground">
        Find working booking endpoints and discover sample bookings
      </p>

      {/* Client component */}
      <BookingEndpointDiscoverer />
    </main>
  )
}
