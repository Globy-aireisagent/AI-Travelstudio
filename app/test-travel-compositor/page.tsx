"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, XCircle, Search, AlertTriangle, Globe, Building } from "lucide-react"

interface TestResult {
  success: boolean
  message: string
  details?: any
  searchTime?: string
}

export default function TestTravelCompositor() {
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [bookingId, setBookingId] = useState("")
  const [selectedConfig, setSelectedConfig] = useState<string>("1")
  const [useMultiMicrosite, setUseMultiMicrosite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get current domain for API calls
  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`
    }
    return path
  }

  const fetchSpecificBooking = async () => {
    if (!bookingId.trim()) return

    console.log(`🔍 Starting search for: "${bookingId.trim()}" (multi: ${useMultiMicrosite})`)

    setIsLoading(true)
    setSelectedBooking(null)
    setTestResult(null)

    try {
      const cleanBookingId = bookingId.trim()
      const queryParams = new URLSearchParams()

      if (useMultiMicrosite) {
        queryParams.set("multi", "true")
      } else {
        queryParams.set("config", selectedConfig)
      }

      const url = `${getApiUrl(`/api/travel-compositor/booking/${cleanBookingId}`)}?${queryParams.toString()}`
      console.log(`📡 Fetching: ${url}`)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("🔍 Search result:", data)

      if (data.success) {
        setSelectedBooking(data.booking)
        setTestResult({
          success: true,
          message: useMultiMicrosite
            ? `✅ Booking ${cleanBookingId} found in microsite: ${data.foundInMicrosite || data.microsite}!`
            : `✅ Booking ${cleanBookingId} found in config ${selectedConfig}!`,
          searchTime: data.searchTime,
          details: {
            foundInMicrosite: data.foundInMicrosite || data.microsite,
            searchResults: data.searchResults,
            matchInfo: data.matchInfo,
            totalMicrosites: data.searchResults?.length || 1,
            totalBookingsSearched: useMultiMicrosite
              ? data.searchResults?.reduce((sum, r) => sum + r.bookingCount, 0) || 0
              : data.totalBookingsSearched || 0,
            source: data.source,
          },
        })
      } else {
        setTestResult({
          success: false,
          message: `❌ Booking ${cleanBookingId} not found`,
          searchTime: data.searchTime,
          details: data.debug || data,
        })
      }
    } catch (error) {
      console.error("🔍 Search error:", error)
      setTestResult({
        success: false,
        message: "Error during search",
        details: { error: error instanceof Error ? error.message : String(error) },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Travel Compositor Test</h1>
          <p className="text-gray-600">Interactive booking search with multi-microsite support</p>
        </div>

        {/* Config 2 Warning */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Known Issue:</strong> Config 2 (reisbureaunederland) has authentication issues (401 UNAUTHORIZED).
            Multi-microsite search will only use working configs (1 & 3) with 681 total bookings.
          </AlertDescription>
        </Alert>

        {/* Working Configs Info */}
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Globe className="w-5 h-5" />
              <span>✅ Working Configurations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Building className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Config 1: rondreis-planner</span>
                </div>
                <p className="text-sm text-green-700">360 bookings - RRP-9236, RRP-7288, RRP-3832</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Config 3: pacificislandtravel</span>
                </div>
                <p className="text-sm text-blue-700">321 bookings - RRP-3832, RRP-3833</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Mode Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>🔧 Search Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label>Search Mode:</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="radio" checked={!useMultiMicrosite} onChange={() => setUseMultiMicrosite(false)} />
                  <span>Single Microsite</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" checked={useMultiMicrosite} onChange={() => setUseMultiMicrosite(true)} />
                  <span>Multi-Microsite (Recommended)</span>
                </label>
              </div>
            </div>

            {!useMultiMicrosite && (
              <div className="flex items-center space-x-4">
                <Label htmlFor="config-select">Configuration:</Label>
                <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select config" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Config 1 (rondreis-planner) ✅</SelectItem>
                    <SelectItem value="2" disabled>
                      Config 2 (reisbureaunederland) ❌
                    </SelectItem>
                    <SelectItem value="3">Config 3 (pacificislandtravel) ✅</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>🔍 Booking Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="bookingId">Booking ID</Label>
                <Input
                  id="bookingId"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Bijv: RRP-9236"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchSpecificBooking} disabled={isLoading || !bookingId.trim()}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setBookingId("RRP-9236")
                  setUseMultiMicrosite(true)
                  setTimeout(fetchSpecificBooking, 100)
                }}
              >
                Test RRP-9236 (Multi) ✅
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setBookingId("RRP-3832")
                  setUseMultiMicrosite(true)
                  setTimeout(fetchSpecificBooking, 100)
                }}
              >
                Test RRP-3832 (Multi) ✅
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setBookingId("RRP-7288")
                  setUseMultiMicrosite(false)
                  setSelectedConfig("1")
                  setTimeout(fetchSpecificBooking, 100)
                }}
              >
                Test RRP-7288 (Config 1) ✅
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setBookingId("RRP-9999")
                  setUseMultiMicrosite(true)
                  setTimeout(fetchSpecificBooking, 100)
                }}
              >
                Test RRP-9999 (Non-existent) ❌
              </Button>
            </div>

            {testResult && (
              <Alert className={testResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                <div className="flex items-center space-x-2">
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                    <div className="font-medium">{testResult.message}</div>
                    {testResult.searchTime && (
                      <div className="text-sm mt-1">⚡ Search time: {testResult.searchTime}</div>
                    )}
                    {testResult.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">Debug Details</summary>
                        <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-96">
                          {JSON.stringify(testResult.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {selectedBooking && (
              <div className="bg-white p-4 rounded border">
                <h3 className="font-medium mb-3">🎯 Booking Found!</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <strong>ID:</strong> {selectedBooking.id}
                  </div>
                  <div>
                    <strong>Reference:</strong> {selectedBooking.reference || selectedBooking.bookingReference}
                  </div>
                  <div>
                    <strong>Status:</strong> {selectedBooking.status}
                  </div>
                  <div>
                    <strong>Creation Date:</strong> {selectedBooking.creationDate}
                  </div>
                </div>
                <details>
                  <summary className="cursor-pointer text-sm font-medium">Full Booking Data</summary>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-96">
                    {JSON.stringify(selectedBooking, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>📊 System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800">✅ Working Configs:</h4>
                <ul className="text-green-700 text-sm mt-2 space-y-1">
                  <li>• Config 1: 360 bookings</li>
                  <li>• Config 3: 321 bookings</li>
                  <li>• Total: 681 bookings</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-800">❌ Known Issues:</h4>
                <ul className="text-red-700 text-sm mt-2 space-y-1">
                  <li>• Config 2: 401 Unauthorized</li>
                  <li>• RRP-9381 likely in Config 2</li>
                  <li>• Need credential fix</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800">🎯 Test Strategy:</h4>
                <ul className="text-blue-700 text-sm mt-2 space-y-1">
                  <li>• Use Multi-Microsite mode</li>
                  <li>• Test known working IDs</li>
                  <li>• Skip Config 2 for now</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
