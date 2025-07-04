"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface DebugResult {
  config: string
  micrositeId: string
  authStatus: string
  bookingFound: string
  bookingData: any
  error: string | null
}

export default function DebugConnectionPage() {
  const [bookingId, setBookingId] = useState("RRP-9263")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<DebugResult[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [lastTest, setLastTest] = useState<string>("")

  const testConnection = async () => {
    setIsLoading(true)
    setResults([])
    setSummary(null)

    try {
      console.log(`🔍 Testing connection for booking: ${bookingId}`)

      const response = await fetch(`/api/debug-booking-status?bookingId=${encodeURIComponent(bookingId)}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        setSummary(data.summary)
        setLastTest(data.timestamp)
        console.log("✅ Debug test completed:", data)
      } else {
        console.error("❌ Debug test failed:", data.error)
        alert(`Debug test failed: ${data.error}`)
      }
    } catch (error) {
      console.error("❌ Debug connection error:", error)
      alert(`Connection error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearCache = async () => {
    try {
      console.log("🧹 Clearing authentication cache...")

      const response = await fetch("/api/clear-auth-cache", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        alert("✅ Cache cleared successfully!")
        console.log("✅ Cache cleared:", data)
      } else {
        alert(`❌ Cache clear failed: ${data.error}`)
      }
    } catch (error) {
      console.error("❌ Clear cache error:", error)
      alert(`Clear cache error: ${error}`)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status.includes("✅")) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status.includes("❌")) return <XCircle className="h-4 w-4 text-red-500" />
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  }

  const getStatusColor = (status: string) => {
    if (status.includes("✅")) return "bg-green-100 text-green-800"
    if (status.includes("❌")) return "bg-red-100 text-red-800"
    return "bg-yellow-100 text-yellow-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🔧 Connection Debug Tool
          </h1>
          <p className="text-gray-600">Test Travel Compositor connections and booking lookups</p>
        </div>

        {/* Test Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2" />
              Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking ID to Test:</label>
                <Input
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="RRP-9263, RRP-9488, etc."
                  className="text-lg"
                />
              </div>
              <Button
                onClick={testConnection}
                disabled={isLoading || !bookingId.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              <Button onClick={clearCache} variant="outline" className="px-6 py-3 bg-transparent">
                🧹 Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📊 Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{summary.totalConfigs}</div>
                  <div className="text-sm text-gray-600">Total Configs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{summary.workingConfigs}</div>
                  <div className="text-sm text-gray-600">Working Configs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{summary.foundBooking}</div>
                  <div className="text-sm text-gray-600">Found Booking</div>
                </div>
              </div>
              {lastTest && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Last tested: {new Date(lastTest).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">🔍 Detailed Results</h2>

            {results.map((result, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{result.config}</span>
                    <Badge variant="outline" className="text-xs">
                      {result.micrositeId}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.authStatus)}
                          <Badge className={getStatusColor(result.authStatus)}>Auth: {result.authStatus}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.bookingFound)}
                          <Badge className={getStatusColor(result.bookingFound)}>Booking: {result.bookingFound}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Booking Data */}
                    <div>
                      <h4 className="font-medium mb-2">Booking Data</h4>
                      {result.bookingData ? (
                        <div className="bg-green-50 p-3 rounded-lg text-sm">
                          <div>
                            <strong>ID:</strong> {result.bookingData.id}
                          </div>
                          <div>
                            <strong>Title:</strong> {result.bookingData.title}
                          </div>
                          <div>
                            <strong>Client:</strong> {result.bookingData.client}
                          </div>
                        </div>
                      ) : result.error ? (
                        <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700">
                          <strong>Error:</strong> {result.error}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">No booking data found</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={() => window.open("/import", "_blank")} variant="outline" className="w-full">
                🔄 Go to Import Page
              </Button>
              <Button onClick={() => window.open("/werkblad", "_blank")} variant="outline" className="w-full">
                📋 Go to Werkblad
              </Button>
              <Button onClick={() => window.open("/agent-dashboard", "_blank")} variant="outline" className="w-full">
                🏠 Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
