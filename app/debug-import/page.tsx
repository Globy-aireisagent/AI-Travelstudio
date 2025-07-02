"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle, XCircle, AlertCircle, Target, Calendar } from "lucide-react"

export default function DebugImportPage() {
  const [fixedSearch, setFixedSearch] = useState(null)
  const [isFixedSearching, setIsFixedSearching] = useState(false)
  const [bookingId, setBookingId] = useState("RRP-9481")
  const [selectedConfig, setSelectedConfig] = useState(1)

  const fixedSearchBooking = async () => {
    setIsFixedSearching(true)
    try {
      const response = await fetch("/api/fixed-booking-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingId,
          configNumber: selectedConfig,
        }),
      })
      const data = await response.json()
      setFixedSearch(data)
    } catch (error) {
      setFixedSearch({ success: false, error: error.message })
    } finally {
      setIsFixedSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fixed Booking Search</h1>
          <p className="text-gray-600">Aangepaste zoekstrategie voor RRP-9481</p>
        </div>

        {/* Alert about the screenshot */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <h4 className="font-medium text-green-800">✅ RRP-9481 Bestaat!</h4>
            </div>
            <p className="text-sm text-green-700">
              Je screenshot toont dat RRP-9481 wel degelijk bestaat (creation date: 25/06/2025). Onze vorige
              zoekstrategie was verkeerd - we gaan nu zoeken met de juiste datum ranges en parameters.
            </p>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuratie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Booking ID:</label>
                <Input value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="RRP-9481" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Config:</label>
                <select
                  value={selectedConfig}
                  onChange={(e) => setSelectedConfig(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={1}>Config 1</option>
                  <option value={2}>Config 2</option>
                  <option value={3}>Config 3</option>
                  <option value={4}>Config 4</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fixed Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Aangepaste Zoekstrategie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">🎯 Nieuwe Strategie:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Focus op 2025 bookings (vooral juni-december)</li>
                <li>• Zoekt met grotere batches (200 per keer)</li>
                <li>• Analyseert booking nummer ranges per datum periode</li>
                <li>• Zoekt systematisch door alle pagina's</li>
              </ul>
            </div>

            <Button onClick={fixedSearchBooking} disabled={isFixedSearching || !bookingId} className="w-full">
              {isFixedSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Zoeken met aangepaste strategie...
                </>
              ) : (
                "🎯 Start Aangepaste Zoektocht"
              )}
            </Button>

            {fixedSearch && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">🔍 Zoek Configuratie:</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      Target: {fixedSearch.bookingId} → {fixedSearch.targetNumber}
                    </p>
                    <p>
                      Config: {fixedSearch.configUsed} | Microsite: {fixedSearch.micrositeId}
                    </p>
                    <p>Strategieën geprobeerd: {fixedSearch.summary?.totalStrategiesTried}</p>
                  </div>
                </div>

                {/* Search Results per Strategy */}
                <div className="space-y-3">
                  <h4 className="font-medium">📊 Resultaten per Strategie:</h4>
                  {fixedSearch.searchResults?.map((result, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-medium">{result.strategy}</span>
                        </div>
                        {result.found ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : result.error ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>

                      <div className="text-sm space-y-1">
                        <p>Datum range: {result.dateRange}</p>
                        {result.totalBookings && <p>Totaal bookings: {result.totalBookings}</p>}
                        {result.sampleRange && (
                          <p>
                            Sample range: {result.sampleRange.min} - {result.sampleRange.max}
                          </p>
                        )}
                        {result.searchedPages > 0 && (
                          <p>
                            Doorzocht: {result.searchedPages} pagina's ({result.searchedBookings} bookings)
                          </p>
                        )}
                        {result.error && <p className="text-red-600">Error: {result.error}</p>}
                      </div>

                      {result.found && result.booking && (
                        <div className="mt-2 p-2 bg-green-50 rounded">
                          <p className="font-medium text-green-800">🎉 Booking Gevonden!</p>
                          <div className="text-sm text-green-700 space-y-1">
                            <p>ID: {result.booking.id}</p>
                            <p>Reference: {result.booking.bookingReference}</p>
                            <p>Titel: {result.booking.title}</p>
                            <p>Klant: {result.booking.client?.name}</p>
                            <p>Status: {result.booking.status}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Final Summary */}
                {fixedSearch.summary?.found ? (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <h4 className="font-medium text-green-800">🎉 Succesvol Gevonden!</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      RRP-{fixedSearch.targetNumber} gevonden met strategie: {fixedSearch.summary.foundWithStrategy}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                      <h4 className="font-medium text-orange-800">🤔 Nog Niet Gevonden</h4>
                    </div>
                    <p className="text-sm text-orange-700">
                      Mogelijk staat het in een andere microsite of hebben we andere zoekparameters nodig.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
