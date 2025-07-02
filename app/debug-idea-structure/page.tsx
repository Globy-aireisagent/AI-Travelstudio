"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Database,
  Key,
  Calendar,
  Users,
  ImageIcon,
  Building2,
  AlertTriangle,
  Copy,
  Download,
} from "lucide-react"

export default function DebugIdeaStructurePage() {
  const [ideaId, setIdeaId] = useState("29223863")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const debugIdea = async () => {
    if (!ideaId.trim()) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      console.log(`🔍 Debugging idea structure for: ${ideaId}`)

      const response = await fetch(`/api/travel-compositor/debug-idea-structure?ideaId=${ideaId}&config=1`)
      const data = await response.json()

      if (data.success) {
        setResults(data)
        console.log("✅ Debug results:", data)
      } else {
        setError(data.error || "Unknown error occurred")
      }
    } catch (err) {
      console.error("❌ Debug error:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadResults = () => {
    if (!results) return
    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `idea-${ideaId}-debug-results.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🔍 Debug Idea Structure</h1>
              <p className="text-gray-600 mt-1">
                Analyseer de exacte API response structuur van Travel Compositor Ideas
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <Building2 className="w-4 h-4 mr-2" />
                Debug Tool
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Idea Structure Analyseren
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="idea-id">Idea ID</Label>
              <Input
                id="idea-id"
                placeholder="bijv. 29223863"
                value={ideaId}
                onChange={(e) => setIdeaId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && debugIdea()}
              />
            </div>

            <Button onClick={debugIdea} disabled={loading || !ideaId.trim()} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Analyseren...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyseer API Structuur
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    Debug Resultaten voor Idea {results.ideaId}
                  </CardTitle>
                  <Button onClick={downloadResults} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.summary.totalEndpoints}</div>
                    <div className="text-sm text-blue-800">Endpoints Getest</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.summary.successfulEndpoints}</div>
                    <div className="text-sm text-green-800">Succesvol</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{results.summary.endpointsWithServices}</div>
                    <div className="text-sm text-purple-800">Met Services</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{results.summary.endpointsWithClient}</div>
                    <div className="text-sm text-orange-800">Met Client Data</div>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{results.summary.endpointsWithDates}</div>
                    <div className="text-sm text-indigo-800">Met Datums</div>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">{results.summary.endpointsWithImages}</div>
                    <div className="text-sm text-pink-800">Met Images</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <strong>Microsite:</strong> {results.microsite}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Tabs defaultValue="successful" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="successful">Succesvolle Endpoints</TabsTrigger>
                <TabsTrigger value="failed">Gefaalde Endpoints</TabsTrigger>
                <TabsTrigger value="analysis">Data Analyse</TabsTrigger>
              </TabsList>

              <TabsContent value="successful">
                <div className="space-y-4">
                  {results.endpointResults
                    .filter((result: any) => result.status === 200)
                    .map((result: any, index: number) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              Endpoint {index + 1}
                            </CardTitle>
                            <div className="flex gap-2">
                              {result.hasServices && (
                                <Badge variant="default" className="bg-purple-100 text-purple-800">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  Services
                                </Badge>
                              )}
                              {result.hasClient && (
                                <Badge variant="default" className="bg-orange-100 text-orange-800">
                                  <Users className="w-3 h-3 mr-1" />
                                  Client
                                </Badge>
                              )}
                              {result.hasDates && (
                                <Badge variant="default" className="bg-indigo-100 text-indigo-800">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Dates
                                </Badge>
                              )}
                              {result.hasImages && (
                                <Badge variant="default" className="bg-pink-100 text-pink-800">
                                  <ImageIcon className="w-3 h-3 mr-1" />
                                  Images
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Key className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">Endpoint URL</span>
                                <Button
                                  onClick={() => copyToClipboard(result.endpoint)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="text-sm bg-gray-100 p-2 rounded font-mono break-all">
                                {result.endpoint}
                              </div>
                            </div>

                            <div>
                              <div className="font-medium mb-2">Data Keys ({result.dataKeys.length})</div>
                              <div className="flex flex-wrap gap-1">
                                {result.dataKeys.map((key: string) => (
                                  <Badge key={key} variant="outline" className="text-xs">
                                    {key}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {result.serviceKeys.length > 0 && (
                              <div>
                                <div className="font-medium mb-2 text-purple-700">Service Keys</div>
                                <div className="flex flex-wrap gap-1">
                                  {result.serviceKeys.map((key: string) => (
                                    <Badge
                                      key={key}
                                      variant="default"
                                      className="text-xs bg-purple-100 text-purple-800"
                                    >
                                      {key}: {result.sampleData[key]}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {result.clientKeys.length > 0 && (
                              <div>
                                <div className="font-medium mb-2 text-orange-700">Client Keys</div>
                                <div className="flex flex-wrap gap-1">
                                  {result.clientKeys.map((key: string) => (
                                    <Badge
                                      key={key}
                                      variant="default"
                                      className="text-xs bg-orange-100 text-orange-800"
                                    >
                                      {key}: {result.sampleData[key]}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {result.dateKeys.length > 0 && (
                              <div>
                                <div className="font-medium mb-2 text-indigo-700">Date Keys</div>
                                <div className="flex flex-wrap gap-1">
                                  {result.dateKeys.map((key: string) => (
                                    <Badge
                                      key={key}
                                      variant="default"
                                      className="text-xs bg-indigo-100 text-indigo-800"
                                    >
                                      {key}: {result.sampleData[key]}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {result.imageKeys.length > 0 && (
                              <div>
                                <div className="font-medium mb-2 text-pink-700">Image Keys</div>
                                <div className="flex flex-wrap gap-1">
                                  {result.imageKeys.map((key: string) => (
                                    <Badge key={key} variant="default" className="text-xs bg-pink-100 text-pink-800">
                                      {key}: {result.sampleData[key]}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <div className="font-medium mb-2">Data Structure Sample</div>
                              <div className="text-xs bg-gray-100 p-3 rounded font-mono overflow-auto max-h-40">
                                <pre>{JSON.stringify(result.sampleData.fullStructure, null, 2)}</pre>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="failed">
                <div className="space-y-4">
                  {results.endpointResults
                    .filter((result: any) => result.status !== 200)
                    .map((result: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <div className="flex-1">
                              <div className="font-medium text-sm break-all">{result.endpoint}</div>
                              <div className="text-sm text-red-600 mt-1">
                                {result.status ? `Status: ${result.status}` : "Connection Error"}
                              </div>
                              {result.error && <div className="text-xs text-gray-500 mt-1">{result.error}</div>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <Card>
                  <CardHeader>
                    <CardTitle>Analyse & Aanbevelingen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.summary.endpointsWithServices === 0 && (
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className="font-medium text-yellow-800">Geen Services Gevonden</div>
                            <div className="text-sm text-yellow-700">
                              Geen van de endpoints bevat service data. Dit kan betekenen dat services in een apart
                              endpoint zitten of een andere structuur hebben.
                            </div>
                          </div>
                        </div>
                      )}

                      {results.summary.endpointsWithClient === 0 && (
                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          <div>
                            <div className="font-medium text-orange-800">Geen Client Data Gevonden</div>
                            <div className="text-sm text-orange-700">
                              Client/contact informatie is niet beschikbaar in de basis idea endpoints.
                            </div>
                          </div>
                        </div>
                      )}

                      {results.summary.successfulEndpoints > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium text-green-800">Basis Data Beschikbaar</div>
                            <div className="text-sm text-green-700">
                              {results.summary.successfulEndpoints} endpoint(s) retourneren basis idea informatie.
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-6">
                        <div className="font-medium mb-2">Volgende Stappen:</div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          <li>Controleer of er aparte endpoints zijn voor services (bijv. /services, /itinerary)</li>
                          <li>Kijk naar de volledige data structuur in succesvolle responses</li>
                          <li>Test met verschillende idea ID's om patronen te vinden</li>
                          <li>Onderzoek of er query parameters zijn voor uitgebreide data</li>
                        </ul>
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
