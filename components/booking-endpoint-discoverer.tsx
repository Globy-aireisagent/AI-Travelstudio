"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Calendar, CheckCircle, XCircle } from "lucide-react"

export default function BookingEndpointDiscoverer() {
  const [discoveryResults, setDiscoveryResults] = useState<any>(null)
  const [specificBookingId, setSpecificBookingId] = useState("")
  const [specificBooking, setSpecificBooking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleDiscovery = async () => {
    setIsLoading(true)
    setMessage("Discovering booking endpoints...")
    setDiscoveryResults(null)

    try {
      const response = await fetch("/api/discover-booking-endpoints")
      const result = await response.json()

      if (result.success) {
        setDiscoveryResults(result.results)
        setMessage(
          `✅ Discovery complete! Found ${result.summary.workingEndpoints} working endpoints with ${result.summary.sampleBookings} sample bookings`,
        )
      } else {
        setMessage(`❌ Discovery failed: ${result.error}`)
      }
    } catch (error) {
      setMessage("❌ Discovery failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpecificBookingSearch = async () => {
    if (!specificBookingId.trim()) return

    setIsLoading(true)
    setMessage(`Searching for booking ${specificBookingId}...`)
    setSpecificBooking(null)

    try {
      const response = await fetch("/api/discover-booking-endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: specificBookingId.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        setSpecificBooking(result.booking)
        setMessage(`✅ Found booking ${specificBookingId}!`)
      } else {
        setMessage(`❌ Booking ${specificBookingId} not found: ${result.error}`)
      }
    } catch (error) {
      setMessage("❌ Booking search failed")
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
            <Eye className="h-5 w-5" />
            Booking Endpoint Discovery
          </CardTitle>
          <CardDescription>
            Discover which booking endpoints work and find sample bookings to understand the data structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handleDiscovery} disabled={isLoading} className="flex-1">
              {isLoading ? "Discovering..." : "Discover Booking Endpoints"}
            </Button>
          </div>

          <div className="border-t pt-4">
            <label className="text-sm font-medium">Search for Specific Booking</label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter booking ID or reference"
                value={specificBookingId}
                onChange={(e) => setSpecificBookingId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSpecificBookingSearch()}
              />
              <Button
                onClick={handleSpecificBookingSearch}
                disabled={isLoading || !specificBookingId.trim()}
                variant="outline"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg ${
                message.includes("✅")
                  ? "bg-green-50 text-green-800"
                  : message.includes("❌")
                    ? "bg-red-50 text-red-800"
                    : "bg-blue-50 text-blue-800"
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discovery Results */}
      {discoveryResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Working Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Working Endpoints ({discoveryResults.workingEndpoints.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {discoveryResults.workingEndpoints.map((endpoint: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{endpoint.endpoint}</code>
                        <Badge variant="outline">{endpoint.status}</Badge>
                      </div>
                      {endpoint.agencyName && <p className="text-sm text-gray-600">Agency: {endpoint.agencyName}</p>}
                      <p className="text-xs text-gray-500">Data keys: {endpoint.dataKeys.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Sample Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Sample Bookings ({discoveryResults.sampleBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {discoveryResults.sampleBookings.map((booking: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {booking.id || booking.reference || booking.bookingReference || `Booking ${index + 1}`}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => setSpecificBooking(booking)}>
                          View
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {booking.customerName || booking.clientName || "No customer name"}
                      </p>
                      <p className="text-xs text-gray-500">Keys: {Object.keys(booking).slice(0, 5).join(", ")}...</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Failed Endpoints */}
      {discoveryResults && discoveryResults.failedEndpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Failed Endpoints ({discoveryResults.failedEndpoints.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {discoveryResults.failedEndpoints.map((endpoint: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <code className="text-sm">{endpoint.endpoint}</code>
                    <Badge variant="destructive">{endpoint.status || "Error"}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Specific Booking Details */}
      {specificBooking && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(specificBooking, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
