"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Users,
  Clock,
  Euro,
  Plane,
  Hotel,
  Camera,
  Download,
  Share2,
  Edit,
  Home,
  Package,
  Star,
  CheckCircle,
  XCircle,
  Info,
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    // Load package data from localStorage
    const loadPackageData = () => {
      try {
        const savedData = localStorage.getItem("importedHolidayPackage")
        if (savedData) {
          const parsed = JSON.parse(savedData)
          console.log("📦 Loaded holiday package data:", parsed)
          setPackageData(parsed)
        } else {
          setError("Geen holiday package data gevonden. Ga terug naar import om een package te importeren.")
        }
      } catch (error) {
        console.error("❌ Error loading package data:", error)
        setError("Fout bij het laden van package data")
      } finally {
        setIsLoading(false)
      }
    }

    loadPackageData()
  }, [])

  const formatPrice = (price: { amount: number; currency: string } | null) => {
    if (!price || !price.amount) return "Prijs op aanvraag"
    return `€${price.amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Datum niet beschikbaar"
    try {
      return new Date(dateString).toLocaleDateString("nl-NL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Holiday Package laden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Fout</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/import">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Package className="h-4 w-4 mr-2" />
                Terug naar Import
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Geen Package Data</h2>
            <p className="text-gray-600 mb-4">Er is geen holiday package data beschikbaar.</p>
            <Link href="/import">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Package className="h-4 w-4 mr-2" />
                Package Importeren
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Holiday Package Werkblad
                </h1>
                <p className="text-sm text-gray-600">{packageData.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg">
                <Package className="h-4 w-4 mr-1" />
                Holiday Package
              </Badge>
              <Link href="/import">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 px-6 py-3">
                  <Home className="w-4 h-4 mr-2" />🏠 Import Hub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Package Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Package Info */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{packageData.name}</CardTitle>
                      <CardDescription className="text-purple-100 mt-2">{packageData.shortDescription}</CardDescription>
                    </div>
                    <Package className="h-8 w-8" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {packageData.imageUrl && (
                    <div className="mb-6">
                      <img
                        src={packageData.imageUrl || "/placeholder.svg"}
                        alt={packageData.name}
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Beschrijving</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {packageData.description || "Geen beschrijving beschikbaar"}
                      </p>
                    </div>
                    {packageData.themes && packageData.themes.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Thema's</h3>
                        <div className="flex flex-wrap gap-2">
                          {packageData.themes.map((theme, index) => (
                            <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Package Details Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Package Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Duur
                    </span>
                    <span className="font-semibold">{packageData.duration || 0} dagen</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      Bestemmingen
                    </span>
                    <span className="font-semibold">{packageData.destinations?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600">
                      <Euro className="h-4 w-4 mr-2" />
                      Prijs vanaf
                    </span>
                    <span className="font-semibold text-green-600">{formatPrice(packageData.priceFrom)}</span>
                  </div>
                  {packageData.availability && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        Beschikbaarheid
                      </span>
                      <Badge variant={packageData.availability.available ? "default" : "destructive"}>
                        {packageData.availability.available ? "Beschikbaar" : "Niet beschikbaar"}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Euro className="h-5 w-5 mr-2" />
                    Prijsinformatie
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Prijs vanaf:</span>
                    <span className="font-semibold">{formatPrice(packageData.priceFrom)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Per persoon:</span>
                    <span className="font-semibold">{formatPrice(packageData.pricePerPerson)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Totaalprijs:</span>
                    <span className="font-semibold text-green-600">{formatPrice(packageData.totalPrice)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Acties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                    <Edit className="h-4 w-4 mr-2" />
                    Bewerk Package
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Share2 className="h-4 w-4 mr-2" />
                    Deel Package
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Information Tabs */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="itinerary">Reisschema</TabsTrigger>
                <TabsTrigger value="accommodations">Hotels</TabsTrigger>
                <TabsTrigger value="transport">Transport</TabsTrigger>
                <TabsTrigger value="activities">Activiteiten</TabsTrigger>
                <TabsTrigger value="inclusions">Inclusief</TabsTrigger>
                <TabsTrigger value="conditions">Voorwaarden</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Dag-tot-dag Reisschema</h3>
                  {packageData.itinerary && packageData.itinerary.length > 0 ? (
                    <div className="space-y-4">
                      {packageData.itinerary.map((day, index) => (
                        <Card key={index} className="border-l-4 border-l-purple-500">
                          <CardContent className="p-4">
                            <div className="flex items-center mb-2">
                              <Badge className="bg-purple-100 text-purple-700 mr-3">Dag {day.day}</Badge>
                              <h4 className="font-semibold">{day.title}</h4>
                            </div>
                            <p className="text-gray-700 mb-3">{day.description}</p>
                            {day.activities && day.activities.length > 0 && (
                              <div className="mb-2">
                                <span className="text-sm font-medium text-gray-600">Activiteiten: </span>
                                <span className="text-sm">{day.activities.join(", ")}</span>
                              </div>
                            )}
                            {day.accommodation && (
                              <div className="mb-2">
                                <span className="text-sm font-medium text-gray-600">Accommodatie: </span>
                                <span className="text-sm">{day.accommodation}</span>
                              </div>
                            )}
                            {day.meals && day.meals.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Maaltijden: </span>
                                <span className="text-sm">{day.meals.join(", ")}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Geen reisschema beschikbaar</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="accommodations" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Accommodaties</h3>
                  {packageData.accommodations && packageData.accommodations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {packageData.accommodations.map((hotel, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center mb-2">
                              <Hotel className="h-5 w-5 mr-2 text-blue-600" />
                              <h4 className="font-semibold">{hotel.name}</h4>
                              {hotel.category && (
                                <div className="ml-auto flex">
                                  {[...Array(hotel.category)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{hotel.type}</p>
                            <p className="text-sm text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 inline mr-1" />
                              {hotel.location}
                            </p>
                            <p className="text-sm mb-3">{hotel.description}</p>
                            {hotel.amenities && hotel.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {hotel.amenities.slice(0, 3).map((amenity, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                                {hotel.amenities.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{hotel.amenities.length - 3} meer
                                  </Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Geen accommodatie informatie beschikbaar</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="transport" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Transport</h3>
                  {packageData.transports && packageData.transports.length > 0 ? (
                    <div className="space-y-4">
                      {packageData.transports.map((transport, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center mb-2">
                              <Plane className="h-5 w-5 mr-2 text-blue-600" />
                              <h4 className="font-semibold">{transport.type}</h4>
                              <Badge variant="outline" className="ml-auto">
                                {transport.company}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Van: </span>
                                {transport.from}
                              </div>
                              <div>
                                <span className="font-medium">Naar: </span>
                                {transport.to}
                              </div>
                              <div>
                                <span className="font-medium">Datum: </span>
                                {formatDate(transport.date)}
                              </div>
                              <div>
                                <span className="font-medium">Tijd: </span>
                                {transport.time}
                              </div>
                              <div>
                                <span className="font-medium">Duur: </span>
                                {transport.duration}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Geen transport informatie beschikbaar</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activities" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Activiteiten</h3>
                  {packageData.activities && packageData.activities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {packageData.activities.map((activity, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center mb-2">
                              <Camera className="h-5 w-5 mr-2 text-green-600" />
                              <h4 className="font-semibold">{activity.name}</h4>
                              <Badge
                                variant={activity.included ? "default" : "outline"}
                                className={`ml-auto ${activity.included ? "bg-green-100 text-green-700" : ""}`}
                              >
                                {activity.included ? "Inbegrepen" : "Optioneel"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{activity.type}</p>
                            <p className="text-sm mb-3">{activity.description}</p>
                            <div className="flex justify-between items-center text-sm">
                              <span>
                                <Clock className="h-4 w-4 inline mr-1" />
                                {activity.duration}
                              </span>
                              {activity.price && !activity.included && (
                                <span className="font-semibold text-green-600">{formatPrice(activity.price)}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Geen activiteiten informatie beschikbaar</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="inclusions" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-green-700">Inbegrepen</h3>
                    {packageData.inclusions && packageData.inclusions.length > 0 ? (
                      <ul className="space-y-2">
                        {packageData.inclusions.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Geen inclusies gespecificeerd</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-red-700">Niet inbegrepen</h3>
                    {packageData.exclusions && packageData.exclusions.length > 0 ? (
                      <ul className="space-y-2">
                        {packageData.exclusions.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Geen exclusies gespecificeerd</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="conditions" className="p-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Boekingsvoorwaarden</h3>
                  {packageData.bookingConditions && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Annuleringsbeleid</h4>
                          <p className="text-sm text-gray-700">{packageData.bookingConditions.cancellationPolicy}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Betalingsvoorwaarden</h4>
                          <p className="text-sm text-gray-700">{packageData.bookingConditions.paymentTerms}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Groepsgrootte</h4>
                          <p className="text-sm text-gray-700">
                            Minimale leeftijd: {packageData.bookingConditions.minimumAge} jaar
                            <br />
                            Maximale groepsgrootte: {packageData.bookingConditions.maximumGroupSize} personen
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Vereiste documenten</h4>
                          <ul className="text-sm text-gray-700">
                            {packageData.bookingConditions.requiredDocuments.map((doc, index) => (
                              <li key={index}>• {doc}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {packageData.contact && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Contact informatie</h4>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p>
                            <strong>Tour operator:</strong> {packageData.contact.tourOperator}
                          </p>
                          {packageData.contact.phone && (
                            <p>
                              <strong>Telefoon:</strong> {packageData.contact.phone}
                            </p>
                          )}
                          {packageData.contact.email && (
                            <p>
                              <strong>Email:</strong> {packageData.contact.email}
                            </p>
                          )}
                          {packageData.contact.website && (
                            <p>
                              <strong>Website:</strong>{" "}
                              <a
                                href={packageData.contact.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {packageData.contact.website}
                              </a>
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
