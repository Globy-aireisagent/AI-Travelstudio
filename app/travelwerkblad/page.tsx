"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Calendar,
  Users,
  Plane,
  Hotel,
  Camera,
  FileText,
  Edit,
  Download,
  Share,
  ArrowLeft,
  Globe,
  Star,
  Car,
  Ticket,
  Shield,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react"

interface TravelIdea {
  id: string
  originalIdeaId: string
  title: string
  description: string
  remarks: string
  imageUrl: string
  creationDate: string
  departureDate: string
  ideaUrl: string
  themes: string[]
  pricePerPerson: {
    amount: number
    currency: string
  }
  totalPrice: {
    amount: number
    currency: string
  }
  ribbonText: string
  destinations: Array<{
    type: string
    code: string
    name: string
    nextLocationDistance: string
    fromDay?: number
    toDay?: number
    country?: string
    description?: string
    imageUrls?: string[]
    geolocation?: {
      latitude: number
      longitude: number
    }
  }>
  itinerary: Array<{
    type: string
    code: string
    name: string
    nextLocationDistance: string
  }>
  customer: {
    name: string
    lastName: string
    email: string
    phoneNumber: string
  }
  counters: {
    adults: number
    children: number
    destinations: number
    hotels: number
    transports: number
    tickets: number
    cars: number
  }
  tripSpots: any[]
  closedTours: any[]
  transports: any[]
  transfers: any[]
  hotels: any[]
  tickets: any[]
  cars: any[]
  insurances: any[]
  manuals: any[]
  cruises: any[]
  searchMethod?: string
}

