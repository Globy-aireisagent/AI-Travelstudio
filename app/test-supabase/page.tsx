"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Database, Users, FileText, Calendar, Zap } from "lucide-react"

interface SupabaseTestResult {
  success: boolean
  message: string
  data?: any
  error?: string
  environment?: {
    hasSupabaseUrl: boolean
    hasAnonKey: boolean
    hasServiceKey: boolean
    supabaseUrl: string
  }
}

export default function TestSupabasePage() {
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null)
  const [writeTestResult, setWriteTestResult] = useState<SupabaseTestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [writeLoading, setWriteLoading] = useState(false)

  useEffect(() => {
    runReadTest()
  }, [])

  const runReadTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-supabase")
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: "Failed to connect to test endpoint",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const runWriteTest = async () => {
    setWriteLoading(true)
    try {
      const response = await fetch("/api/test-supabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
      const result = await response.json()
      setWriteTestResult(result)
    } catch (error) {
      setWriteTestResult({
        success: false,
        message: "Failed to run write test",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setWriteLoading(false)
    }
  }

  const getStatusIcon = (success: boolean | undefined) => {
    if (success === undefined) return <AlertCircle className="w-5 h-5 text-yellow-500" />
    return success ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
  }

  const getStatusBadge = (success: boolean | undefined) => {
    if (success === undefined) return <Badge variant="secondary">Unknown</Badge>
    return success ? (
      <Badge className="bg-green-100 text-green-800">Connected</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Connection Test</h1>
        <p className="text-gray-600">
          Test de verbinding met Supabase database en controleer of alle tabellen correct zijn opgezet.
        </p>
      </div>

      {/* Environment Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Environment Configuration
          </CardTitle>
          <CardDescription>Controleer of alle benodigde environment variabelen zijn ingesteld</CardDescription>
        </CardHeader>
        <CardContent>
          {testResult?.environment ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span>Supabase URL</span>
                {getStatusIcon(testResult.environment.hasSupabaseUrl)}
              </div>
              <div className="flex items-center justify-between">
                <span>Anonymous Key</span>
                {getStatusIcon(testResult.environment.hasAnonKey)}
              </div>
              <div className="flex items-center justify-between">
                <span>Service Role Key</span>
                {getStatusIcon(testResult.environment.hasServiceKey)}
              </div>
              <div className="flex items-center justify-between">
                <span>URL Preview</span>
                <span className="text-sm text-gray-600">{testResult.environment.supabaseUrl}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Geen environment data beschikbaar</p>
          )}
        </CardContent>
      </Card>

      {/* Read Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Database Read Test
            </div>
            {getStatusBadge(testResult?.success)}
          </CardTitle>
          <CardDescription>Test het lezen van data uit verschillende tabellen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button onClick={runReadTest} disabled={loading}>
                {loading ? "Testing..." : "Run Read Test"}
              </Button>
              {testResult && (
                <span className="text-sm text-gray-600">{testResult.success ? "✅ Success" : "❌ Failed"}</span>
              )}
            </div>

            {testResult?.data && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Users</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{testResult.data.users?.count || 0}</p>
                  {testResult.data.users?.error && (
                    <p className="text-xs text-red-600">{testResult.data.users.error}</p>
                  )}
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Database className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Agencies</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{testResult.data.agencies?.count || 0}</p>
                  {testResult.data.agencies?.error && (
                    <p className="text-xs text-red-600">{testResult.data.agencies.error}</p>
                  )}
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Features</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{testResult.data.featureRequests?.count || 0}</p>
                  {testResult.data.featureRequests?.error && (
                    <p className="text-xs text-red-600">{testResult.data.featureRequests.error}</p>
                  )}
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium">Bookings</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{testResult.data.bookings?.count || 0}</p>
                  {testResult.data.bookings?.error && (
                    <p className="text-xs text-red-600">{testResult.data.bookings.error}</p>
                  )}
                </div>
              </div>
            )}

            {testResult?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                <p className="text-sm text-red-600">{testResult.error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Write Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Database Write Test
            </div>
            {getStatusBadge(writeTestResult?.success)}
          </CardTitle>
          <CardDescription>Test het schrijven van data naar de database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button onClick={runWriteTest} disabled={writeLoading}>
                {writeLoading ? "Testing..." : "Run Write Test"}
              </Button>
              {writeTestResult && (
                <span className="text-sm text-gray-600">{writeTestResult.success ? "✅ Success" : "❌ Failed"}</span>
              )}
            </div>

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

      {/* Tables Overview */}
      {testResult?.data?.tables && (
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>Overzicht van alle tabellen in de database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {testResult.data.tables.data?.map((table: any, index: number) => (
                <Badge key={index} variant="outline" className="justify-center">
                  {table.table_name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
