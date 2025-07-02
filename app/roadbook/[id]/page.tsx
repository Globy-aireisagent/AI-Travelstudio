"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  MapPin,
  Hotel,
  Plane,
  Users,
  Phone,
  Mail,
  Download,
  Share2,
  Edit,
  Navigation,
  Building,
  Car,
  AlertCircle,
  Bug,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import TransportCard from "@/components/transport-card"
import { EnhancedHotelCard } from "@/components/enhanced-hotel-card"
import { DestinationService } from "@/lib/destination-service"
import { VoucherService, type VoucherData } from "@/lib/voucher-service"

interface RealContent {
  destinations: Array<{
    name: string
    realDescription: string | null
    realImages: string[]
    realFacilities: string[]
    realAttractions: string[]
  }>
  hotels: Array<{
    bookingHotel: any
    realContent: {
      description: string | null
      images: string[]
      facilities: string[]
      themes: string[]
      giataId?: string
      stars?: number
    } | null
    error?: string
  }>
  bookingImages: string[]
}

interface RoadbookData {
  id: string
  title: string
  client: {
    name: string
    email?: string
    phone?: string
    company?: string
  }
  period: {
    startDate: string
    endDate: string
    duration: number
  }
  destinations: Array<{
    name: string
    description?: string
    images: string[]
    highlights?: string[]
  }>
  hotels: Array<{
    name: string
    location: string
    checkIn: string
    checkOut: string
    nights: number
    stars?: number
    roomType?: string
    mealPlan?: string
    images: string[]
    address?: string
    phone?: string
    category?: string
    provider?: string
    description?: string
    facilities?: string[]
    voucherUrl?: string
    hotelId?: string
    id?: string
  }>
  transports: Array<{
    type: string
    route: string
    departure: string
    arrival: string
    details?: string
    flightNumber?: string
    voucherUrl?: string
  }>
  tripType?: string
  status?: string
  allImages: string[]
}

