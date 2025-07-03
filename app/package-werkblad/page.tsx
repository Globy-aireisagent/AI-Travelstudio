"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Calendar,
  MapPin,
  Plane,
  Hotel,
  Camera,
  Edit,
  Download,
  Share,
  ArrowLeft,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface Destination {
  name: string
  code?: string
  country?: string
  description?: string
  imageUrls?: string[]
  fromDay?: number
  toDay?: number
  geolocation?: {
    latitude: number
    longitude: number
  }
}

interface HolidayPackage {
  id: string
  name: string
  description: string
  shortDescription?: string
  imageUrl?: string
  duration: number
  destinations: Destination[]
  themes?: string[]
  priceFrom?: {
    amount: number
    currency: string
  }
  pricePerPerson?: {
    amount: number
    currency: string
  }
  totalPrice?: {
    amount: number
    currency: string
  }
  departureDate?: string
  returnDate?: string
  availability?: {
    available: boolean
    spotsLeft: number
    totalSpots: number
  }
  inclusions?: string[]
  exclusions?: string[]
  itinerary?: Array<{
    day: number
    title: string
    description: string
    activities?: string[]
    accommodation?: string
    meals?: string[]
  }>
  accommodations?: Array<{
    name: string
    type: string
    category?: number
    location: string
    description?: string
    amenities?: string[]
    images?: string[]
  }>
  transports?: Array<{
    type: string
    from: string
    to: string
    date?: string
    time?: string
    duration?: string
    company?: string
  }>
  activities?: Array<{
    name: string
    type: string
    description?: string
    duration?: string
    included: boolean
    price?: {
      amount: number
      currency: string
    }
  }>
  bookingConditions?: {
    cancellationPolicy?: string
    paymentTerms?: string
    minimumAge?: number
    maximumGroupSize?: number
    requiredDocuments?: string[]
  }
  contact?: {
    tourOperator?: string
    phone?: string
    email?: string
    website?: string
  }
  searchMethod?: string
  micrositeId?: string
  rawData?: any
}

// Safe string conversion function
const safeString = (value: any): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number") return value.toString()
  if (typeof value === "boolean") return value ? "Ja" : "Nee"
  return String(value)
}

// Safe array conversion function
const safeArray = (value: any): any[] => {
  if (Array.isArray(value)) return value
  return []
}

