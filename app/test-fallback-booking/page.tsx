"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, MapPin, RotateCcw } from "lucide-react"

export default function TestFallbackBookingPage() {
  const [bookingReference, setBookingReference] = useState("RRP-9263")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testFallbackAPI = async () => {
    if (!bookingReference.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(
        `/api/travel-compositor/fallback-to-working?bookingReference=${encodeURIComponent(bookingReference.trim())}`,
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔄 Fallback to Working API</h1>
          <p className="text-gray-600">Test met de bestaande werkende API methode als fallback</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Fallback API Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Booking Reference (bijv. RRP-9263)"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && testFallbackAPI()}
              />
              <Button onClick={testFallbackAPI} disabled={loading || !bookingReference.trim()} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Testing Fallback API...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Test Fallback API
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
                  <span className="font-medium">Success via Fallback API!</span>
                  <Badge variant="outline" className="ml-2">
                    Config {result.foundInConfig}
                  </Badge>
                  <Badge variant="outline">{result.method}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Extraction Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Fallback API Resultaat - {result.booking.descriptions?.tripType}
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

                <div className="mt-6 pt-6 border-t flex gap-4">
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
                      link.download = `booking-${result.booking.id}-fallback.json`
                      link.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    Download JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
