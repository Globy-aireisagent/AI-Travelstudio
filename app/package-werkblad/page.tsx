"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Hotel,
  Plane,
  Camera,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Euro,
  Star,
  Navigation,
  Phone,
  Mail,
  Globe,
  Download,
  Share2,
  Edit,
  Home,
} from "lucide-react"
import Link from "next/link"

interface HolidayPackage {
  id?: string
  packageId?: string
  name?: string
  title?: string
  destination?: string
  description?: string
  duration?: number
  price?: number
  currency?: string
  startDate?: string
  endDate?: string
  maxParticipants?: number
  minParticipants?: number
  category?: string
  difficulty?: string
  highlights?: string[]
  inclusions?: string[]
  exclusions?: string[]
  itinerary?: Array<{
    day: number
    title: string
    description: string
    activities: string[]
    accommodation?: string
    meals?: string[]
  }>
  accommodations?: Array<{
    name: string
    type: string
    location: string
    rating?: number
    amenities?: string[]
  }>
  transport?: Array<{
    type: string
    from: string
    to: string
    date: string
    details?: string
  }>
  activities?: Array<{
    name: string
    type: string
    duration: string
    description: string
    included: boolean
  }>
  bookingConditions?: {
    cancellationPolicy?: string
    paymentTerms?: string
    requirements?: string[]
  }
  contact?: {
    phone?: string
    email?: string
    website?: string
  }
}