// Image Slideshow Component
function ImageSlideshow({ images, alt }: { images: string[]; alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <img
        src={`/placeholder.svg?height=200&width=300&text=${encodeURIComponent(alt)}`}
        alt={alt}
        className="w-full h-48 object-cover rounded-lg shadow-md"
      />
    )
  }

  if (images.length === 1) {
    return (
      <img src={images[0] || "/placeholder.svg"} alt={alt} className="w-full h-48 object-cover rounded-lg shadow-md" />
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="relative">
      <img
        src={images[currentIndex] || "/placeholder.svg"}
        alt={alt}
        className="w-full h-48 object-cover rounded-lg shadow-md"
      />
      {images.length > 1 && (
        <>
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
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  )
}

export default function TravelWerkbladPage() {
  const [travelIdea, setTravelIdea] = useState<TravelIdea | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load travel idea from localStorage
    const savedIdea = localStorage.getItem("importedTravelIdea")
    console.log("🔍 Raw localStorage travel idea data:", savedIdea)

    if (savedIdea && savedIdea !== "undefined") {
      try {
        const ideaData = JSON.parse(savedIdea)
        console.log("📋 Parsed travel idea data:", ideaData)

        if (ideaData && typeof ideaData === "object") {
          setTravelIdea(ideaData)
        } else {
          setError("Ongeldige travel idea data structuur")
        }
      } catch (error) {
        console.error("❌ Failed to parse travel idea data:", error)
        setError("Fout bij het laden van travel idea data")
      }
    } else {
      console.log("❌ No travel idea data found in localStorage")
      setError("Geen travel idea data gevonden")
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Travel werkblad laden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Globe className="h-16 w-16 text-red-400 mx-auto mb-4" />
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

  if (!travelIdea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Geen travel idea gevonden</h1>
          <p className="text-gray-600 mb-6">Er zijn geen geïmporteerde travel idea gegevens beschikbaar.</p>
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

  const formatPrice = (price: { amount: number; currency: string }) => {
    if (!price || price.amount === 0) return "Prijs op aanvraag"
    return `${price.currency === "EUR" ? "€" : price.currency}${price.amount.toLocaleString()}`
  }

  // Create day-by-day itinerary
  const createDayByDayItinerary = () => {
    const dayItems: { [key: number]: any[] } = {}

    // Add destinations
    travelIdea.destinations.forEach((destination) => {
      if (destination.fromDay) {
        for (let day = destination.fromDay; day <= (destination.toDay || destination.fromDay); day++) {
          if (!dayItems[day]) dayItems[day] = []
          dayItems[day].push({
            type: "destination",
            data: destination,
            day,
          })
        }
      }
    })

    // Add hotels
    travelIdea.hotels.forEach((hotel) => {
      if (hotel.day) {
        if (!dayItems[hotel.day]) dayItems[hotel.day] = []
        dayItems[hotel.day].push({
          type: "hotel",
          data: hotel,
          day: hotel.day,
        })
      }
    })

    // Add transports
    travelIdea.transports.forEach((transport) => {
      if (transport.day) {
        if (!dayItems[transport.day]) dayItems[transport.day] = []
        dayItems[transport.day].push({
          type: "transport",
          data: transport,
          day: transport.day,
        })
      }
    })

    // Add tickets/activities
    travelIdea.tickets.forEach((ticket) => {
      if (ticket.day) {
        if (!dayItems[ticket.day]) dayItems[ticket.day] = []
        dayItems[ticket.day].push({
          type: "activity",
          data: ticket,
          day: ticket.day,
        })
      }
    })

    // Add cars
    travelIdea.cars.forEach((car) => {
      if (car.pickupDay) {
        if (!dayItems[car.pickupDay]) dayItems[car.pickupDay] = []
        dayItems[car.pickupDay].push({
          type: "car_pickup",
          data: car,
          day: car.pickupDay,
        })
      }
      if (car.dropoffDay && car.dropoffDay !== car.pickupDay) {
        if (!dayItems[car.dropoffDay]) dayItems[car.dropoffDay] = []
        dayItems[car.dropoffDay].push({
          type: "car_dropoff",
          data: car,
          day: car.dropoffDay,
        })
      }
    })

    return dayItems
  }

  const dayByDayItinerary = createDayByDayItinerary()
  const sortedDays = Object.keys(dayByDayItinerary)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Travel Idea Werkblad
                </h1>
                <p className="text-sm text-gray-600">
                  {travelIdea.originalIdeaId} • Geïmporteerd via {travelIdea.searchMethod}
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
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
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
        {/* Travel Idea Overview */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{travelIdea.title}</CardTitle>
                <div className="flex items-center space-x-4 text-purple-100">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {travelIdea.destinations.length} bestemmingen
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(travelIdea.departureDate)}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {travelIdea.counters.adults + travelIdea.counters.children} personen
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{formatPrice(travelIdea.totalPrice)}</div>
                {travelIdea.pricePerPerson.amount > 0 && (
                  <div className="text-sm text-purple-100">{formatPrice(travelIdea.pricePerPerson)} per persoon</div>
                )}
                {travelIdea.ribbonText && (
                  <Badge className="bg-white/20 text-white mt-2">{travelIdea.ribbonText}</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Travel Idea Image */}
            {travelIdea.imageUrl && (
              <div className="mb-6">
                <img
                  src={travelIdea.imageUrl || "/placeholder.svg"}
                  alt={travelIdea.title}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Description */}
            {travelIdea.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Beschrijving</h3>
                <p className="text-gray-600">{travelIdea.description}</p>
              </div>
            )}

            {/* Themes */}
            {travelIdea.themes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Thema's</h3>
                <div className="flex flex-wrap gap-2">
                  {travelIdea.themes.map((theme, index) => (
                    <Badge key={index} variant="secondary">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics - Fixed to show actual counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Hotel className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{travelIdea.hotels.length}</div>
                <div className="text-sm text-gray-600">Hotels</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Plane className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{travelIdea.transports.length}</div>
                <div className="text-sm text-gray-600">Transport</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Camera className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{travelIdea.tickets.length}</div>
                <div className="text-sm text-gray-600">Activiteiten</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <MapPin className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{travelIdea.destinations.length}</div>
                <div className="text-sm text-gray-600">Bestemmingen</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Tabs */}
        <Tabs defaultValue="dagbijdag" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 bg-white/80 backdrop-blur-sm gap-1">
            <TabsTrigger value="dagbijdag" className="flex flex-col items-center space-y-1 p-3">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Dag bij dag</span>
            </TabsTrigger>
            <TabsTrigger value="destinations" className="flex flex-col items-center space-y-1 p-3">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Bestemmingen</span>
              <span className="text-xs text-gray-500">({travelIdea.destinations.length})</span>
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex flex-col items-center space-y-1 p-3">
              <Hotel className="h-4 w-4" />
              <span className="text-xs">Hotels</span>
              <span className="text-xs text-gray-500">({travelIdea.hotels.length})</span>
            </TabsTrigger>
            <TabsTrigger value="transport" className="flex flex-col items-center space-y-1 p-3">
              <Plane className="h-4 w-4" />
              <span className="text-xs">Transport</span>
              <span className="text-xs text-gray-500">({travelIdea.transports.length})</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex flex-col items-center space-y-1 p-3">
              <Camera className="h-4 w-4" />
              <span className="text-xs">Activiteiten</span>
              <span className="text-xs text-gray-500">({travelIdea.tickets.length})</span>
            </TabsTrigger>
            <TabsTrigger value="cars" className="flex flex-col items-center space-y-1 p-3">
              <Car className="h-4 w-4" />
              <span className="text-xs">Auto's</span>
              <span className="text-xs text-gray-500">({travelIdea.cars.length})</span>
            </TabsTrigger>
            <TabsTrigger value="extras" className="flex flex-col items-center space-y-1 p-3">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Extra's</span>
            </TabsTrigger>
          </TabsList>

          {/* Day by Day Tab */}
          <TabsContent value="dagbijdag" className="space-y-6">
            {sortedDays.length > 0 ? (
              sortedDays.map((day) => (
                <Card key={day} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Dag {day}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {dayByDayItinerary[day].map((item, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                          {item.type === "destination" && (
                            <div className="flex items-start space-x-4">
                              <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                              <div>
                                <h4 className="font-semibold text-gray-800">{item.data.name}</h4>
                                <p className="text-sm text-gray-600">{item.data.country}</p>
                                {item.data.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.data.description}</p>
                                )}
                              </div>
                            </div>
                          )}
                          {item.type === "hotel" && (
                            <div className="flex items-start space-x-4">
                              <Hotel className="h-5 w-5 text-green-600 mt-1" />
                              <div>
                                <h4 className="font-semibold text-gray-800">{item.data.hotelData?.name}</h4>
                                <p className="text-sm text-gray-600">
                                  Check-in: {formatDate(item.data.checkInDate)} • {item.data.nights} nachten
                                </p>
                                <p className="text-sm text-gray-600">{item.data.roomTypes}</p>
                              </div>
                            </div>
                          )}
                          {item.type === "transport" && (
                            <div className="flex items-start space-x-4">
                              <Plane className="h-5 w-5 text-purple-600 mt-1" />
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  {item.data.transportType} {item.data.transportNumber}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {item.data.originCode} → {item.data.targetCode}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Vertrek: {item.data.departureTime} • Aankomst: {item.data.arrivalTime}
                                </p>
                              </div>
                            </div>
                          )}
                          {item.type === "activity" && (
                            <div className="flex items-start space-x-4">
                              <Camera className="h-5 w-5 text-orange-600 mt-1" />
                              <div>
                                <h4 className="font-semibold text-gray-800">{item.data.name}</h4>
                                <p className="text-sm text-gray-600">{item.data.modality}</p>
                                <p className="text-sm text-gray-600">
                                  {formatDate(item.data.eventDate)} • {item.data.eventTime || "Hele dag"}
                                </p>
                              </div>
                            </div>
                          )}
                          {item.type === "car_pickup" && (
                            <div className="flex items-start space-x-4">
                              <Car className="h-5 w-5 text-blue-600 mt-1" />
                              <div>
                                <h4 className="font-semibold text-gray-800">Auto ophalen: {item.data.product}</h4>
                                <p className="text-sm text-gray-600">{item.data.company}</p>
                                <p className="text-sm text-gray-600">
                                  Locatie: {item.data.pickupLocation} • {item.data.pickupTime}
                                </p>
                              </div>
                            </div>
                          )}
                          {item.type === "car_dropoff" && (
                            <div className="flex items-start space-x-4">
                              <Car className="h-5 w-5 text-red-600 mt-1" />
                              <div>
                                <h4 className="font-semibold text-gray-800">Auto inleveren: {item.data.product}</h4>
                                <p className="text-sm text-gray-600">{item.data.company}</p>
                                <p className="text-sm text-gray-600">
                                  Locatie: {item.data.dropoffLocation} • {item.data.dropoffTime}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen dag-informatie beschikbaar voor deze travel idea</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Destinations Tab */}
          <TabsContent value="destinations" className="space-y-4">
            {travelIdea.destinations.length > 0 ? (
              travelIdea.destinations.map((destination, index) => (
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
                              <span className="text-gray-600">{destination.country || destination.code}</span>
                            </div>
                          </div>
                          <Badge>{destination.type}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {destination.fromDay && (
                            <div>
                              <strong>Dagen:</strong> {destination.fromDay} - {destination.toDay}
                            </div>
                          )}
                          {destination.nextLocationDistance && (
                            <div>
                              <strong>Afstand volgende:</strong> {destination.nextLocationDistance}
                            </div>
                          )}
                        </div>
                        {destination.description && (
                          <p className="text-gray-600 mt-4 text-sm">{destination.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen bestemmingen gevonden in deze travel idea</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Hotels Tab */}
          <TabsContent value="hotels" className="space-y-4">
            {travelIdea.hotels.length > 0 ? (
              travelIdea.hotels.map((hotel, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <ImageSlideshow
                          images={hotel.hotelData?.images?.map((img) => img.url) || []}
                          alt={hotel.hotelData?.name || "Hotel"}
                        />
                      </div>
                      <div className="md:w-2/3">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{hotel.hotelData?.name}</h3>
                            <div className="flex items-center mt-1">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-gray-600">{hotel.hotelData?.category} sterren</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {hotel.priceBreakdown?.totalPrice && (
                              <div className="text-lg font-bold text-green-600">
                                €{hotel.priceBreakdown.totalPrice.microsite.amount.toLocaleString()}
                              </div>
                            )}
                            <Badge className="mt-1">{hotel.nights} nachten</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Check-in:</strong> {formatDate(hotel.checkInDate)}
                          </div>
                          <div>
                            <strong>Check-out:</strong> {formatDate(hotel.checkOutDate)}
                          </div>
                          <div>
                            <strong>Kamertype:</strong> {hotel.roomTypes || "Standaard"}
                          </div>
                          <div>
                            <strong>Maaltijden:</strong> {hotel.mealPlan || "Geen"}
                          </div>
                        </div>
                        {hotel.hotelData?.description && (
                          <p className="text-gray-600 mt-4 text-sm">{hotel.hotelData.description}</p>
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
                  <p className="text-gray-600">Geen hotels gevonden in deze travel idea</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport" className="space-y-4">
            {travelIdea.transports.length > 0 ? (
              travelIdea.transports.map((transport, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {transport.transportType} {transport.transportNumber && `- ${transport.transportNumber}`}
                        </h3>
                        <div className="flex items-center mt-2 space-x-4">
                          <div className="flex items-center">
                            <Plane className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-600">
                              {transport.originCode} → {transport.targetCode}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {transport.priceBreakdown?.totalPrice && (
                          <div className="text-lg font-bold text-purple-600">
                            €{transport.priceBreakdown.totalPrice.microsite.amount.toLocaleString()}
                          </div>
                        )}
                        <Badge className="mt-1">{transport.company}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Vertrek:</strong> {formatDate(transport.departureDate)}
                        <br />
                        <strong>Tijd:</strong> {transport.departureTime || "Onbekend"}
                      </div>
                      <div>
                        <strong>Aankomst:</strong> {formatDate(transport.arrivalDate)}
                        <br />
                        <strong>Tijd:</strong> {transport.arrivalTime || "Onbekend"}
                      </div>
                      <div>
                        <strong>Duur:</strong> {transport.duration || "Onbekend"}
                        <br />
                        <strong>Segmenten:</strong> {transport.numberOfSegments || 1}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen transport gevonden in deze travel idea</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            {travelIdea.tickets.length > 0 ? (
              travelIdea.tickets.map((ticket, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <ImageSlideshow images={ticket.imageUrls || []} alt={ticket.name} />
                      </div>
                      <div className="md:w-2/3">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{ticket.name}</h3>
                            <div className="flex items-center mt-1">
                              <Ticket className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-gray-600">{ticket.modality}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {ticket.priceBreakdown?.totalPrice && (
                              <div className="text-lg font-bold text-green-600">
                                €{ticket.priceBreakdown.totalPrice.microsite.amount.toLocaleString()}
                              </div>
                            )}
                            <Badge className="mt-1">Dag {ticket.day}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Datum:</strong> {formatDate(ticket.eventDate)}
                          </div>
                          <div>
                            <strong>Tijd:</strong> {ticket.eventTime || "Hele dag"}
                          </div>
                          <div>
                            <strong>Duur:</strong> {ticket.duration || "Onbekend"}
                          </div>
                          <div>
                            <strong>Ontmoetingspunt:</strong> {ticket.meetingPoint || "Ter plaatse"}
                          </div>
                        </div>
                        {ticket.description && <p className="text-gray-600 mt-4 text-sm">{ticket.description}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen activiteiten gevonden in deze travel idea</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars" className="space-y-4">
            {travelIdea.cars.length > 0 ? (
              travelIdea.cars.map((car, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <img
                          src={
                            car.imageUrl ||
                            `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(car.product) || "/placeholder.svg"}`
                          }
                          alt={car.product}
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{car.product}</h3>
                            <div className="flex items-center mt-1">
                              <Car className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-gray-600">{car.company}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {car.priceBreakdown?.totalPrice && (
                              <div className="text-lg font-bold text-blue-600">
                                €{car.priceBreakdown.totalPrice.microsite.amount.toLocaleString()}
                              </div>
                            )}
                            <Badge className="mt-1">{car.transmissionType}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Ophalen:</strong> {formatDate(car.pickupDate)}
                            <br />
                            <strong>Locatie:</strong> {car.pickupLocation}
                          </div>
                          <div>
                            <strong>Inleveren:</strong> {formatDate(car.dropoffDate)}
                            <br />
                            <strong>Locatie:</strong> {car.dropoffLocation}
                          </div>
                          <div>
                            <strong>Brandstof:</strong> {car.fuelType}
                          </div>
                          <div>
                            <strong>Min. leeftijd:</strong> {car.minimumAge} jaar
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen auto's gevonden in deze travel idea</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Extras Tab */}
          <TabsContent value="extras" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Insurances */}
              {travelIdea.insurances.length > 0 && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Verzekeringen ({travelIdea.insurances.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {travelIdea.insurances.map((insurance, index) => (
                      <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold">{insurance.type}</h4>
                        <p className="text-sm text-gray-600">Regio: {insurance.region}</p>
                        {insurance.priceBreakdown?.totalPrice && (
                          <p className="text-sm font-medium text-green-600">
                            €{insurance.priceBreakdown.totalPrice.microsite.amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Manual Services */}
              {travelIdea.manuals.length > 0 && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Handmatige Services ({travelIdea.manuals.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {travelIdea.manuals.map((manual, index) => (
                      <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold">{manual.type}</h4>
                        <p className="text-sm text-gray-600">{manual.description}</p>
                        {manual.priceBreakdown?.totalPrice && (
                          <p className="text-sm font-medium text-green-600">
                            €{manual.priceBreakdown.totalPrice.microsite.amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {travelIdea.insurances.length === 0 && travelIdea.manuals.length === 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Geen extra services gevonden in deze travel idea</p>
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
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Exporteer als PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
