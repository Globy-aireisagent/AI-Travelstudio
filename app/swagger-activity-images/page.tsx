"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ImageIcon, Ticket, Search, FileText, Loader2, CheckCircle, XCircle, Download } from "lucide-react"

interface SwaggerAnalysis {
  success: boolean
  analysis: {
    totalEndpoints: number
    imageEndpoints: {
      count: number
      endpoints: any[]
    }
    ticketEndpoints: {
      count: number
      endpoints: any[]
    }
    activityEndpoints: {
      count: number
      endpoints: any[]
    }
    imageDefinitions: {
      count: number
      definitions: any[]
    }
    ticketDefinitions: {
      count: number
      definitions: any[]
    }
  }
  recommendations: string[]
}

export default function SwaggerActivityImagesPage() {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<SwaggerAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSwaggerAnalysis()
  }, [])

  const fetchSwaggerAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/travel-compositor/swagger-activity-images")
      const data = await response.json()

      if (data.success) {
        setAnalysis(data)
      } else {
        setError(data.error || "Failed to analyze Swagger documentation")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const downloadAnalysis = () => {
    if (!analysis) return

    const dataStr = JSON.stringify(analysis, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "swagger-activity-images-analysis.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Analyzing Swagger documentation for activity images...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="max-w-2xl mx-auto border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Swagger Activity Images Analysis</h1>
          <p className="text-gray-600">
            Analyzing the Travel Compositor API documentation to find where activity and ticket images are stored
          </p>
        </div>

        {analysis && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    Analysis Summary
                  </CardTitle>
                  <Button onClick={downloadAnalysis} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Analysis
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Total Endpoints</span>
                    <div className="font-medium text-2xl">{analysis.analysis.totalEndpoints}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Image Endpoints</span>
                    <div className="font-medium text-2xl text-blue-600">{analysis.analysis.imageEndpoints.count}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Ticket Endpoints</span>
                    <div className="font-medium text-2xl text-green-600">{analysis.analysis.ticketEndpoints.count}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Activity Endpoints</span>
                    <div className="font-medium text-2xl text-purple-600">
                      {analysis.analysis.activityEndpoints.count}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Image Definitions</span>
                    <div className="font-medium text-2xl text-orange-600">
                      {analysis.analysis.imageDefinitions.count}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Tabs defaultValue="endpoints" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="endpoints">Image Endpoints</TabsTrigger>
                <TabsTrigger value="tickets">Ticket Endpoints</TabsTrigger>
                <TabsTrigger value="definitions">Definitions</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="endpoints">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Image-Related Endpoints ({analysis.analysis.imageEndpoints.count})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.analysis.imageEndpoints.count > 0 ? (
                      <ScrollArea className="h-96">
                        <div className="space-y-4">
                          {analysis.analysis.imageEndpoints.endpoints.map((endpoint: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <h4 className="font-medium mb-2">{endpoint.path}</h4>
                              <div className="flex gap-2 mb-2">
                                {endpoint.methods.map((method: string) => (
                                  <Badge key={method} variant="outline">
                                    {method.toUpperCase()}
                                  </Badge>
                                ))}
                              </div>
                              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(endpoint.details, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No direct image endpoints found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tickets">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="w-5 h-5" />
                      Ticket/Activity Endpoints ({analysis.analysis.ticketEndpoints.count})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.analysis.ticketEndpoints.count > 0 ? (
                      <ScrollArea className="h-96">
                        <div className="space-y-4">
                          {analysis.analysis.ticketEndpoints.endpoints.map((endpoint: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <h4 className="font-medium mb-2">{endpoint.path}</h4>
                              <div className="flex gap-2 mb-2">
                                {endpoint.methods.map((method: string) => (
                                  <Badge key={method} variant="outline">
                                    {method.toUpperCase()}
                                  </Badge>
                                ))}
                              </div>
                              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(endpoint.details, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No ticket endpoints found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="definitions">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Ticket Definitions with Image Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {analysis.analysis.ticketDefinitions.definitions.map((def: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{def.name}</h4>
                            {def.imageProperties.length > 0 && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-green-600">Image Properties Found:</span>
                                <div className="mt-1 space-y-1">
                                  {def.imageProperties.map((prop: any, propIndex: number) => (
                                    <div key={propIndex} className="text-xs bg-green-50 p-2 rounded">
                                      <span className="font-medium">{prop.name}</span> ({prop.type})
                                      {prop.description && <div className="text-gray-600">{prop.description}</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <details className="text-xs">
                              <summary className="cursor-pointer text-gray-600">View full definition</summary>
                              <pre className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(def.definition, null, 2)}
                              </pre>
                            </details>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.recommendations.map((recommendation: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
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