export default function RoadbookPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<RoadbookData | null>(null)
  const [realContent, setRealContent] = useState<RealContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [debugData, setDebugData] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({})
  const [vouchers, setVouchers] = useState<VoucherData[]>([])
  const [vouchersLoading, setVouchersLoading] = useState(true)

  useEffect(() => {
    const loadRoadbook = async () => {
      try {
        setLoading(true)

        // Try to get cached data first
        const cached = localStorage.getItem(`booking-${id}`)
        const cachedReal = localStorage.getItem(`real-content-${id}`)

        if (cached && cachedReal) {
          console.log("📦 Using cached data for", id)
          const rawData = JSON.parse(cached)
          const realData = JSON.parse(cachedReal)
          setDebugData(rawData)
          setRealContent(realData)
          const transformedData = transformToRoadbook(rawData, realData)
          setData(transformedData)

          // Load vouchers and enrich destinations
          await Promise.all([loadVouchers(id), enrichDestinationsData(transformedData)])

          setLoading(false)
          return
        }

        // Fetch both booking and real content
        console.log("🌐 Fetching fresh data for", id)

        const [bookingResponse, contentResponse] = await Promise.all([
          fetch(`/api/travel-compositor/booking-super-fast?bookingId=${id}&config=1&optimized=true`),
          fetch(`/api/travel-compositor/get-real-content?bookingId=${id}&config=1`),
        ])

        const bookingResult = await bookingResponse.json()
        const contentResult = await contentResponse.json()

        console.log("📊 API Responses:", { booking: bookingResult.success, content: contentResult.success })

        if (bookingResult.success && contentResult.success) {
          setDebugData(bookingResult.booking)
          setRealContent(contentResult.realContent)

          const transformedData = transformToRoadbook(bookingResult.booking, contentResult.realContent)
          setData(transformedData)

          localStorage.setItem(`booking-${id}`, JSON.stringify(bookingResult.booking))
          localStorage.setItem(`real-content-${id}`, JSON.stringify(contentResult.realContent))

          // Load vouchers and enrich destinations
          await Promise.all([loadVouchers(id), enrichDestinationsData(transformedData)])
        } else {
          console.error("❌ API Error:", { booking: bookingResult, content: contentResult })
          setError(bookingResult.error || contentResult.error || "Data niet gevonden")
        }
      } catch (e: any) {
        console.error("❌ Load Error:", e)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) loadRoadbook()
  }, [id])

  const transformToRoadbook = (rawData: any, realContent: RealContent): RoadbookData => {
    console.log("🔄 Starting transformation with REAL content")

    const deepData = rawData.rawData || rawData
    const hotelServices = deepData.hotelservice || deepData.services?.hotels || []

    // Transform destinations with REAL content
    const destinations = realContent.destinations.map((dest) => ({
      name: dest.name,
      description: dest.realDescription, // REAL description from Travel Compositor
      images: dest.realImages, // REAL images from Travel Compositor
      highlights: dest.realAttractions, // REAL attractions from Travel Compositor
    }))

    // Transform hotels with REAL content
    const hotels = hotelServices.map((h: any, index: number) => {
      const realHotel = realContent.hotels.find((rh) => rh.bookingHotel.hotelId === (h.hotelId || h.providerHotelId))

      let stars = 0
      if (h.category) {
        if (h.category.startsWith("S")) {
          stars = Number.parseInt(h.category.replace("S", "")) || 0
        } else if (h.category.startsWith("L")) {
          stars = Number.parseInt(h.category.replace("L", "")) || 0
        }
      }

      return {
        name: h.hotelName || h.name || "Hotel",
        location: h.locationName || h.location || h.destinationName || h.city || "Onbekend",
        checkIn: h.startDate || h.checkInDate,
        checkOut: h.endDate || h.checkOutDate,
        nights: h.nights || 1,
        stars: realHotel?.realContent?.stars || stars,
        roomType: h.room?.[0]?.roomType || h.room?.[0]?.roomTypeDescription || h.roomType || "Standaard kamer",
        mealPlan:
          h.mealPlan === "BB" ? "Ontbijt" : h.mealPlan === "RO" ? "Alleen kamer" : h.mealPlan || "Geen maaltijden",
        images: realHotel?.realContent?.images || [], // REAL images from Travel Compositor
        address: realHotel?.realContent?.address || h.hotelData?.address || h.address,
        phone: h.hotelData?.phoneNumber || h.phone,
        category: h.category,
        provider: h.providerDescription || h.provider,
        description: realHotel?.realContent?.description, // REAL description from Travel Compositor
        facilities: realHotel?.realContent?.facilities || [], // REAL facilities from Travel Compositor
        voucherUrl: h.voucherUrl,
        hotelId: h.hotelId || h.id,
        id: h.hotelId || h.id,
      }
    })

    // Transform transports - check multiple possible locations
    const transportServices =
      deepData.transportservice ||
      deepData.services?.transports ||
      deepData.transports ||
      rawData.transportservice ||
      rawData.transports ||
      []

    console.log("🚀 Transport data check:", {
      transportservice: deepData.transportservice,
      servicesTransports: deepData.services?.transports,
      transports: deepData.transports,
      rawTransportservice: rawData.transportservice,
      rawTransports: rawData.transports,
      allKeys: Object.keys(deepData),
    })

    // Transform transports (remove prices)
    const transports = transportServices.map((t: any) => ({
      type: t.transportType || t.type || "Transport",
      route: `${t.departureAirport || t.departure || "Vertrek"} → ${t.arrivalAirport || t.arrival || "Aankomst"}`,
      departure: t.startDate || t.departureDate,
      arrival: t.endDate || t.arrivalDate,
      details: t.operatorProvider || t.airline || t.operator || t.details,
      flightNumber: t.flightNumber,
      voucherUrl: t.voucherUrl,
    }))

    // Calculate duration
    let duration = 0
    if (deepData.nightsCount) {
      duration = deepData.nightsCount
    } else if (deepData.startDate && deepData.endDate) {
      const start = new Date(deepData.startDate)
      const end = new Date(deepData.endDate)
      duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    } else {
      duration = hotels.reduce((sum, h) => sum + h.nights, 0)
    }

    // Extract client info
    const contactPerson = deepData.contactPerson || deepData.client
    const user = deepData.user

    const result = {
      id: deepData.bookingReference || deepData.id || id,
      title:
        deepData.title ||
        `${deepData.bookingReference || deepData.id || id} - ${
          destinations
            .slice(0, 2)
            .map((d) => d.name)
            .join(" & ") || "Reis"
        }`,
      client: {
        name:
          contactPerson?.name && contactPerson?.lastName
            ? `${contactPerson.name} ${contactPerson.lastName}`.trim()
            : contactPerson?.name || deepData.client?.name || "Onbekend",
        email: contactPerson?.email || user?.email,
        phone: contactPerson?.phone
          ? `${contactPerson.phoneCountryCode || ""} ${contactPerson.phone}`.trim()
          : user?.telephone,
        company: user?.agency?.name || contactPerson?.company,
      },
      period: {
        startDate: deepData.startDate || "",
        endDate: deepData.endDate || "",
        duration: duration,
      },
      destinations,
      hotels,
      transports,
      tripType: deepData.tripType,
      status: deepData.status,
      allImages: realContent.bookingImages,
    }

    console.log("✅ Transformation complete with REAL content:", {
      hotels: hotels.length,
      transports: transports.length,
      destinations: destinations.length,
      duration: duration,
      clientName: result.client.name,
      title: result.title,
      totalImages: realContent.bookingImages.length,
    })

    return result
  }

  // Add these helper functions after loadRoadbook:
  const loadVouchers = async (bookingId: string) => {
    try {
      setVouchersLoading(true)
      const voucherData = await VoucherService.getBookingVouchers(bookingId)
      setVouchers(voucherData)
      console.log(`📄 Loaded ${voucherData.length} vouchers`)
    } catch (error) {
      console.error("❌ Error loading vouchers:", error)
    } finally {
      setVouchersLoading(false)
    }
  }

  const enrichDestinationsData = async (roadbookData: RoadbookData) => {
    try {
      console.log("🌍 Enriching destinations with full data")
      const enrichedDestinations = await DestinationService.enrichDestinations(roadbookData.destinations)

      // Update the data with enriched destinations
      setData((prev) =>
        prev
          ? {
              ...prev,
              destinations: enrichedDestinations,
            }
          : null,
      )

      console.log("✅ Destinations enriched")
    } catch (error) {
      console.error("❌ Error enriching destinations:", error)
    }
  }

  // Toggle description expansion
  const toggleDescription = (key: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Truncate text for preview
  const truncateText = (text: string, maxLength = 200) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Image navigation functions
  const nextImage = (hotelIndex: string) => {
    if (!data) return
    const hotel = data.hotels[Number.parseInt(hotelIndex)]
    if (!hotel || hotel.images.length === 0) return

    setCurrentImageIndex((prev) => ({
      ...prev,
      [hotelIndex]: ((prev[hotelIndex] || 0) + 1) % hotel.images.length,
    }))
  }

  const prevImage = (hotelIndex: string) => {
    if (!data) return
    const hotel = data.hotels[Number.parseInt(hotelIndex)]
    if (!hotel || hotel.images.length === 0) return

    setCurrentImageIndex((prev) => ({
      ...prev,
      [hotelIndex]: ((prev[hotelIndex] || 0) - 1 + hotel.images.length) % hotel.images.length,
    }))
  }

  // Quick debug function
  const clearCache = () => {
    localStorage.removeItem(`booking-${id}`)
    localStorage.removeItem(`real-content-${id}`)
    window.location.reload()
  }

  const generateMissingVouchers = (bookingId: string) => {
    alert("Voucher generatie is nog niet geimplementeerd")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Roadbook laden met echte content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>Opnieuw proberen</Button>
              <Button variant="outline" onClick={clearCache}>
                Cache wissen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const isEmpty = data.hotels.length === 0 && data.period.duration === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Debug Panel */}
      {(showDebug || isEmpty) && debugData && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-yellow-800 flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Debug Informatie voor {id}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
                  {showDebug ? "Verberg" : "Toon"} Debug
                </Button>
                <Button variant="outline" size="sm" onClick={clearCache}>
                  Cache wissen
                </Button>
              </div>
            </div>
            {showDebug && realContent && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Hotels:</strong> {data.hotels.length}
                  </div>
                  <div>
                    <strong>Transport:</strong> {data.transports.length}
                  </div>
                  <div>
                    <strong>Nachten:</strong> {data.period.duration}
                  </div>
                  <div>
                    <strong>Echte Content:</strong> ✅
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header - NO PRICES */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="bg-blue-50">
                  <Calendar className="w-4 h-4 mr-1" />
                  {data.period.duration} dagen
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  <MapPin className="w-4 h-4 mr-1" />
                  {data.destinations.length} bestemmingen
                </Badge>
                {data.status && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {data.status}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
                <Bug className="w-4 h-4 mr-2" />
                Debug
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Delen
              </Button>
              <Button size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Bewerken
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Empty Data Warning */}
            {isEmpty && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Geen booking data gevonden</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        De booking {id} bevat geen hotel- of transportgegevens.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Reis Overzicht
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        {data.period.startDate
                          ? new Date(data.period.startDate).toLocaleDateString("nl-NL")
                          : "Onbekend"}{" "}
                        - {data.period.endDate ? new Date(data.period.endDate).toLocaleDateString("nl-NL") : "Onbekend"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{data.period.duration} dagen</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Hotel className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{data.hotels.length} accommodaties</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        {data.destinations.map((d) => d.name).join(", ") || "Geen bestemmingen"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Destinations with REAL content and images */}
            {data.destinations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Bestemmingen ({data.destinations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {data.destinations.map((destination, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      {/* REAL Destination Images */}
                      {destination.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                          {destination.images.slice(0, 6).map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image || "/placeholder.svg"}
                              alt={`${destination.name} foto ${imgIndex + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="p-6">
                        <h3 className="font-semibold text-xl text-gray-900 mb-3">{destination.name}</h3>

                        {/* REAL Description with Read More */}
                        {destination.description ? (
                          <div className="mb-4">
                            <p className="text-gray-700">
                              {expandedDescriptions[`dest-${index}`]
                                ? destination.description
                                : truncateText(destination.description, 300)}
                            </p>
                            {destination.description.length > 300 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleDescription(`dest-${index}`)}
                                className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-800"
                              >
                                {expandedDescriptions[`dest-${index}`] ? (
                                  <>
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                    Minder lezen
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                    Lees verder
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 mb-4 italic">
                            Geen beschrijving beschikbaar uit Travel Compositor
                          </p>
                        )}

                        {/* REAL Highlights/Attractions */}
                        {destination.highlights && destination.highlights.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">🌟 Bezienswaardigheden</h4>
                            <div className="flex flex-wrap gap-2">
                              {destination.highlights.map((highlight, hIndex) => (
                                <Badge key={hIndex} variant="outline" className="text-xs">
                                  {highlight}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Hotels with REAL content - NO PRICES */}
            {data.hotels.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Hotel className="w-5 h-5" />
                  <h2 className="text-2xl font-bold">Accommodaties ({data.hotels.length})</h2>
                </div>
                {data.hotels.map((hotel, index) => (
                  <EnhancedHotelCard
                    key={index}
                    hotel={{
                      ...hotel,
                      hotelId: hotel.hotelId || hotel.id,
                      displayName: hotel.name,
                      checkInDate: hotel.checkIn,
                      checkOutDate: hotel.checkOut,
                    }}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Eigen vervoer - geen accommodaties geboekt via Travel Compositor</p>
                </CardContent>
              </Card>
            )}

            {/* Transport - NO PRICES */}
            {data.transports.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="w-5 h-5" />
                  <h2 className="text-2xl font-bold">Vervoer ({data.transports.length})</h2>
                </div>
                {data.transports.map((transport, index) => (
                  <TransportCard key={index} transport={transport} index={index} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Eigen vervoer - geen transport geboekt via Travel Compositor</p>
                </CardContent>
              </Card>
            )}

            {/* Vouchers & Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Vouchers & Documenten ({vouchers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vouchersLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Vouchers laden...</p>
                  </div>
                ) : vouchers.length > 0 ? (
                  vouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className={`border rounded-lg p-4 ${VoucherService.getVoucherColor(voucher.type)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{VoucherService.getVoucherIcon(voucher.type)}</span>
                          <div>
                            <h4 className="font-medium">{voucher.title}</h4>
                            <p className="text-sm text-gray-600">{voucher.description}</p>
                          </div>
                        </div>
                        <Button asChild>
                          <a href={voucher.url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Download className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Geen vouchers beschikbaar</p>
                    <p className="text-sm">Vouchers worden automatisch gegenereerd na bevestiging</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - NO PRICES */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Klant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium text-lg">{data.client.name}</p>
                {data.client.company && (
                  <p className="text-sm flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {data.client.company}
                  </p>
                )}
                {data.client.email && (
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {data.client.email}
                  </p>
                )}
                {data.client.phone && (
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {data.client.phone}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats - NO PRICES */}
            <Card>
              <CardHeader>
                <CardTitle>Reis Statistieken</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Totale nachten:</span>
                  <span className="font-medium">{data.hotels.reduce((sum, h) => sum + h.nights, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bestemmingen:</span>
                  <span className="font-medium">{data.destinations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accommodaties:</span>
                  <span className="font-medium">{data.hotels.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Foto's:</span>
                  <span className="font-medium">{data.allImages.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Route Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Route Kaart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Kaart wordt geladen...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
