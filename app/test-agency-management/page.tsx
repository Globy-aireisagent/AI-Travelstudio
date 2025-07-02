"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TestAgencyManagement() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [micrositeId, setMicrositeId] = useState("microsite1")
  const [agencyId, setAgencyId] = useState("agency123")
  const [operatorId, setOperatorId] = useState("operator1")
  const [quoteDateFrom, setQuoteDateFrom] = useState("2024-01-01")
  const [quoteDateTo, setQuoteDateTo] = useState("2024-12-31")
  const [tripType, setTripType] = useState("MULTI")
  const [config, setConfig] = useState("1")

  const testGetAgencies = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/travel-compositor/agency/${micrositeId}?config=${config}&first=0&limit=10`)
      const data = await response.json()
      setResults({ type: "agencies", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testGetAgencyDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/travel-compositor/agency/${micrositeId}/${agencyId}?config=${config}`)
      const data = await response.json()
      setResults({ type: "agency-details", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testGetAgencyCredit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/travel-compositor/agency/credit/${micrositeId}/${agencyId}?config=${config}`)
      const data = await response.json()
      setResults({ type: "agency-credit", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testTripQuoteCount = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        config,
        operatorId,
        quoteDateFrom,
        quoteDateTo,
        tripType,
        salesChannel: "WEB",
      })
      const response = await fetch(`/api/travel-compositor/tripquote/count?${params}`)
      const data = await response.json()
      setResults({ type: "trip-quote-count", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testTripQuoteReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        config,
        operatorId,
        quoteDateFrom,
        quoteDateTo,
        tripType,
        page: "0",
      })
      const response = await fetch(`/api/travel-compositor/tripquote/report?${params}`)
      const data = await response.json()
      setResults({ type: "trip-quote-report", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testPackageBooking = async () => {
    setLoading(true)
    try {
      const bookingData = {
        micrositeId,
        holidayPackageId: "package123",
        lang: "nl",
        logTitle: "Test Package Booking",
        description: "Test booking description",
        themes: ["BEACH", "CULTURE"],
        visible: true,
        order: 1,
        automaticSale: false,
      }

      const response = await fetch(`/api/travel-compositor/packages/destinations/book?config=${config}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })
      const data = await response.json()
      setResults({ type: "package-booking", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏢 Agency Management API Tester</h1>
          <p className="text-gray-600">Test agency management, trip quotes, and package booking endpoints</p>
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
                <Label htmlFor="micrositeId">Microsite ID</Label>
                <Input
                  id="micrositeId"
                  value={micrositeId}
                  onChange={(e) => setMicrositeId(e.target.value)}
                  placeholder="microsite1"
                />
              </div>

              <div>
                <Label htmlFor="agencyId">Agency ID</Label>
                <Input
                  id="agencyId"
                  value={agencyId}
                  onChange={(e) => setAgencyId(e.target.value)}
                  placeholder="agency123"
                />
              </div>

              <div>
                <Label htmlFor="operatorId">Operator ID</Label>
                <Input
                  id="operatorId"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  placeholder="operator1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="dateFrom">Quote Date From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={quoteDateFrom}
                    onChange={(e) => setQuoteDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">Quote Date To</Label>
                  <Input id="dateTo" type="date" value={quoteDateTo} onChange={(e) => setQuoteDateTo(e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="tripType">Trip Type</Label>
                <Select value={tripType} onValueChange={setTripType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MULTI">Multi</SelectItem>
                    <SelectItem value="GROUPS">Groups</SelectItem>
                    <SelectItem value="ONLY_HOTEL">Only Hotel</SelectItem>
                    <SelectItem value="ONLY_FLIGHT">Only Flight</SelectItem>
                    <SelectItem value="FLIGHT_HOTEL">Flight + Hotel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧪 API Tests</CardTitle>
              <CardDescription>Test different agency management endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={testGetAgencies} disabled={loading} className="w-full">
                🏢 Get Agencies
              </Button>

              <Button onClick={testGetAgencyDetails} disabled={loading} className="w-full">
                📋 Get Agency Details
              </Button>

              <Button onClick={testGetAgencyCredit} disabled={loading} className="w-full" variant="secondary">
                💰 Get Agency Credit
              </Button>

              <Button onClick={testTripQuoteCount} disabled={loading} className="w-full" variant="outline">
                📊 Trip Quote Count
              </Button>

              <Button onClick={testTripQuoteReport} disabled={loading} className="w-full" variant="outline">
                📈 Trip Quote Report
              </Button>

              <Button onClick={testPackageBooking} disabled={loading} className="w-full" variant="destructive">
                📦 Book Package
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
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📚 API Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="agencies">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="agencies">Agencies</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="credit">Credit</TabsTrigger>
                <TabsTrigger value="quotes">Quotes</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="booking">Booking</TabsTrigger>
              </TabsList>

              <TabsContent value="agencies" className="space-y-2">
                <h3 className="font-semibold">Get Agencies</h3>
                <p className="text-sm text-gray-600">
                  Retrieve list of agencies for a specific microsite with pagination.
                </p>
                <Badge variant="outline">GET /agency/{encodeURIComponent(micrositeId)}</Badge>
              </TabsContent>

              <TabsContent value="details" className="space-y-2">
                <h3 className="font-semibold">Agency Details</h3>
                <p className="text-sm text-gray-600">
                  Get detailed information about a specific agency including contact info and settings.
                </p>
                <Badge variant="outline">
                  GET /agency/{encodeURIComponent(micrositeId)}/{encodeURIComponent(agencyId)}
                </Badge>
              </TabsContent>

              <TabsContent value="credit" className="space-y-2">
                <h3 className="font-semibold">Agency Credit</h3>
                <p className="text-sm text-gray-600">Check agency credit balance and deposit movement information.</p>
                <Badge variant="outline">
                  GET /agency/credit/{encodeURIComponent(micrositeId)}/{encodeURIComponent(agencyId)}
                </Badge>
              </TabsContent>

              <TabsContent value="quotes" className="space-y-2">
                <h3 className="font-semibold">Trip Quote Count</h3>
                <p className="text-sm text-gray-600">
                  Get count of trip quotes with filtering by date range, trip type, and operator.
                </p>
                <Badge variant="outline">GET /tripquote/count</Badge>
              </TabsContent>

              <TabsContent value="reports" className="space-y-2">
                <h3 className="font-semibold">Trip Quote Report</h3>
                <p className="text-sm text-gray-600">
                  Generate detailed trip quote reports with search totals and pagination.
                </p>
                <Badge variant="outline">GET /tripquote/report</Badge>
              </TabsContent>

              <TabsContent value="booking" className="space-y-2">
                <h3 className="font-semibold">Package Booking</h3>
                <p className="text-sm text-gray-600">
                  Book destination packages with complex parameters and customization options.
                </p>
                <Badge variant="outline">POST /package/destinations/book</Badge>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
