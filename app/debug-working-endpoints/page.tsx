"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Bug, CheckCircle, XCircle } from "lucide-react"

export default function DebugWorkingEndpoints() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDebug = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/travel-compositor/debug-working-endpoints")
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

  useEffect(() => {
    runDebug()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🐛 Debug Working Endpoints</h1>
          <p className="text-gray-600">Waarom werkt multi-microsite wel en single niet?</p>
        </div>

        {/* Control */}
        <Card>
          <CardContent className="pt-6">
            <Button onClick={runDebug} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Debugging...
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4 mr-2" />
                  Run Debug Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Conclusion */}
            {result.conclusion && (
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Conclusie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      {result.conclusion.singleMicrositeWorks ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span>Single Microsite: {result.conclusion.singleMicrositeWorks ? "Werkt" : "Werkt niet"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.conclusion.multiMicrositeWorks ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span>Multi Microsite: {result.conclusion.multiMicrositeWorks ? "Werkt" : "Werkt niet"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Mogelijke oorzaken:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {result.conclusion.possibleIssues.map((issue: string, index: number) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Authentication Comparison */}
            {result.authComparison && (
              <Card>
                <CardHeader>
                  <CardTitle>🔐 Authentication Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Base URL:</label>
                        <code className="block text-sm bg-gray-100 p-2 rounded">
                          {result.authComparison.singleClientBaseUrl}
                        </code>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Microsite ID:</label>
                        <code className="block text-sm bg-gray-100 p-2 rounded">
                          {result.authComparison.singleClientMicrositeId}
                        </code>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Token Status:</label>
                      <div className="flex items-center space-x-2 mt-1">
                        {result.authComparison.tokenPresent ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {result.authComparison.tokenPresent ? "Token aanwezig" : "Geen token"}
                        </span>
                        {result.authComparison.tokenPreview && (
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {result.authComparison.tokenPreview}
                          </code>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Single Microsite Tests */}
            {result.results?.singleMicrosite && (
              <Card>
                <CardHeader>
                  <CardTitle>🔍 Single Microsite Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.results.singleMicrosite.tests.map((test: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded border ${
                          test.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-sm font-mono">{test.endpoint}</code>
                          <Badge variant={test.success ? "default" : "destructive"}>{test.status || "ERROR"}</Badge>
                        </div>
                        {test.responsePreview && (
                          <div className="mt-2">
                            <label className="text-xs font-medium text-gray-600">Response Preview:</label>
                            <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-x-auto">
                              {test.responsePreview}
                            </pre>
                          </div>
                        )}
                        {test.error && (
                          <div className="mt-2">
                            <label className="text-xs font-medium text-red-600">Error:</label>
                            <div className="text-xs text-red-800 mt-1">{test.error}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Multi Microsite Tests */}
            {result.results?.multiMicrosite && (
              <Card>
                <CardHeader>
                  <CardTitle>🌐 Multi Microsite Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.results.multiMicrosite.tests.map((test: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded border ${
                          test.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{test.method}</span>
                          <Badge variant={test.success ? "default" : "destructive"}>
                            {test.success ? "SUCCESS" : "FAILED"}
                          </Badge>
                        </div>
                        {test.foundIn && <div className="text-sm text-green-700">Found in: {test.foundIn}</div>}
                        {test.searchResults && (
                          <div className="mt-2">
                            <label className="text-xs font-medium text-gray-600">Search Results:</label>
                            <div className="text-xs space-y-1 mt-1">
                              {test.searchResults.map((sr: any, srIndex: number) => (
                                <div key={srIndex} className="flex justify-between">
                                  <span>{sr.microsite}</span>
                                  <span>{sr.bookingCount} bookings</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
