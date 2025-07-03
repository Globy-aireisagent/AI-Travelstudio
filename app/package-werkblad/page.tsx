"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Euro,
  Plane,
  Hotel,
  Camera,
  CheckCircle,
  XCircle,
  Phone,
  Download,
  Share2,
  Edit,
  Star,
  Heart,
  Navigation,
} from "lucide-react"
import Link from "next/link"

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
}

export default function PackageWerkbladPage() {
  const [packageData, setPackageData] = useState<HolidayPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Load package data from localStorage
    const savedPackage = localStorage.getItem("importedHolidayPackage")
    if (savedPackage) {
      try {
        const parsed = JSON.parse(savedPackage)
        setPackageData(parsed)
        console.log("📦 Loaded holiday package:", parsed)
      } catch (error) {
        console.error("❌ Failed to parse holiday package data:", error)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Holiday Package laden...</h2>
        </div>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-700">Geen Package Data</CardTitle>
            <CardDescription>Er is geen holiday package data gevonden.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/import">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Importeer Holiday Package
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatPrice = (price: { amount: number; currency: string }) => {
    return `${price.currency} ${price.amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Niet opgegeven"
    return new Date(dateString).toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Holiday Package Werkblad
                </h1>
                <p className="text-sm text-gray-600">{packageData.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                <Heart className="h-4 w-4 mr-1" />
                Holiday Package
              </Badge>
              <Link href="/import">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 px-6 py-3">
                  <Download className="w-4 h-4 mr-2" />
                  Nieuwe Import
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Package Header */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Package Image */}
              <div className="lg:col-span-1">
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={packageData.imageUrl || "/placeholder.svg?height=300&width=400&text=Holiday+Package"}
                    alt={packageData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Package Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{packageData.name}</h2>
                    <p className="text-gray-600 text-lg">{packageData.shortDescription}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4 mr-1" />
                      Delen
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-1" />
                      Bewerken
                    </Button>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Duur</p>
                    <p className="font-semibold">{packageData.duration} dagen</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Bestemmingen</p>
                    <p className="font-semibold">{packageData.destinations.length}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Euro className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Vanaf</p>
                    <p className="font-semibold">{formatPrice(packageData.priceFrom)}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Beschikbaar</p>
                    <p className="font-semibold">{packageData.availability.available ? "Ja" : "Nee"}</p>
                  </div>
                </div>

                {/* Themes */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {packageData.themes.map((theme, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                      {theme}
                    </Badge>
                  ))}
                </div>

                {/* Destinations */}
                <div className="flex flex-wrap gap-2">
                  {packageData.destinations.map((destination, index) => (
                    <Badge key={index} variant="outline" className="border-blue-300 text-blue-700">
                      <MapPin className="w-3 h-3 mr-1" />
                      {destination}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-2">
            <TabsTrigger value="overview" className="rounded-xl">
              <Star className="w-4 h-4 mr-2" />
              Overzicht
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              Reisschema
            </TabsTrigger>
            <TabsTrigger value="accommodations" className="rounded-xl">
              <Hotel className="w-4 h-4 mr-2" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="transport" className="rounded-xl">
              <Plane className="w-4 h-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="activities" className="rounded-xl">
              <Camera className="w-4 h-4 mr-2" />
              Activiteiten
            </TabsTrigger>
            <TabsTrigger value="conditions" className="rounded-xl">
              <CheckCircle className="w-4 h-4 mr-2" />
              Voorwaarden
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Description */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Navigation className="w-5 h-5 mr-2 text-purple-600" />
                    Beschrijving
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{packageData.description}</p>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Euro className="w-5 h-5 mr-2 text-green-600" />
                    Prijsinformatie
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Prijs vanaf:</span>
                    <span className="font-semibold text-lg">{formatPrice(packageData.priceFrom)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Per persoon:</span>
                    <span className="font-semibold text-lg">{formatPrice(packageData.pricePerPerson)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Totaalprijs:</span>
                    <span className="font-semibold text-xl text-green-600">{formatPrice(packageData.totalPrice)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Dates */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Reisdata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Vertrekdatum</p>
                    <p className="font-semibold">{formatDate(packageData.departureDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Terugkeer</p>
                    <p className="font-semibold">{formatDate(packageData.returnDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duur</p>
                    <p className="font-semibold">{packageData.duration} dagen</p>
                  </div>
                </CardContent>
              </Card>

              {/* Availability */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-orange-600" />
                    Beschikbaarheid
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {packageData.availability.available ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-semibold">
                      {packageData.availability.available ? "Beschikbaar" : "Niet beschikbaar"}
                    </span>
                  </div>
                  {packageData.availability.spotsLeft > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Resterende plaatsen</p>
                      <p className="font-semibold">
                        {packageData.availability.spotsLeft} van {packageData.availability.totalSpots}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Inbegrepen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <ul className="space-y-2">
                      {packageData.inclusions.map((inclusion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-700">
                    <XCircle className="w-5 h-5 mr-2" />
                    Niet inbegrepen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <ul className="space-y-2">
                      {packageData.exclusions.map((exclusion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{exclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Dag-tot-dag Reisschema
                </CardTitle>
                <CardDescription>Gedetailleerd overzicht van je reis</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {packageData.itinerary.map((day, index) => (
                      <div key={index} className="border-l-4 border-blue-300 pl-6 pb-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {day.day}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">{day.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-3">{day.description}</p>

                        {day.activities.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Activiteiten:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {day.activities.map((activity, actIndex) => (
                                <li key={actIndex}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {day.accommodation && (
                            <div>
                              <p className="font-medium text-gray-700">Accommodatie:</p>
                              <p className="text-gray-600">{day.accommodation}</p>
                            </div>
                          )}
                          {day.meals.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700">Maaltijden:</p>
                              <p className="text-gray-600">{day.meals.join(", ")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accommodations Tab */}
          <TabsContent value="accommodations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {packageData.accommodations.map((accommodation, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Hotel className="w-5 h-5 mr-2 text-blue-600" />
                        {accommodation.name}
                      </span>
                      <div className="flex">
                        {[...Array(accommodation.category)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {accommodation.type} in {accommodation.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{accommodation.description}</p>

                    <div>
                      <p className="font-medium text-gray-700 mb-2">Voorzieningen:</p>
                      <div className="flex flex-wrap gap-2">
                        {accommodation.amenities.map((amenity, amenityIndex) => (
                          <Badge key={amenityIndex} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {accommodation.images.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Foto's:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {accommodation.images.slice(0, 4).map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image || "/placeholder.svg"}
                              alt={`${accommodation.name} ${imgIndex + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport" className="space-y-6">
            <div className="space-y-4">
              {packageData.transports.map((transport, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Plane className="w-6 h-6 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-lg">{transport.type}</h3>
                          <p className="text-sm text-gray-600">{transport.company}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{transport.duration}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Van</p>
                        <p className="text-gray-600">{transport.from}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Naar</p>
                        <p className="text-gray-600">{transport.to}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Datum & Tijd</p>
                        <p className="text-gray-600">
                          {transport.date} om {transport.time}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {packageData.activities.map((activity, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Camera className="w-5 h-5 mr-2 text-purple-600" />
                        {activity.name}
                      </span>
                      {activity.included ? (
                        <Badge className="bg-green-100 text-green-700">Inbegrepen</Badge>
                      ) : (
                        <Badge variant="outline">{activity.price ? formatPrice(activity.price) : "Optioneel"}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{activity.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-600">{activity.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {activity.duration}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Conditions Tab */}
          <TabsContent value="conditions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Conditions */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                    Boekingsvoorwaarden
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-700">Annuleringsbeleid</p>
                    <p className="text-gray-600 text-sm">{packageData.bookingConditions.cancellationPolicy}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Betalingsvoorwaarden</p>
                    <p className="text-gray-600 text-sm">{packageData.bookingConditions.paymentTerms}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Minimumleeftijd</p>
                    <p className="text-gray-600 text-sm">{packageData.bookingConditions.minimumAge} jaar</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Maximale groepsgrootte</p>
                    <p className="text-gray-600 text-sm">{packageData.bookingConditions.maximumGroupSize} personen</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Documents */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-green-600" />
                    Contact & Documenten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-700">Tour Operator</p>
                    <p className="text-gray-600 text-sm">{packageData.contact.tourOperator}</p>
                  </div>
                  {packageData.contact.phone && (
                    <div>
                      <p className="font-medium text-gray-700">Telefoon</p>
                      <p className="text-gray-600 text-sm">{packageData.contact.phone}</p>
                    </div>
                  )}
                  {packageData.contact.email && (
                    <div>
                      <p className="font-medium text-gray-700">E-mail</p>
                      <p className="text-gray-600 text-sm">{packageData.contact.email}</p>
                    </div>
                  )}
                  {packageData.contact.website && (
                    <div>
                      <p className="font-medium text-gray-700">Website</p>
                      <a href={packageData.contact.website} className="text-blue-600 text-sm hover:underline">
                        {packageData.contact.website}
                      </a>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <p className="font-medium text-gray-700 mb-2">Vereiste documenten</p>
                    <ul className="space-y-1">
                      {packageData.bookingConditions.requiredDocuments.map((doc, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <Download className="w-5 h-5 mr-2" />
            Exporteer PDF
          </Button>
          <Button
            variant="outline"
            className="px-8 py-3 rounded-2xl border-2 border-purple-300 hover:bg-purple-50 bg-transparent"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Delen
          </Button>
          <Link href="/import">
            <Button
              variant="outline"
              className="px-8 py-3 rounded-2xl border-2 border-blue-300 hover:bg-blue-50 bg-transparent"
            >
              <Edit className="w-5 h-5 mr-2" />
              Nieuwe Import
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
