"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, CheckCircle, XCircle, ArrowRight } from "lucide-react"

export default function TestImportFixPage() {
  const [bookingId, setBookingId] = useState("RRP-9263")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const testImport = async () => {
    setIsLoading(true)
    setResult(null)
    setError("")

    try {
      console.log(`📋 Testing import for booking: ${bookingId}`)

      const response = await fetch(`/api/fix-import-page?bookingId=${encodeURIComponent(bookingId)}`)
      const data = await response.json()

      if (data.success) {
        setResult(data)
        console.log("✅ Import test successful:", data)
      } else {
        setError(data.error || "Import failed")
        console.error("❌ Import test failed:", data.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(errorMessage)
      console.error("❌ Import test error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const goToRoadbook = () => {
    if (result?.booking?.id) {
      window.open(`/roadbook/${result.booking.id}`, "_blank")
    }
  }

  const quickTestIds = ["RRP-9263", "RRP-9571", "RRP-7291", "RRP-7288"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            📋 Test Import Fix
          </h1>
          <p className="text-gray-600">Test the fixed import functionality</p>
        </div>

        {/* Test Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Import Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking ID to Import:</label>
                  <Input
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="RRP-9263, RRP-9571, etc."
                    className="text-lg"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={testImport}
                  disabled={isLoading || !bookingId.trim()}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Test Import
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Test Buttons */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-gray-600 mr-2">Quick test:</span>
                {quickTestIds.map((id) => (
                  <Button
                    key={id}
                    variant="outline"
                    size="sm"
                    onClick={() => setBookingId(id)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {id}
                  </Button>
                ))}
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Error: {error}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Success Result */}
        {result && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                Import Successful!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Import Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">Import Details</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <strong>Source:</strong> {result.source}
                      </div>
                      <div>
                        <strong>Microsite:</strong> {result.micrositeId}
                      </div>
                      <div>
                        <strong>Imported:</strong> {new Date(result.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">Booking Info</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <strong>ID:</strong> {result.booking.id}
                      </div>
                      <div>
                        <strong>Reference:</strong> {result.booking.bookingReference}
                      </div>
                      <div>
                        <strong>Status:</strong> <Badge variant="outline">{result.booking.status}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium mb-3">{result.booking.title}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Client:</strong> {result.booking.client.name}
                      <br />
                      <strong>Email:</strong> {result.booking.client.email}
                    </div>
                    <div>
                      <strong>Period:</strong> {result.booking.period.duration} days
                      <br />
                      <strong>Dates:</strong> {result.booking.period.startDate} - {result.booking.period.endDate}
                    </div>
                    <div>
                      <strong>Services:</strong>
                      <br />🏨 {result.booking.hotels} hotels, 🚗 {result.booking.transports} transports, 🚙{" "}
                      {result.booking.cars} cars
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  <Button onClick={goToRoadbook} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3">
                    View Roadbook
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>🛠️ How to Fix Import Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                <strong>1. Test hier eerst:</strong> Controleer of de import API werkt
              </p>
              <p>
                <strong>2. Als het werkt:</strong> Ga naar <code>/import</code> en test daar
              </p>
              <p>
                <strong>3. Als import pagina nog niet werkt:</strong> We moeten de import component updaten
              </p>
              <p>
                <strong>4. Success:</strong> Booking wordt geïmporteerd en roadbook wordt getoond
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
