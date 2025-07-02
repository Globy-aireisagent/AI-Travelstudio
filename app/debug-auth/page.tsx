"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertTriangle, Key, Database } from "lucide-react"

interface AuthResult {
  config: number
  name: string
  status: string
  totalBookings?: number
  endpointResults?: any[]
  credentials?: any
  error?: string
}

interface TestResults {
  success: boolean
  testTime: string
  results: AuthResult[]
  summary: {
    totalConfigs: number
    workingConfigs: number
    totalBookings: number
  }
}

export default function DebugAuth() {
  const [testResults, setTestResults] = useState<TestResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runAuthTest = async () => {
    setIsLoading(true)
    setTestResults(null)

    try {
      const response = await fetch("/api/travel-compositor/debug-auth")
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      console.error("Auth test error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runAuthTest()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "auth_failed":
      case "http_error":
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "missing_credentials":
      case "no_token":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200"
      case "auth_failed":
      case "http_error":
      case "error":
        return "bg-red-50 border-red-200"
      case "missing_credentials":
      case "no_token":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔐 Authentication Debug</h1>
          <p className="text-gray-600">Testing all Travel Compositor configurations</p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>Authentication Test</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={runAuthTest} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Testing Authentication...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Run Authentication Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {testResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Test Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{testResults.summary.totalConfigs}</div>
                  <div className="text-blue-600">Total Configs</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">{testResults.summary.workingConfigs}</div>
                  <div className="text-green-600">Working Configs</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">{testResults.summary.totalBookings}</div>
                  <div className="text-purple-600">Total Bookings</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{testResults.testTime}</div>
                  <div className="text-gray-600">Test Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Results */}
        {testResults && (
          <div className="space-y-4">
            {testResults.results.map((result) => (
              <Card key={result.config} className={`border-2 ${getStatusColor(result.status)}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <span>
                        Config {result.config}: {result.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={result.status === "success" ? "default" : "destructive"}>{result.status}</Badge>
                      {result.totalBookings !== undefined && (
                        <Badge variant="outline">{result.totalBookings} bookings</Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Credentials Info */}
                  {result.credentials && (
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium mb-2">Credentials:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <strong>Username:</strong> {result.credentials.username}
                        </div>
                        <div>
                          <strong>Microsite ID:</strong> {result.credentials.micrositeId}
                        </div>
                        <div>
                          <strong>Password:</strong> {result.credentials.hasPassword ? "✅ Set" : "❌ Missing"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Info */}
                  {result.error && (
                    <Alert className="border-red-200 bg-red-50">
                      <XCircle className="w-4 h-4" />
                      <AlertDescription className="text-red-800">
                        <strong>Error:</strong> {result.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Endpoint Results */}
                  {result.endpointResults && result.endpointResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Endpoint Test Results:</h4>
                      {result.endpointResults.map((endpoint, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {endpoint.endpoint.split("?")[1] || endpoint.endpoint}
                            </code>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(endpoint.status)}
                              <Badge
                                variant={endpoint.status === "success" ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {endpoint.status}
                              </Badge>
                              {endpoint.bookingCount !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  {endpoint.bookingCount} bookings
                                </Badge>
                              )}
                            </div>
                          </div>

                          {endpoint.sampleIds && endpoint.sampleIds.length > 0 && (
                            <div>
                              <strong>Sample IDs:</strong> {endpoint.sampleIds.join(", ")}
                            </div>
                          )}

                          {endpoint.error && (
                            <div className="text-red-600">
                              <strong>Error:</strong> {endpoint.error}
                            </div>
                          )}

                          {endpoint.responsePreview && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs">Response Preview</summary>
                              <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto">
                                {endpoint.responsePreview}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Based on the test results:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Check which configs are working</li>
                    <li>• Verify credentials for failed configs</li>
                    <li>• Look at booking counts per microsite</li>
                    <li>• Test specific booking IDs in working configs</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
