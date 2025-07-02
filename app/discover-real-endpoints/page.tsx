"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, Loader2, CheckCircle, XCircle, ImageIcon, Activity, Globe } from "lucide-react"

export default function DiscoverRealEndpointsPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const discoverEndpoints = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/travel-compositor/discover-real-endpoints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.results)
      } else {
        setError(data.error || "Failed to discover endpoints")
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
    link.download = `real-api-endpoints-discovery.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Auto-run on page load
  useEffect(() => {
    discoverEndpoints()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Discover Real API Endpoints</h1>
          <p className="text-gray-600">Find out which endpoints actually exist in the Travel Compositor API</p>
        </div>

        {/* Control Panel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              API Discovery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={discoverEndpoints} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Discover Endpoints
              </Button>
              {results && (
                <Button onClick={downloadResults} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Results
                </Button>
              )}
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

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mr-3" />
                <span>Discovering API endpoints...</span>
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
                    API Discovery Results
                  </CardTitle>
                  <Button onClick={downloadResults} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Total Endpoints</span>
                    <div className="font-medium text-2xl">{results.swaggerEndpoints?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Image Endpoints</span>
                    <div className="font-medium text-2xl text-blue-600">
                      {results.imageRelatedEndpoints?.length || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Activity Endpoints</span>
                    <div className="font-medium text-2xl text-purple-600">{results.activityEndpoints?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Working Endpoints</span>
                    <div className="font-medium text-2xl text-green-600">
                      {results.workingEndpoints?.filter((e: any) => e.success).length || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Tabs defaultValue="image-endpoints" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="image-endpoints">Image Endpoints</TabsTrigger>
                <TabsTrigger value="activity-endpoints">Activity Endpoints</TabsTrigger>
                <TabsTrigger value="working-endpoints">Working Endpoints</TabsTrigger>
                <TabsTrigger value="all-endpoints">All Endpoints</TabsTrigger>
              </TabsList>

              <TabsContent value="image-endpoints">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Image-Related Endpoints ({results.imageRelatedEndpoints?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {results.imageRelatedEndpoints?.map((endpoint: string, index: number) => (
                          <div key={index} className="p-2 bg-blue-50 rounded border">
                            <span className="font-mono text-sm">{endpoint}</span>
                          </div>
                        )) || <p className="text-gray-500">No image endpoints found</p>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity-endpoints">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Activity-Related Endpoints ({results.activityEndpoints?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {results.activityEndpoints?.map((endpoint: string, index: number) => (
                          <div key={index} className="p-2 bg-purple-50 rounded border">
                            <span className="font-mono text-sm">{endpoint}</span>
                          </div>
                        )) || <p className="text-gray-500">No activity endpoints found</p>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="working-endpoints">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Working Endpoints (Tested)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {results.workingEndpoints?.map((endpoint: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-sm">{endpoint.endpoint}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant={endpoint.success ? "default" : "secondary"}>{endpoint.status}</Badge>
                                {endpoint.success ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            </div>
                            {endpoint.success && endpoint.hasData && (
                              <div className="text-xs text-gray-600">
                                <div>Keys: {endpoint.dataKeys?.join(", ")}</div>
                                <div className="mt-1 p-2 bg-gray-50 rounded text-xs break-all">
                                  {endpoint.sampleData}
                                </div>
                              </div>
                            )}
                            {endpoint.error && <div className="text-xs text-red-600 mt-1">{endpoint.error}</div>}
                          </div>
                        )) || <p className="text-gray-500">No endpoints tested yet</p>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="all-endpoints">
                <Card>
                  <CardHeader>
                    <CardTitle>All Available Endpoints ({results.swaggerEndpoints?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-1">
                        {results.swaggerEndpoints?.map((endpoint: string, index: number) => (
                          <div key={index} className="p-1 text-sm font-mono">
                            {endpoint}
                          </div>
                        )) || <p className="text-gray-500">No endpoints found</p>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Analysis */}
            {results.endpointAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Analysis & Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Key Findings:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• {results.endpointAnalysis.totalEndpoints} total endpoints available</li>
                        <li>• {results.endpointAnalysis.imageEndpoints} image-related endpoints found</li>
                        <li>• {results.endpointAnalysis.activityEndpoints} activity-related endpoints found</li>
                        <li>• {results.endpointAnalysis.workingEndpoints} endpoints responded successfully</li>
                      </ul>
                    </div>

                    {results.endpointAnalysis.patterns?.commonImagePatterns?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Common Image Patterns:</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.endpointAnalysis.patterns.commonImagePatterns.map(
                            (pattern: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {pattern}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {results.endpointAnalysis.patterns?.commonActivityPatterns?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Common Activity Patterns:</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.endpointAnalysis.patterns.commonActivityPatterns.map(
                            (pattern: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {pattern}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
