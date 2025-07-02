"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, BarChart3, CheckCircle, XCircle, TrendingUp } from "lucide-react"

export default function AnalyzeBookingData() {
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [selectedConfig, setSelectedConfig] = useState<string>("1")
  const [isLoading, setIsLoading] = useState(false)

  const runAnalysis = async () => {
    setIsLoading(true)
    setAnalysisResult(null)

    try {
      const response = await fetch(`/api/travel-compositor/analyze-data?config=${selectedConfig}`)
      const data = await response.json()
      setAnalysisResult(data)
    } catch (error) {
      setAnalysisResult({
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Booking Data Analysis</h1>
          <p className="text-gray-600">Ontdek waarom we zo weinig bookings krijgen</p>
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
              <Button onClick={runAnalysis} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Start Deep Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Summary */}
            {analysisResult.summary && (
              <Alert className="border-blue-500 bg-blue-50">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="font-medium">{analysisResult.summary.message}</div>
                  <div className="mt-1 text-sm">
                    Best endpoint: {analysisResult.summary.topEndpoint} ({analysisResult.summary.topEndpointCount}{" "}
                    bookings)
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Analysis Overview */}
            {analysisResult.analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisResult.analysis.totalUniqueBookings}
                      </div>
                      <div className="text-sm text-gray-600">Unique Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResult.analysis.successfulEndpoints}
                      </div>
                      <div className="text-sm text-gray-600">Working Endpoints</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisResult.analysis.totalEndpointsTested}
                      </div>
                      <div className="text-sm text-gray-600">Endpoints Tested</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(
                          (analysisResult.analysis.successfulEndpoints / analysisResult.analysis.totalEndpointsTested) *
                            100,
                        )}
                        %
                      </div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>

                  {/* Best Endpoints */}
                  {analysisResult.analysis.bestEndpoints && (
                    <div>
                      <h3 className="font-medium mb-3">🏆 Best Performing Endpoints:</h3>
                      <div className="space-y-2">
                        {analysisResult.analysis.bestEndpoints.map((endpoint: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium">{endpoint.name}</div>
                              <div className="text-xs text-gray-600 font-mono">{endpoint.endpoint}</div>
                            </div>
                            <Badge variant="default">{endpoint.bookingCount} bookings</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yearly Breakdown */}
                  {analysisResult.analysis.yearlyBreakdown && analysisResult.analysis.yearlyBreakdown.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">📅 Yearly Breakdown:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {analysisResult.analysis.yearlyBreakdown.map((year: any, index: number) => (
                          <div key={index} className="text-center p-3 bg-gray-50 rounded">
                            <div className="font-bold">{year.year}</div>
                            <div className="text-sm text-gray-600">{year.bookingCount} bookings</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysisResult.analysis.recommendations && analysisResult.analysis.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">💡 Recommendations:</h3>
                      <ul className="space-y-1">
                        {analysisResult.analysis.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Detailed Results */}
            {analysisResult.detailedResults && (
              <Card>
                <CardHeader>
                  <CardTitle>🔍 Detailed Endpoint Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {analysisResult.detailedResults.map((result: any, index: number) => (
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
                            <div>
                              <div className="font-medium">{result.name}</div>
                              <div className="text-xs text-gray-600 font-mono">{result.endpoint}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={result.success ? "default" : "destructive"}>
                              {result.success ? `${result.bookingCount} bookings` : result.error}
                            </Badge>
                            {result.newBookings > 0 && (
                              <div className="text-xs text-green-600">+{result.newBookings} new</div>
                            )}
                          </div>
                        </div>
                        {result.sampleIds && (
                          <div className="mt-2 text-xs text-gray-600">Sample IDs: {result.sampleIds}</div>
                        )}
                        {result.idRange && (
                          <div className="mt-1 text-xs text-blue-600">
                            Range: {result.idRange.first} → {result.idRange.last}
                          </div>
                        )}
                      </div>
                    ))}
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
