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

interface HolidayPackage {
  id: string
  name: string
  description: string
  shortDescription: string
  imageUrl: string
  duration: number
  destinations: string[]
  themes: string[]
  priceFrom: {
    amount: number
    currency: string
  }
  pricePerPerson: {
    amount: number
    currency: string
  }
  totalPrice: {
    amount: number
    currency: string
  }
  departureDate: string
  returnDate: string
  availability: {
    available: boolean
    spotsLeft: number
    totalSpots: number
  }
  inclusions: string[]
  exclusions: string[]
  itinerary: Array<{
    day: number
    title: string
    description: string
    activities: string[]
    accommodation: string
    meals: string[]
  }>
  accommodations: Array<{
    name: string
    type: string
    category: number
    location: string
    description: string
    amenities: string[]
    images: string[]
  }>
  transports: Array<{
    type: string
    from: string
    to: string
    date: string
    time: string
    duration: string
    company: string
  }>
  activities: Array<{
    name: string
    type: string
    description: string
    duration: string
    included: boolean
    price?: {
      amount: number
      currency: string
    }
  }>
  bookingConditions: {
    cancellationPolicy: string
    paymentTerms: string
    minimumAge: number
    maximumGroupSize: number
    requiredDocuments: string[]
  }
  contact: {
    tourOperator: string
    phone: string
    email: string
    website: string
  }
  searchMethod?: string
  micrositeId?: string
}

