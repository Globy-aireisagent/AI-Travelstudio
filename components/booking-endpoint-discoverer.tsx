"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, AlertCircle, CheckCircle, Calendar } from "lucide-react"

export default function BookingEndpointDiscoverer() {
  const [discoveryResults, setDiscoveryResults] = useState<any>(null)
  const [searchBookingId, setSearchBookingId] = useState("")
  const [foundBooking, setFoundBooking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const discoverEndpoints = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/discover-booking-endpoints")
      const result = await response.json()

      if (result.success) {
        setDiscoveryResults(result.results)
        setMessage(`✅ Discovery complete: ${result.summary.workingEndpoints} working endpoints found`)
      } else {
        setMessage(`❌ Discovery failed: ${result.error}`)
      }
    } catch (error) {
      setMessage("❌ Discovery failed")
    } finally {
      setIsLoading(false)
    }
  }

  const searchSpecificBooking = async () => {
    if (!searchBookingId.trim()) return

    setIsLoading(true)
    setMessage("")
    setFoundBooking(null)

    try {
      const response = await fetch("/api/discover-booking-endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: searchBookingId.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        setFoundBooking(result.booking)
        setMessage(`✅ Found booking ${searchBookingId}!`)
      } else {
        setMessage(`❌ Booking not found: ${result.error}`)
      }
    } catch (error) {
      setMessage("❌ Search failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Discovery Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Booking Endpoint Discovery
          </CardTitle>
          <CardDescription>Discover which booking endpoints work and find sample bookings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={discoverEndpoints} disabled={isLoading} size="lg" className="w-full">
            {isLoading ? "Discovering..." : "Discover Booking Endpoints"}
          </Button>

          {message && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                message.includes("✅") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {message.includes("✅") ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Specific Booking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Search Specific Booking
          </CardTitle>
          <CardDescription>Search for a specific booking ID in all discovered endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter booking ID (e.g. RRP-9569)"
              value={searchBookingId}
              onChange={(e) => setSearchBookingId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchSpecificBooking()}
            />
            <Button onClick={searchSpecificBooking} disabled={isLoading || !searchBookingId.trim()}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Discovery Results */}
      {discoveryResults && (
        <>
          {/* Working Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Working Endpoints ({discoveryResults.workingEndpoints.length})</CardTitle>
              <CardDescription>Endpoints that returned data successfully</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {discoveryResults.workingEndpoints.map((endpoint: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm">{endpoint.endpoint}</p>
                          {endpoint.agencyName && (
                            <p className="text-xs text-gray-600">Agency: {endpoint.agencyName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{endpoint.status}</Badge>
                          {endpoint.totalCount && <Badge variant="secondary">{endpoint.totalCount} items</Badge>}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">Data keys: {endpoint.dataKeys.join(", ")}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Sample Bookings */}
          {discoveryResults.sampleBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Bookings ({discoveryResults.sampleBookings.length})</CardTitle>
                <CardDescription>Sample bookings found in the endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {discoveryResults.sampleBookings.slice(0, 20).map((booking: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {booking.id || booking.reference || booking.bookingReference || `Booking ${index + 1}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.creationDate || booking.bookingDate || booking.created || "No date"}
                            </p>
                          </div>
                          <Button size="sm" onClick={() => setSearchBookingId(booking.id || booking.reference || "")}>
                            Test This ID
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Recent 2025 Bookings */}
          {discoveryResults.year2025Bookings && discoveryResults.year2025Bookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>2025 Bookings ({discoveryResults.year2025Bookings.length})</CardTitle>
                <CardDescription>Bookings from 2025 specifically</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {discoveryResults.year2025Bookings.slice(0, 10).map((booking: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {booking.id || booking.reference || booking.bookingReference || `Booking ${index + 1}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.creationDate || booking.bookingDate || booking.created || "No date"}
                            </p>
                          </div>
                          <Button size="sm" onClick={() => setSearchBookingId(booking.id || booking.reference || "")}>
                            Test This ID
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Found Booking */}
      {foundBooking && (
        <Card>
          <CardHeader>
            <CardTitle>Found Booking: {searchBookingId}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(foundBooking, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
