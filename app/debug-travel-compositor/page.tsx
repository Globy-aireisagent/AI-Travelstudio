"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, CheckCircle, XCircle, Eye } from "lucide-react"

export default function DebugTravelCompositor() {
  const [debugResult, setDebugResult] = useState<any>(null)
  const [exploreResult, setExploreResult] = useState<any>(null)
  const [selectedConfig, setSelectedConfig] = useState<string>("1")
  const [customEndpoint, setCustomEndpoint] = useState("/resources")
  const [isLoading, setIsLoading] = useState(false)

  const runDebug = async () => {
    setIsLoading(true)
    setDebugResult(null)

    try {
      const response = await fetch(`/api/travel-compositor/debug?config=${selectedConfig}`)
      const data = await response.json()
      setDebugResult(data)
    } catch (error) {
      setDebugResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exploreEndpoint = async () => {
    setIsLoading(true)
    setExploreResult(null)

    try {
      const response = await fetch(
        `/api/travel-compositor/explore?config=${selectedConfig}&endpoint=${encodeURIComponent(customEndpoint)}`,
      )
      const data = await response.json()
      setExploreResult(data)
    } catch (error) {
      setExploreResult({
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Travel Compositor API Debug</h1>
          <p className="text-gray-600">Ontdek welke endpoints beschikbaar zijn</p>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Configuratie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label>Configuratie:</Label>
              <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Configuratie 1</SelectItem>
                  <SelectItem value="2">Configuratie 2</SelectItem>
                  <SelectItem value="3">Configuratie 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Debug All Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Alle Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runDebug} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testen...
                </>
              ) : (
                "Test Alle Mogelijke Endpoints"
              )}
            </Button>

            {debugResult && (
              <div className="space-y-4">
                {debugResult.summary && (
                  <Alert className="border-blue-500 bg-blue-50">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <div className="font-medium">
                        Resultaat: {debugResult.summary.successful}/{debugResult.summary.total} endpoints werken
                      </div>
                      {debugResult.summary.successfulEndpoints.length > 0 && (
                        <div className="mt-2">
                          <strong>Werkende endpoints:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {debugResult.summary.successfulEndpoints.map((endpoint: string) => (
                              <li key={endpoint} className="text-sm font-mono">
                                {endpoint}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {debugResult.endpointResults?.map((result: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {result.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <code className="text-sm font-mono">{result.endpoint}</code>
                          <Badge variant={result.success ? "default" : "destructive"}>{result.status}</Badge>
                        </div>
                        {result.success && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCustomEndpoint(result.endpoint)
                              exploreEndpoint()
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {result.data && (
                        <div className="mt-2 text-xs">
                          {result.data.type === "array" && (
                            <span className="text-green-700">Array met {result.data.length} items</span>
                          )}
                          {result.data.keys && (
                            <span className="text-blue-700">Object keys: {result.data.keys.join(", ")}</span>
                          )}
                        </div>
                      )}
                      {result.error && (
                        <div className="mt-2 text-xs text-red-700 font-mono bg-red-100 p-2 rounded">{result.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Explore Specific Endpoint */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Verken Specifiek Endpoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="endpoint">Endpoint:</Label>
                <Input
                  id="endpoint"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="/resources/bookings"
                  className="mt-1 font-mono"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={exploreEndpoint} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {exploreResult && (
              <div className="space-y-4">
                <Alert className={exploreResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                  <div className="flex items-center space-x-2">
                    {exploreResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">
                        {exploreResult.endpoint} - Status: {exploreResult.status}
                      </div>
                      {exploreResult.dataInfo && (
                        <div className="text-sm mt-1">
                          Type: {exploreResult.dataInfo.type}
                          {exploreResult.dataInfo.length && ` (${exploreResult.dataInfo.length} items)`}
                          {exploreResult.dataInfo.keys && ` - Keys: ${exploreResult.dataInfo.keys.join(", ")}`}
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>

                {exploreResult.data && (
                  <div className="bg-white p-4 rounded border">
                    <h3 className="font-medium mb-3">Response Data:</h3>
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-96">
                      {JSON.stringify(exploreResult.data, null, 2)}
                    </pre>
                  </div>
                )}

                {exploreResult.error && (
                  <div className="bg-red-50 p-4 rounded border border-red-200">
                    <h3 className="font-medium mb-3 text-red-800">Error Response:</h3>
                    <pre className="text-xs text-red-700 bg-red-100 p-3 rounded overflow-auto max-h-48">
                      {exploreResult.error}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