// Image Slideshow Component
function ImageSlideshow({ images, alt }: { images: string[]; alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Safe array handling
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : []

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
    // Load holiday package from localStorage
    const savedPackage = localStorage.getItem("importedHolidayPackage")
    console.log("🔍 Raw localStorage holiday package data:", savedPackage)

    if (savedPackage && savedPackage !== "undefined") {
      try {
        const packageData = JSON.parse(savedPackage)
        console.log("📋 Parsed holiday package data:", packageData)

        if (packageData && typeof packageData === "object") {
          // Ensure all arrays are properly initialized
          const safePackageData: HolidayPackage = {
            id: packageData.id || "UNKNOWN",
            name: packageData.name || "Untitled Holiday Package",
            description: packageData.description || "",
            shortDescription: packageData.shortDescription || "",
            imageUrl: packageData.imageUrl || "",
            duration: packageData.duration || 0,
            destinations: Array.isArray(packageData.destinations) ? packageData.destinations : [],
            themes: Array.isArray(packageData.themes) ? packageData.themes : [],
            priceFrom: packageData.priceFrom || { amount: 0, currency: "EUR" },
            pricePerPerson: packageData.pricePerPerson || { amount: 0, currency: "EUR" },
            totalPrice: packageData.totalPrice || { amount: 0, currency: "EUR" },
            departureDate: packageData.departureDate || "",
            returnDate: packageData.returnDate || "",
            availability: packageData.availability || {
              available: true,
              spotsLeft: 0,
              totalSpots: 0,
            },
            inclusions: Array.isArray(packageData.inclusions) ? packageData.inclusions : [],
            exclusions: Array.isArray(packageData.exclusions) ? packageData.exclusions : [],
            itinerary: Array.isArray(packageData.itinerary)
              ? packageData.itinerary.map((day: any) => ({
                  day: day.day || 0,
                  title: day.title || "",
                  description: day.description || "",
                  activities: Array.isArray(day.activities) ? day.activities : [],
                  accommodation: day.accommodation || "",
                  meals: Array.isArray(day.meals) ? day.meals : [],
                }))
              : [],
            accommodations: Array.isArray(packageData.accommodations)
              ? packageData.accommodations.map((acc: any) => ({
                  name: acc.name || "",
                  type: acc.type || "",
                  category: acc.category || 0,
                  location: acc.location || "",
                  description: acc.description || "",
                  amenities: Array.isArray(acc.amenities) ? acc.amenities : [],
                  images: Array.isArray(acc.images) ? acc.images : [],
                }))
              : [],
            transports: Array.isArray(packageData.transports)
              ? packageData.transports.map((transport: any) => ({
                  type: transport.type || "",
                  from: transport.from || "",
                  to: transport.to || "",
                  date: transport.date || "",
                  time: transport.time || "",
                  duration: transport.duration || "",
                  company: transport.company || "",
                }))
              : [],
            activities: Array.isArray(packageData.activities)
              ? packageData.activities.map((activity: any) => ({
                  name: activity.name || "",
                  type: activity.type || "",
                  description: activity.description || "",
                  duration: activity.duration || "",
                  included: activity.included || false,
                  price: activity.price || undefined,
                }))
              : [],
            bookingConditions: packageData.bookingConditions || {
              cancellationPolicy: "Standard cancellation policy",
              paymentTerms: "Payment required at booking",
              minimumAge: 0,
              maximumGroupSize: 50,
              requiredDocuments: ["Valid passport"],
            },
            contact: packageData.contact || {
              tourOperator: "Travel Compositor",
              phone: "",
              email: "",
              website: "",
            },
            searchMethod: packageData.searchMethod || "Unknown",
            micrositeId: packageData.micrositeId || "Unknown",
          }

          // Ensure booking conditions arrays are safe
          if (
            safePackageData.bookingConditions.requiredDocuments &&
            !Array.isArray(safePackageData.bookingConditions.requiredDocuments)
          ) {
            safePackageData.bookingConditions.requiredDocuments = ["Valid passport"]
          }

          setHolidayPackage(safePackageData)
        } else {
          setError("Ongeldige holiday package data structuur")
        }
      } catch (error) {
        console.error("❌ Failed to parse holiday package data:", error)
        setError("Fout bij het laden van holiday package data")
      }
    } else {
      console.log("❌ No holiday package data found in localStorage")
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

  const formatDate = (dateString: string) => {
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

  const formatPrice = (price: { amount: number; currency: string }) => {
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
                    {holidayPackage.destinations?.length || 0} bestemmingen
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
                {holidayPackage.pricePerPerson?.amount > 0 && (
                  <div className="text-sm text-orange-100">
                    {formatPrice(holidayPackage.pricePerPerson)} per persoon
                  </div>
                )}
                <div className="flex items-center mt-2">
                  {holidayPackage.availability?.available ? (
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
            {holidayPackage.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Beschrijving</h3>
                <p className="text-gray-600">{holidayPackage.description}</p>
              </div>
            )}

            {/* Themes */}
            {holidayPackage.themes?.length > 0 && (
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
            {holidayPackage.destinations?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Bestemmingen</h3>
                <div className="flex flex-wrap gap-2">
                  {holidayPackage.destinations.map((destination, index) => (
                    <Badge key={index} className="bg-orange-100 text-orange-700">
                      <MapPin className="h-3 w-3 mr-1" />
                      {destination}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

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
        <Tabs defaultValue="itinerary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-white/80 backdrop-blur-sm gap-1">
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
            <TabsTrigger value="inclusions" className="flex flex-col items-center space-y-1 p-3">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">In/Exclusief</span>
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex flex-col items-center space-y-1 p-3">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">Boekingsinfo</span>
            </TabsTrigger>
          </TabsList>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-4">
            {holidayPackage.itinerary?.length > 0 ? (
              holidayPackage.itinerary.map((day, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Dag {day.day}: {day.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <p className="text-gray-600">{day.description}</p>

                      {day.activities?.length > 0 && (
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
                        {day.meals?.length > 0 && (
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
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Accommodations Tab */}
          <TabsContent value="accommodations" className="space-y-4">
            {holidayPackage.accommodations?.length > 0 ? (
              holidayPackage.accommodations.map((accommodation, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <ImageSlideshow images={accommodation.images} alt={accommodation.name} />
                      </div>
                      <div className="md:w-2/3">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{accommodation.name}</h3>
                            <div className="flex items-center mt-1">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-gray-600">{accommodation.category} sterren</span>
                            </div>
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

                        {accommodation.amenities?.length > 0 && (
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
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport" className="space-y-4">
            {holidayPackage.transports?.length > 0 ? (
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
                      <Badge className="mt-1">{transport.company}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Datum:</strong> {formatDate(transport.date)}
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
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            {holidayPackage.activities?.length > 0 ? (
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
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Inclusions Tab */}
          <TabsContent value="inclusions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inclusions */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center text-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Inbegrepen
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {holidayPackage.inclusions?.length > 0 ? (
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

              {/* Exclusions */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center text-red-700">
                    <XCircle className="h-5 w-5 mr-2" />
                    Niet inbegrepen
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {holidayPackage.exclusions?.length > 0 ? (
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
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking Conditions */}
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
                      <strong>Min. leeftijd:</strong> {holidayPackage.bookingConditions?.minimumAge} jaar
                    </div>
                    <div>
                      <strong>Max. groepsgrootte:</strong> {holidayPackage.bookingConditions?.maximumGroupSize}
                    </div>
                  </div>
                  {holidayPackage.bookingConditions?.requiredDocuments?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Vereiste documenten</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {holidayPackage.bookingConditions.requiredDocuments.map((doc, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
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
                        {holidayPackage.availability?.available ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mr-2" />
                        )}
                        <span className="text-sm text-gray-600">
                          {holidayPackage.availability.available ? "Beschikbaar" : "Niet beschikbaar"}
                        </span>
                      </div>
                      {holidayPackage.availability?.spotsLeft > 0 && (
                        <Badge variant="outline">{holidayPackage.availability.spotsLeft} plekken over</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
