import BookingEndpointDiscoverer from "@/components/booking-endpoint-discoverer"

export default function DiscoverBookingEndpointsPage() {
  return (
    <main className="container mx-auto max-w-6xl py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-Microsite Booking Discovery</h1>
        <p className="text-muted-foreground">
          Test all available microsite configurations to find working booking endpoints
        </p>
      </div>

      <BookingEndpointDiscoverer />
    </main>
  )
}
