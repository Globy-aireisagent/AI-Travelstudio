"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface TestResult {
  success: boolean
  timestamp: string
  environment: {
    NEXT_PUBLIC_SUPABASE_URL: boolean
    NEXT_PUBLIC_SUPABASE_ANON_KEY: boolean
    SUPABASE_SERVICE_ROLE_KEY: boolean
  }
  tests: {
    client: { success: boolean; error: string | null }
    server: { success: boolean; error: string | null }
    tables: {
      success: boolean
      tables: Array<{ name: string; exists: boolean; error: string | null }>
      error: string | null
    }
  }
  recommendations: string[]
}

export default function TestSupabasePage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-supabase")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Test failed")
      }

      setTestResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTest()
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
          <h1 className="text-3xl font-bold">Supabase Connection Test</h1>
          <p className="text-muted-foreground">Test de verbinding met Supabase database</p>
        </div>
        <Button onClick={runTest} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Test Opnieuw
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              Test Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {testResult && (
        <div className="space-y-6">
          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getStatusIcon(Object.values(testResult.environment).every(Boolean))}
                <span className="ml-2">Environment Variables</span>
              </CardTitle>
              <CardDescription>Controleert of alle benodigde environment variables zijn ingesteld</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(testResult.environment).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{key}</code>
                    {getStatusBadge(value)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Connection Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getStatusIcon(testResult.tests.client.success && testResult.tests.server.success)}
                <span className="ml-2">Connection Tests</span>
              </CardTitle>
              <CardDescription>Test client-side en server-side verbindingen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Client-side Connection</h4>
                    {testResult.tests.client.error && (
                      <p className="text-sm text-red-600">{testResult.tests.client.error}</p>
                    )}
                  </div>
                  {getStatusBadge(testResult.tests.client.success)}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Server-side Connection</h4>
                    {testResult.tests.server.error && (
                      <p className="text-sm text-red-600">{testResult.tests.server.error}</p>
                    )}
                  </div>
                  {getStatusBadge(testResult.tests.server.success)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Tables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getStatusIcon(testResult.tests.tables.success)}
                <span className="ml-2">Database Tables</span>
              </CardTitle>
              <CardDescription>Controleert of alle benodigde database tabellen bestaan</CardDescription>
            </CardHeader>
            <CardContent>
              {testResult.tests.tables.error ? (
                <p className="text-red-600">{testResult.tests.tables.error}</p>
              ) : (
                <div className="space-y-2">
                  {testResult.tests.tables.tables.map((table) => (
                    <div key={table.name} className="flex items-center justify-between">
                      <div>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{table.name}</code>
                        {table.error && <p className="text-xs text-red-600 mt-1">{table.error}</p>}
                      </div>
                      {getStatusBadge(table.exists)}
                    </div>
                  ))}
                </div>
              )}
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
