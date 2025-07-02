"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, BookOpen, Calendar, Settings, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface DebugResult {
  success: boolean
  bookingId: string
  configNumber: number
  micrositeId: string
  results: {
    swaggerInfo: any[]
    endpointTests: any[]
    dateRangeTests: any[]
    parameterTests: any[]
  }
  recommendations: any[]
}

export default function ComprehensiveBookingDebug() {
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null)
  const [bookingId, setBookingId] = useState("RRP-9200")
  const [selectedConfig, setSelectedConfig] = useState<string>("1")
  const [isLoading, setIsLoading] = useState(false)

  const runComprehensiveDebug = async () => {
    if (!bookingId.trim()) return

    setIsLoading(true)
    setDebugResult(null)

    try {
      const response = await fetch(
        `/api/travel-compositor/swagger-booking-debug?bookingId=${encodeURIComponent(bookingId.trim())}&config=${selectedConfig}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setDebugResult(data)
    } catch (error) {
      console.error("Debug error:", error)
      setDebugResult({
        success: false,
        bookingId: bookingId.trim(),
        configNumber: Number.parseInt(selectedConfig),
        micrositeId: "unknown",
        results: {
          swaggerInfo: [],
          endpointTests: [],
          dateRangeTests: [],
          parameterTests: [],
        },
        recommendations: [
          {
            type: "error",
            message: `Debug failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (success: boolean, found?: boolean) => {
    if (found) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (success) return <CheckCircle className="w-4 h-4 text-blue-600" />
    return <XCircle className="w-4 h-4 text-red-600" />
  }

  const getStatusBadge = (success: boolean, found?: boolean) => {
    if (found) return <Badge className="bg-green-100 text-green-800">FOUND</Badge>
    if (success) return <Badge className="bg-blue-100 text-blue-800">SUCCESS</Badge>
    return <Badge className="bg-red-100 text-red-800">FAILED</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Comprehensive Booking Debug</h1>
          <p className="text-gray-600">Complete API analysis with Swagger documentation check</p>
        </div>

        {/* Search Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Debug Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bookingId">Booking ID</Label>
                <Input
                  id="bookingId"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="RRP-9200"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="config-select">Configuration</Label>
                <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select config" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Config 1 (rondreis-planner)</SelectItem>
                    <SelectItem value="3">Config 3 (pacificislandtravel)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={runComprehensiveDebug} disabled={isLoading || !bookingId.trim()} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Debugging...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Run Debug
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setBookingId("RRP-9200")
                  setTimeout(runComprehensiveDebug, 100)
                }}
              >
                Debug RRP-9200
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setBookingId("RRP-9236")
                  setTimeout(runComprehensiveDebug, 100)
                }}
              >
                Debug RRP-9236 (Known Working)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {debugResult && (
          <div className="space-y-6">
            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {debugResult.recommendations.map((rec, index) => (
                    <Alert
                      key={index}
                      className={
                        rec.type === "booking_found"
                          ? "border-green-500 bg-green-50"
                          : rec.type === "error"
                            ? "border-red-500 bg-red-50"
                            : "border-blue-500 bg-blue-50"
                      }
                    >
                      <AlertDescription>
                        <div className="font-medium">{rec.message}</div>
                        {rec.details && (
                          <div className="mt-2 text-sm">
                            {rec.details.endpoint && <div>• Endpoint: {rec.details.endpoint}</div>}
                            {rec.details.dateRange && <div>• Date Range: {rec.details.dateRange}</div>}
                            {rec.details.parameters && <div>• Parameters: {rec.details.parameters}</div>}
                          </div>
                        )}
                        {rec.suggestions && (
                          <div className="mt-2 text-sm">
                            {rec.suggestions.map((suggestion: string, i: number) => (
                              <div key={i}>• {suggestion}</div>
                            ))}
                          </div>
                        )}
                        {rec.endpoints && (
                          <div className="mt-2 text-sm">
                            <div>Working endpoints:</div>
                            {rec.endpoints.slice(0, 3).map((endpoint: string, i: number) => (
                              <div key={i} className="ml-2">
                                • {endpoint}
                              </div>
                            ))}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle>Debug Results for {debugResult.bookingId}</CardTitle>
                <div className="text-sm text-gray-600">
                  Config {debugResult.configNumber} • Microsite: {debugResult.micrositeId}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="endpoints" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="swagger" className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Swagger</span>
                    </TabsTrigger>
                    <TabsTrigger value="endpoints" className="flex items-center space-x-2">
                      <Search className="w-4 h-4" />
                      <span>Endpoints</span>
                    </TabsTrigger>
                    <TabsTrigger value="dates" className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Date Ranges</span>
                    </TabsTrigger>
                    <TabsTrigger value="parameters" className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Parameters</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="swagger" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Swagger Documentation Check</h3>
                      {debugResult.results.swaggerInfo.length === 0 ? (
                        <Alert>
                          <AlertDescription>No Swagger documentation endpoints found or accessible.</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="grid gap-4">
                          {debugResult.results.swaggerInfo.map((info, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{info.endpoint}</code>
                                {getStatusBadge(info.success)}
                              </div>
                              {info.success && (
                                <div className="text-sm text-gray-600">
                                  <div>Has booking paths: {info.hasBookingPaths ? "Yes" : "No"}</div>
                                  {info.pathsFound && info.pathsFound.length > 0 && (
                                    <div className="mt-2">
                                      <div>Booking paths found:</div>
                                      {info.pathsFound.map((path: string, i: number) => (
                                        <div key={i} className="ml-2">
                                          • {path}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="endpoints" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Endpoint Tests</h3>
                      <div className="grid gap-4">
                        {debugResult.results.endpointTests.map((test, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1 mr-2">{test.endpoint}</code>
                              <div className="flex items-center space-x-2">
                                {test.bookingFound && (
                                  <Badge className="bg-green-100 text-green-800">BOOKING FOUND!</Badge>
                                )}
                                {getStatusBadge(test.success, test.bookingFound)}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div>Status: {test.status || "N/A"}</div>
                              <div>Bookings: {test.totalBookings || 0}</div>
                              <div>Content-Type: {test.contentType || "N/A"}</div>
                              <div>Structure: {test.dataStructure ? test.dataStructure.join(", ") : "N/A"}</div>
                            </div>
                            {test.error && <div className="mt-2 text-sm text-red-600">Error: {test.error}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="dates" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Date Range Tests</h3>
                      <div className="grid gap-4">
                        {debugResult.results.dateRangeTests.map((test, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{test.range}</div>
                              <div className="flex items-center space-x-2">
                                {test.bookingFound && (
                                  <Badge className="bg-green-100 text-green-800">BOOKING FOUND!</Badge>
                                )}
                                {getStatusBadge(test.success, test.bookingFound)}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>Total Bookings: {test.totalBookings || 0}</div>
                              <div>Status: {test.status || "Success"}</div>
                            </div>
                            {test.sampleIds && test.sampleIds.length > 0 && (
                              <div className="mt-2 text-sm text-gray-600">Sample IDs: {test.sampleIds.join(", ")}</div>
                            )}
                            {test.endpoint && (
                              <div className="mt-2">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{test.endpoint}</code>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="parameters" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Parameter Tests</h3>
                      <div className="grid gap-4">
                        {debugResult.results.parameterTests.map((test, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{test.test}</div>
                              <div className="flex items-center space-x-2">
                                {test.bookingFound && (
                                  <Badge className="bg-green-100 text-green-800">BOOKING FOUND!</Badge>
                                )}
                                {getStatusBadge(test.success, test.bookingFound)}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>Total Bookings: {test.totalBookings || 0}</div>
                              <div>Status: {test.status || "Success"}</div>
                            </div>
                            <div className="mt-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{test.params}</code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
