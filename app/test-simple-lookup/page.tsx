"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, MapPin, Search, RefreshCw } from "lucide-react"

export default function TestSimpleLookupPage() {
  const [bookingReference, setBookingReference] = useState("RRP-9263")
  const [loading, setLoading] = useState(false)
  const [refreshingCache, setRefreshingCache] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshCache = async () => {
    setRefreshingCache(true)
    try {
      const response = await fetch("/api/travel-compositor/cache", {
        method: "POST",
      })
      const data = await response.json()
      console.log("Cache refreshed:", data)
    } catch (err) {
      console.error("Cache refresh failed:", err)
    } finally {
      setRefreshingCache(false)
    }
  }

  const testSimpleLookup = async () => {
    if (!bookingReference.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(
        `/api/travel-compositor/simple-booking-lookup?bookingReference=${encodeURIComponent(bookingReference.trim())}`,
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch booking")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const openRoadbook = () => {
    if (!result?.booking) return

    // Save to localStorage for roadbook access
    localStorage.setItem(`booking-${result.booking.id}`, JSON.stringify(result.booking))

    // Open roadbook
    window.open(`/roadbook/booking-${result.booking.id}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Simple Booking Lookup</h1>
          <p className="text-gray-600">Eenvoudige cache-gebaseerde booking lookup</p>
        </div>

        {/* Cache Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Cache Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshCache} disabled={refreshingCache} variant="outline">
              {refreshingCache ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Refreshing Cache...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Cache
                </>
              )}
            </Button>
            <p className="text-sm text-gray-600 mt-2">Refresh de cache eerst als je booking niet wordt gevonden</p>
          </CardContent>
        </Card>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Simple Lookup Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Booking Reference (bijv. RRP-9263)"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && testSimpleLookup()}
              />
              <Button onClick={testSimpleLookup} disabled={loading || !bookingReference.trim()} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Searching in Cache...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search in Cache
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
              {error.includes("not found in cache") && (
                <p className="text-sm text-red-600 mt-2">💡 Tip: Probeer eerst de cache te refreshen</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Success Info */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Found in Cache!</span>
                  <Badge variant="outline">{result.method}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Extraction Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Simple Lookup Resultaat - {result.booking.descriptions?.tripType}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.extractionInfo.hotelsExtracted}</div>
                    <div className="text-sm text-gray-600">Hotels</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.booking.services.transports.length}
                    </div>
                    <div className="text-sm text-gray-600">Vluchten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.extractionInfo.imagesFound}</div>
                    <div className="text-sm text-gray-600">Afbeeldingen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">€{result.extractionInfo.totalPrice}</div>
                    <div className="text-sm text-gray-600">Totaalprijs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{result.booking.metadata?.nightsCount || 0}</div>
                    <div className="text-sm text-gray-600">Nachten</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Client</h4>
                      <p className="text-gray-600">{result.extractionInfo.clientName}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Data Type</h4>
                      <p className="text-gray-600">{result.extractionInfo.originalDataType}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={openRoadbook} className="bg-blue-600 hover:bg-blue-700">
                      <MapPin className="w-4 h-4 mr-2" />
                      Open Roadbook
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const dataStr = JSON.stringify(result.booking, null, 2)
                        const dataBlob = new Blob([dataStr], { type: "application/json" })
                        const url = URL.createObjectURL(dataBlob)
                        const link = document.createElement("a")
                        link.href = url
                        link.download = `booking-${result.booking.id}-simple.json`
                        link.click()
                        URL.revokeObjectURL(url)
                      }}
                    >
                      Download JSON
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
