"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, CheckCircle, XCircle, Clock } from "lucide-react"

export default function TestBookingSearchPage() {
  const [bookingId, setBookingId] = useState("RRP-9200")
  const [mode, setMode] = useState<"single" | "multi">("single")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSearch = async () => {
    if (!bookingId.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(
        `/api/travel-compositor/booking-search-optimized?bookingId=${encodeURIComponent(bookingId)}&mode=${mode}`,
      )
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">🔍 Optimized Booking Search</h1>
          <p className="text-muted-foreground mt-2">Fast and reliable booking search with timeout handling</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Booking ID</label>
              <Input
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter booking ID (e.g., RRP-9200)"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Search Mode</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="single"
                    checked={mode === "single"}
                    onChange={(e) => setMode(e.target.value as "single" | "multi")}
                  />
                  Single Microsite (Fast)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="multi"
                    checked={mode === "multi"}
                    onChange={(e) => setMode(e.target.value as "single" | "multi")}
                  />
                  Multi-Microsite (Comprehensive)
                </label>
              </div>
            </div>

            <Button onClick={handleSearch} disabled={loading || !bookingId.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Booking
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.found ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Search Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.success ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.found ? "default" : "destructive"}>
                      {result.found ? "Found" : "Not Found"}
                    </Badge>
                    {result.totalSearchTime && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {result.totalSearchTime}ms
                      </Badge>
                    )}
                  </div>

                  {result.found && result.booking && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800">Booking Found!</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <strong>ID:</strong> {result.booking.id}
                        </p>
                        <p>
                          <strong>Reference:</strong>{" "}
                          {result.booking.bookingReference || result.booking.reference || "N/A"}
                        </p>
                        <p>
                          <strong>Title:</strong> {result.booking.title || result.booking.name || "N/A"}
                        </p>
                        {result.foundInMicrosite && (
                          <p>
                            <strong>Found in:</strong> {result.foundInMicrosite}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {result.searchResults && (
                    <div>
                      <h3 className="font-semibold mb-2">Search Details</h3>
                      <div className="space-y-2">
                        {result.searchResults.map((sr: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium">{sr.microsite}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={sr.found ? "default" : "outline"}>{sr.bookingCount} bookings</Badge>
                              <Badge variant="outline">{sr.searchTime}</Badge>
                              {sr.error && <Badge variant="destructive">Error</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800">Search Failed</h3>
                  <p className="text-red-700 mt-1">{result.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
