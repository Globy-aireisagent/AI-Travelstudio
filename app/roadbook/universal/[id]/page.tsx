"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Calendar,
  Clock,
  Download,
  Edit,
  Euro,
  Hotel,
  MapPin,
  Navigation,
  Phone,
  Plane,
  Share2,
  Star,
  Users,
  Mail,
  Building,
} from "lucide-react"

import { ErrorBoundary } from "react-error-boundary"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/* ---------- Enhanced data extraction helpers ---------- */
const safeString = (v: any, fb = ""): string => {
  if (v === null || v === undefined) return fb
  if (typeof v === "string") return v.trim()
  if (typeof v === "number") return String(v)
  if (Array.isArray(v)) return v.map((x) => safeString(x)).join(", ")
  if (typeof v === "object") {
    for (const k of ["text", "name", "title", "description", "value"]) {
      if (typeof v[k] === "string") return v[k]
    }
  }
  return fb
}

const safeArray = (v: any): string[] => {
  if (!v) return []
  if (Array.isArray(v)) return v.map((x) => safeString(x)).filter(Boolean)
  if (typeof v === "object")
    return Object.values(v)
      .map((x) => safeString(x))
      .filter(Boolean)
  if (typeof v === "string") return [v]
  return []
}

/* ---------- Enhanced types for Travel Compositor data ---------- */
interface HotelService {
  id: string
  bookingReference: string
  displayName: string
  hotelName: string
  address?: string
  city: string
  country?: string
  stars?: string
  checkInDate?: string
  checkOutDate?: string
  checkInTime?: string
  checkOutTime?: string
  roomType?: string
  mealPlan?: string
  description?: string
  facilities: string[]
  images: string[]
  nightsStayed?: number | null
  category?: string
  provider?: string
  locationName?: string
  destinationName?: string
  totalPrice?: { amount: number; currency: string }
}

interface TransportService {
  id: string
  bookingReference: string
  displayName: string
  provider: string
  departureAirport?: string
  arrivalAirport?: string
  departureDate?: string
  arrivalDate?: string
  returnDepartureAirport?: string
  returnArrivalAirport?: string
  returnDepartureDate?: string
  returnArrivalDate?: string
  flightNumber?: string
  airline?: string
  includedBaggage?: string
  totalPrice?: { amount: number; currency: string }
  segments?: any[]
}

interface BookingData {
  id: string
  bookingReference: string
  status: string
  creationDate: string
  startDate: string | null
  endDate: string | null
  nightsCount?: number
  destinationCount?: number
  adultCount?: number
  childCount?: number
  totalPrice: { amount: number; currency: string } | null
  client: {
    name: string
    lastName?: string
    email?: string
    phone?: string
    company?: string
  }
  services: {
    hotels: HotelService[]
    transports: TransportService[]
    tickets: any[]
    transfers: any[]
    cars: any[]
    closedTours: any[]
    cruises: any[]
    insurances: any[]
  }
  images: string[]
  descriptions: { title: string; description?: string }
  destinations: { name: string }[]
  rawData: any
}