export default function PackageWerkbladPage() {
  const [packageData, setPackageData] = useState<HolidayPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load package data from localStorage
    try {
      const savedPackage = localStorage.getItem("importedHolidayPackage")
      if (savedPackage) {
        const parsed = JSON.parse(savedPackage)
        console.log("📦 Loaded holiday package:", parsed)
        setPackageData(parsed)
      } else {
        setError("Geen holiday package data gevonden. Importeer eerst een package.")
      }
    } catch (error) {
      console.error("❌ Error loading package data:", error)
      setError("Fout bij laden van package data")
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Holiday package laden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Fout</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/import">
              <Button className="bg-purple-600 hover:bg-purple-700">Terug naar Import</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Geen Package Data</h2>
            <p className="text-gray-600 mb-4">Er is geen holiday package data beschikbaar.</p>
            <Link href="/import">
              <Button className="bg-purple-600 hover:bg-purple-700">Holiday Package Importeren</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const packageId = packageData.id || packageData.packageId || "Unknown"
  const packageName = packageData.name || packageData.title || "Holiday Package"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
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
                <p className="text-sm text-gray-600">Package ID: {packageId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                <FileText className="h-4 w-4 mr-1" />
                Holiday Package
              </Badge>
              <Link href="/agent-dashboard">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 px-6 py-3">
                  <Home className="w-4 h-4 mr-2" />
                  Agent HQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Package Overview */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{packageName}</CardTitle>
                <CardDescription className="text-purple-100">
                  {packageData.destination && (
                    <span className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {packageData.destination}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="text-right">
                {packageData.price && <div className="text-3xl font-bold">€{packageData.price.toLocaleString()}</div>}
                {packageData.duration && <div className="text-purple-100">{packageData.duration} dagen</div>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {packageData.description && <p className="text-gray-700 mb-4">{packageData.description}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {packageData.startDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                  <div>
                    <div className="font-medium">Start</div>
                    <div>{new Date(packageData.startDate).toLocaleDateString("nl-NL")}</div>
                  </div>
                </div>
              )}

              {packageData.maxParticipants && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-purple-500" />
                  <div>
                    <div className="font-medium">Max deelnemers</div>
                    <div>{packageData.maxParticipants} personen</div>
                  </div>
                </div>
              )}

              {packageData.category && (
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="h-4 w-4 mr-2 text-purple-500" />
                  <div>
                    <div className="font-medium">Categorie</div>
                    <div>{packageData.category}</div>
                  </div>
                </div>
              )}

              {packageData.difficulty && (
                <div className="flex items-center text-sm text-gray-600">
                  <Navigation className="h-4 w-4 mr-2 text-purple-500" />
                  <div>
                    <div className="font-medium">Moeilijkheidsgraad</div>
                    <div>{packageData.difficulty}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs defaultValue="itinerary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-2">
            <TabsTrigger value="itinerary" className="rounded-xl">
              <Calendar className="h-4 w-4 mr-2" />
              Reisschema
            </TabsTrigger>
            <TabsTrigger value="accommodations" className="rounded-xl">
              <Hotel className="h-4 w-4 mr-2" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="transport" className="rounded-xl">
              <Plane className="h-4 w-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="activities" className="rounded-xl">
              <Camera className="h-4 w-4 mr-2" />
              Activiteiten
            </TabsTrigger>
            <TabsTrigger value="inclusions" className="rounded-xl">
              <CheckCircle className="h-4 w-4 mr-2" />
              Inclusies
            </TabsTrigger>
            <TabsTrigger value="conditions" className="rounded-xl">
              <FileText className="h-4 w-4 mr-2" />
              Voorwaarden
            </TabsTrigger>
          </TabsList>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                  Dag-tot-dag Reisschema
                </CardTitle>
              </CardHeader>
              <CardContent>
                {packageData.itinerary && packageData.itinerary.length > 0 ? (
                  <div className="space-y-6">
                    {packageData.itinerary.map((day, index) => (
                      <div key={index} className="border-l-4 border-purple-500 pl-6 pb-6">
                        <div className="flex items-center mb-2">
                          <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                            {day.day}
                          </div>
                          <h3 className="text-lg font-semibold">{day.title}</h3>
                        </div>
                        <p className="text-gray-700 mb-3">{day.description}</p>

                        {day.activities && day.activities.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-medium text-sm text-gray-600 mb-2">Activiteiten:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {day.activities.map((activity, actIndex) => (
                                <li key={actIndex}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                          {day.accommodation && (
                            <div className="flex items-center text-gray-600">
                              <Hotel className="h-4 w-4 mr-1" />
                              {day.accommodation}
                            </div>
                          )}
                          {day.meals && day.meals.length > 0 && (
                            <div className="flex items-center text-gray-600">
                              <span className="mr-1">🍽️</span>
                              {day.meals.join(", ")}
                            </div>
                          )}
                        </div>
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
          <TabsContent value="accommodations">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hotel className="h-5 w-5 mr-2 text-purple-500" />
                  Accommodaties
                </CardTitle>
              </CardHeader>
              <CardContent>
                {packageData.accommodations && packageData.accommodations.length > 0 ? (
                  <div className="grid gap-6">
                    {packageData.accommodations.map((accommodation, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold">{accommodation.name}</h3>
                              <p className="text-sm text-gray-600">{accommodation.type}</p>
                            </div>
                            {accommodation.rating && (
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < accommodation.rating! ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-1" />
                            {accommodation.location}
                          </div>

                          {accommodation.amenities && accommodation.amenities.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-2">Faciliteiten:</h4>
                              <div className="flex flex-wrap gap-2">
                                {accommodation.amenities.map((amenity, amenityIndex) => (
                                  <Badge key={amenityIndex} variant="secondary" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Geen accommodatie details beschikbaar</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plane className="h-5 w-5 mr-2 text-purple-500" />
                  Transport Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {packageData.transport && packageData.transport.length > 0 ? (
                  <div className="space-y-4">
                    {packageData.transport.map((transport, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                {transport.type === "flight" && <Plane className="h-5 w-5 text-purple-600" />}
                                {transport.type === "bus" && <span className="text-purple-600">🚌</span>}
                                {transport.type === "train" && <span className="text-purple-600">🚂</span>}
                                {transport.type === "car" && <span className="text-purple-600">🚗</span>}
                              </div>
                              <div>
                                <h3 className="font-semibold capitalize">{transport.type}</h3>
                                <p className="text-sm text-gray-600">
                                  {transport.from} → {transport.to}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{transport.date}</div>
                            </div>
                          </div>
                          {transport.details && <p className="text-sm text-gray-600 mt-2">{transport.details}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Geen transport details beschikbaar</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-purple-500" />
                  Activiteiten & Excursies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {packageData.activities && packageData.activities.length > 0 ? (
                  <div className="grid gap-4">
                    {packageData.activities.map((activity, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{activity.name}</h3>
                              <p className="text-sm text-gray-600 capitalize">{activity.type}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={activity.included ? "default" : "secondary"}>
                                {activity.included ? "Inbegrepen" : "Optioneel"}
                              </Badge>
                              <div className="text-sm text-gray-600">{activity.duration}</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{activity.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Geen activiteiten details beschikbaar</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inclusions Tab */}
          <TabsContent value="inclusions">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Inclusions */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Inbegrepen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {packageData.inclusions && packageData.inclusions.length > 0 ? (
                    <ul className="space-y-2">
                      {packageData.inclusions.map((inclusion, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Geen inclusies gespecificeerd</p>
                  )}
                </CardContent>
              </Card>

              {/* Exclusions */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <XCircle className="h-5 w-5 mr-2" />
                    Niet Inbegrepen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {packageData.exclusions && packageData.exclusions.length > 0 ? (
                    <ul className="space-y-2">
                      {packageData.exclusions.map((exclusion, index) => (
                        <li key={index} className="flex items-start">
                          <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{exclusion}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Geen exclusies gespecificeerd</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Highlights */}
            {packageData.highlights && packageData.highlights.length > 0 && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-600">
                    <Star className="h-5 w-5 mr-2" />
                    Hoogtepunten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {packageData.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Conditions Tab */}
          <TabsContent value="conditions">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-500" />
                  Boekingsvoorwaarden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {packageData.bookingConditions?.cancellationPolicy && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      Annuleringsvoorwaarden
                    </h3>
                    <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg">
                      {packageData.bookingConditions.cancellationPolicy}
                    </p>
                  </div>
                )}

                {packageData.bookingConditions?.paymentTerms && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Euro className="h-4 w-4 mr-2 text-green-500" />
                      Betalingsvoorwaarden
                    </h3>
                    <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                      {packageData.bookingConditions.paymentTerms}
                    </p>
                  </div>
                )}

                {packageData.bookingConditions?.requirements &&
                  packageData.bookingConditions.requirements.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                        Vereisten
                      </h3>
                      <ul className="space-y-1">
                        {packageData.bookingConditions.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            {requirement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Contact Information */}
                {packageData.contact && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-purple-500" />
                      Contact Informatie
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {packageData.contact.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <a href={`tel:${packageData.contact.phone}`} className="text-blue-600 hover:underline">
                            {packageData.contact.phone}
                          </a>
                        </div>
                      )}
                      {packageData.contact.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <a href={`mailto:${packageData.contact.email}`} className="text-blue-600 hover:underline">
                            {packageData.contact.email}
                          </a>
                        </div>
                      )}
                      {packageData.contact.website && (
                        <div className="flex items-center text-sm">
                          <Globe className="h-4 w-4 mr-2 text-gray-500" />
                          <a
                            href={packageData.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            className="px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Delen
          </Button>
          <Button
            variant="outline"
            className="px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-transparent"
          >
            <Edit className="h-4 w-4 mr-2" />
            Bewerken
          </Button>
        </div>
      </div>
    </div>
  )
}
