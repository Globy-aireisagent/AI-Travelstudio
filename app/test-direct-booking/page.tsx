"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, MapPin, Zap } from "lucide-react"

export default function TestDirectBookingPage() {
  const [bookingReference, setBookingReference] = useState("RRP-9263")
  const [micrositeId, setMicrositeId] = useState("Auto-detect")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testDirectAPI = async () => {
    if (!bookingReference.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const params = new URLSearchParams({
        bookingReference: bookingReference.trim(),
      })

      if (micrositeId !== "Auto-detect") {
        params.append("micrositeId", micrositeId)
      }

      const response = await fetch(`/api/travel-compositor/booking-direct?${params}`)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚡ Direct API Booking Test</h1>
          <p className="text-gray-600">Test de directe Travel Compositor API calls voor specifieke bookings</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Direct API Booking Ophalen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Booking Reference (bijv. RRP-9263)"
                  value={bookingReference}
                  onChange={(e) => setBookingReference(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && testDirectAPI()}
                  className="flex-1"
                />
                <Select value={micrositeId} onValueChange={setMicrositeId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Microsite (optioneel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Auto-detect">Auto-detect</SelectItem>
                    <SelectItem value="1">Config 1</SelectItem>
                    <SelectItem value="3">Config 3</SelectItem>
                    <SelectItem value="4">Config 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={testDirectAPI} disabled={loading || !bookingReference.trim()} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Fetching via Direct API...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Fetch Direct via API
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
            {/* Method Info */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">Success via Direct API!</span>
                  <Badge variant="outline" className="ml-2">
                    Config {result.foundInConfig}
                  </Badge>
                  <Badge variant="outline">{result.method}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Extraction Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Direct API Resultaat - {result.booking.descriptions?.tripType}
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

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Method:</strong> Direct API Call
                    </div>
                    <div>
                      <strong>Client:</strong> {result.extractionInfo.clientName}
                    </div>
                    <div>
                      <strong>Agency:</strong> {result.booking.client.company}
                    </div>
                    <div>
                      <strong>Booking Ref:</strong> {result.booking.client.agencyBookingReference}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rest of the booking display - same as before */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {result.booking.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                      link.download = `booking-${result.booking.id}-direct.json`
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
