"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plane, Ticket, CheckCircle, XCircle, RefreshCw, Trash2 } from "lucide-react"

export default function TestTicketTransportAPI() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [ticketQuoteForm, setTicketQuoteForm] = useState({
    checkIn: "2024-06-01",
    checkOut: "2024-06-03",
    destinationId: "123",
    persons: JSON.stringify([{ name: "John", lastName: "Doe", age: 30, country: "NL" }], null, 2),
  })

  const [transportQuoteForm, setTransportQuoteForm] = useState({
    journeys: JSON.stringify(
      [
        {
          departureDate: "2024-06-01",
          departure: "AMS",
          departureType: "AIRPORT",
          arrival: "BCN",
          arrivalType: "AIRPORT",
        },
      ],
      null,
      2,
    ),
    persons: JSON.stringify([{ name: "John", lastName: "Doe", age: 30, country: "NL" }], null, 2),
    tripType: "ROUND_TRIP",
  })

  const [transportBookForm, setTransportBookForm] = useState({
    recommendationKey: "",
    externalReference: "TEST-REF-001",
    fakeBooking: true,
  })

  const [refreshForm, setRefreshForm] = useState({
    bookingReference: "",
    serviceBookingReference: "",
  })

  const testAPI = async (endpoint: string, method: string, payload?: any) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      console.log(`🧪 Testing ${method} ${endpoint}`, payload)

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        ...(payload && { body: JSON.stringify(payload) }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      setResults(data)
      console.log("✅ API test successful:", data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      console.error("❌ API test failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const testTicketQuote = () => {
    try {
      const payload = {
        ...ticketQuoteForm,
        persons: JSON.parse(ticketQuoteForm.persons),
      }
      testAPI("/api/travel-compositor/tickets/quote", "POST", payload)
    } catch (err) {
      setError("Invalid JSON in persons field")
    }
  }

  const testTransportQuote = () => {
    try {
      const payload = {
        ...transportQuoteForm,
        journeys: JSON.parse(transportQuoteForm.journeys),
        persons: JSON.parse(transportQuoteForm.persons),
      }
      testAPI("/api/travel-compositor/transports/quote", "POST", payload)
    } catch (err) {
      setError("Invalid JSON in journeys or persons field")
    }
  }

  const testTransportBook = () => {
    testAPI("/api/travel-compositor/transports/book", "POST", transportBookForm)
  }

  const testRefreshTicket = () => {
    const { bookingReference, serviceBookingReference } = refreshForm
    if (!bookingReference || !serviceBookingReference) {
      setError("Both booking reference and service booking reference are required")
      return
    }
    testAPI(`/api/travel-compositor/booking/${bookingReference}/tickets/${serviceBookingReference}/refresh`, "PUT")
  }

  const testCancelTransport = () => {
    const { bookingReference, serviceBookingReference } = refreshForm
    if (!bookingReference || !serviceBookingReference) {
      setError("Both booking reference and transport booking reference are required")
      return
    }
    testAPI(`/api/travel-compositor/booking/${bookingReference}/transports/${serviceBookingReference}/cancel`, "DELETE")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎫 Ticket & Transport API Tester</h1>
          <p className="text-gray-600">Test de nieuwe Travel Compositor ticket en transport endpoints</p>
        </div>

        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tickets" className="flex items-center space-x-2">
              <Ticket className="w-4 h-4" />
              <span>Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="transports" className="flex items-center space-x-2">
              <Plane className="w-4 h-4" />
              <span>Transports</span>
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Booking</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Management</span>
            </TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-blue-600" />
                  <span>Ticket Quote API</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkIn">Check-in Datum</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={ticketQuoteForm.checkIn}
                      onChange={(e) =>
                        setTicketQuoteForm({
                          ...ticketQuoteForm,
                          checkIn: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkOut">Check-out Datum</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={ticketQuoteForm.checkOut}
                      onChange={(e) =>
                        setTicketQuoteForm({
                          ...ticketQuoteForm,
                          checkOut: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="destinationId">Destination ID</Label>
                  <Input
                    id="destinationId"
                    value={ticketQuoteForm.destinationId}
                    onChange={(e) =>
                      setTicketQuoteForm({
                        ...ticketQuoteForm,
                        destinationId: e.target.value,
                      })
                    }
                    placeholder="bijv. 123"
                  />
                </div>

                <div>
                  <Label htmlFor="persons">Personen (JSON)</Label>
                  <Textarea
                    id="persons"
                    value={ticketQuoteForm.persons}
                    onChange={(e) =>
                      setTicketQuoteForm({
                        ...ticketQuoteForm,
                        persons: e.target.value,
                      })
                    }
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <Button onClick={testTicketQuote} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4 mr-2" />
                      Test Ticket Quote
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transports Tab */}
          <TabsContent value="transports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="w-5 h-5 text-green-600" />
                  <span>Transport Quote API</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="journeys">Journeys (JSON)</Label>
                  <Textarea
                    id="journeys"
                    value={transportQuoteForm.journeys}
                    onChange={(e) =>
                      setTransportQuoteForm({
                        ...transportQuoteForm,
                        journeys: e.target.value,
                      })
                    }
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="transport-persons">Personen (JSON)</Label>
                  <Textarea
                    id="transport-persons"
                    value={transportQuoteForm.persons}
                    onChange={(e) =>
                      setTransportQuoteForm({
                        ...transportQuoteForm,
                        persons: e.target.value,
                      })
                    }
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="tripType">Trip Type</Label>
                  <Input
                    id="tripType"
                    value={transportQuoteForm.tripType}
                    onChange={(e) =>
                      setTransportQuoteForm({
                        ...transportQuoteForm,
                        tripType: e.target.value,
                      })
                    }
                    placeholder="ROUND_TRIP, ONE_WAY, etc."
                  />
                </div>

                <Button onClick={testTransportQuote} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Plane className="w-4 h-4 mr-2" />
                      Test Transport Quote
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span>Transport Booking API</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recommendationKey">Recommendation Key</Label>
                  <Input
                    id="recommendationKey"
                    value={transportBookForm.recommendationKey}
                    onChange={(e) =>
                      setTransportBookForm({
                        ...transportBookForm,
                        recommendationKey: e.target.value,
                      })
                    }
                    placeholder="Krijg je van transport quote API"
                  />
                </div>

                <div>
                  <Label htmlFor="externalReference">External Reference</Label>
                  <Input
                    id="externalReference"
                    value={transportBookForm.externalReference}
                    onChange={(e) =>
                      setTransportBookForm({
                        ...transportBookForm,
                        externalReference: e.target.value,
                      })
                    }
                    placeholder="bijv. TEST-REF-001"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fakeBooking"
                    checked={transportBookForm.fakeBooking}
                    onChange={(e) =>
                      setTransportBookForm({
                        ...transportBookForm,
                        fakeBooking: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="fakeBooking">Fake Booking (Test Mode)</Label>
                </div>

                <Button onClick={testTransportBook} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Book Transport
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                    <span>Refresh Services</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bookingRef">Booking Reference</Label>
                    <Input
                      id="bookingRef"
                      value={refreshForm.bookingReference}
                      onChange={(e) =>
                        setRefreshForm({
                          ...refreshForm,
                          bookingReference: e.target.value,
                        })
                      }
                      placeholder="bijv. BOOK-123"
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceRef">Service Booking Reference</Label>
                    <Input
                      id="serviceRef"
                      value={refreshForm.serviceBookingReference}
                      onChange={(e) =>
                        setRefreshForm({
                          ...refreshForm,
                          serviceBookingReference: e.target.value,
                        })
                      }
                      placeholder="bijv. TICKET-456 of TRANSPORT-789"
                    />
                  </div>

                  <Button onClick={testRefreshTicket} disabled={loading} className="w-full" variant="outline">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Ticket
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <span>Cancel Services</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Booking Reference</Label>
                    <Input
                      value={refreshForm.bookingReference}
                      onChange={(e) =>
                        setRefreshForm({
                          ...refreshForm,
                          bookingReference: e.target.value,
                        })
                      }
                      placeholder="bijv. BOOK-123"
                    />
                  </div>

                  <div>
                    <Label>Transport Booking Reference</Label>
                    <Input
                      value={refreshForm.serviceBookingReference}
                      onChange={(e) =>
                        setRefreshForm({
                          ...refreshForm,
                          serviceBookingReference: e.target.value,
                        })
                      }
                      placeholder="bijv. TRANSPORT-789"
                    />
                  </div>

                  <Button onClick={testCancelTransport} disabled={loading} className="w-full" variant="destructive">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancel Transport
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Results Section */}
        {(results || error) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {error ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <span>Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="border-red-500 bg-red-50">
                  <XCircle className="w-4 h-4" />
                  <AlertDescription className="text-red-800">
                    <strong>Error:</strong> {error}
                  </AlertDescription>
                </Alert>
              )}

              {results && (
                <div className="space-y-4">
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription className="text-green-800">
                      <strong>Success!</strong> API call completed successfully.
                    </AlertDescription>
                  </Alert>

                  {results.summary && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
                      <pre className="text-sm text-blue-800 whitespace-pre-wrap">
                        {JSON.stringify(results.summary, null, 2)}
                      </pre>
                    </div>
                  )}

                  <details className="bg-gray-50 border border-gray-200 rounded-lg">
                    <summary className="p-4 cursor-pointer font-medium">Full Response Data</summary>
                    <div className="p-4 border-t border-gray-200">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                        {JSON.stringify(results, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* API Documentation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📚 API Endpoints Overzicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🎫 Ticket Endpoints</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• POST /api/travel-compositor/tickets/quote</li>
                  <li>• POST /api/travel-compositor/tickets/quote</li>
                  <li>• PUT /api/travel-compositor/booking/bookingReference/tickets/serviceBookingReference/refresh</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">✈️ Transport Endpoints</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• POST /api/travel-compositor/transports/quote</li>
                  <li>• POST /api/travel-compositor/transports/prebook</li>
                  <li>• POST /api/travel-compositor/transports/book</li>
                  <li>• POST /api/travel-compositor/transports/confirm</li>
                  <li>
                    • DELETE /api/travel-compositor/booking/bookingReference/transports/serviceBookingReference/cancel
                  </li>
                  <li>
                    • PUT /api/travel-compositor/booking/bookingReference/transports/serviceBookingReference/refresh
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
