"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Search, Loader2, AlertCircle, Settings } from "lucide-react"

interface DiscoveryResults {
  workingEndpoints: Array<{
    endpoint: string
    status: number
    dataKeys: string[]
    totalCount: number
    micrositeId?: string
    configName?: string
    agencyId?: string
    agencyName?: string
  }>
  failedEndpoints: Array<{
    endpoint: string
    status?: number
    error: string
    micrositeId?: string
  }>
  agencies: Array<{
    id: string
    name: string
  }>
  sampleBookings: Array<any>
  testedConfigs: Array<{
    name: string
    micrositeId: string
    status: string
  }>
}

export default function BookingEndpointDiscoverer() {
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<DiscoveryResults | null>(null)
  const [searchBookingId, setSearchBookingId] = useState("")
  const [foundBooking, setFoundBooking] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const discoverEndpoints = async () => {
    setIsDiscovering(true)
    setError(null)

    try {
      const response = await fetch("/api/discover-booking-endpoints")
      const data = await response.json()

      if (data.success !== false) {
        setResults(data)
      } else {
        setError(data.error || "Discovery failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Discovery failed")
    } finally {
      setIsDiscovering(false)
    }
  }

  const searchSpecificBooking = async () => {
    if (!searchBookingId.trim()) return

    setIsSearching(true)
    setError(null)
    setFoundBooking(null)

    try {
      const response = await fetch("/api/discover-booking-endpoints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: searchBookingId.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setFoundBooking(data.booking)
      } else {
        setError(data.error || "Booking not found")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Discovery Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Multi-Microsite Booking Discovery
          </CardTitle>
          <CardDescription>
            Test all available microsite configurations to find working booking endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={discoverEndpoints} disabled={isDiscovering} className="w-full">
            {isDiscovering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing All Configurations...
              </>
            ) : (
              "Discover Booking Endpoints"
            )}
          </Button>

          {results && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Discovery complete: {results.workingEndpoints.length} working endpoints found across{" "}
                  {results.testedConfigs.length} configurations
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error: {error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Specific Booking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Specific Booking
          </CardTitle>
          <CardDescription>Search for a specific booking ID across all configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter booking ID (e.g. RRP-9569)"
              value={searchBookingId}
              onChange={(e) => setSearchBookingId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchSpecificBooking()}
            />
            <Button onClick={searchSpecificBooking} disabled={isSearching || !searchBookingId.trim()}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {foundBooking && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Booking Found!</h4>
              <ScrollArea className="h-64">
                <pre className="text-sm bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(foundBooking, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Tabs defaultValue="configs" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="configs">Configs ({results.testedConfigs.length})</TabsTrigger>
            <TabsTrigger value="working">Working ({results.workingEndpoints.length})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({results.failedEndpoints.length})</TabsTrigger>
            <TabsTrigger value="agencies">Agencies ({results.agencies.length})</TabsTrigger>
            <TabsTrigger value="bookings">Bookings ({results.sampleBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="configs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Tested Configurations ({results.testedConfigs.length})
                </CardTitle>
                <CardDescription>All microsite configurations that were tested</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.testedConfigs.map((config, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{config.name}</p>
                          <p className="text-sm text-gray-600">Microsite ID: {config.micrositeId}</p>
                        </div>
                        <Badge variant={config.status === "authenticated" ? "default" : "destructive"}>
                          {config.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="working" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Working Endpoints ({results.workingEndpoints.length})</CardTitle>
                <CardDescription>Endpoints that returned data successfully</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {results.workingEndpoints.map((endpoint, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">{endpoint.endpoint}</code>
                          <Badge variant="outline" className="text-green-600">
                            {endpoint.status}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          {endpoint.configName && <p>Config: {endpoint.configName}</p>}
                          {endpoint.micrositeId && <p>Microsite: {endpoint.micrositeId}</p>}
                          {endpoint.agencyName && (
                            <p>
                              Agency: {endpoint.agencyName} (ID: {endpoint.agencyId})
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 flex-wrap mt-2">
                          <Badge variant="secondary">Total: {endpoint.totalCount}</Badge>
                          <Badge variant="outline">Keys: {endpoint.dataKeys.length}</Badge>
                        </div>

                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Data keys: {endpoint.dataKeys.join(", ")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="failed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Failed Endpoints ({results.failedEndpoints.length})</CardTitle>
                <CardDescription>Endpoints that failed to return data</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {results.failedEndpoints.map((endpoint, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-red-50">
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">{endpoint.endpoint}</code>
                          {endpoint.status && <Badge variant="destructive">{endpoint.status}</Badge>}
                        </div>
                        {endpoint.micrositeId && (
                          <p className="text-sm text-gray-600 mb-1">Microsite: {endpoint.micrositeId}</p>
                        )}
                        <p className="text-sm text-red-600">{endpoint.error}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agencies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agencies ({results.agencies.length})</CardTitle>
                <CardDescription>Available agencies across all microsites</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {results.agencies.map((agency, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{agency.name}</span>
                          <Badge variant="outline">{agency.id}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sample Bookings ({results.sampleBookings.length})</CardTitle>
                <CardDescription>Sample bookings found across all endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {results.sampleBookings.slice(0, 10).map((booking, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {booking.reference || booking.id || booking.bookingReference || `Booking ${index + 1}`}
                          </span>
                          <div className="flex gap-2">
                            {booking.creationDate && (
                              <Badge variant="outline">{new Date(booking.creationDate).getFullYear()}</Badge>
                            )}
                            {booking.status && <Badge variant="secondary">{booking.status}</Badge>}
                          </div>
                        </div>

                        {booking.customerName && (
                          <p className="text-sm text-gray-600">Customer: {booking.customerName}</p>
                        )}

                        {booking.creationDate && (
                          <p className="text-sm text-gray-500">
                            Created: {new Date(booking.creationDate).toLocaleDateString()}
                          </p>
                        )}

                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">View raw data</summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32">
                            {JSON.stringify(booking, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
