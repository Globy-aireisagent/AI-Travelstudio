"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Loader2, Globe, Code, ImageIcon, Database, Brain, CheckCircle, XCircle, Settings } from "lucide-react"

export default function DebugUrlExtractionPage() {
  const [url, setUrl] = useState("https://rondreis-planner.nl/nl/idea/24826536/-land-cruise-miami")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeUrl = async () => {
    if (!url.trim()) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      console.log("🔍 Analyzing URL:", url)

      const response = await fetch("/api/scrape-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("📊 Analysis result:", result)

      if (!result.success) {
        setError(result.error || "URL kon niet worden geanalyseerd")
        return
      }

      setResults(result)
    } catch (error) {
      console.error("❌ Error analyzing URL:", error)
      setError("Fout bij analyseren van URL: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🔍 URL Extractie Debug</h1>
              <p className="text-gray-600 mt-1">Analyseer hoe de AI websites leest en data extraheert</p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Settings className="w-4 h-4 mr-2" />
              Debug Tool
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* URL Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Website Analyseren
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="url-input">Website URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://rondreis-planner.nl/nl/idea/24826536/-land-cruise-miami"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && analyzeUrl()}
                  className="flex-1"
                />
                <Button onClick={analyzeUrl} disabled={loading || !url.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Analyseren...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyseren
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick URL Examples */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrl("https://rondreis-planner.nl/nl/idea/24826536/-land-cruise-miami")}
              >
                Miami Cruise
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrl("https://rondreis-planner.nl/nl/idea/12345/italy-roadtrip")}
              >
                Italy Roadtrip
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrl("https://reisbureaunederland.nl/booking/RRP-9236")}
              >
                Booking Example
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <div>
                  <div className="font-medium">Analyse Fout</div>
                  <div className="text-sm mt-1">{error}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Extraction Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Extractie Resultaten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.data.accommodations?.length || 0}</div>
                    <div className="text-sm text-gray-600">Accommodaties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{results.data.cars?.length || 0}</div>
                    <div className="text-sm text-gray-600">Auto's</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{results.data.cruises?.length || 0}</div>
                    <div className="text-sm text-gray-600">Cruises</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{results.data.images?.length || 0}</div>
                    <div className="text-sm text-gray-600">Afbeeldingen</div>
                  </div>
                </div>

                {/* Extraction Method */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Extractie Methode:</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.data.extractionMethod?.structuredData && (
                      <Badge variant="default">
                        <Database className="w-3 h-3 mr-1" />
                        Structured Data
                      </Badge>
                    )}
                    {results.data.extractionMethod?.selectorBased && (
                      <Badge variant="secondary">
                        <Code className="w-3 h-3 mr-1" />
                        CSS Selectors
                      </Badge>
                    )}
                    {results.data.extractionMethod?.aiAnalysis && (
                      <Badge variant="outline">
                        <Brain className="w-3 h-3 mr-1" />
                        AI Analysis
                      </Badge>
                    )}
                    {results.data.extractionMethod?.websiteSpecific && (
                      <Badge variant="destructive">
                        <Settings className="w-3 h-3 mr-1" />
                        Website Rules
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Tabs defaultValue="data" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="data">Geëxtraheerde Data</TabsTrigger>
                <TabsTrigger value="accommodations">Accommodaties</TabsTrigger>
                <TabsTrigger value="transport">Transport</TabsTrigger>
                <TabsTrigger value="images">Afbeeldingen</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
              </TabsList>

              <TabsContent value="data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basis Informatie</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Titel</Label>
                        <div className="p-2 bg-gray-50 rounded">{results.data.title || "Niet gevonden"}</div>
                      </div>
                      <div>
                        <Label>Prijs</Label>
                        <div className="p-2 bg-gray-50 rounded">
                          {results.data.totalPrice
                            ? `€${results.data.totalPrice.amount} ${results.data.totalPrice.currency}`
                            : "Niet gevonden"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Beschrijving</Label>
                      <Textarea
                        value={results.data.description || "Niet gevonden"}
                        readOnly
                        rows={3}
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label>Bestemmingen</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {results.data.destinations?.map((dest: any, index: number) => (
                          <Badge key={index} variant="outline">
                            {dest.name}
                          </Badge>
                        )) || <span className="text-gray-500">Geen bestemmingen gevonden</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accommodations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Accommodaties ({results.data.accommodations?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.data.accommodations?.length > 0 ? (
                      <div className="space-y-4">
                        {results.data.accommodations.map((acc: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{acc.name}</h4>
                              {acc.type && <Badge variant="secondary">{acc.type}</Badge>}
                            </div>
                            {acc.location && <p className="text-sm text-gray-600 mb-2">📍 {acc.location}</p>}
                            {acc.description && <p className="text-sm text-gray-700">{acc.description}</p>}
                            {(acc.checkInDate || acc.checkOutDate) && (
                              <div className="text-xs text-gray-500 mt-2">
                                {acc.checkInDate && `Check-in: ${acc.checkInDate}`}
                                {acc.checkInDate && acc.checkOutDate && " | "}
                                {acc.checkOutDate && `Check-out: ${acc.checkOutDate}`}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">Geen accommodaties gevonden</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transport" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cars */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Auto's ({results.data.cars?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {results.data.cars?.length > 0 ? (
                        <div className="space-y-3">
                          {results.data.cars.map((car: any, index: number) => (
                            <div key={index} className="p-3 bg-gray-50 rounded">
                              <div className="font-medium">{car.type}</div>
                              {car.description && <div className="text-sm text-gray-600 mt-1">{car.description}</div>}
                              {(car.pickupLocation || car.dropoffLocation) && (
                                <div className="text-xs text-gray-500 mt-2">
                                  {car.pickupLocation && `Ophalen: ${car.pickupLocation}`}
                                  {car.pickupLocation && car.dropoffLocation && " → "}
                                  {car.dropoffLocation && `Inleveren: ${car.dropoffLocation}`}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">Geen auto's gevonden</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cruises */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cruises ({results.data.cruises?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {results.data.cruises?.length > 0 ? (
                        <div className="space-y-3">
                          {results.data.cruises.map((cruise: any, index: number) => (
                            <div key={index} className="p-3 bg-gray-50 rounded">
                              <div className="font-medium">{cruise.name}</div>
                              {cruise.description && (
                                <div className="text-sm text-gray-600 mt-1">{cruise.description}</div>
                              )}
                              {(cruise.departurePort || cruise.duration) && (
                                <div className="text-xs text-gray-500 mt-2">
                                  {cruise.departurePort && `Vertrek: ${cruise.departurePort}`}
                                  {cruise.departurePort && cruise.duration && " | "}
                                  {cruise.duration && `Duur: ${cruise.duration}`}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">Geen cruises gevonden</div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Flights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vluchten ({results.data.flights?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.data.flights?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.data.flights.map((flight: any, index: number) => (
                          <div key={index} className="p-3 border rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{flight.type}</span>
                              {flight.airline && <Badge variant="outline">{flight.airline}</Badge>}
                            </div>
                            {(flight.from || flight.to) && (
                              <div className="text-sm text-gray-600">
                                {flight.from} → {flight.to}
                              </div>
                            )}
                            {flight.departureDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                Vertrek: {new Date(flight.departureDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">Geen vluchten gevonden</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Afbeeldingen ({results.data.images?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.data.images?.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {results.data.images.map((image: string, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                              <ImageIcon
                                src={image || "/placeholder.svg"}
                                alt={`Afbeelding ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = `/placeholder.svg?height=120&width=160&text=Fout`
                                }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 break-all">
                              {new URL(image).pathname.split("/").pop()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">Geen afbeeldingen gevonden</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="raw" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Raw Data & Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Metadata</Label>
                        <Textarea
                          value={JSON.stringify(results.meta, null, 2)}
                          readOnly
                          rows={8}
                          className="font-mono text-xs bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label>Complete Extracted Data</Label>
                        <Textarea
                          value={JSON.stringify(results.data, null, 2)}
                          readOnly
                          rows={20}
                          className="font-mono text-xs bg-gray-50"
                        />
                      </div>
                    </div>
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
