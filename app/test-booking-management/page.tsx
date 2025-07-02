"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TestBookingManagement() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [bookingReference, setBookingReference] = useState("BOOK123456")
  const [serviceType, setServiceType] = useState("TRANSPORT")
  const [serviceId, setServiceId] = useState("service123")
  const [clientRequestId, setClientRequestId] = useState("req123")
  const [holidayPackageId, setHolidayPackageId] = useState("package123")
  const [config, setConfig] = useState("1")
  const [microsite, setMicrosite] = useState("microsite1")

  const testCancelService = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/travel-compositor/booking/${bookingReference}/cancel-service?serviceType=${serviceType}&serviceId=${serviceId}&config=${config}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cancellationType: "FULL",
            emailNotifyCancel: true,
            manualCancellationFee: 0,
            relatedManualCancellationFee: 0,
          }),
        },
      )
      const data = await response.json()
      setResults({ type: "cancel-service", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testCreateClientRequest = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/travel-compositor/booking/${bookingReference}/client-requests?config=${config}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: clientRequestId,
            creationDate: new Date().toISOString(),
            closingDate: null,
            type: "GENERAL",
            requestClosed: false,
            message: "Test client request message",
          }),
        },
      )
      const data = await response.json()
      setResults({ type: "client-request", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testReplyToRequest = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/travel-compositor/booking/${bookingReference}/client-requests/${clientRequestId}/reply?config=${config}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "This is a reply to your request. We will process it shortly.",
          }),
        },
      )
      const data = await response.json()
      setResults({ type: "reply", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testGetHolidayPackage = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/travel-compositor/packages/${microsite}/${holidayPackageId}?config=${config}&lang=nl`,
      )
      const data = await response.json()
      setResults({ type: "holiday-package", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testGetPackageCalendar = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/travel-compositor/packages/${microsite}/calendar/${holidayPackageId}?config=${config}&currency=EUR`,
      )
      const data = await response.json()
      setResults({ type: "package-calendar", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎫 Booking Management API Tester</h1>
          <p className="text-gray-600">Test booking cancellation, client communication, and holiday packages</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Configuration</CardTitle>
              <CardDescription>Set up test parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="config">API Configuration</Label>
                <Select value={config} onValueChange={setConfig}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Config 1 (Primary)</SelectItem>
                    <SelectItem value="2">Config 2 (Secondary)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bookingRef">Booking Reference</Label>
                <Input
                  id="bookingRef"
                  value={bookingReference}
                  onChange={(e) => setBookingReference(e.target.value)}
                  placeholder="BOOK123456"
                />
              </div>

              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRANSPORT">Transport</SelectItem>
                    <SelectItem value="HOTEL">Hotel</SelectItem>
                    <SelectItem value="TICKET">Ticket</SelectItem>
                    <SelectItem value="CRUISE">Cruise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="serviceId">Service ID</Label>
                <Input
                  id="serviceId"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  placeholder="service123"
                />
              </div>

              <div>
                <Label htmlFor="packageId">Holiday Package ID</Label>
                <Input
                  id="packageId"
                  value={holidayPackageId}
                  onChange={(e) => setHolidayPackageId(e.target.value)}
                  placeholder="package123"
                />
              </div>

              <div>
                <Label htmlFor="microsite">Microsite</Label>
                <Input
                  id="microsite"
                  value={microsite}
                  onChange={(e) => setMicrosite(e.target.value)}
                  placeholder="microsite1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧪 API Tests</CardTitle>
              <CardDescription>Test different booking management endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={testCancelService} disabled={loading} className="w-full" variant="destructive">
                🚫 Cancel Service
              </Button>

              <Button onClick={testCreateClientRequest} disabled={loading} className="w-full">
                💬 Create Client Request
              </Button>

              <Button onClick={testReplyToRequest} disabled={loading} className="w-full">
                📝 Reply to Request
              </Button>

              <Button onClick={testGetHolidayPackage} disabled={loading} className="w-full" variant="secondary">
                📦 Get Holiday Package
              </Button>

              <Button onClick={testGetPackageCalendar} disabled={loading} className="w-full" variant="secondary">
                📅 Get Package Calendar
              </Button>
            </CardContent>
          </Card>
        </div>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Test Results
                <Badge variant={results.data?.success ? "default" : "destructive"}>
                  {results.data?.success ? "Success" : "Error"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(results, null, 2)}</pre>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📚 API Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cancel">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="cancel">Cancel</TabsTrigger>
                <TabsTrigger value="client">Client Requests</TabsTrigger>
                <TabsTrigger value="reply">Reply</TabsTrigger>
                <TabsTrigger value="package">Packages</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>

              <TabsContent value="cancel" className="space-y-2">
                <h3 className="font-semibold">Cancel Service</h3>
                <p className="text-sm text-gray-600">
                  Cancel a specific service from a booking. Supports different cancellation types and fee structures.
                </p>
                <Badge variant="outline">
                  PUT /booking/{encodeURIComponent(bookingReference)}/{encodeURIComponent(serviceType)}/
                  {encodeURIComponent(serviceId)}/cancel
                </Badge>
              </TabsContent>

              <TabsContent value="client" className="space-y-2">
                <h3 className="font-semibold">Client Requests</h3>
                <p className="text-sm text-gray-600">
                  Create new client requests for bookings. Enables customer communication workflow.
                </p>
                <Badge variant="outline">POST /booking/{encodeURIComponent(bookingReference)}/client-requests</Badge>
              </TabsContent>

              <TabsContent value="reply" className="space-y-2">
                <h3 className="font-semibold">Reply to Requests</h3>
                <p className="text-sm text-gray-600">Reply to existing client requests with messages and updates.</p>
                <Badge variant="outline">
                  POST /booking/{encodeURIComponent(bookingReference)}/client-requests/
                  {encodeURIComponent(clientRequestId)}/reply
                </Badge>
              </TabsContent>

              <TabsContent value="package" className="space-y-2">
                <h3 className="font-semibold">Holiday Packages</h3>
                <p className="text-sm text-gray-600">
                  Get detailed information about holiday packages including itineraries and services.
                </p>
                <Badge variant="outline">
                  GET /package/{encodeURIComponent(microsite)}/{encodeURIComponent(holidayPackageId)}
                </Badge>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-2">
                <h3 className="font-semibold">Package Calendar</h3>
                <p className="text-sm text-gray-600">Get availability and pricing calendar for holiday packages.</p>
                <Badge variant="outline">
                  GET /package/calendar/{encodeURIComponent(microsite)}/{encodeURIComponent(holidayPackageId)}
                </Badge>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