export default function UniversalRoadbookPage() {
  const router = useRouter()
  const { id: bookingId } = useParams<{ id: string }>()
  const [state, setState] = useState<{
    loading: boolean
    error: string | null
    data: BookingData | null
    currentImage: number
  }>({
    loading: true,
    error: null,
    data: null,
    currentImage: 0,
  })

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setState((s) => ({ ...s, loading: true }))

        // Try localStorage first for cached data
        const localKey = `booking-${bookingId}`
        const cached = localStorage.getItem(localKey)
        let raw = cached ? JSON.parse(cached) : null

        if (!raw) {
          console.log(`🔍 Loading booking ${bookingId} from API...`)
          // Use the optimized booking API
          const res = await fetch(`/api/travel-compositor/booking-super-fast?bookingId=${bookingId}&optimized=true`)
          if (!res.ok) throw new Error("Kan booking niet vinden in Travel Compositor")
          const json = await res.json()
          if (!json.success) throw new Error(json.error ?? "Onbekende API-fout")
          raw = json.booking
        }

        console.log("📊 Raw booking data:", raw)

        // Enhanced data transformation using Travel Compositor schema knowledge
        const transformedData = transformTravelCompositorData(raw)

        localStorage.setItem(localKey, JSON.stringify(transformedData))
        setState({ loading: false, error: null, data: transformedData, currentImage: 0 })
      } catch (e: any) {
        console.error("❌ Booking load error:", e)
        setState({ loading: false, error: e.message ?? "Onbekende fout", data: null, currentImage: 0 })
      }
    }

    if (bookingId) {
      console.log(`🔄 Redirecting from /roadbook/universal/${bookingId} to /roadbook/${bookingId}`)
      router.replace(`/roadbook/${bookingId}`)
    } else {
      loadBookingData()
    }
  }, [bookingId, router])

  // Enhanced data transformation function
  const transformTravelCompositorData = (raw: any): BookingData => {
    console.log("🔄 Transforming Travel Compositor data...")

    // Extract hotels from hotelservice array
    const hotels: HotelService[] = (raw.hotelservice || []).map((h: any): HotelService => {
      const nights = h.nights || calculateNights(h.startDate, h.endDate)
      return {
        id: h.id,
        bookingReference: h.bookingReference,
        displayName: h.hotelName || "Hotel",
        hotelName: h.hotelName,
        address: h.hotelData?.address,
        city: h.locationName || h.destinationName,
        country: h.country,
        stars: h.category?.replace("S", ""),
        checkInDate: h.startDate,
        checkOutDate: h.endDate,
        roomType: h.room?.[0]?.roomType,
        mealPlan: h.mealPlan,
        description: h.hotelData?.address ? `${h.hotelData.address}, ${h.locationName}` : h.locationName,
        facilities: [], // Could be enhanced with facility lookup
        images: [], // Will be fetched separately
        nightsStayed: nights,
        category: h.category,
        provider: h.provider,
        locationName: h.locationName,
        destinationName: h.destinationName,
        totalPrice: h.pricebreakdown?.totalPrice?.microsite
          ? {
              amount: h.pricebreakdown.totalPrice.microsite.amount,
              currency: h.pricebreakdown.totalPrice.microsite.currency || "EUR",
            }
          : undefined,
      }
    })

    // Extract transports from transportservice array
    const transports: TransportService[] = (raw.transportservice || []).map(
      (t: any): TransportService => ({
        id: t.id,
        bookingReference: t.bookingReference,
        displayName: `${t.departureAirport} → ${t.arrivalAirport}`,
        provider: t.provider,
        departureAirport: t.departureAirport,
        arrivalAirport: t.arrivalAirport,
        departureDate: t.startDate,
        arrivalDate: t.endDate,
        returnDepartureAirport: t.returnDepartureAirport,
        returnArrivalAirport: t.returnArrivalAirport,
        returnDepartureDate: t.returnDepartureDate,
        returnArrivalDate: t.returnArrivalDate,
        flightNumber: t.segment?.[0]?.flightNumber,
        airline: t.operatorProvider,
        includedBaggage: t.includedBaggage,
        totalPrice: t.pricebreakdown?.totalPrice?.microsite
          ? {
              amount: t.pricebreakdown.totalPrice.microsite.amount,
              currency: t.pricebreakdown.totalPrice.microsite.currency || "EUR",
            }
          : undefined,
        segments: t.segment || [],
      }),
    )

    // Extract client information from contactPerson
    const client = {
      name: `${raw.contactPerson?.name || ""} ${raw.contactPerson?.lastName || ""}`.trim() || "Onbekend",
      lastName: raw.contactPerson?.lastName,
      email: raw.contactPerson?.email,
      phone: raw.contactPerson?.phone,
      company: raw.user?.agency?.name,
    }

    // Extract destinations from hotels
    const destinations = [...new Set(hotels.map((h) => h.city).filter(Boolean))].map((name) => ({ name }))

    const booking: BookingData = {
      id: raw.id || raw.bookingReference,
      bookingReference: raw.bookingReference,
      status: raw.status,
      creationDate: raw.creationDate,
      startDate: raw.startDate,
      endDate: raw.endDate,
      nightsCount: raw.nightsCount,
      destinationCount: raw.destinationCount,
      adultCount: raw.adultCount,
      childCount: raw.childCount,
      totalPrice: raw.pricebreakdown?.totalPrice?.microsite
        ? {
            amount: raw.pricebreakdown.totalPrice.microsite.amount,
            currency: raw.pricebreakdown.totalPrice.microsite.currency || "EUR",
          }
        : null,
      client,
      services: {
        hotels,
        transports,
        tickets: raw.ticketservice || [],
        transfers: raw.transferservice || [],
        cars: raw.carservice || [],
        closedTours: raw.closedtourservice || [],
        cruises: raw.cruiseservice || [],
        insurances: raw.insuranceservice || [],
      },
      images: [], // Will be populated with hotel images
      descriptions: {
        title: raw.bookingReference || "Reis",
        description: `${raw.nightsCount || 0} nachten rondreis door ${raw.destinationCount || destinations.length} bestemmingen`,
      },
      destinations,
      rawData: raw,
    }

    console.log("✅ Transformed booking:", {
      id: booking.id,
      hotels: booking.services.hotels.length,
      transports: booking.services.transports.length,
      client: booking.client.name,
      totalPrice: booking.totalPrice?.amount,
    })

    return booking
  }

  const calculateNights = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.max(0, Math.ceil((+end - +start) / 86_400_000))
  }

  const duration = (): string => {
    const { data } = state
    if (!data?.startDate || !data?.endDate) return "Onbekend"
    const a = new Date(data.startDate)
    const b = new Date(data.endDate)
    return `${Math.max(1, Math.ceil((+b - +a) / 86_400_000))} dagen`
  }

  const nextImg = () =>
    setState((s) => ({
      ...s,
      currentImage: s.data?.images?.length ? (s.currentImage + 1) % s.data.images.length : 0,
    }))
  const prevImg = () =>
    setState((s) => ({
      ...s,
      currentImage: s.data?.images?.length ? (s.currentImage - 1 + s.data.images.length) % s.data.images.length : 0,
    }))

  if (state.loading) return <div className="min-h-screen flex items-center justify-center">📦 Roadbook laden…</div>
  if (state.error)
    return <div className="min-h-screen flex items-center justify-center text-red-600">{state.error}</div>
  if (!state.data) return null

  const { data } = state

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-red-600">{error.message}</p>
          <Button onClick={resetErrorBoundary}>Opnieuw</Button>
        </div>
      )}
    >
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* header */}
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{data.bookingReference}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                <Calendar className="w-4 h-4 mr-1" /> {duration()}
              </Badge>
              <Badge variant="outline">
                <MapPin className="w-4 h-4 mr-1" />
                {data.destinations.map((d) => d.name).join(", ") || "Meerdere bestemmingen"}
              </Badge>
              {data.totalPrice && (
                <Badge variant="outline">
                  <Euro className="w-4 h-4 mr-1" /> €{data.totalPrice.amount}
                </Badge>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
          {/* ---- left (main) ---- */}
          <section className="lg:col-span-2 space-y-6">
            {/* overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="w-4 h-4 mr-2" /> Reis Overzicht
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1 text-sm">
                  <p>
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {data.startDate ? new Date(data.startDate).toLocaleDateString() : "?"} –{" "}
                    {data.endDate ? new Date(data.endDate).toLocaleDateString() : "?"}
                  </p>
                  <p>
                    <Clock className="inline w-4 h-4 mr-1" /> {duration()}
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <Hotel className="inline w-4 h-4 mr-1" /> {data.services.hotels.length} hotels
                  </p>
                  <p>
                    <Plane className="inline w-4 h-4 mr-1" /> {data.services.transports.length} vervoer
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* accommodations */}
            {data.services.hotels.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Hotel className="w-4 h-4 mr-2" />
                    Accommodaties ({data.services.hotels.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {data.services.hotels.map((h, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      <div className="bg-blue-50 px-4 py-3 flex justify-between">
                        <div>
                          <h3 className="font-semibold">{h.hotelName}</h3>
                          {h.city && (
                            <p className="text-xs text-gray-600 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" /> {h.city}
                            </p>
                          )}
                        </div>
                        {h.stars && (
                          <div className="flex">
                            {[...Array(+h.stars || 3)].map((_, s) => (
                              <Star key={s} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2 text-sm">
                        <p className="text-gray-600">{h.description}</p>
                        <p>
                          📅 {h.checkInDate ? new Date(h.checkInDate).toLocaleDateString() : "?"} –{" "}
                          {h.checkOutDate ? new Date(h.checkOutDate).toLocaleDateString() : "?"} (
                          {h.nightsStayed ?? "?"} nachten)
                        </p>
                        <p>🛏️ Kamertype: {h.roomType || "Onbekend"}</p>
                        <p>🍽️ Maaltijden: {h.mealPlan || "Onbekend"}</p>
                        {h.totalPrice && <p>💰 Prijs: €{h.totalPrice.amount}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* transport */}
            {data.services.transports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plane className="w-4 h-4 mr-2" />
                    Vervoer ({data.services.transports.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.services.transports.map((t, i) => (
                    <div key={i} className="border rounded-lg p-4 bg-white">
                      <h3 className="font-semibold mb-2">{t.displayName}</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p>✈️ Heenvlucht: {t.departureDate ? new Date(t.departureDate).toLocaleString() : "?"}</p>
                          <p>🛬 Aankomst: {t.arrivalDate ? new Date(t.arrivalDate).toLocaleString() : "?"}</p>
                        </div>
                        <div>
                          <p>
                            ✈️ Terugvlucht:{" "}
                            {t.returnDepartureDate ? new Date(t.returnDepartureDate).toLocaleString() : "?"}
                          </p>
                          <p>
                            🛬 Aankomst: {t.returnArrivalDate ? new Date(t.returnArrivalDate).toLocaleString() : "?"}
                          </p>
                        </div>
                      </div>
                      {t.airline && <p className="text-sm mt-2">🏢 Maatschappij: {t.airline}</p>}
                      {t.includedBaggage && <p className="text-sm">🧳 Bagage: {t.includedBaggage}</p>}
                      {t.totalPrice && <p className="text-sm">💰 Prijs: €{t.totalPrice.amount}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </section>

          {/* ---- right (sidebar) ---- */}
          <aside className="space-y-6">
            {/* client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-4 h-4 mr-2" /> Klant
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{data.client.name}</p>
                {data.client.company && (
                  <p className="flex items-center">
                    <Building className="w-3 h-3 mr-1" /> {data.client.company}
                  </p>
                )}
                {data.client.email && (
                  <p className="flex items-center">
                    <Mail className="w-3 h-3 mr-1" /> {data.client.email}
                  </p>
                )}
                {data.client.phone && (
                  <p className="flex items-center">
                    <Phone className="w-3 h-3 mr-1" /> {data.client.phone}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Button className="w-full" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" /> Delen
                </Button>
                <Button className="w-full">
                  <Edit className="w-4 h-4 mr-2" /> Bewerken
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </ErrorBoundary>
  )
}
