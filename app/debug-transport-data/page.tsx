"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugTransportDataPage() {
  const [bookingId, setBookingId] = useState("RRP-9263")
  const [config, setConfig] = useState("1")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const debugBooking = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/simple-booking-debug?bookingId=${bookingId}&config=${config}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">🔍 Simple Transport Debug</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Booking ID (bijv. RRP-9263)"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="flex-1"
            />
            <select value={config} onChange={(e) => setConfig(e.target.value)} className="px-3 py-2 border rounded-md">
              <option value="1">Config 1</option>
              <option value="2">Config 2</option>
              <option value="3">Config 3</option>
              <option value="4">Config 4</option>
            </select>
            <Button onClick={debugBooking} disabled={loading}>
              {loading ? "Loading..." : "Debug"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? "✅ Success" : "❌ Error"}
              {result.success && <Badge variant="outline">{result.transports?.length || 0} transports found</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">📋 Booking Info</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm">
                      <p>
                        <strong>ID:</strong> {result.booking.id}
                      </p>
                      <p>
                        <strong>Reference:</strong> {result.booking.reference}
                      </p>
                      <p>
                        <strong>Title:</strong> {result.booking.title}
                      </p>
                      <p>
                        <strong>Status:</strong> {result.booking.status}
                      </p>
                      <p>
                        <strong>Dates:</strong> {result.booking.startDate} → {result.booking.endDate}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">🔍 Debug Info</h3>
                    <div className="bg-blue-50 p-4 rounded-lg text-sm">
                      <p>
                        <strong>Config:</strong> {result.configId}
                      </p>
                      <p>
                        <strong>Microsite:</strong> {result.micrositeId}
                      </p>
                      <p>
                        <strong>Transport Source:</strong> {result.debug.foundLocation}
                      </p>
                      <p>
                        <strong>Transport Count:</strong> {result.debug.transportCount}
                      </p>
                      <p>
                        <strong>Available Locations:</strong> {result.debug.transportLocations.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transport Details */}
                {result.transports && result.transports.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">✈️ Transport Services</h3>
                    {result.transports.map((transport: any, index: number) => (
                      <div key={index} className="bg-green-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium mb-2">
                          Transport {transport.index}: {transport.departureAirport} → {transport.arrivalAirport}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p>
                              <strong>ID:</strong> {transport.id}
                            </p>
                            <p>
                              <strong>Departure:</strong> {transport.departureAirport} at {transport.departureDate}
                            </p>
                            <p>
                              <strong>Arrival:</strong> {transport.arrivalAirport} at {transport.arrivalDate}
                            </p>
                            <p>
                              <strong>Provider:</strong> {transport.provider}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Status:</strong> {transport.status}
                            </p>
                            <p>
                              <strong>Segments:</strong> {transport.segments}
                            </p>
                            <p>
                              <strong>Price:</strong>{" "}
                              {transport.price
                                ? `€${transport.price.amount} ${transport.price.currency}`
                                : "No price data"}
                            </p>
                          </div>
                        </div>

                        {/* Segment Details */}
                        {transport.segmentDetails && transport.segmentDetails.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Flight Segments:</h5>
                            <div className="space-y-2">
                              {transport.segmentDetails.map((segment: any, segIndex: number) => (
                                <div key={segIndex} className="bg-white p-3 rounded border text-sm">
                                  <p>
                                    <strong>Segment {segIndex + 1}:</strong> {segment.from} → {segment.to}
                                  </p>
                                  <p>
                                    <strong>Flight:</strong> {segment.flight}
                                  </p>
                                  <p>
                                    <strong>Times:</strong> {segment.departure} → {segment.arrival}
                                  </p>
                                  <p>
                                    <strong>Duration:</strong> {segment.duration} minutes
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Raw Data */}
                <details>
                  <summary className="font-semibold cursor-pointer">🔧 Raw Transport Data</summary>
                  <pre className="bg-gray-100 p-4 rounded-lg mt-2 text-xs overflow-auto max-h-96">
                    {JSON.stringify(result.rawFirstTransport, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-700">
                  <strong>Error:</strong> {result.error}
                </p>
                {result.url && (
                  <p className="text-sm mt-2">
                    <strong>URL:</strong> {result.url}
                  </p>
                )}
                {result.status && (
                  <p className="text-sm">
                    <strong>Status:</strong> {result.status}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
