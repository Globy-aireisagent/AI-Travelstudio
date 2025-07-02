"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Users, Plane, Hotel, Camera, FileText, Edit, Download, Share, ArrowLeft } from "lucide-react"
import { EnhancedHotelCard } from "@/components/enhanced-hotel-card"

interface ImportedBooking {
  id: string
  bookingReference: string
  title: string
  client: {
    name: string
    email: string
    phone: string
  }
  destination: string
  startDate: string
  endDate: string
  status: string
  totalPrice: number
  currency: string
  accommodations: any[]
  activities: any[]
  transports: any[]
  vouchers: any[]
  searchMethod?: string
  originalBookingId?: string
  cleanedBookingId?: string
}

export default function WerkbladPage() {
  const [booking, setBooking] = useState<ImportedBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search)
    const bookingParam = urlParams.get("booking")

    if (bookingParam) {
      // Fetch booking data from API
      fetchBookingData(bookingParam)
    } else {
      // Fallback to localStorage
      const savedBooking = localStorage.getItem("importedBooking")
      console.log("🔍 Raw localStorage data:", savedBooking)

      if (savedBooking && savedBooking !== "undefined") {
        try {
          const bookingData = JSON.parse(savedBooking)
          console.log("📋 Parsed booking data:", bookingData)

          // Validate booking data structure
          if (bookingData && typeof bookingData === "object") {
            // Ensure arrays exist with defaults
            const validatedBooking = {
              ...bookingData,
              accommodations: bookingData.accommodations || [],
              activities: bookingData.activities || [],
              transports: bookingData.transports || [],
              vouchers: bookingData.vouchers || [],
              destinations: bookingData.destinations || [],
              client: bookingData.client || {
                name: "Onbekend",
                email: "",
                phone: "",
                company: "",
              },
            }
            setBooking(validatedBooking)
          } else {
            setError("Ongeldige booking data structuur")
          }
        } catch (error) {
          console.error("❌ Failed to parse booking data:", error)
          setError("Fout bij het laden van booking data")
        }
      } else {
        console.log("❌ No booking data found in localStorage")
        setError("Geen booking data gevonden")
      }
    }
    setLoading(false)
  }, [])

  const fetchBookingData = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/backend/remote/booking/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "view",
          booking_id: bookingId,
        }),
      })
      const data = await response.json()
      if (data.success && data.booking) {
        setBooking(data.booking)
      }
    } catch (error) {
      console.error("Failed to fetch booking data:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Werkblad laden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Fout bij laden</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/import">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Import
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Geen reisgegevens gevonden</h1>
          <p className="text-gray-600 mb-6">Er zijn geen geïmporteerde reisgegevens beschikbaar.</p>
          <Link href="/import">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Import
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Onbekend"
    return new Date(dateString).toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDuration = () => {
    if (!booking.startDate || !booking.endDate) return "Onbekend"
    const start = new Date(booking.startDate)
    const end = new Date(booking.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} dagen`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Reis Werkblad
                </h1>
                <p className="text-sm text-gray-600">
                  {booking.originalBookingId} • Geïmporteerd via {booking.searchMethod}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="hidden md:flex">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" className="hidden md:flex">
                <Share className="w-4 h-4 mr-2" />
                Delen
              </Button>
              <Link href="/import">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Nieuwe Import
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Booking Overview */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{booking.title}</CardTitle>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {booking.destination}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {getDuration()}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {booking.client.name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {booking.totalPrice ? `€${booking.totalPrice.toLocaleString()}` : "Prijs op aanvraag"}
                </div>
                <Badge className="bg-white/20 text-white mt-2">{booking.status}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Reisperiode</h3>
                <p className="text-sm text-gray-600">
                  <strong>Vertrek:</strong> {formatDate(booking.startDate)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Terugkeer:</strong> {formatDate(booking.endDate)}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Klantgegevens</h3>
                <p className="text-sm text-gray-600">
                  <strong>Naam:</strong> {booking.client.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {booking.client.email || "Niet beschikbaar"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Telefoon:</strong> {booking.client.phone || "Niet beschikbaar"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Booking Details</h3>
                <p className="text-sm text-gray-600">
                  <strong>Referentie:</strong> {booking.bookingReference}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> {booking.status}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Valuta:</strong> {booking.currency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Tabs */}
        <Tabs defaultValue="hotels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="hotels" className="flex items-center space-x-2">
              <Hotel className="h-4 w-4" />
              <span>Hotels ({(booking?.accommodations || []).length})</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Activiteiten ({(booking?.activities || []).length})</span>
            </TabsTrigger>
            <TabsTrigger value="transport" className="flex items-center space-x-2">
              <Plane className="h-4 w-4" />
              <span>Transport ({(booking?.transports || []).length})</span>
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Vouchers ({(booking?.vouchers || []).length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Hotels Tab */}
          <TabsContent value="hotels" className="space-y-4">
            {booking.accommodations.length > 0 ? (
              booking.accommodations.map((hotel, index) => (
                <EnhancedHotelCard key={hotel.id || index} hotel={hotel} index={index} />
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen hotels gevonden in deze booking</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            {booking.activities.length > 0 ? (
              booking.activities.map((activity, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <img
                          src={`/placeholder_image.png?height=200&width=300&text=${encodeURIComponent(activity.name || `Activiteit ${index + 1}`)}`}
                          alt={activity.name || `Activiteit ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              {activity.name || activity.title || `Activiteit ${index + 1}`}
                            </h3>
                            <div className="flex items-center mt-1">
                              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-gray-600">
                                {activity.location || activity.destination || "Locatie onbekend"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {activity.price && (
                              <div className="text-lg font-bold text-green-600">€{activity.price.toLocaleString()}</div>
                            )}
                            <Badge className="mt-1">{activity.type || "Activiteit"}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Datum:</strong> {formatDate(activity.date || activity.startDate)}
                          </div>
                          <div>
                            <strong>Tijd:</strong> {activity.time || activity.startTime || "Hele dag"}
                          </div>
                          <div>
                            <strong>Duur:</strong> {activity.duration || "Onbekend"}
                          </div>
                          <div>
                            <strong>Deelnemers:</strong> {activity.participants || activity.pax || "Alle reizigers"}
                          </div>
                        </div>
                        {activity.description && <p className="text-gray-600 mt-4 text-sm">{activity.description}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen activiteiten gevonden in deze booking</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport" className="space-y-4">
            {booking.transports.length > 0 ? (
              booking.transports.map((transport, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {transport.type || "Transport"} {transport.flightNumber && `- ${transport.flightNumber}`}
                        </h3>
                        <div className="flex items-center mt-2 space-x-4">
                          <div className="flex items-center">
                            <Plane className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-600">
                              {transport.departure || transport.from} → {transport.arrival || transport.to}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {transport.price && (
                          <div className="text-lg font-bold text-purple-600">€{transport.price.toLocaleString()}</div>
                        )}
                        <Badge className="mt-1">{transport.class || "Economy"}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Vertrek:</strong> {formatDate(transport.departureDate || transport.date)}
                        <br />
                        <strong>Tijd:</strong> {transport.departureTime || "Onbekend"}
                      </div>
                      <div>
                        <strong>Aankomst:</strong> {formatDate(transport.arrivalDate || transport.date)}
                        <br />
                        <strong>Tijd:</strong> {transport.arrivalTime || "Onbekend"}
                      </div>
                      <div>
                        <strong>Maatschappij:</strong> {transport.airline || transport.company || "Onbekend"}
                        <br />
                        <strong>Duur:</strong> {transport.duration || "Onbekend"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen transport gevonden in deze booking</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Vouchers Tab */}
          <TabsContent value="vouchers" className="space-y-4">
            {booking.vouchers.length > 0 ? (
              booking.vouchers.map((voucher, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {voucher.name || voucher.title || `Voucher ${index + 1}`}
                        </h3>
                        <p className="text-gray-600 mt-1">{voucher.description || "Geen beschrijving beschikbaar"}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          <strong>Type:</strong> {voucher.type || "Document"}
                        </div>
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen vouchers gevonden in deze booking</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button variant="outline" className="flex items-center">
            <Edit className="w-4 h-4 mr-2" />
            Bewerken
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Exporteer als PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
