"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, CheckCircle, XCircle, Search } from "lucide-react"

export default function SwaggerAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const fetchSwaggerInfo = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/travel-compositor/swagger-analysis")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">📋 Travel Compositor API Analysis</h1>
          <p className="text-muted-foreground mt-2">Discover the correct API endpoints and documentation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              API Discovery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchSwaggerInfo} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing API...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Discover API Endpoints
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-4">
            {result.success ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>API Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Base URL:</strong> {result.baseUrl}
                    </div>
                    <div>
                      <strong>Microsite ID:</strong> {result.micrositeId}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{result.summary.totalEndpointsTested} endpoints tested</Badge>
                      <Badge variant="outline">{result.summary.successfulEndpoints} successful</Badge>
                      <Badge variant="outline">{result.summary.foundSwaggerDocs} swagger docs found</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Endpoint Discovery Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.swaggerSearchResults.map((endpoint: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {endpoint.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">{endpoint.endpoint}</code>
                            </div>
                            <div className="flex gap-2">
                              {endpoint.status && (
                                <Badge variant={endpoint.status === 200 ? "default" : "destructive"}>
                                  {endpoint.status}
                                </Badge>
                              )}
                              {endpoint.contentType && <Badge variant="outline">{endpoint.contentType}</Badge>}
                            </div>
                          </div>

                          {endpoint.data && (
                            <div className="mt-2">
                              <details className="cursor-pointer">
                                <summary className="font-medium text-green-700">
                                  📋 Swagger Documentation Found!
                                </summary>
                                <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
                                  {JSON.stringify(endpoint.data, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}

                          {endpoint.preview && (
                            <div className="mt-2">
                              <details className="cursor-pointer">
                                <summary className="font-medium">Preview Response</summary>
                                <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-auto max-h-48">
                                  {endpoint.preview}
                                </pre>
                              </details>
                            </div>
                          )}

                          {endpoint.error && (
                            <div className="mt-2 text-red-600 text-sm">
                              <strong>Error:</strong> {endpoint.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800">Analysis Failed</h3>
                    <p className="text-red-700 mt-1">{result.error}</p>
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
