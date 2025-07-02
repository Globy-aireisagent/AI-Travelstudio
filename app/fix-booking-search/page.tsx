"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, CheckCircle, XCircle } from "lucide-react"

interface FixResult {
  success: boolean
  bookingId: string
  workingEndpoint?: string
  totalBookingsFound?: number
  booking?: any
  searchStrategy?: string
  message?: string
  error?: string
}

export default function FixBookingSearch() {
  const [result, setResult] = useState<FixResult | null>(null)
  const [bookingId, setBookingId] = useState("RRP-9200")
  const [selectedConfig, setSelectedConfig] = useState<string>("1")
  const [isLoading, setIsLoading] = useState(false)

  const runFixedSearch = async () => {
    if (!bookingId.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(
        `/api/travel-compositor/fix-booking-endpoints?bookingId=${encodeURIComponent(bookingId.trim())}&config=${selectedConfig}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Fix search error:", error)
      setResult({
        success: false,
        bookingId: bookingId.trim(),
        error: error instanceof Error ? error.message : String(error),
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Fixed Booking Search</h1>
          <p className="text-gray-600">Using the correct endpoint structure based on debug results</p>
        </div>

        {/* Search Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search Configuration</span>
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
                <Button onClick={runFixedSearch} disabled={isLoading || !bookingId.trim()} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search Fixed
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
                  setTimeout(runFixedSearch, 100)
                }}
              >
                Search RRP-9200
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setBookingId("RRP-9236")
                  setTimeout(runFixedSearch, 100)
                }}
              >
                Search RRP-9236
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>Search Results for {result.bookingId}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.success ? (
                <div className="space-y-4">
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                      <div className="font-medium">Search successful!</div>
                      <div className="mt-2 text-sm">
                        <div>• Working endpoint found</div>
                        <div>• Strategy: {result.searchStrategy}</div>
                        <div>• Total bookings in dataset: {result.totalBookingsFound}</div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {result.workingEndpoint && (
                    <div>
                      <Label className="text-sm font-medium">Working Endpoint:</Label>
                      <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">{result.workingEndpoint}</code>
                    </div>
                  )}

                  {result.booking && result.booking.found !== false ? (
                    <div className="border rounded-lg p-4 bg-green-50">
                      <h3 className="font-medium text-green-800 mb-3">✅ Booking Found!</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Booking Details:</div>
                          <div>ID: {result.booking.id}</div>
                          <div>Booking ID: {result.booking.bookingId}</div>
                          <div>Reference: {result.booking.reference}</div>
                          <div>Title: {result.booking.title}</div>
                        </div>
                        <div>
                          <div className="font-medium">Client & Dates:</div>
                          <div>Client: {result.booking.client?.name}</div>
                          <div>Start: {result.booking.startDate}</div>
                          <div>End: {result.booking.endDate}</div>
                          <div>Status: {result.booking.status}</div>
                        </div>
                      </div>

                      {result.booking.matchedFields && (
                        <div className="mt-3">
                          <div className="font-medium text-sm">Matched Fields:</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(result.booking.matchedFields).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-yellow-50">
                      <h3 className="font-medium text-yellow-800 mb-3">⚠️ Booking Not Found in Dataset</h3>
                      <div className="text-sm text-yellow-700">
                        <div>Searched through {result.booking?.totalSearched} bookings</div>
                        {result.booking?.sampleBookings && (
                          <div className="mt-3">
                            <div className="font-medium">Sample bookings in dataset:</div>
                            <div className="mt-2 space-y-1">
                              {result.booking.sampleBookings.slice(0, 5).map((sample: any, index: number) => (
                                <div key={index} className="text-xs">
                                  • {sample.id} - {sample.reference} - {sample.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Alert className="border-red-500 bg-red-50">
                  <XCircle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="font-medium">Search failed</div>
                    <div className="mt-2 text-sm">{result.error || result.message || "Unknown error occurred"}</div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
