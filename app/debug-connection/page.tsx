"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, Trash2 } from "lucide-react"

interface TestResult {
  config: string
  micrositeId: string
  authStatus: string
  bookingFound: string
  bookingData?: any
  error?: string
}

interface TestSummary {
  totalConfigs: number
  workingConfigs: number
  foundBooking: number
}

export default function DebugConnectionPage() {
  const [bookingId, setBookingId] = useState("RRP-9571")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [summary, setSummary] = useState<TestSummary | null>(null)
  const [lastTested, setLastTested] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)
    setResults([])
    setSummary(null)

    try {
      const response = await fetch(`/api/debug-booking-status?bookingId=${encodeURIComponent(bookingId)}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setResults(data.results || [])
        setSummary(data.summary || null)
        setLastTested(new Date().toLocaleString())
      } else {
        setError(data.error || "Unknown error occurred")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const clearCache = async () => {
    try {
      const response = await fetch("/api/clear-auth-cache", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        alert("Cache cleared successfully!")
      } else {
        alert("Failed to clear cache: " + data.error)
      }
    } catch (err) {
      alert("Error clearing cache: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }

  const quickTest = (id: string) => {
    setBookingId(id)
    setTimeout(() => testConnection(), 100)
  }

  const getStatusIcon = (status: string) => {
    if (status.includes("SUCCESS") || status.includes("FOUND")) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else if (status.includes("ERROR") || status.includes("NOT FOUND")) {
      return <XCircle className="h-4 w-4 text-red-600" />
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    if (status.includes("SUCCESS") || status.includes("FOUND")) {
      return "bg-green-100 text-green-800"
    } else if (status.includes("ERROR") || status.includes("NOT FOUND")) {
      return "bg-red-100 text-red-800"
    } else {
      return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">🔧 Connection Debug Tool</h1>
          <p className="text-gray-600">Test Travel Compositor connections and booking lookups</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-2">
                Booking ID to Test:
              </label>
              <div className="flex gap-2">
                <Input
                  id="bookingId"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Enter booking ID (e.g., RRP-9571)"
                  className="flex-1"
                />
                <Button onClick={testConnection} disabled={isLoading} className="min-w-[140px]">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
                <Button onClick={clearCache} variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cache
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick test:</label>
              <div className="flex gap-2 flex-wrap">
                {["RRP-9571", "RRP-9263", "RRP-7291", "RRP-7288"].map((id) => (
                  <Button key={id} variant="outline" size="sm" onClick={() => quickTest(id)} disabled={isLoading}>
                    {id}
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-800 font-medium">Error: {error}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">📊 Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{summary.totalConfigs}</div>
                  <div className="text-sm text-gray-600">Total Configs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{summary.workingConfigs}</div>
                  <div className="text-sm text-gray-600">Working Configs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{summary.foundBooking}</div>
                  <div className="text-sm text-gray-600">Found Booking</div>
                </div>
              </div>
              {lastTested && <div className="text-center text-sm text-gray-500 mt-4">Last tested: {lastTested}</div>}
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🔍 Detailed Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{result.config}</h3>
                    <span className="text-sm text-gray-500">{result.micrositeId}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.authStatus)}
                          <span className="text-sm">Auth:</span>
                          <Badge className={getStatusColor(result.authStatus)}>
                            {result.authStatus.replace("✅ ", "").replace("❌ ", "")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.bookingFound)}
                          <span className="text-sm">Booking:</span>
                          <Badge className={getStatusColor(result.bookingFound)}>
                            {result.bookingFound.replace("✅ ", "").replace("❌ ", "")}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Details</h4>
                      {result.bookingData ? (
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>ID:</strong> {result.bookingData.id}
                          </div>
                          <div>
                            <strong>Title:</strong> {result.bookingData.title}
                          </div>
                          <div>
                            <strong>Client:</strong> {result.bookingData.client}
                          </div>
                          <div>
                            <strong>Status:</strong> {result.bookingData.status}
                          </div>
                        </div>
                      ) : result.error ? (
                        <div className="text-sm text-red-600">{result.error}</div>
                      ) : (
                        <div className="text-sm text-gray-500">Real API test completed</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🚀 Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-12 bg-transparent"
                onClick={() => (window.location.href = "/import")}
              >
                📋 Go to Import Page
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-transparent"
                onClick={() => (window.location.href = "/werkblad")}
              >
                📄 Go to Werkblad
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-transparent"
                onClick={() => (window.location.href = "/dashboard")}
              >
                🏠 Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