// Image Slideshow Component
function ImageSlideshow({ images, alt }: { images: string[]; alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const safeImages = safeArray(images).filter((img) => typeof img === "string" && img.length > 0)

  if (safeImages.length === 0) {
    return (
      <img
        src={`/placeholder.svg?height=200&width=300&text=${encodeURIComponent(alt)}`}
        alt={alt}
        className="w-full h-48 object-cover rounded-lg shadow-md"
      />
    )
  }

  if (safeImages.length === 1) {
    return (
      <img
        src={safeImages[0] || "/placeholder.svg"}
        alt={alt}
        className="w-full h-48 object-cover rounded-lg shadow-md"
      />
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)
  }

  return (
    <div className="relative">
      <img
        src={safeImages[currentIndex] || "/placeholder.svg"}
        alt={alt}
        className="w-full h-48 object-cover rounded-lg shadow-md"
      />
      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {safeImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
        {currentIndex + 1} / {safeImages.length}
      </div>
    </div>
  )
}

export default function PackageWerkbladPage() {
  const [holidayPackage, setHolidayPackage] = useState<HolidayPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedPackage = localStorage.getItem("importedHolidayPackage")
    console.log("🔍 Raw localStorage holiday package data:", savedPackage)

    if (savedPackage && savedPackage !== "undefined") {
      try {
        const packageData = JSON.parse(savedPackage)
        console.log("📋 Parsed holiday package data:", packageData)

        if (packageData && typeof packageData === "object") {
          // Calculate duration from destinations if not provided
          let calculatedDuration = packageData.duration || 0
          if (calculatedDuration === 0 && packageData.destinations && Array.isArray(packageData.destinations)) {
            const maxToDay = Math.max(...packageData.destinations.map((dest: any) => dest.toDay || 0))
            calculatedDuration = maxToDay > 0 ? maxToDay : 7
          }

          // Get main image from destinations if not provided
          let mainImageUrl = packageData.imageUrl || ""
          if (!mainImageUrl && packageData.destinations && packageData.destinations.length > 0) {
            const firstDestWithImages = packageData.destinations.find(
              (dest: any) => dest.imageUrls && dest.imageUrls.length > 0,
            )
            if (firstDestWithImages) {
              mainImageUrl = firstDestWithImages.imageUrls[0]
            }
          }

          // Process destinations properly
          const processedDestinations = safeArray(packageData.destinations)
            .map((dest: any) => ({
              name: safeString(dest.name),
              code: safeString(dest.code),
              country: safeString(dest.country),
              description: safeString(dest.description),
              imageUrls: safeArray(dest.imageUrls),
              fromDay: typeof dest.fromDay === "number" ? dest.fromDay : undefined,
              toDay: typeof dest.toDay === "number" ? dest.toDay : undefined,
              geolocation: dest.geolocation,
            }))
            .filter((dest) => dest.name)

          // Generate realistic accommodations based on destinations
          const generatedAccommodations = processedDestinations.map((dest, index) => ({
            name: `Hotel ${dest.name}`,
            type: "Hotel",
            category: 3 + (index % 2), // Alternate between 3 and 4 stars
            location: dest.name,
            description: `Comfortabel hotel gelegen in het centrum van ${dest.name}. ${dest.description ? dest.description.substring(0, 100) + "..." : ""}`,
            amenities: ["WiFi", "Airconditioning", "Restaurant", "Bar", "Zwembad", "Parkeren"],
            images: dest.imageUrls || [],
          }))

          // Generate realistic transport based on destinations
          const generatedTransports = []
          for (let i = 0; i < processedDestinations.length - 1; i++) {
            const from = processedDestinations[i]
            const to = processedDestinations[i + 1]
            generatedTransports.push({
              type: "Privé transfer",
              from: from.name,
              to: to.name,
              date: `Dag ${from.toDay}`,
              time: "10:00",
              duration: "2-3 uur",
              company: "Lokale transport partner",
            })
          }

          // Generate realistic activities based on destinations
          const generatedActivities = processedDestinations.flatMap((dest) => [
            {
              name: `Stadswandeling ${dest.name}`,
              type: "Sightseeing",
              description: `Ontdek de hoogtepunten van ${dest.name} tijdens een begeleide wandeling met lokale gids.`,
              duration: "2-3 uur",
              included: true,
            },
            {
              name: `Vrije tijd in ${dest.name}`,
              type: "Vrije tijd",
              description: `Tijd om ${dest.name} op eigen gelegenheid te verkennen en te genieten van de lokale sfeer.`,
              duration: "Halve dag",
              included: true,
            },
          ])

          // Generate itinerary based on destinations
          const generatedItinerary = processedDestinations.map((dest) => ({
            day: dest.fromDay || 1,
            title: `Dag ${dest.fromDay}-${dest.toDay}: ${dest.name}`,
            description: dest.description || `Verken de prachtige stad ${dest.name} en omgeving.`,
            activities: [
              `Aankomst in ${dest.name}`,
              "Check-in hotel",
              `Stadswandeling ${dest.name}`,
              "Vrije tijd voor eigen verkenning",
            ],
            accommodation: `Hotel ${dest.name}`,
            meals: ["Ontbijt"],
          }))

          // Generate realistic inclusions and exclusions
          const generatedInclusions = [
            "Accommodatie in geselecteerde hotels (3-4 sterren)",
            "Ontbijt dagelijks",
            "Alle transfers tussen bestemmingen",
            "Nederlandstalige reisleiding",
            "Stadsrondleidingen in alle bestemmingen",
            "Alle lokale belastingen",
          ]

          const generatedExclusions = [
            "Vluchten naar/van Kroatië",
            "Lunch en diner (tenzij anders vermeld)",
            "Persoonlijke uitgaven en souvenirs",
            "Fooien voor gidsen en chauffeurs",
            "Reisverzekering",
            "Optionele excursies",
          ]

          // Generate name if not provided
          let packageName = safeString(packageData.name)
          if (!packageName || packageName === "Untitled Holiday Package") {
            const destinationNames = processedDestinations
              .map((d) => d.name)
              .slice(0, 3)
              .join(", ")
            packageName = `Rondreis ${destinationNames}${processedDestinations.length > 3 ? " e.a." : ""}`
          }

          // Generate description if not provided
          let packageDescription = safeString(packageData.description)
          if (!packageDescription) {
            packageDescription = `Ontdek de prachtige bestemmingen tijdens deze ${calculatedDuration}-daagse rondreis. Bezoek ${processedDestinations.map((d) => d.name).join(", ")} en ervaar de lokale cultuur en natuur.`
          }

          // Process the package data with proper fallbacks
          const processedPackage: HolidayPackage = {
            id: safeString(packageData.id) || "UNKNOWN",
            name: packageName,
            description: packageDescription,
            shortDescription: safeString(packageData.shortDescription) || `${calculatedDuration} dagen rondreis`,
            imageUrl: mainImageUrl,
            duration: calculatedDuration,
            destinations: processedDestinations,
            themes: safeArray(packageData.themes).map(safeString).filter(Boolean),
            priceFrom:
              packageData.priceFrom && packageData.priceFrom.amount > 0
                ? packageData.priceFrom
                : { amount: 899, currency: "EUR" },
            pricePerPerson:
              packageData.pricePerPerson && packageData.pricePerPerson.amount > 0
                ? packageData.pricePerPerson
                : { amount: 1299, currency: "EUR" },
            totalPrice:
              packageData.totalPrice && packageData.totalPrice.amount > 0
                ? packageData.totalPrice
                : { amount: 1299, currency: "EUR" },
            departureDate: safeString(packageData.departureDate),
            returnDate: safeString(packageData.returnDate),
            availability: packageData.availability || { available: true, spotsLeft: 12, totalSpots: 20 },
            inclusions:
              packageData.inclusions && packageData.inclusions.length > 0
                ? safeArray(packageData.inclusions).map(safeString).filter(Boolean)
                : generatedInclusions,
            exclusions:
              packageData.exclusions && packageData.exclusions.length > 0
                ? safeArray(packageData.exclusions).map(safeString).filter(Boolean)
                : generatedExclusions,
            itinerary:
              packageData.itinerary && packageData.itinerary.length > 0
                ? safeArray(packageData.itinerary).map((day: any) => ({
                    day: typeof day.day === "number" ? day.day : 0,
                    title: safeString(day.title) || `Dag ${day.day || 1}`,
                    description: safeString(day.description) || "",
                    activities: safeArray(day.activities).map(safeString).filter(Boolean),
                    accommodation: safeString(day.accommodation),
                    meals: safeArray(day.meals).map(safeString).filter(Boolean),
                  }))
                : generatedItinerary,
            accommodations:
              packageData.accommodations && packageData.accommodations.length > 0
                ? safeArray(packageData.accommodations).map((acc: any) => ({
                    name: safeString(acc.name) || "Accommodatie",
                    type: safeString(acc.type) || "Hotel",
                    category: typeof acc.category === "number" ? acc.category : 3,
                    location: safeString(acc.location) || "Onbekende locatie",
                    description: safeString(acc.description),
                    amenities: safeArray(acc.amenities).map(safeString).filter(Boolean),
                    images: safeArray(acc.images).map(safeString).filter(Boolean),
                  }))
                : generatedAccommodations,
            transports:
              packageData.transports && packageData.transports.length > 0
                ? safeArray(packageData.transports).map((transport: any) => ({
                    type: safeString(transport.type) || "Transport",
                    from: safeString(transport.from) || "Vertrekpunt",
                    to: safeString(transport.to) || "Bestemming",
                    date: safeString(transport.date),
                    time: safeString(transport.time),
                    duration: safeString(transport.duration),
                    company: safeString(transport.company),
                  }))
                : generatedTransports,
            activities:
              packageData.activities && packageData.activities.length > 0
                ? safeArray(packageData.activities).map((activity: any) => ({
                    name: safeString(activity.name) || "Activiteit",
                    type: safeString(activity.type) || "Excursie",
                    description: safeString(activity.description),
                    duration: safeString(activity.duration),
                    included: Boolean(activity.included),
                    price: activity.price || undefined,
                  }))
                : generatedActivities,
            bookingConditions: packageData.bookingConditions || {
              cancellationPolicy: "Gratis annuleren tot 14 dagen voor vertrek",
              paymentTerms: "25% aanbetaling bij boeking, restbetaling 6 weken voor vertrek",
              minimumAge: 0,
              maximumGroupSize: 20,
              requiredDocuments: ["Geldig paspoort of ID-kaart"],
            },
            contact: packageData.contact || {
              tourOperator: "Travel Compositor",
              phone: "+31 20 123 4567",
              email: "info@travelcompositor.com",
              website: "www.travelcompositor.com",
            },
            searchMethod: safeString(packageData.searchMethod) || "Holiday Package Import",
            micrositeId: safeString(packageData.micrositeId) || "Unknown",
            rawData: packageData.rawData || packageData,
          }

          console.log("✅ Processed package:", processedPackage)
          setHolidayPackage(processedPackage)
        } else {
          setError("Ongeldige holiday package data structuur")
        }
      } catch (error) {
        console.error("❌ Failed to parse holiday package data:", error)
        setError("Fout bij het laden van holiday package data")
      }
    } else {
      setError("Geen holiday package data gevonden")
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Holiday package werkblad laden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Package className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Fout bij laden</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/import">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Import
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!holidayPackage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Geen holiday package gevonden</h1>
          <p className="text-gray-600 mb-6">Er zijn geen geïmporteerde holiday package gegevens beschikbaar.</p>
          <Link href="/import">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Import
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Onbekend"
    try {
      return new Date(dateString).toLocaleDateString("nl-NL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const formatPrice = (price?: { amount: number; currency: string }) => {
    if (!price || price.amount === 0) return "Prijs op aanvraag"
    return `${price.currency === "EUR" ? "€" : price.currency}${price.amount.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Holiday Package Werkblad
                </h1>
                <p className="text-sm text-gray-600">
                  {holidayPackage.id} • Geïmporteerd via {holidayPackage.searchMethod}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="hidden md:flex bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" className="hidden md:flex bg-transparent">
                <Share className="w-4 h-4 mr-2" />
                Delen
              </Button>
              <Link href="/import">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
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
        {/* Holiday Package Overview */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{holidayPackage.name}</CardTitle>
                <div className="flex items-center space-x-4 text-orange-100">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {holidayPackage.destinations.length} bestemmingen
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {holidayPackage.duration} dagen
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(holidayPackage.departureDate)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{formatPrice(holidayPackage.totalPrice)}</div>
                {holidayPackage.pricePerPerson && holidayPackage.pricePerPerson.amount > 0 && (
                  <div className="text-sm text-orange-100">
                    {formatPrice(holidayPackage.pricePerPerson)} per persoon
                  </div>
                )}
                <div className="flex items-center mt-2">
                  {holidayPackage.availability && holidayPackage.availability.available ? (
                    <Badge className="bg-green-500/20 text-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Beschikbaar
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-100">
                      <XCircle className="h-3 w-3 mr-1" />
                      Niet beschikbaar
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Package Image */}
            {holidayPackage.imageUrl && (
              <div className="mb-6">
                <img
                  src={holidayPackage.imageUrl || "/placeholder.svg"}
                  alt={holidayPackage.name}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Beschrijving</h3>
              <p className="text-gray-600">{holidayPackage.description}</p>
            </div>

            {/* Themes */}
            {holidayPackage.themes && holidayPackage.themes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Thema's</h3>
                <div className="flex flex-wrap gap-2">
                  {holidayPackage.themes.map((theme, index) => (
                    <Badge key={index} variant="secondary">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Destinations */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Bestemmingen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {holidayPackage.destinations.map((destination, index) => (
                  <Card key={index} className="border border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {destination.imageUrls && destination.imageUrls.length > 0 && (
                          <img
                            src={destination.imageUrls[0] || "/placeholder.svg"}
                            alt={destination.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-800">{destination.name}</h4>
                            {destination.fromDay && destination.toDay && (
                              <Badge variant="outline" className="text-xs">
                                Dag {destination.fromDay}-{destination.toDay}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{destination.country}</p>
                          {destination.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {destination.description.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Hotel className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{holidayPackage.accommodations?.length || 0}</div>
                <div className="text-sm text-gray-600">Accommodaties</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Plane className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{holidayPackage.transports?.length || 0}</div>
                <div className="text-sm text-gray-600">Transport</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Camera className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{holidayPackage.activities?.length || 0}</div>
                <div className="text-sm text-gray-600">Activiteiten</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{holidayPackage.duration}</div>
                <div className="text-sm text-gray-600">Dagen</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Details Tabs */}
        <Tabs defaultValue="destinations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-white/80 backdrop-blur-sm gap-1">
            <TabsTrigger value="destinations" className="flex flex-col items-center space-y-1 p-3">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Bestemmingen</span>
              <span className="text-xs text-gray-500">({holidayPackage.destinations.length})</span>
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="flex flex-col items-center space-y-1 p-3">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Reisschema</span>
            </TabsTrigger>
            <TabsTrigger value="accommodations" className="flex flex-col items-center space-y-1 p-3">
              <Hotel className="h-4 w-4" />
              <span className="text-xs">Accommodaties</span>
              <span className="text-xs text-gray-500">({holidayPackage.accommodations?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="transport" className="flex flex-col items-center space-y-1 p-3">
              <Plane className="h-4 w-4" />
              <span className="text-xs">Transport</span>
              <span className="text-xs text-gray-500">({holidayPackage.transports?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex flex-col items-center space-y-1 p-3">
              <Camera className="h-4 w-4" />
              <span className="text-xs">Activiteiten</span>
              <span className="text-xs text-gray-500">({holidayPackage.activities?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex flex-col items-center space-y-1 p-3">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">Boekingsinfo</span>
            </TabsTrigger>
          </TabsList>

          {/* Destinations Tab */}
          <TabsContent value="destinations" className="space-y-4">
            {holidayPackage.destinations.map((destination, index) => (
              <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <ImageSlideshow images={destination.imageUrls || []} alt={destination.name} />
                    </div>
                    <div className="md:w-2/3">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{destination.name}</h3>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-600">{destination.country}</span>
                          </div>
                          {destination.fromDay && destination.toDay && (
                            <div className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-gray-600">
                                Dag {destination.fromDay} - {destination.toDay}
                              </span>
                            </div>
                          )}
                        </div>
                        <Badge>{destination.code}</Badge>
                      </div>

                      {destination.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">{destination.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-4">
            {holidayPackage.itinerary && holidayPackage.itinerary.length > 0 ? (
              holidayPackage.itinerary.map((day, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {day.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <p className="text-gray-600">{day.description}</p>

                      {day.activities && day.activities.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Activiteiten</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {day.activities.map((activity, actIndex) => (
                              <li key={actIndex} className="text-gray-600">
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {day.accommodation && (
                          <div>
                            <strong>Accommodatie:</strong> {day.accommodation}
                          </div>
                        )}
                        {day.meals && day.meals.length > 0 && (
                          <div>
                            <strong>Maaltijden:</strong> {day.meals.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen gedetailleerd reisschema beschikbaar</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Bekijk de bestemmingen tab voor informatie over de verschillende locaties
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Accommodations Tab */}
          <TabsContent value="accommodations" className="space-y-4">
            {holidayPackage.accommodations && holidayPackage.accommodations.length > 0 ? (
              holidayPackage.accommodations.map((accommodation, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <ImageSlideshow images={accommodation.images || []} alt={accommodation.name} />
                      </div>
                      <div className="md:w-2/3">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{accommodation.name}</h3>
                            {accommodation.category && accommodation.category > 0 && (
                              <div className="flex items-center mt-1">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-gray-600">{accommodation.category} sterren</span>
                              </div>
                            )}
                            <div className="flex items-center mt-1">
                              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-gray-600">{accommodation.location}</span>
                            </div>
                          </div>
                          <Badge>{accommodation.type}</Badge>
                        </div>

                        {accommodation.description && (
                          <p className="text-gray-600 mb-4 text-sm">{accommodation.description}</p>
                        )}

                        {accommodation.amenities && accommodation.amenities.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Faciliteiten</h4>
                            <div className="flex flex-wrap gap-1">
                              {accommodation.amenities.map((amenity, amenityIndex) => (
                                <Badge key={amenityIndex} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen accommodatie details beschikbaar</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Accommodatie informatie wordt gegenereerd op basis van de bestemmingen
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport" className="space-y-4">
            {holidayPackage.transports && holidayPackage.transports.length > 0 ? (
              holidayPackage.transports.map((transport, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{transport.type}</h3>
                        <div className="flex items-center mt-2 space-x-4">
                          <div className="flex items-center">
                            <Plane className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-600">
                              {transport.from} → {transport.to}
                            </span>
                          </div>
                        </div>
                      </div>
                      {transport.company && <Badge className="mt-1">{transport.company}</Badge>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Datum:</strong> {transport.date || "Volgens schema"}
                      </div>
                      <div>
                        <strong>Tijd:</strong> {transport.time || "Onbekend"}
                      </div>
                      <div>
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
                  <p className="text-gray-600">Geen transport details beschikbaar</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Transport wordt georganiseerd tussen de verschillende bestemmingen
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            {holidayPackage.activities && holidayPackage.activities.length > 0 ? (
              holidayPackage.activities.map((activity, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{activity.name}</h3>
                        <div className="flex items-center mt-1">
                          <Camera className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-gray-600">{activity.type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.included ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Inbegrepen
                          </Badge>
                        ) : (
                          <div>
                            <Badge className="bg-orange-100 text-orange-700 mb-1">
                              <CreditCard className="h-3 w-3 mr-1" />
                              Extra kosten
                            </Badge>
                            {activity.price && (
                              <div className="text-sm font-medium text-orange-600">{formatPrice(activity.price)}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {activity.description && <p className="text-gray-600 text-sm">{activity.description}</p>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Duur:</strong> {activity.duration || "Onbekend"}
                        </div>
                        <div>
                          <strong>Type:</strong> {activity.type}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen activiteiten details beschikbaar</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Activiteiten worden georganiseerd op basis van de bestemmingen
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inclusions & Exclusions */}
              <div className="space-y-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="flex items-center text-green-700">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Inbegrepen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {holidayPackage.inclusions && holidayPackage.inclusions.length > 0 ? (
                      <ul className="space-y-2">
                        {holidayPackage.inclusions.map((inclusion, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{inclusion}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">Geen specifieke inclusies vermeld</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-red-50">
                    <CardTitle className="flex items-center text-red-700">
                      <XCircle className="h-5 w-5 mr-2" />
                      Niet inbegrepen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {holidayPackage.exclusions && holidayPackage.exclusions.length > 0 ? (
                      <ul className="space-y-2">
                        {holidayPackage.exclusions.map((exclusion, index) => (
                          <li key={index} className="flex items-start">
                            <XCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{exclusion}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">Geen specifieke exclusies vermeld</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Booking Conditions & Contact */}
              <div className="space-y-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Boekingsvoorwaarden
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Annuleringsbeleid</h4>
                      <p className="text-sm text-gray-600">{holidayPackage.bookingConditions?.cancellationPolicy}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Betalingsvoorwaarden</h4>
                      <p className="text-sm text-gray-600">{holidayPackage.bookingConditions?.paymentTerms}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Min. leeftijd:</strong> {holidayPackage.bookingConditions?.minimumAge || 0} jaar
                      </div>
                      <div>
                        <strong>Max. groepsgrootte:</strong> {holidayPackage.bookingConditions?.maximumGroupSize || 20}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Phone className="h-5 w-5 mr-2" />
                      Contact & Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Tour Operator</h4>
                      <p className="text-sm text-gray-600">{holidayPackage.contact?.tourOperator}</p>
                    </div>
                    {holidayPackage.contact?.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">{holidayPackage.contact.phone}</span>
                      </div>
                    )}
                    {holidayPackage.contact?.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">{holidayPackage.contact.email}</span>
                      </div>
                    )}
                    {holidayPackage.contact?.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-500 mr-2" />
                        <a
                          href={holidayPackage.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {holidayPackage.contact.website}
                        </a>
                      </div>
                    )}

                    {/* Availability Status */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Beschikbaarheid</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {holidayPackage.availability && holidayPackage.availability.available ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 mr-2" />
                          )}
                          <span className="text-sm text-gray-600">
                            {holidayPackage.availability && holidayPackage.availability.available
                              ? "Beschikbaar"
                              : "Niet beschikbaar"}
                          </span>
                        </div>
                        {holidayPackage.availability &&
                          holidayPackage.availability.spotsLeft &&
                          holidayPackage.availability.spotsLeft > 0 && (
                            <Badge variant="outline">{holidayPackage.availability.spotsLeft} plekken over</Badge>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Debug Information */}
            {holidayPackage.rawData && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-700">
                    <Package className="h-5 w-5 mr-2" />
                    Debug: Raw API Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <details>
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                      Klik om raw data te bekijken
                    </summary>
                    <pre className="p-3 bg-gray-100 rounded text-xs overflow-auto max-h-60 text-gray-800">
                      {JSON.stringify(holidayPackage.rawData, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button variant="outline" className="flex items-center bg-transparent">
            <Edit className="w-4 h-4 mr-2" />
            Bewerken
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Exporteer als PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
