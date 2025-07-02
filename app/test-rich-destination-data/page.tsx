"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Globe, Navigation, Loader2, CheckCircle, XCircle, AlertCircle, Map, ImageIcon } from "lucide-react"

export default function TestRichDestinationDataPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState("RRP-9263")

  const fetchRichDestinationData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/travel-compositor/get-rich-destination-data?bookingId=${bookingId}&config=1`)
      const result = await response.json()
      setData(result)
      console.log("🗺️ Rich Destination Data:", result)
    } catch (error) {
      console.error("❌ Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRichDestinationData()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="w-8 h-8 text-blue-600" />
            Rich Destination Data Test
          </h1>
          <p className="text-gray-600 mt-2">Test de rijke destination data uit Travel Compositor</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="Booking ID"
            className="px-3 py-2 border rounded"
          />
          <Button onClick={fetchRichDestinationData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
            Test
          </Button>
        </div>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Ophalen van rijke destination data...</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Samenvatting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.summary?.destinationsAnalyzed || 0}</div>
                  <div className="text-sm text-gray-600">Bestemmingen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.summary?.destinationsWithRichData || 0}</div>
                  <div className="text-sm text-gray-600">Met Rijke Data</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.summary?.totalImages || 0}</div>
                  <div className="text-sm text-gray-600">Totaal Foto's</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{data.summary?.totalGPSPoints || 0}</div>
                  <div className="text-sm text-gray-600">GPS Punten</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span>Met Foto's: {data.summary?.destinationsWithImages || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-green-500" />
                  <span>Met GPS: {data.summary?.destinationsWithGPS || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-500" />
                  <span>Met Beschrijving: {data.summary?.destinationsWithDescriptions || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destination Details */}
          <div className="space-y-4">
            {data.richDestinationData?.map((destination: any, index: number) => (
              <Card key={index} className={destination.richData ? "border-green-200" : "border-red-200"}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {destination.bookingDestination.name}
                    </div>
                    <div className="flex gap-2">
                      {destination.richData ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Rijke Data
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Geen Data
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {destination.richData ? (
                    <div className="space-y-4">
                      {/* Basic Info */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">📍 Basis Informatie</h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <strong>Code:</strong> {destination.richData.code || "Onbekend"}
                            </p>
                            <p>
                              <strong>Land:</strong> {destination.richData.country || "Onbekend"}
                            </p>
                            <p>
                              <strong>Provincie:</strong> {destination.richData.provincePostalPrefix || "Onbekend"}
                            </p>
                            <p>
                              <strong>Actief:</strong>{" "}
                              {destination.richData.active ? (
                                <Badge className="bg-green-100 text-green-800">Ja</Badge>
                              ) : (
                                <Badge variant="destructive">Nee</Badge>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* GPS Coordinates */}
                        {destination.richData.geolocation && (
                          <div>
                            <h4 className="font-medium mb-2">🧭 GPS Coordinaten</h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <strong>Latitude:</strong> {destination.richData.latitude}
                              </p>
                              <p>
                                <strong>Longitude:</strong> {destination.richData.longitude}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(
                                    `https://www.google.com/maps?q=${destination.richData.latitude},${destination.richData.longitude}`,
                                    "_blank",
                                  )
                                }
                              >
                                <Map className="w-4 h-4 mr-2" />
                                Open in Google Maps
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Images */}
                      {destination.richData.images && destination.richData.images.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">📸 Foto's ({destination.richData.images.length})</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {destination.richData.images.slice(0, 8).map((image: string, imgIndex: number) => (
                              <img
                                key={imgIndex}
                                src={image || "/placeholder.svg"}
                                alt={`${destination.bookingDestination.name} foto ${imgIndex + 1}`}
                                className="w-full h-24 object-cover rounded border"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detailed Info */}
                      {destination.richData.detailedInfo && (
                        <div>
                          <h4 className="font-medium mb-2">📋 Gedetailleerde Informatie</h4>
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            {destination.richData.description && (
                              <p className="mb-2">
                                <strong>Beschrijving:</strong> {destination.richData.description}
                              </p>
                            )}
                            {destination.richData.currency && (
                              <p>
                                <strong>Valuta:</strong> {destination.richData.currency}
                              </p>
                            )}
                            {destination.richData.language && (
                              <p>
                                <strong>Taal:</strong> {destination.richData.language}
                              </p>
                            )}
                            {destination.richData.timeZone && (
                              <p>
                                <strong>Tijdzone:</strong> {destination.richData.timeZone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rich Content Indicator */}
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Rijke content beschikbaar uit Travel Compositor</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600 mb-2">Geen rijke data gevonden</p>
                      {destination.error && <p className="text-sm text-gray-500">{destination.error}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Raw Data */}
          <Card>
            <CardHeader>
              <CardTitle>🔧 Raw Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
