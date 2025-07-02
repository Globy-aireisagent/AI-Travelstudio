"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Calendar, Users } from "lucide-react"

export default function IntakePreviewPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id") || ""

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // 🔍 DETECT TYPE: Travel Idea vs Booking
  const isBooking = id.startsWith("RRP-") || id.includes("-")
  const isTravelIdea = !isBooking && /^\d+$/.test(id)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log(`🔍 Fetching data for: ${id}`)
        console.log(`📋 Type detected: ${isTravelIdea ? "Travel Idea" : "Booking"}`)

        let response

        if (isTravelIdea) {
          // 🎯 TRAVEL IDEA - gebruik idea API
          console.log(`💡 Using IDEA API for: ${id}`)
          response = await fetch("/api/travel-compositor/idea-lightning-fast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: id,
              micrositeConfig: "1",
              includeFullDetails: true,
              language: "nl",
            }),
          })
        } else {
          // 📋 BOOKING - gebruik booking API
          console.log(`📋 Using BOOKING API for: ${id}`)
          response = await fetch(`/api/travel-compositor/booking-super-fast?bookingId=${id}&config=1`)
        }

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          setData(result.data || result.booking)
          console.log(`✅ Data loaded successfully`)
        } else {
          throw new Error(result.error || "Failed to load data")
        }
      } catch (err) {
        console.error("❌ Error loading data:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, isTravelIdea])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{isTravelIdea ? "Travel Idea laden..." : "Booking laden..."}</h3>
            <p className="text-sm text-gray-600 text-center">{isTravelIdea ? `Travel Idea ${id}` : `Booking ${id}`}</p>
            <Badge variant="outline" className="mt-2">
              {isTravelIdea ? "💡 Travel Idea" : "📋 Booking"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">
              {isTravelIdea ? "Travel Idea niet gevonden" : "Booking niet gevonden"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-4">
              ID: {id} ({isTravelIdea ? "Travel Idea" : "Booking"})
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Probeer opnieuw
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-12">
            <span className="text-4xl mb-4 block">🤔</span>
            <h3 className="text-lg font-semibold mb-2">Geen data gevonden</h3>
            <p className="text-sm text-gray-600">
              {isTravelIdea ? `Travel Idea ${id}` : `Booking ${id}`} kon niet worden geladen
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">{isTravelIdea ? "💡" : "📋"}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {isTravelIdea ? "Travel Idea Preview" : "Booking Preview"}
                </h1>
                <p className="text-sm text-gray-600">
                  {isTravelIdea ? "Reisidee voorvertoning" : "Booking voorvertoning"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {id}
              </Badge>
              <Badge variant={isTravelIdea ? "default" : "secondary"}>
                {isTravelIdea ? "💡 Travel Idea" : "📋 Booking"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Preview Card */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {data.title || data.name || `${isTravelIdea ? "Travel Idea" : "Booking"} ${id}`}
                  </h2>
                  <div className="flex items-center space-x-4 text-blue-100">
                    {data.destination && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{data.destination}</span>
                      </div>
                    )}
                    {data.startDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{data.startDate}</span>
                      </div>
                    )}
                    {data.client?.name && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{data.client.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {data.totalPrice && (
                    <>
                      <div className="text-2xl font-bold">€{data.totalPrice.toLocaleString()}</div>
                      <div className="text-blue-100 text-sm">Totaalprijs</div>
                    </>
                  )}
                  {data.price?.amount && (
                    <>
                      <div className="text-2xl font-bold">€{data.price.amount.toLocaleString()}</div>
                      <div className="text-blue-100 text-sm">Prijs</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>ID:</strong> {id}
                    </p>
                    <p>
                      <strong>Type:</strong> {isTravelIdea ? "Travel Idea" : "Booking"}
                    </p>
                    {data.description && (
                      <p>
                        <strong>Beschrijving:</strong> {data.description}
                      </p>
                    )}
                    {data.duration && (
                      <p>
                        <strong>Duur:</strong> {data.duration.nights} nachten, {data.duration.days} dagen
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Componenten</h3>
                  <div className="space-y-1 text-sm">
                    {data.hotels && <p>🏨 Hotels: {data.hotels.length}</p>}
                    {data.activities && <p>🎯 Activiteiten: {data.activities.length}</p>}
                    {data.transports && <p>✈️ Vervoer: {data.transports.length}</p>}
                    {data.destinations && <p>📍 Bestemmingen: {data.destinations.length}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <Button
                  onClick={() => {
                    if (isTravelIdea) {
                      window.open(`/offerte/${id}`, "_blank")
                    } else {
                      window.open(`/travelbuddy/${id}`, "_blank")
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isTravelIdea ? "Bekijk Offerte" : "Open TravelBuddy"}
                </Button>

                <Button variant="outline">Intake starten</Button>
              </div>
            </CardContent>
          </Card>

          {/* Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Detected Type: {isTravelIdea ? "Travel Idea" : "Booking"}</p>
                <p>API Used: {isTravelIdea ? "idea-lightning-fast" : "booking-super-fast"}</p>
                <p>Data Keys: {Object.keys(data).join(", ")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
