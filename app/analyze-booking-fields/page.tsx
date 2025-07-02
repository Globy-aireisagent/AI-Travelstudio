"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Search, Download, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface AnalysisResult {
  success: boolean
  bookingId: string
  foundInMicrosite?: string
  analysis?: any
  rawBooking?: any
  error?: string
}

export default function AnalyzeBookingFieldsPage() {
  const [bookingId, setBookingId] = useState("RRP-9236")
  const [micrositeId, setMicrositeId] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showRawData, setShowRawData] = useState(false)

  const analyzeBooking = async () => {
    if (!bookingId.trim()) {
      alert("Voer een booking ID in")
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/travel-compositor/analyze-booking-fields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: bookingId.trim(),
          micrositeId: micrositeId === "all" ? null : micrositeId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 200)}...`)
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error analyzing booking:", error)
      setResult({
        success: false,
        bookingId,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadAnalysis = () => {
    if (!result) return

    const dataStr = JSON.stringify(result, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `booking-analysis-${bookingId}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔍 Booking Field Analyzer</h1>
        <p className="text-muted-foreground">
          Analyseer de veldstructuur van Travel Compositor bookings om ontbrekende data te vinden
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Booking Analyseren
          </CardTitle>
          <CardDescription>Voer een booking ID in om de veldstructuur te analyseren</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Booking ID (bijv. RRP-9236)"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    analyzeBooking()
                  }
                }}
              />
            </div>
            <div className="w-48">
              <Select value={micrositeId} onValueChange={setMicrositeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer microsite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🔍 Alle Microsites</SelectItem>
                  <SelectItem value="rondreis-planner">🌍 Rondreis Planner</SelectItem>
                  <SelectItem value="reisbureaunederland">🇳🇱 Reisbureau Nederland</SelectItem>
                  <SelectItem value="auto">🚗 Auto Microsite</SelectItem>
                  <SelectItem value="microsite-4">🏢 Microsite 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={analyzeBooking} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isLoading ? "Analyseren..." : "Analyseer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {result.success ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div>
                        <CardTitle className="text-green-600">Analyse Succesvol</CardTitle>
                        <CardDescription>
                          Booking {result.bookingId}
                          {result.foundInMicrosite && (
                            <Badge variant="secondary" className="ml-2">
                              {result.foundInMicrosite}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowRawData(!showRawData)}>
                        {showRawData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showRawData ? "Verberg" : "Toon"} Raw Data
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadAnalysis}>
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Tabs defaultValue="deep-search" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="deep-search">🔍 Deep Search</TabsTrigger>
                  <TabsTrigger value="services">📋 Service Types</TabsTrigger>
                  <TabsTrigger value="missing">⚠️ Missing Fields</TabsTrigger>
                  <TabsTrigger value="recommendations">💡 Tips</TabsTrigger>
                </TabsList>

                <TabsContent value="deep-search" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>🔍 Deep Search Resultaten</CardTitle>
                      <CardDescription>Gevonden velden voor foto's, leveranciers en bagage informatie</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {result.analysis.deepSearchResults &&
                      Object.keys(result.analysis.deepSearchResults).length > 0 ? (
                        <div className="space-y-4">
                          {Object.entries(result.analysis.deepSearchResults).map(
                            ([fieldType, matches]: [string, any]) => (
                              <div key={fieldType} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge
                                    variant={
                                      fieldType.includes("image") || fieldType.includes("photo")
                                        ? "default"
                                        : fieldType.includes("supplier") || fieldType.includes("provider")
                                          ? "secondary"
                                          : "outline"
                                    }
                                  >
                                    {fieldType.includes("image") || fieldType.includes("photo")
                                      ? "📸"
                                      : fieldType.includes("supplier") || fieldType.includes("provider")
                                        ? "🏢"
                                        : fieldType.includes("baggage") || fieldType.includes("luggage")
                                          ? "🧳"
                                          : "🔍"}{" "}
                                    {fieldType}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">({matches.length} matches)</span>
                                </div>
                                <div className="space-y-2">
                                  {matches.map((match: any, index: number) => (
                                    <div key={index} className="bg-muted p-3 rounded text-sm">
                                      <div className="font-mono text-xs text-blue-600 mb-2">{match.path}</div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-xs">
                                          {match.type}
                                        </Badge>
                                        {match.isEmpty && (
                                          <Badge variant="destructive" className="text-xs">
                                            Empty
                                          </Badge>
                                        )}
                                        {match.isArray && (
                                          <Badge variant="default" className="text-xs">
                                            Array
                                          </Badge>
                                        )}
                                      </div>
                                      {!match.isEmpty && (
                                        <div className="mt-2 p-2 bg-background rounded text-xs font-mono">
                                          {typeof match.value === "string"
                                            ? match.value.slice(0, 150) + (match.value.length > 150 ? "..." : "")
                                            : JSON.stringify(match.value, null, 2).slice(0, 150) +
                                              (JSON.stringify(match.value).length > 150 ? "..." : "")}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Geen specifieke velden gevonden voor foto's, leveranciers of bagage</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>📋 Service Types Gevonden</CardTitle>
                      <CardDescription>Overzicht van alle service types in deze booking</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {Object.keys(result.analysis.serviceTypes).length > 0 ? (
                        <div className="space-y-4">
                          {Object.entries(result.analysis.serviceTypes).map(([serviceType, data]: [string, any]) => (
                            <div key={serviceType} className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary">
                                  {serviceType === "hotelservice"
                                    ? "🏨"
                                    : serviceType === "transportservice"
                                      ? "✈️"
                                      : serviceType === "ticketservice"
                                        ? "🎫"
                                        : serviceType === "carservice"
                                          ? "🚗"
                                          : "📋"}{" "}
                                  {serviceType}
                                </Badge>
                                <span className="text-sm text-muted-foreground">({data.count} items)</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                                {data.allSamples[0]?.fields.map((field: string) => (
                                  <div key={field} className="bg-muted px-2 py-1 rounded text-xs">
                                    {field}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Geen service types gevonden in deze booking</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="missing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>⚠️ Missing Fields</CardTitle>
                      <CardDescription>Velden die verwacht worden maar niet gevonden zijn</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {result.analysis.missingFields.length > 0 ? (
                        <div className="space-y-2">
                          {result.analysis.missingFields.map((missing: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded">
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{missing}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-green-600">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                          <p className="font-medium">✅ Alle verwachte velden zijn gevonden</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>💡 Recommendations</CardTitle>
                      <CardDescription>Aanbevelingen voor het verbeteren van de data parsing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.analysis.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded">
                            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                              <span className="text-xs">💡</span>
                            </div>
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {showRawData && (
                <Card>
                  <CardHeader>
                    <CardTitle>📄 Raw Booking Data</CardTitle>
                    <CardDescription>Volledige booking data voor inspectie</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full">
                      <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                        {JSON.stringify(result.rawBooking, null, 2)}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <CardTitle className="text-red-600">Analyse Gefaald</CardTitle>
                    <CardDescription>Er is een fout opgetreden tijdens de analyse</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-red-800 font-mono text-sm whitespace-pre-wrap">{result.error}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
