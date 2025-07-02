"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle, ImageIcon, FileText, MapPin, Hotel, Database } from "lucide-react"

interface ContentAnalysis {
  bookingId: string
  micrositeId: string
  realDestinations: Array<{
    bookingDestination: any
    travelCompositorData: any
    hasRealContent: boolean
  }>
  realHotels: Array<{
    bookingHotel: any
    realDatasheet: any
    error?: string
  }>
  realAccommodationDatasheets: Array<any>
  availableRealContent: {
    destinations: any
    accommodations: any
    facilities: any
    themes: any
  }
}

export default function AnalyzeContentDataPage() {
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const analyzeContent = async () => {
      try {
        setLoading(true)
        console.log("🔍 Starting REAL content analysis...")

        const response = await fetch("/api/travel-compositor/analyze-content-data?bookingId=RRP-9263&config=1")
        const result = await response.json()

        if (result.success) {
          setAnalysis(result.analysis)
          setSummary(result.summary)
          console.log("✅ REAL content analysis complete:", result.summary)
        } else {
          setError(result.error)
        }
      } catch (e: any) {
        console.error("❌ Analysis error:", e)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    analyzeContent()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Analyseren van ECHTE Travel Compositor content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚨 ECHTE Travel Compositor Content Analyse</h1>
          <p className="text-gray-600">
            Analyse van ALLEEN echte data uit Travel Compositor API - geen gegenereerde content
          </p>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">
              ⚠️ ALLEEN ECHTE DATA - Geen fallbacks, geen gegenereerde content, geen placeholders
            </p>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Samenvatting ECHTE Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{summary.destinationsFoundInTC}</div>
                  <div className="text-sm text-gray-600">Bestemmingen in TC</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{summary.destinationsWithRealContent}</div>
                  <div className="text-sm text-gray-600">Met echte content</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{summary.hotelsWithRealDatasheets}</div>
                  <div className="text-sm text-gray-600">Hotels met datasheets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{summary.hotelsWithGiataData}</div>
                  <div className="text-sm text-gray-600">Hotels met GIATA</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{summary.totalRealDestinationImages}</div>
                  <div className="text-sm text-gray-600">Destination foto's</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{summary.totalRealHotelImages}</div>
                  <div className="text-sm text-gray-600">Hotel foto's</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{summary.realFacilitiesAvailable}</div>
                  <div className="text-sm text-gray-600">Faciliteiten</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{summary.realThemesAvailable}</div>
                  <div className="text-sm text-gray-600">Thema's</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Real Destinations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                ECHTE Destination Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis?.realDestinations.map((dest, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{dest.bookingDestination.name}</h3>
                    {dest.hasRealContent ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  {dest.travelCompositorData ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>
                          Beschrijving:{" "}
                          {dest.travelCompositorData.description ? (
                            <Badge variant="outline" className="text-green-600">
                              ✅ Beschikbaar
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600">
                              ❌ Niet beschikbaar
                            </Badge>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>
                          Foto's: {dest.travelCompositorData.images?.length || 0}{" "}
                          {dest.travelCompositorData.images?.length > 0 ? (
                            <Badge variant="outline" className="text-green-600">
                              ✅ Beschikbaar
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600">
                              ❌ Geen foto's
                            </Badge>
                          )}
                        </span>
                      </div>
                      {dest.travelCompositorData.description && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <strong>Echte beschrijving:</strong> {dest.travelCompositorData.description.substring(0, 150)}
                          ...
                        </div>
                      )}
                      {dest.travelCompositorData.facilities?.length > 0 && (
                        <div className="mt-2">
                          <strong>Faciliteiten:</strong> {dest.travelCompositorData.facilities.slice(0, 3).join(", ")}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm">❌ Geen data gevonden in Travel Compositor</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Real Hotels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                ECHTE Hotel Content & GIATA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis?.realHotels.map((hotel, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{hotel.bookingHotel.name}</h3>
                    {hotel.realDatasheet?.hasRealContent ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {hotel.bookingHotel.location} • ID: {hotel.bookingHotel.hotelId}
                  </p>

                  {hotel.realDatasheet ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>
                          Beschrijving:{" "}
                          {hotel.realDatasheet.description ? (
                            <Badge variant="outline" className="text-green-600">
                              ✅ Beschikbaar
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600">
                              ❌ Niet beschikbaar
                            </Badge>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>
                          Foto's: {hotel.realDatasheet.images?.length || 0}{" "}
                          {hotel.realDatasheet.images?.length > 0 ? (
                            <Badge variant="outline" className="text-green-600">
                              ✅ Beschikbaar
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600">
                              ❌ Geen foto's
                            </Badge>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        <span>
                          GIATA ID:{" "}
                          {hotel.realDatasheet.giataId ? (
                            <Badge variant="outline" className="text-green-600">
                              ✅ {hotel.realDatasheet.giataId}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600">
                              ❌ Geen GIATA
                            </Badge>
                          )}
                        </span>
                      </div>
                      {hotel.realDatasheet.facilities?.length > 0 && (
                        <div className="mt-2">
                          <strong>Faciliteiten ({hotel.realDatasheet.facilities.length}):</strong>{" "}
                          {hotel.realDatasheet.facilities.slice(0, 3).join(", ")}
                          {hotel.realDatasheet.facilities.length > 3 && "..."}
                        </div>
                      )}
                      {hotel.realDatasheet.description && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <strong>Echte beschrijving:</strong> {hotel.realDatasheet.description.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm">
                      ❌ {hotel.error || "Geen datasheet gevonden in Travel Compositor"}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Available Real Content */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Beschikbare ECHTE Content Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Faciliteiten Database</h3>
                {analysis?.availableRealContent.facilities?.available ? (
                  <div>
                    <Badge variant="outline" className="text-green-600 mb-2">
                      ✅ {analysis.availableRealContent.facilities.count} faciliteiten beschikbaar
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Voorbeelden: {analysis.availableRealContent.facilities.sample?.slice(0, 5).join(", ")}
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-red-600">
                    ❌ Niet beschikbaar
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Thema's Database</h3>
                {analysis?.availableRealContent.themes?.available ? (
                  <div>
                    <Badge variant="outline" className="text-green-600 mb-2">
                      ✅ {analysis.availableRealContent.themes.count} thema's beschikbaar
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Voorbeelden:{" "}
                      {analysis.availableRealContent.themes.sample
                        ?.slice(0, 3)
                        .map((t: any) => t.name)
                        .join(", ")}
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-red-600">
                    ❌ Niet beschikbaar
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
