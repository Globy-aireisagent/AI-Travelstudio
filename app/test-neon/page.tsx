"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database } from "lucide-react"

interface NeonTestResult {
  success: boolean
  message: string
  timestamp: string
  environment: {
    DATABASE_URL: boolean
  }
  database?: {
    version: string
    tables: Array<{ name: string; exists: boolean; error: string | null }>
    data: Array<{ table: string; count: number; error: string | null }>
  }
  recommendations: string[]
  error?: string
}

export default function TestNeonPage() {
  const [testResult, setTestResult] = useState<NeonTestResult | null>(null)
  const [writeTestResult, setWriteTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [writeLoading, setWriteLoading] = useState(false)

  const runReadTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-neon")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        message: "Failed to connect to test endpoint",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        environment: { DATABASE_URL: false },
        recommendations: ["Check if the API endpoint is working"],
      })
    } finally {
      setLoading(false)
    }
  }

  const runWriteTest = async () => {
    setWriteLoading(true)
    try {
      const response = await fetch("/api/test-neon", { method: "POST" })
      const data = await response.json()
      setWriteTestResult(data)
    } catch (error) {
      setWriteTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setWriteLoading(false)
    }
  }

  useEffect(() => {
    runReadTest()
  }, [])

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (success: boolean) => {
    return <Badge variant={success ? "default" : "destructive"}>{success ? "✅ OK" : "❌ Failed"}</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Database className="h-8 w-8 mr-3 text-blue-600" />
            Neon Database Test
          </h1>
          <p className="text-muted-foreground">Test de verbinding met Neon PostgreSQL database</p>
        </div>
        <Button onClick={runReadTest} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Test Opnieuw
        </Button>
      </div>

      {testResult && (
        <div className="space-y-6">
          {/* Environment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getStatusIcon(testResult.environment.DATABASE_URL)}
                <span className="ml-2">Environment Configuration</span>
              </CardTitle>
              <CardDescription>Controleert of DATABASE_URL environment variable is ingesteld</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">DATABASE_URL</code>
                {getStatusBadge(testResult.environment.DATABASE_URL)}
              </div>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getStatusIcon(testResult.success)}
                <span className="ml-2">Database Connection</span>
              </CardTitle>
              <CardDescription>{testResult.message}</CardDescription>
            </CardHeader>
            <CardContent>
              {testResult.database && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Database Version</h4>
                    <p className="text-sm text-gray-600">{testResult.database.version}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Tables Status</h4>
                    <div className="space-y-2">
                      {testResult.database.tables.map((table) => (
                        <div key={table.name} className="flex items-center justify-between">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{table.name}</code>
                          {getStatusBadge(table.exists)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Data Counts</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {testResult.database.data.map((item) => (
                        <div key={item.table} className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-blue-800">{item.table}</div>
                          <div className="text-2xl font-bold text-blue-600">{item.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {testResult.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                  <p className="text-sm text-red-600">{testResult.error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Write Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <span>Database Write Test</span>
                </div>
                {writeTestResult && getStatusBadge(writeTestResult.success)}
              </CardTitle>
              <CardDescription>Test het schrijven van data naar de database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={runWriteTest} disabled={writeLoading || !testResult.success}>
                  {writeLoading ? "Testing..." : "Run Write Test"}
                </Button>

                {writeTestResult?.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Write Test Error:</h4>
                    <p className="text-sm text-red-600">{writeTestResult.error}</p>
                  </div>
                )}

                {writeTestResult?.success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Write Test Successful!</h4>
                    <p className="text-sm text-green-600">Database write operations are working correctly.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {testResult.recommendations.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Aanbevelingen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {testResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-yellow-700 flex items-start">
                      <span className="mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Test Info */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Test uitgevoerd op: {new Date(testResult.timestamp).toLocaleString("nl-NL")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
