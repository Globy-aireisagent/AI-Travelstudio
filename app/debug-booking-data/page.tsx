"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugBookingDataPage() {
  const [bookingId, setBookingId] = useState("RRP-9263")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchBookingData = async () => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch(`/api/travel-compositor/booking-debug?id=${bookingId}`)
      const result = await response.json()

      if (!result.success) {
        setError(result.error)
        return
      }

      setData(result)
      console.log("🔍 Complete booking data:", result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">🔍 Booking Data Debug</h1>
          <p className="text-gray-600 mt-2">Debug tool om te zien wat er precies uit de Travel Compositor API komt</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Opzoeken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Booking ID (bijv. RRP-9263)"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={fetchBookingData} disabled={loading || !bookingId.trim()}>
                {loading ? "Zoeken..." : "Debug Booking"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">❌ {error}</p>
            </CardContent>
          </Card>
        )}

        {data && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Debug Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Gevonden in Config</p>
                    <Badge variant="outline">{data.foundInConfig}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hotels</p>
                    <Badge variant={data.debug.hotelCount > 0 ? "default" : "destructive"}>
                      {data.debug.hotelCount}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Person</p>
                    <Badge variant={data.debug.hasContactPerson ? "default" : "destructive"}>
                      {data.debug.hasContactPerson ? "✅" : "❌"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price Breakdown</p>
                    <Badge variant={data.debug.hasPriceBreakdown ? "default" : "destructive"}>
                      {data.debug.hasPriceBreakdown ? "✅" : "❌"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Level Keys */}
            <Card>
              <CardHeader>
                <CardTitle>🔑 Top-Level API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.debug.topLevelKeys.map((key: string) => (
                    <Badge key={key} variant="outline">
                      {key}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hotel Services Detail */}
            {data.booking.hotelservice && (
              <Card>
                <CardHeader>
                  <CardTitle>🏨 Hotel Services ({data.booking.hotelservice.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.booking.hotelservice.map((hotel: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold mb-2">Hotel {index + 1}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <strong>Name:</strong> {hotel.name || hotel.hotelName || "N/A"}
                          </div>
                          <div>
                            <strong>City:</strong> {hotel.city || "N/A"}
                          </div>
                          <div>
                            <strong>Country:</strong> {hotel.country || "N/A"}
                          </div>
                          <div>
                            <strong>Check-in:</strong> {hotel.checkInDate || hotel.checkin || "N/A"}
                          </div>
                          <div>
                            <strong>Check-out:</strong> {hotel.checkOutDate || hotel.checkout || "N/A"}
                          </div>
                          <div>
                            <strong>Stars:</strong> {hotel.stars || hotel.category || "N/A"}
                          </div>
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600">Alle velden bekijken</summary>
                          <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                            {JSON.stringify(hotel, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Person */}
            {data.booking.contactPerson && (
              <Card>
                <CardHeader>
                  <CardTitle>👤 Contact Person</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
                    {JSON.stringify(data.booking.contactPerson, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* User */}
            {data.booking.user && (
              <Card>
                <CardHeader>
                  <CardTitle>👤 User</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
                    {JSON.stringify(data.booking.user, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Price Breakdown */}
            {data.booking.pricebreakdown && (
              <Card>
                <CardHeader>
                  <CardTitle>💰 Price Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
                    {JSON.stringify(data.booking.pricebreakdown, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Complete Raw Data */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Complete Raw Booking Data</CardTitle>
              </CardHeader>
              <CardContent>
                <details>
                  <summary className="cursor-pointer text-blue-600 mb-2">Klik om alle raw data te bekijken</summary>
                  <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(data.booking, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
