"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  FileText,
  Download,
  Share2,
  Edit,
  CheckCircle,
  AlertCircle,
  Star,
  Phone,
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
  const [error, setError] = useState<string>("")

  useEffect(() => {
    // Load package data from localStorage
    try {
      const savedPackage = localStorage.getItem("importedHolidayPackage")
      if (savedPackage) {
        const parsedPackage = JSON.parse(savedPackage)
        console.log("📦 Loaded holiday package from localStorage:", parsedPackage)
        setPackageData(parsedPackage)
      } else {
        setError("Geen holiday package data gevonden. Ga terug naar import om een package te importeren.")
      }
    } catch (error) {
      console.error("❌ Error loading package data:", error)
      setError("Fout bij het laden van package data.")
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Holiday Package laden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Geen Package Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/import">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Terug naar Import</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Geen Package Gevonden</h2>
            <p className="text-gray-600 mb-4">Er is geen holiday package data beschikbaar.</p>
            <Link href="/import">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Importeer Holiday Package</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-white" />
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
                <Star className="h-4 w-4 mr-1" />
                Holiday Package
              </Badge>
              <Link href="/agent-dashboard">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 px-6 py-3">
                  🏠 Agent HQ
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
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{packageData.name}</CardTitle>
                  <CardDescription className="text-purple-100 mt-2">{packageData.shortDescription}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">€{packageData.priceFrom.amount || 0}</div>
                  <div className="text-sm text-purple-100">vanaf per persoon</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-semibold">{packageData.duration} dagen</p>
                    <p className="text-sm text-gray-600">Duur</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-semibold">{packageData.destinations.join(", ") || "Diverse bestemmingen"}</p>
                    <p className="text-sm text-gray-600">Bestemmingen</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold">
                      {packageData.availability.available ? "Beschikbaar" : "Niet beschikbaar"}
                    </p>
                    <p className="text-sm text-gray-600">Status</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="font-semibold">{packageData.themes.join(", ") || "Vakantie"}</p>
                    <p className="text-sm text-gray-600">Thema's</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-2">
              <TabsTrigger value="overview" className="rounded-xl">
                Overzicht
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="rounded-xl">
                Reisschema
              </TabsTrigger>
              <TabsTrigger value="accommodations" className="rounded-xl">
                Hotels
              </TabsTrigger>
              <TabsTrigger value="activities" className="rounded-xl">
                Activiteiten
              </TabsTrigger>
              <TabsTrigger value="transport" className="rounded-xl">
                Transport
              </TabsTrigger>
              <TabsTrigger value="conditions" className="rounded-xl">
                Voorwaarden
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-purple-600" />
                      Beschrijving
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {packageData.description || "Geen beschrijving beschikbaar."}
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Inbegrepen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <ul className="space-y-2">
                        {packageData.inclusions.length > 0 ? (
                          packageData.inclusions.map((inclusion, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{inclusion}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 text-sm">Geen specifieke inclusies vermeld</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Pricing */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Euro className="h-5 w-5 mr-2 text-green-600" />
                    Prijsinformatie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">€{packageData.priceFrom.amount || 0}</div>
                      <div className="text-sm text-gray-600">Vanaf prijs</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">€{packageData.pricePerPerson.amount || 0}</div>
                      <div className="text-sm text-gray-600">Per persoon</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">€{packageData.totalPrice.amount || 0}</div>
                      <div className="text-sm text-gray-600">Totaalprijs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Itinerary Tab */}
            <TabsContent value="itinerary" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                    Dag-voor-dag Reisschema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {packageData.itinerary.length > 0 ? (
                    <div className="space-y-4">
                      {packageData.itinerary.map((day, index) => (
                        <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                          <div className="flex items-center mb-2">
                            <Badge className="bg-purple-100 text-purple-700 mr-2">Dag {day.day}</Badge>
                            <h3 className="font-semibold">{day.title}</h3>
                          </div>
                          <p className="text-gray-700 mb-2">{day.description}</p>
                          {day.activities.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-600">Activiteiten:</p>
                              <ul className="text-sm text-gray-600 ml-4">
                                {day.activities.map((activity, actIndex) => (
                                  <li key={actIndex}>• {activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {day.accommodation && (
                            <p className="text-sm text-gray-600">
                              <Hotel className="h-4 w-4 inline mr-1" />
                              Accommodatie: {day.accommodation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Geen gedetailleerd reisschema beschikbaar</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accommodations Tab */}
            <TabsContent value="accommodations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {packageData.accommodations.length > 0 ? (
                  packageData.accommodations.map((accommodation, index) => (
                    <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Hotel className="h-5 w-5 mr-2 text-blue-600" />
                          {accommodation.name}
                        </CardTitle>
                        <CardDescription>
                          {accommodation.type} • {accommodation.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{accommodation.category} sterren categorie</span>
                          </div>
                          <p className="text-gray-700 text-sm">{accommodation.description}</p>
                          {accommodation.amenities.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Faciliteiten:</p>
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
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Geen specifieke accommodatie informatie beschikbaar</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {packageData.activities.length > 0 ? (
                  packageData.activities.map((activity, index) => (
                    <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Camera className="h-5 w-5 mr-2 text-green-600" />
                            {activity.name}
                          </div>
                          {activity.included ? (
                            <Badge className="bg-green-100 text-green-700">Inbegrepen</Badge>
                          ) : (
                            <Badge variant="outline">Optioneel</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{activity.type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-gray-700 text-sm">{activity.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-sm text-gray-600">{activity.duration}</span>
                            </div>
                            {activity.price && (
                              <div className="text-sm font-medium text-green-600">€{activity.price.amount}</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Geen specifieke activiteiten informatie beschikbaar</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Transport Tab */}
            <TabsContent value="transport" className="space-y-6">
              <div className="space-y-4">
                {packageData.transports.length > 0 ? (
                  packageData.transports.map((transport, index) => (
                    <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Plane className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-semibold">
                                {transport.from} → {transport.to}
                              </p>
                              <p className="text-sm text-gray-600">
                                {transport.type} • {transport.company}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{transport.date}</p>
                            <p className="text-sm text-gray-600">
                              {transport.time} • {transport.duration}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Geen specifieke transport informatie beschikbaar</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Conditions Tab */}
            <TabsContent value="conditions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-red-600" />
                      Boekingsvoorwaarden
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-700">Annuleringsbeleid:</p>
                      <p className="text-sm text-gray-600">{packageData.bookingConditions.cancellationPolicy}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Betalingsvoorwaarden:</p>
                      <p className="text-sm text-gray-600">{packageData.bookingConditions.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Minimumleeftijd:</p>
                      <p className="text-sm text-gray-600">{packageData.bookingConditions.minimumAge} jaar</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Maximale groepsgrootte:</p>
                      <p className="text-sm text-gray-600">{packageData.bookingConditions.maximumGroupSize} personen</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-blue-600" />
                      Contact & Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-700">Tour Operator:</p>
                      <p className="text-sm text-gray-600">{packageData.contact.tourOperator}</p>
                    </div>
                    {packageData.contact.phone && (
                      <div>
                        <p className="font-medium text-gray-700">Telefoon:</p>
                        <p className="text-sm text-gray-600">{packageData.contact.phone}</p>
                      </div>
                    )}
                    {packageData.contact.email && (
                      <div>
                        <p className="font-medium text-gray-700">Email:</p>
                        <p className="text-sm text-gray-600">{packageData.contact.email}</p>
                      </div>
                    )}
                    {packageData.contact.website && (
                      <div>
                        <p className="font-medium text-gray-700">Website:</p>
                        <p className="text-sm text-gray-600">{packageData.contact.website}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-700">Vereiste documenten:</p>
                      <ul className="text-sm text-gray-600 ml-4">
                        {packageData.bookingConditions.requiredDocuments.map((doc, index) => (
                          <li key={index}>• {doc}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 justify-center">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Bewerk Package
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent">
                  <Share2 className="h-4 w-4 mr-2" />
                  Deel Package
                </Button>
                <Link href="/import">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Nieuw Package
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
