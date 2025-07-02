"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, Search, Code, Database } from "lucide-react"

export default function SwaggerDetailedAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const fetchDetailedAnalysis = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/travel-compositor/swagger-detailed-analysis")
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
          <h1 className="text-3xl font-bold">📋 Detailed Swagger Analysis</h1>
          <p className="text-muted-foreground mt-2">Deep dive into Travel Compositor API documentation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Analyze Swagger Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchDetailedAnalysis} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Swagger Docs...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Analyze API Documentation
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
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      API Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <strong>Title:</strong> {result.swaggerInfo.title || "N/A"}
                    </div>
                    <div>
                      <strong>Version:</strong> {result.swaggerInfo.version || "N/A"}
                    </div>
                    <div>
                      <strong>Description:</strong> {result.swaggerInfo.description || "N/A"}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">
                        <Database className="h-3 w-3 mr-1" />
                        {result.apiStructure.totalEndpoints} total endpoints
                      </Badge>
                      <Badge variant="outline">
                        <Search className="h-3 w-3 mr-1" />
                        {result.apiStructure.bookingEndpoints} booking endpoints
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {result.bookingEndpoints.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Booking Endpoints Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.bookingEndpoints.map((endpoint: string, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Code className="h-4 w-4" />
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{endpoint}</code>
                            </div>
                            {result.bookingEndpointDetails[endpoint] && (
                              <div className="ml-6">
                                <div className="flex gap-2 mb-2">
                                  {result.bookingEndpointDetails[endpoint].methods.map((method: string) => (
                                    <Badge key={method} variant="secondary">
                                      {method.toUpperCase()}
                                    </Badge>
                                  ))}
                                </div>
                                <details className="cursor-pointer">
                                  <summary className="font-medium text-blue-600">View Details</summary>
                                  <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
                                    {JSON.stringify(result.bookingEndpointDetails[endpoint].details, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>All Available Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {result.allEndpoints.map((endpoint: string, index: number) => (
                        <code
                          key={index}
                          className={`text-xs p-2 rounded block ${
                            endpoint.toLowerCase().includes("booking")
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {endpoint}
                        </code>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Complete Swagger Documentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <details className="cursor-pointer">
                      <summary className="font-medium text-blue-600 mb-2">
                        📋 View Full Swagger JSON (Click to expand)
                      </summary>
                      <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-96 border">
                        {JSON.stringify(result.rawSwaggerDoc, null, 2)}
                      </pre>
                    </details>
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
