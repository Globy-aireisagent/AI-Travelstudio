"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Download, Hotel, Car, Ticket, Loader2, CheckCircle, XCircle } from "lucide-react"

export default function DebugActivityStructurePage() {
  const [bookingId, setBookingId] = useState("RRP-9400")
  const [micrositeId, setMicrositeId] = useState("4")
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const debugStructure = async () => {
    if (!bookingId.trim()) return

    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch("/api/travel-compositor/debug-activity-structure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          micrositeId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAnalysis(data)
      } else {
        setError(data.error || "Failed to debug activity structure")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const downloadAnalysis = () => {
    if (!analysis) return

    const dataStr = JSON.stringify(analysis, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `activity-structure-debug-${bookingId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Debug Activity Structure</h1>
          <p className="text-gray-600">Analyze why hotels have 60 photos but activities have 0 photos</p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Debug Booking Structure (Config 4)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Booking ID (bijv. RRP-9400)"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="flex-1"
              />
              <select
                value={micrositeId}
                onChange={(e) => setMicrositeId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="1">Microsite 1</option>
                <option value="2">Microsite 2</option>
                <option value="3">Microsite 3</option>
                <option value="4">Microsite 4</option>
              </select>
              <Button onClick={debugStructure} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Debug Structure
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    Structure Analysis - {analysis.analysis.booking.id}
                  </CardTitle>
                  <Button onClick={downloadAnalysis} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Analysis
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Badge variant="outline">Endpoint: {analysis.analysis.booking.endpointUsed}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Hotels</span>
                    <div className="font-medium text-2xl text-blue-600">
                      {analysis.analysis.booking.services.hotels || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Activities</span>
                    <div className="font-medium text-2xl text-green-600">
                      {analysis.analysis.booking.services.tickets || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Cars</span>
                    <div className="font-medium text-2xl text-orange-600">
                      {analysis.analysis.booking.services.cars || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Key Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="comparison">Vergelijking</TabsTrigger>
                <TabsTrigger value="hotels">Hotels (✅ Foto's)</TabsTrigger>
                <TabsTrigger value="activities">Activities (❌ Geen foto's)</TabsTrigger>
                <TabsTrigger value="cars">Cars (✅ Foto's)</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison">
                <Card>
                  <CardHeader>
                    <CardTitle>📊 Image Fields Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">Hotels (Werkt)</h4>
                          <div className="text-sm text-green-700">
                            {analysis.analysis.imageAnalysis.hotels.map((hotel: any) => (
                              <div key={hotel.index} className="mb-2">
                                <div className="font-medium">{hotel.name}</div>
                                <div>{hotel.imageFields.length} image fields</div>
                                {hotel.imageFields.map((field: any) => (
                                  <div key={field.field} className="text-xs">
                                    • {field.field} ({field.type})
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-medium text-red-800 mb-2">Activities (Probleem)</h4>
                          <div className="text-sm text-red-700">
                            {analysis.analysis.imageAnalysis.tickets.map((ticket: any) => (
                              <div key={ticket.index} className="mb-2">
                                <div className="font-medium">{ticket.name}</div>
                                <div>{ticket.imageFields.length} image fields</div>
                                {ticket.imageFields.length === 0 && (
                                  <div className="text-xs text-red-600">❌ Geen image fields gevonden</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-medium text-orange-800 mb-2">Cars (Werkt)</h4>
                          <div className="text-sm text-orange-700">
                            {analysis.analysis.imageAnalysis.cars.map((car: any) => (
                              <div key={car.index} className="mb-2">
                                <div className="font-medium">{car.name}</div>
                                <div>{car.imageFields.length} image fields</div>
                                {car.imageFields.map((field: any) => (
                                  <div key={field.field} className="text-xs">
                                    • {field.field} ({field.type})
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hotels">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hotel className="w-5 h-5" />
                      Hotel Image Structure (Reference)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {analysis.analysis.imageAnalysis.hotels.map((hotel: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{hotel.name}</h4>
                            <div className="mb-2">
                              <Badge variant="outline">{hotel.imageFields.length} image fields found</Badge>
                            </div>
                            {hotel.imageFields.length > 0 ? (
                              <div className="space-y-2">
                                {hotel.imageFields.map((field: any, fieldIndex: number) => (
                                  <div key={fieldIndex} className="bg-green-50 p-2 rounded text-sm">
                                    <span className="font-medium text-green-700">{field.field}</span>
                                    <span className="text-gray-600"> ({field.type})</span>
                                    {field.isArray && (
                                      <span className="text-blue-600"> [Array: {field.length} items]</span>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1 truncate">
                                      {JSON.stringify(field.value)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm">No image fields found</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activities">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="w-5 h-5" />
                      Activity Image Structure (Problem)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {analysis.analysis.imageAnalysis.tickets.map((ticket: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{ticket.name}</h4>
                            <div className="mb-2">
                              <Badge variant={ticket.imageFields.length > 0 ? "default" : "secondary"}>
                                {ticket.imageFields.length} image fields found
                              </Badge>
                            </div>
                            {ticket.imageFields.length > 0 ? (
                              <div className="space-y-2">
                                {ticket.imageFields.map((field: any, fieldIndex: number) => (
                                  <div key={fieldIndex} className="bg-blue-50 p-2 rounded text-sm">
                                    <span className="font-medium text-blue-700">{field.field}</span>
                                    <span className="text-gray-600"> ({field.type})</span>
                                    {field.isArray && (
                                      <span className="text-blue-600"> [Array: {field.length} items]</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-red-500 text-sm">❌ No image fields found</div>
                            )}
                            <details className="mt-2">
                              <summary className="text-xs text-gray-600 cursor-pointer">
                                All fields ({ticket.allFields.length})
                              </summary>
                              <div className="text-xs text-gray-500 mt-1">{ticket.allFields.join(", ")}</div>
                            </details>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cars">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      Car Image Structure (Reference)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {analysis.analysis.imageAnalysis.cars.map((car: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{car.name}</h4>
                            <div className="mb-2">
                              <Badge variant="outline">{car.imageFields.length} image fields found</Badge>
                            </div>
                            {car.imageFields.length > 0 ? (
                              <div className="space-y-2">
                                {car.imageFields.map((field: any, fieldIndex: number) => (
                                  <div key={fieldIndex} className="bg-orange-50 p-2 rounded text-sm">
                                    <span className="font-medium text-orange-700">{field.field}</span>
                                    <span className="text-gray-600"> ({field.type})</span>
                                    {field.isArray && (
                                      <span className="text-blue-600"> [Array: {field.length} items]</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm">No image fields found</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
