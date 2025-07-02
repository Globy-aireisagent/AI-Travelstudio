"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestEndpointsPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testEndpoint = async (endpoint: string, method = "GET", body?: any) => {
    setLoading(true)
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(endpoint, options)
      const data = await response.json()

      setResults({
        endpoint,
        status: response.status,
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString(),
      })
    } catch (error) {
      setResults({
        endpoint,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toLocaleTimeString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">🧪 API Endpoint Tester</h1>
          <Badge className="bg-green-100 text-green-700 px-4 py-2">
            Testing op: {typeof window !== "undefined" ? window.location.origin : "Server"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>🔐 Authenticated Search</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => testEndpoint("/api/authenticated-booking-search?bookingId=RRP-9263")}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Test Authenticated Search
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚡ Fast Lookup</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() =>
                  testEndpoint("/api/fast-booking-lookup", "POST", {
                    bookingId: "RRP-9263",
                    micrositeId: null,
                  })
                }
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Test Fast Lookup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📋 Import Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() =>
                  testEndpoint("/api/import-booking", "POST", {
                    bookingId: "RRP-9263",
                    micrositeId: null,
                  })
                }
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                Test Import Booking
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🌍 Get Microsites</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => testEndpoint("/api/get-microsites")}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Test Get Microsites
              </Button>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Testing endpoint...</p>
            </CardContent>
          </Card>
        )}

        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Test Results
                <Badge className={results.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {results.success ? "SUCCESS" : "FAILED"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <strong>Endpoint:</strong> {results.endpoint}
                </div>
                <div>
                  <strong>Status:</strong> {results.status}
                </div>
                <div>
                  <strong>Time:</strong> {results.timestamp}
                </div>
                <div>
                  <strong>Response:</strong>
                  <pre className="bg-gray-100 p-4 rounded-lg mt-2 overflow-auto text-sm">
                    {JSON.stringify(results.data || results.error, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Belangrijk:</h3>
          <p className="text-yellow-700">
            Deze test pagina werkt alleen op <strong>jouw eigen app</strong> (localhost:3000), niet op AI-Travel
            Studio's website!
          </p>
        </div>
      </div>
    </div>
  )
}
