"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Download, Loader2, CheckCircle, XCircle, ImageIcon } from "lucide-react"

export default function FindActivityImagesPage() {
  const [ticketId, setTicketId] = useState("AW2-11")
  const [ticketName, setTicketName] = useState(
    "Verborgen juweeltjes: Volledige dag wijn, scones, lunch en lokale producten Tour",
  )
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const searchImages = async () => {
    if (!ticketId.trim() || !ticketName.trim()) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/travel-compositor/find-activity-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          ticketName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.results)
      } else {
        setError(data.error || "Failed to search for activity images")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const downloadResults = () => {
    if (!results) return

    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `activity-images-search-${ticketId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Find Activity Images</h1>
          <p className="text-gray-600">Search for where activity images are stored in the Travel Compositor API</p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search for Activity Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ticket ID</label>
                <Input placeholder="bijv. AW2-11" value={ticketId} onChange={(e) => setTicketId(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Activity Name</label>
                <Input
                  placeholder="bijv. Verborgen juweeltjes tour"
                  value={ticketName}
                  onChange={(e) => setTicketName(e.target.value)}
                />
              </div>
              <Button onClick={searchImages} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Search for Images
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

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    Image Search Results - {results.ticketName}
                  </CardTitle>
                  <Button onClick={downloadResults} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Results
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Endpoints Tried</span>
                    <div className="font-medium text-2xl">{results.endpointsTried.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Successful Responses</span>
                    <div className="font-medium text-2xl text-green-600">
                      {results.endpointsTried.filter((e: any) => e.success).length}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Images Found</span>
                    <div className="font-medium text-2xl text-blue-600">
                      {results.imageSearchResults.reduce(
                        (total: number, result: any) => total + result.imageContent.length,
                        0,
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Results */}
            {results.imageSearchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Found Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {results.imageSearchResults.map((result: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Endpoint: {result.endpoint}</h4>
                          <div className="space-y-2">
                            {result.imageContent.map((image: any, imageIndex: number) => (
                              <div key={imageIndex} className="bg-green-50 p-2 rounded text-sm">
                                <span className="font-medium text-green-700">{image.field}</span>
                                <span className="text-gray-600"> ({image.type})</span>
                                {image.isArray && <span className="text-blue-600"> [Array]</span>}
                                <div className="text-xs text-gray-500 mt-1 break-all">Path: {image.path}</div>
                                <div className="text-xs text-gray-700 mt-1 break-all">
                                  Value: {JSON.stringify(image.value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Endpoints Tried */}
            <Card>
              <CardHeader>
                <CardTitle>Endpoints Tested</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {results.endpointsTried.map((endpoint: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-mono">{endpoint.endpoint}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={endpoint.success ? "default" : "secondary"}>{endpoint.status}</Badge>
                          {endpoint.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.potentialImageSources.map((source: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{source}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
