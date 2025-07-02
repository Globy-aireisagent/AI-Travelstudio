"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, XCircle, Database, FileText, Globe } from "lucide-react"

export default function DiscoverEndpoints() {
  const [result, setResult] = useState<any>(null)
  const [selectedConfig, setSelectedConfig] = useState<string>("1")
  const [isLoading, setIsLoading] = useState(false)

  const discoverEndpoints = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/travel-compositor/discover-endpoints?config=${selectedConfig}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Endpoint Discovery</h1>
          <p className="text-gray-600">Ontdek welke API endpoints beschikbaar zijn</p>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Configuratie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <label>Configuratie:</label>
              <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Config 1 (rondreis-planner)</SelectItem>
                  <SelectItem value="3">Config 3 (pacificislandtravel)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={discoverEndpoints} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Discover Endpoints
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            {result.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>📊 Discovery Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{result.summary.totalEndpointsTested}</div>
                      <div className="text-sm text-gray-600">Endpoints Tested</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{result.summary.workingEndpoints}</div>
                      <div className="text-sm text-gray-600">Working Endpoints</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {result.summary.endpointsWithBookingData}
                      </div>
                      <div className="text-sm text-gray-600">With Booking Data</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{result.summary.maxBookingsFound}</div>
                      <div className="text-sm text-gray-600">Max Bookings Found</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Best Endpoints */}
            {result.recommendations && result.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Best Endpoints (With Booking Data)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.recommendations.map((rec: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200"
                      >
                        <div className="flex items-center space-x-3">
                          <Database className="w-5 h-5 text-green-600" />
                          <div>
                            <code className="text-sm font-mono bg-white px-2 py-1 rounded">
                              {rec.method} {rec.endpoint}
                            </code>
                            <div className="text-xs text-gray-600 mt-1">{rec.bookingCount} bookings found</div>
                          </div>
                        </div>
                        <Badge variant="default">{rec.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Working Endpoints */}
            {result.workingEndpoints && result.workingEndpoints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>✅ All Working Endpoints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.workingEndpoints.map((endpoint: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200"
                      >
                        <div className="flex items-center space-x-2">
                          {endpoint.hasData ? (
                            <Database className="w-4 h-4 text-green-600" />
                          ) : endpoint.contentType?.includes("json") ? (
                            <FileText className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Globe className="w-4 h-4 text-gray-600" />
                          )}
                          <code className="text-xs font-mono">
                            {endpoint.method} {endpoint.endpoint}
                          </code>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {endpoint.contentType?.split(";")[0] || "unknown"}
                          </Badge>
                          <Badge variant="default">{endpoint.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {result.error && (
              <Alert className="border-red-500 bg-red-50">
                <XCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Error:</strong> {result.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
