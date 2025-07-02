"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function DebugDirectAuthPage() {
  const [configId, setConfigId] = useState("1")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testAuth = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/travel-compositor/debug-direct-auth?config=${configId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to test authentication")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔐 Direct API Authentication Debug</h1>
          <p className="text-gray-600">Test de authenticatie en API endpoints voor Travel Compositor</p>
        </div>

        {/* Test Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authentication Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Select value={configId} onValueChange={setConfigId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Config" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Config 1</SelectItem>
                    <SelectItem value="3">Config 3</SelectItem>
                    <SelectItem value="4">Config 4</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={testAuth} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Testing Authentication...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Test Config {configId}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Credentials Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Config {result.config} Credentials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Username:</span>
                    <Badge variant={result.credentials.username.includes("✅") ? "default" : "destructive"}>
                      {result.credentials.username}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Password:</span>
                    <Badge variant={result.credentials.password.includes("✅") ? "default" : "destructive"}>
                      {result.credentials.password}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Microsite ID:</span>
                    <Badge variant="outline">{result.credentials.micrositeId}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Endpoints */}
            {result.workingEndpoints.length > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Working Endpoints ({result.workingEndpoints.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.workingEndpoints.map((endpoint: any, index: number) => (
                      <div key={index} className="p-3 bg-white rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm font-mono text-green-700">{endpoint.endpoint}</code>
                          <Badge className="bg-green-100 text-green-800">
                            {endpoint.status} {endpoint.statusText}
                          </Badge>
                        </div>
                        {endpoint.dataType && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Data Type:</span> {endpoint.dataType}
                            {endpoint.sampleKeys && endpoint.sampleKeys.length > 0 && (
                              <span className="ml-2">Keys: {endpoint.sampleKeys.join(", ")}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Failed Endpoints */}
            {result.failedEndpoints.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <XCircle className="w-5 h-5" />
                    Failed Endpoints ({result.failedEndpoints.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.failedEndpoints.map((endpoint: any, index: number) => (
                      <div key={index} className="p-3 bg-white rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm font-mono text-red-700">{endpoint.endpoint}</code>
                          {endpoint.status && (
                            <Badge variant="destructive">
                              {endpoint.status} {endpoint.statusText}
                            </Badge>
                          )}
                        </div>
                        {endpoint.errorBody && (
                          <div className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Error:</span>
                            <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                              {endpoint.errorBody}
                            </pre>
                          </div>
                        )}
                        {endpoint.error && (
                          <div className="text-sm text-red-600">
                            <span className="font-medium">Error:</span> {endpoint.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.workingEndpoints.length}</div>
                    <div className="text-sm text-gray-600">Working Endpoints</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{result.failedEndpoints.length}</div>
                    <div className="text-sm text-gray-600">Failed Endpoints</div>
                  </div>
                </div>

                {result.workingEndpoints.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded">
                    <p className="text-green-700 font-medium">✅ Authentication is working!</p>
                    <p className="text-sm text-green-600 mt-1">Use the working endpoints above for API calls.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
