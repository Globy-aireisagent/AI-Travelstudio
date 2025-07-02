"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Clock,
  Car,
  Bed,
  Camera,
  Plane,
  Calendar,
  Users,
  Euro,
  Phone,
  Mail,
  Download,
  Share2,
  MessageCircle,
  Star,
  Info,
  ChevronRight,
  ChevronLeft,
  Edit3,
  Loader2,
  BookOpen,
  Route,
  Compass,
} from "lucide-react"

interface UniversalRoadbookProps {
  bookingData: any
  onEdit?: (section: string, data: any) => void
  onEnrichWithAI?: () => void
  isEnriching?: boolean
}

export default function UniversalRoadbookTemplate({
  bookingData,
  onEdit,
  onEnrichWithAI,
  isEnriching = false,
}: UniversalRoadbookProps) {
  const [currentDay, setCurrentDay] = useState(1)
  const [viewMode, setViewMode] = useState<"overview" | "daily" | "itinerary">("overview")
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

  // Safe data extraction with fallbacks
  const safeBooking = bookingData || {}
  const title = safeBooking.descriptions?.title || safeBooking.title || "Reis"
  const client = safeBooking.client || {}
  const services = safeBooking.services || {}
  const destinations = safeBooking.destinations || []
  const images = safeBooking.images || []
  const totalDays = calculateTotalDays()
  const days = generateDays()

  function calculateTotalDays(): number {
    if (safeBooking.totalDays) return safeBooking.totalDays
    if (safeBooking.startDate && safeBooking.endDate) {
      const start = new Date(safeBooking.startDate)
      const end = new Date(safeBooking.endDate)
      return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    }
    return Math.max(1, (services.hotels?.length || 0) + 1)
  }

  function generateDays() {
    const generatedDays = []
    const startDate = safeBooking.startDate ? new Date(safeBooking.startDate) : new Date()

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const currentDate = new Date(startDate.getTime() + (dayNum - 1) * 24 * 60 * 60 * 1000)

      // Find services for this day
      const dayHotels = (services.hotels || []).filter((hotel: any) => {
        if (hotel.checkInDate) {
          const checkIn = new Date(hotel.checkInDate)
          const checkOut = hotel.checkOutDate
            ? new Date(hotel.checkOutDate)
            : new Date(checkIn.getTime() + 24 * 60 * 60 * 1000)
          return currentDate >= checkIn && currentDate < checkOut
        }
        return dayNum === 1
      })

      const dayActivities = (services.tickets || []).filter((ticket: any) => {
        if (ticket.date) {
          const ticketDate = new Date(ticket.date)
          return ticketDate.toDateString() === currentDate.toDateString()
        }
        return false
      })

      const dayTransports = (services.transports || []).filter((transport: any) => {
        if (transport.departureDate) {
          const transportDate = new Date(transport.departureDate)
          return transportDate.toDateString() === currentDate.toDateString()
        }
        return false
      })

      const dayCars = (services.cars || []).filter((car: any) => {
        if (car.pickupDate) {
          const pickupDate = new Date(car.pickupDate)
          return pickupDate.toDateString() === currentDate.toDateString()
        }
        return false
      })

      const dayTours = (services.closedTours || []).filter((tour: any) => {
        if (tour.date) {
          const tourDate = new Date(tour.date)
          return tourDate.toDateString() === currentDate.toDateString()
        }
        return false
      })

      // Generate day title
      let dayTitle = `Dag ${dayNum}`
      if (destinations.length > 0) {
        const destIndex = Math.floor((dayNum - 1) / Math.max(1, totalDays / destinations.length))
        const destination = destinations[Math.min(destIndex, destinations.length - 1)]
        dayTitle = destination.name || dayTitle
      }

      // Use hotel location if available
      if (dayHotels.length > 0 && dayHotels[0].location) {
        dayTitle = dayHotels[0].location
      }

      generatedDays.push({
        day: dayNum,
        date: currentDate.toISOString(),
        title: dayTitle,
        hotels: dayHotels,
        activities: dayActivities,
        transports: dayTransports,
        cars: dayCars,
        tours: dayTours,
        highlights: [], // Can be filled by AI
        tips: [], // Can be filled by AI
        route: "",
        weather: null,
        budget: null,
      })
    }

    return generatedDays
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const formatPrice = (price: any) => {
    if (!price) return "Prijs op aanvraag"
    if (typeof price === "number") return `€${price.toLocaleString()}`
    if (price.amount) return `€${price.amount.toLocaleString()}`
    if (price.microsite?.amount) return `€${price.microsite.amount.toLocaleString()}`
    return "Prijs op aanvraag"
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Datum onbekend"
    return new Date(dateStr).toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getMainImage = () => {
    if (images.length > 0) return images[0]
    const destination = destinations[0]?.name || title
    return `/placeholder.svg?height=400&width=800&text=${encodeURIComponent(destination)}&bg=gradient`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{totalDays} dagen</span>
                  </span>
                  {client.name && (
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{client.name}</span>
                    </span>
                  )}
                  {safeBooking.totalPrice && (
                    <span className="flex items-center space-x-1">
                      <Euro className="w-4 h-4" />
                      <span>{formatPrice(safeBooking.totalPrice)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {onEnrichWithAI && (
                <Button onClick={onEnrichWithAI} disabled={isEnriching} variant="outline" size="sm">
                  {isEnriching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      AI Verrijkt...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Verrijk met AI
                    </>
                  )}
                </Button>
              )}

              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                AI Reisbuddy
              </Button>

              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Delen
              </Button>

              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Compass className="w-4 h-4" />
              <span>Overzicht</span>
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Per Dag</span>
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="flex items-center space-x-2">
              <Route className="w-4 h-4" />
              <span>Route</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Hero Section */}
            <Card className="overflow-hidden relative group">
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onEdit("hero", { title, images })}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Bewerk
                </Button>
              )}

              <div className="relative h-80 bg-gradient-to-r from-blue-400 to-orange-400">
                <img
                  src={getMainImage() || "/placeholder.svg"}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const destination = destinations[0]?.name || title
                    e.currentTarget.src = `/placeholder.svg?height=400&width=800&text=${encodeURIComponent(destination)}&bg=gradient`
                  }}
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h2 className="text-4xl font-bold mb-4">{title}</h2>
                  <div className="flex items-center space-x-6 text-lg">
                    {safeBooking.startDate && safeBooking.endDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>
                          {new Date(safeBooking.startDate).toLocaleDateString("nl-NL")} -{" "}
                          {new Date(safeBooking.endDate).toLocaleDateString("nl-NL")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>{totalDays} dagen</span>
                    </div>
                    {destinations.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5" />
                        <span>{destinations.map((d) => d.name).join(" • ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bed className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{services.hotels?.length || 0}</div>
                <div className="text-sm text-gray-600">Hotels</div>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{services.tickets?.length || 0}</div>
                <div className="text-sm text-gray-600">Activiteiten</div>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plane className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{services.transports?.length || 0}</div>
                <div className="text-sm text-gray-600">Vervoer</div>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{destinations.length}</div>
                <div className="text-sm text-gray-600">Bestemmingen</div>
              </Card>
            </div>

            {/* Description */}
            {safeBooking.descriptions?.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <span>Over deze reis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{safeBooking.descriptions.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Destinations Overview */}
            {destinations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>Bestemmingen</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {destinations.map((destination: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <h3 className="font-semibold text-gray-900">{destination.name}</h3>
                        </div>
                        {destination.description && <p className="text-sm text-gray-600">{destination.description}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hotels */}
              {services.hotels && services.hotels.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bed className="w-5 h-5 text-purple-600" />
                      <span>Accommodaties</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {services.hotels.map((hotel: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                        <Bed className="w-5 h-5 text-purple-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{hotel.displayName || hotel.name}</h4>
                          {hotel.location && <p className="text-sm text-gray-600">{hotel.location}</p>}
                          {hotel.checkInDate && (
                            <p className="text-xs text-gray-500">
                              Check-in: {new Date(hotel.checkInDate).toLocaleDateString("nl-NL")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Activities */}
              {services.tickets && services.tickets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Camera className="w-5 h-5 text-green-600" />
                      <span>Activiteiten</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {services.tickets.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <Camera className="w-5 h-5 text-green-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{activity.displayName || activity.name}</h4>
                          {activity.location && <p className="text-sm text-gray-600">{activity.location}</p>}
                          {activity.date && (
                            <p className="text-xs text-gray-500">
                              {new Date(activity.date).toLocaleDateString("nl-NL")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Photo Gallery */}
            {images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <span>Foto Galerij ({images.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.slice(0, 12).map((image: string, index: number) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${title} foto ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const destination = destinations[0]?.name || title
                            e.currentTarget.src = `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(destination)}&bg=gradient`
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {images.length > 12 && (
                    <div className="text-center mt-4">
                      <Button variant="outline" size="sm">
                        Bekijk alle {images.length} foto's
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Daily Tab */}
          <TabsContent value="daily" className="space-y-6">
            {/* Day Navigation */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2 bg-white rounded-full p-2 shadow-lg border">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
                  disabled={currentDay === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {days.map((day) => (
                  <Button
                    key={day.day}
                    size="sm"
                    variant={currentDay === day.day ? "default" : "ghost"}
                    onClick={() => setCurrentDay(day.day)}
                    className={currentDay === day.day ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    Dag {day.day}
                  </Button>
                ))}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentDay(Math.min(totalDays, currentDay + 1))}
                  disabled={currentDay === totalDays}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Current Day Content */}
            {days
              .filter((day) => day.day === currentDay)
              .map((day) => (
                <div key={day.day} className="space-y-6">
                  {/* Day Header */}
                  <Card className="relative group">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEdit(`day-${day.day}`, day)}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Bewerk Dag
                      </Button>
                    )}

                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">
                            Dag {day.day}: {day.title}
                          </h2>
                          <div className="flex items-center space-x-6 text-sm text-gray-600 mt-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(day.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{day.title}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-lg px-4 py-2">
                          Dag {day.day}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Day Services */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Hotels for this day */}
                    {day.hotels.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Bed className="w-5 h-5 text-purple-600" />
                            <span>Overnachting</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {day.hotels.map((hotel: any, index: number) => (
                            <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-purple-900">{hotel.displayName || hotel.name}</h4>
                                  {hotel.location && <p className="text-sm text-purple-700 mt-1">{hotel.location}</p>}
                                  {hotel.checkInDate && (
                                    <p className="text-xs text-purple-600 mt-2">
                                      Check-in: {new Date(hotel.checkInDate).toLocaleDateString("nl-NL")}
                                    </p>
                                  )}
                                </div>
                                <Badge className="bg-purple-600">Geboekt</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Activities for this day */}
                    {day.activities.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Camera className="w-5 h-5 text-green-600" />
                            <span>Activiteiten</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {day.activities.map((activity: any, index: number) => (
                            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-green-900">
                                    {activity.displayName || activity.name}
                                  </h4>
                                  {activity.location && (
                                    <p className="text-sm text-green-700 mt-1">{activity.location}</p>
                                  )}
                                  {activity.time && (
                                    <p className="text-xs text-green-600 mt-2">Tijd: {activity.time}</p>
                                  )}
                                </div>
                                <Badge className="bg-green-600">Geboekt</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Transport for this day */}
                    {day.transports.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Plane className="w-5 h-5 text-blue-600" />
                            <span>Vervoer</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {day.transports.map((transport: any, index: number) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-blue-900">
                                    {transport.displayName || transport.type}
                                  </h4>
                                  {transport.route && <p className="text-sm text-blue-700 mt-1">{transport.route}</p>}
                                  {transport.departureTime && (
                                    <p className="text-xs text-blue-600 mt-2">Vertrek: {transport.departureTime}</p>
                                  )}
                                </div>
                                <Badge className="bg-blue-600">Geboekt</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Car rentals for this day */}
                    {day.cars.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Car className="w-5 h-5 text-orange-600" />
                            <span>Huurauto</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {day.cars.map((car: any, index: number) => (
                            <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-orange-900">{car.displayName || car.type}</h4>
                                  {car.location && (
                                    <p className="text-sm text-orange-700 mt-1">Ophalen: {car.location}</p>
                                  )}
                                  {car.pickupTime && (
                                    <p className="text-xs text-orange-600 mt-2">Ophaaltijd: {car.pickupTime}</p>
                                  )}
                                </div>
                                <Badge className="bg-orange-600">Geboekt</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* AI Tips and Highlights (if available) */}
                  {(day.highlights.length > 0 || day.tips.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Star className="w-5 h-5 text-yellow-600" />
                          <span>AI Aanbevelingen</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {day.highlights.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">🌟 Highlights</h4>
                            <ul className="space-y-1">
                              {day.highlights.map((highlight: string, index: number) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                                  <span className="text-yellow-500 mt-1">•</span>
                                  <span>{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {day.tips.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">💡 Tips</h4>
                            <ul className="space-y-1">
                              {day.tips.map((tip: string, index: number) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Route className="w-5 h-5 text-blue-600" />
                  <span>Complete Reisroute</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {days.map((day, index) => (
                    <div key={day.day} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                          {day.day}
                        </div>
                        {index < days.length - 1 && <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>}
                      </div>
                      <div className="flex-1 pb-8">
                        <h3 className="font-semibold text-gray-900 mb-1">{day.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{formatDate(day.date)}</p>

                        <div className="space-y-2">
                          {day.hotels.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Bed className="w-4 h-4 text-purple-600" />
                              <span>{day.hotels[0].displayName || day.hotels[0].name}</span>
                            </div>
                          )}

                          {day.activities.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Camera className="w-4 h-4 text-green-600" />
                              <span>{day.activities.length} activiteit(en)</span>
                            </div>
                          )}

                          {day.transports.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Plane className="w-4 h-4 text-blue-600" />
                              <span>{day.transports.length} vervoer</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact & Emergency Info */}
        {client.name && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Contactgegevens</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Reiziger</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{client.name}</p>
                    {client.email && (
                      <p className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{client.email}</span>
                      </p>
                    )}
                    {client.phone && (
                      <p className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Noodcontact</h4>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Reisagent Bellen
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      24/7 Noodhulp
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Reisbuddy CTA */}
        <Card className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 mr-3" />
              <h3 className="text-2xl font-bold">Vragen over je reis?</h3>
            </div>
            <p className="mb-6 opacity-90 text-lg">
              Je persoonlijke AI Reisbuddy staat klaar om al je vragen te beantwoorden!
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => window.open(`/chat/booking-${safeBooking.id}`, "_blank")}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Chat met AI Reisbuddy
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
