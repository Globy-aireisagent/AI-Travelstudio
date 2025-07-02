"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Download,
  ImageIcon,
  FileText,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  Hotel,
  Plane,
  Car,
  Ticket,
} from "lucide-react"

// Mock booking data for testing
const mockBookingData = {
  id: "RRP-9400",
  bookingReference: "RRP-9400",
  status: "BOOKED",
  creationDate: "2024-01-15",
  startDate: "2024-03-15",
  endDate: "2024-03-25",
  totalPrice: {
    microsite: {
      amount: "2,450.00",
      currency: "EUR",
    },
  },
  client: {
    name: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+31 6 12345678",
    country: "Netherlands",
  },
  services: {
    hotels: [
      {
        hotelName: "Grand Hotel Amsterdam",
        locationName: "Amsterdam, Netherlands",
        nights: 3,
        imageUrl: "/placeholder.svg?height=200&width=300&text=Grand+Hotel+Amsterdam",
        images: [
          "/placeholder.svg?height=200&width=300&text=Grand+Hotel+Amsterdam+Lobby",
          "/placeholder.svg?height=200&width=300&text=Grand+Hotel+Amsterdam+Room",
          "/placeholder.svg?height=200&width=300&text=Grand+Hotel+Amsterdam+Restaurant",
        ],
      },
      {
        hotelName: "Beach Resort Bali",
        locationName: "Bali, Indonesia",
        nights: 7,
        imageUrl: "/placeholder.svg?height=200&width=300&text=Beach+Resort+Bali",
        images: [
          "/placeholder.svg?height=200&width=300&text=Beach+Resort+Bali+Pool",
          "/placeholder.svg?height=200&width=300&text=Beach+Resort+Bali+Beach",
          "/placeholder.svg?height=200&width=300&text=Beach+Resort+Bali+Spa",
        ],
      },
    ],
    tickets: [
      {
        ticketName: "Ubud Monkey Forest Sanctuary",
        destination: "Ubud, Bali",
        duration: "2 hours",
        imageUrl: "/placeholder.svg?height=200&width=300&text=Monkey+Forest+Entrance",
        images: [
          "/placeholder.svg?height=200&width=300&text=Monkey+Forest+Monkeys",
          "/placeholder.svg?height=200&width=300&text=Monkey+Forest+Temple",
          "/placeholder.svg?height=200&width=300&text=Monkey+Forest+Nature",
          "/placeholder.svg?height=200&width=300&text=Monkey+Forest+Pathway",
        ],
      },
      {
        ticketName: "Tanah Lot Temple Tour",
        destination: "Tanah Lot, Bali",
        duration: "4 hours",
        imageUrl: "/placeholder.svg?height=200&width=300&text=Tanah+Lot+Temple",
        images: [
          "/placeholder.svg?height=200&width=300&text=Tanah+Lot+Sunset",
          "/placeholder.svg?height=200&width=300&text=Tanah+Lot+Ocean+View",
          "/placeholder.svg?height=200&width=300&text=Tanah+Lot+Traditional+Dance",
          "/placeholder.svg?height=200&width=300&text=Tanah+Lot+Market",
        ],
      },
      {
        ticketName: "Mount Batur Sunrise Trekking",
        destination: "Mount Batur, Bali",
        duration: "6 hours",
        imageUrl: "/placeholder.svg?height=200&width=300&text=Mount+Batur+Sunrise",
        images: [
          "/placeholder.svg?height=200&width=300&text=Mount+Batur+Trekking",
          "/placeholder.svg?height=200&width=300&text=Mount+Batur+Crater",
          "/placeholder.svg?height=200&width=300&text=Mount+Batur+Lake+View",
          "/placeholder.svg?height=200&width=300&text=Mount+Batur+Hot+Springs",
        ],
      },
    ],
    cars: [
      {
        vehicleName: "Toyota Avanza",
        vendor: "Bali Car Rental",
        pickup: "Ngurah Rai Airport",
        dropoff: "Ngurah Rai Airport",
        imageUrl: "/placeholder.svg?height=200&width=300&text=Toyota+Avanza",
        images: [
          "/placeholder.svg?height=200&width=300&text=Toyota+Avanza+Interior",
          "/placeholder.svg?height=200&width=300&text=Toyota+Avanza+Exterior",
          "/placeholder.svg?height=200&width=300&text=Toyota+Avanza+Trunk",
        ],
      },
      {
        vehicleName: "Honda CR-V",
        vendor: "Premium Car Rental",
        pickup: "Hotel Pickup",
        dropoff: "Hotel Dropoff",
        imageUrl: "/placeholder.svg?height=200&width=300&text=Honda+CRV",
        images: [
          "/placeholder.svg?height=200&width=300&text=Honda+CRV+Dashboard",
          "/placeholder.svg?height=200&width=300&text=Honda+CRV+Seats",
          "/placeholder.svg?height=200&width=300&text=Honda+CRV+Features",
        ],
      },
    ],
    transfers: [],
    closedTours: [],
    cruises: [],
    insurances: [],
  },
  images: [],
  descriptions: {
    service_0: {
      type: "Hotel",
      name: "Grand Hotel Amsterdam",
      description: "Luxurious hotel in the heart of Amsterdam with canal views",
      remarks: ["Free WiFi", "Breakfast included"],
      included: ["Daily breakfast", "Airport transfer"],
      meetingPoint: "Hotel lobby",
    },
    service_1: {
      type: "Activity",
      name: "Ubud Monkey Forest Sanctuary",
      description: "Visit the sacred monkey forest sanctuary in Ubud",
      remarks: ["Bring camera", "Wear comfortable shoes"],
      included: ["Entrance ticket", "Local guide"],
      meetingPoint: "Sanctuary entrance",
    },
  },
}

// Add this function after the mockBookingData definition:

const fetchActivityImages = async (activity: any, micrositeId: string) => {
  try {
    console.log(`🎯 Fetching images for activity: ${activity.ticketName}`)

    const response = await fetch("/api/travel-compositor/activity-images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activityData: activity,
        micrositeId: micrositeId || "rondreis-planner",
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Activity images response:", data)
      return data.images
    } else {
      console.error("❌ Failed to fetch activity images")
      return null
    }
  } catch (error) {
    console.error("❌ Error fetching activity images:", error)
    return null
  }
}

// Replace the images array with this function that collects all images:
const getAllImages = () => {
  const allImages: string[] = []

  // Hotel images
  mockBookingData.services.hotels.forEach((hotel) => {
    if (hotel.imageUrl) allImages.push(hotel.imageUrl)
    if (hotel.images) allImages.push(...hotel.images)
  })

  // Activity/Ticket images
  mockBookingData.services.tickets.forEach((ticket) => {
    if (ticket.imageUrl) allImages.push(ticket.imageUrl)
    if (ticket.images) allImages.push(...ticket.images)
  })

  // Car rental images
  mockBookingData.services.cars.forEach((car) => {
    if (car.imageUrl) allImages.push(car.imageUrl)
    if (car.images) allImages.push(...car.images)
  })

  return [...new Set(allImages)] // Remove duplicates
}

// Update the searchBooking function to include activity image fetching:

const searchBooking = async (bookingId: string, setLoading: any, setError: any, setBookingData: any) => {
  if (!bookingId.trim()) return

  setLoading(true)
  setError(null)

  // Simulate API call
  setTimeout(async () => {
    if (bookingId === "RRP-9400" || bookingId === "RRP-9236") {
      const bookingResult = {
        ...mockBookingData,
        id: bookingId,
        bookingReference: bookingId,
      }

      // Fetch images for all activities
      if (bookingResult.services.tickets.length > 0) {
        console.log("🔍 Fetching images for activities...")

        for (let i = 0; i < bookingResult.services.tickets.length; i++) {
          const activity = bookingResult.services.tickets[i]
          const activityImages = await fetchActivityImages(activity, "rondreis-planner")

          if (activityImages && activityImages.foundImages.length > 0) {
            console.log(`✅ Found ${activityImages.foundImages.length} images for ${activity.ticketName}`)

            // Add images to the activity
            bookingResult.services.tickets[i].images = activityImages.foundImages
            bookingResult.services.tickets[i].imageSearchResults = activityImages

            // Add to main images array
            bookingResult.images.push(...activityImages.foundImages)
          }
        }

        // Remove duplicates from main images array
        bookingResult.images = [...new Set(bookingResult.images)]
      }

      setBookingData(bookingResult)
    } else {
      setError(`Booking ${bookingId} not found`)
      setBookingData(null)
    }
    setLoading(false)
  }, 1500)
}

export default function TestFullBookingPage() {
  const [bookingId, setBookingId] = useState("RRP-9400")
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const downloadBookingData = () => {
    if (!bookingData) return

    const dataStr = JSON.stringify(bookingData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `booking-${bookingData.id}-full-data.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Test Volledige Booking Ophalen</h1>
            <p className="text-gray-600">
              Test het ophalen van een volledige booking inclusief alle teksten, beschrijvingen en afbeeldingen
            </p>
          </div>
          {/* Search Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Booking Zoeken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Booking ID (bijv. RRP-9400, RRP-9236)"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && searchBooking(bookingId, setLoading, setError, setBookingData)
                  }
                  className="flex-1"
                />
                <Button
                  onClick={() => searchBooking(bookingId, setLoading, setError, setBookingData)}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Zoeken
                </Button>
              </div>
            </CardContent>
          </Card>
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Error:</span>
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Test Volledige Booking Ophalen</h1>
          <p className="text-gray-600">
            Test het ophalen van een volledige booking inclusief alle teksten, beschrijvingen en afbeeldingen
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Booking Zoeken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Booking ID (bijv. RRP-9400, RRP-9236)"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchBooking(bookingId, setLoading, setError, setBookingData)}
                className="flex-1"
              />
              <Button onClick={() => searchBooking(bookingId, setLoading, setError, setBookingData)} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Zoeken
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Data Display */}
        {bookingData && (
          <div className="space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    Booking {bookingData.id}
                  </CardTitle>
                  <Button onClick={downloadBookingData} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <div className="font-medium">
                      <Badge variant={bookingData.status === "BOOKED" ? "default" : "secondary"}>
                        {bookingData.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Start Datum</span>
                    <div className="font-medium">{new Date(bookingData.startDate).toLocaleDateString("nl-NL")}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Eind Datum</span>
                    <div className="font-medium">{new Date(bookingData.endDate).toLocaleDateString("nl-NL")}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Totaal Prijs</span>
                    <div className="font-medium">
                      {bookingData.totalPrice?.microsite?.amount} {bookingData.totalPrice?.microsite?.currency}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Tabs */}
            <Tabs defaultValue="services" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="images">Afbeeldingen</TabsTrigger>
                <TabsTrigger value="descriptions">Beschrijvingen</TabsTrigger>
                <TabsTrigger value="client">Klantgegevens</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Hotels */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Hotel className="w-5 h-5" />
                        Hotels ({bookingData?.services?.hotels?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        {bookingData?.services?.hotels?.map((hotel: any, index: number) => (
                          <div key={index} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                            <div className="font-medium">{hotel.hotelName}</div>
                            <div className="text-gray-600">{hotel.locationName}</div>
                            <div className="text-xs text-gray-500">{hotel.nights} nachten</div>
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Tickets/Activities */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Ticket className="w-5 h-5" />
                        Activiteiten ({bookingData?.services?.tickets?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        {bookingData?.services?.tickets?.map((ticket: any, index: number) => (
                          <div key={index} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                            <div className="font-medium">{ticket.ticketName}</div>
                            <div className="text-gray-600">{ticket.destination}</div>
                            <div className="text-xs text-gray-500">{ticket.duration}</div>
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Cars */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Car className="w-5 h-5" />
                        Auto's ({bookingData?.services?.cars?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        {bookingData?.services?.cars?.map((car: any, index: number) => (
                          <div key={index} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                            <div className="font-medium">{car.vehicleName}</div>
                            <div className="text-gray-600">{car.vendor}</div>
                            <div className="text-xs text-gray-500">
                              {car.pickup} → {car.dropoff}
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Transports */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Plane className="w-5 h-5" />
                        Transport ({bookingData?.services?.transports?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        {bookingData.services.transports.map((transport: any, index: number) => (
                          <div key={index} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                            <div className="font-medium">
                              {transport.departureAirport} → {transport.arrivalAirport}
                            </div>
                            <div className="text-gray-600">{transport.marketingAirlineCode}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(transport.startDate).toLocaleDateString("nl-NL")}
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="images">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Alle Afbeeldingen ({bookingData?.images?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Hotel Images Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Hotel className="w-5 h-5" />
                        Hotel Foto's
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {bookingData.services.hotels.map((hotel: any, hotelIndex: number) =>
                          hotel.images?.map((imageUrl: string, imgIndex: number) => (
                            <div key={`hotel-${hotelIndex}-${imgIndex}`} className="border rounded-lg overflow-hidden">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`${hotel.hotelName} foto ${imgIndex + 1}`}
                                className="w-full h-48 object-cover"
                              />
                              <div className="p-2 bg-gray-50">
                                <div className="text-xs font-medium text-gray-800">{hotel.hotelName}</div>
                                <div className="text-xs text-gray-600">Foto {imgIndex + 1}</div>
                              </div>
                            </div>
                          )),
                        )}
                      </div>
                    </div>

                    {/* Activity Images Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Ticket className="w-5 h-5" />
                        Activiteit Foto's
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {bookingData.services.tickets.map((ticket: any, ticketIndex: number) =>
                          ticket.images?.map((imageUrl: string, imgIndex: number) => (
                            <div
                              key={`ticket-${ticketIndex}-${imgIndex}`}
                              className="border rounded-lg overflow-hidden"
                            >
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`${ticket.ticketName} foto ${imgIndex + 1}`}
                                className="w-full h-48 object-cover"
                              />
                              <div className="p-2 bg-gray-50">
                                <div className="text-xs font-medium text-gray-800">{ticket.ticketName}</div>
                                <div className="text-xs text-gray-600">Foto {imgIndex + 1}</div>
                              </div>
                            </div>
                          )),
                        )}
                      </div>
                    </div>

                    {/* Car Rental Images Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Car className="w-5 h-5" />
                        Auto Verhuur Foto's
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {bookingData.services.cars.map((car: any, carIndex: number) =>
                          car.images?.map((imageUrl: string, imgIndex: number) => (
                            <div key={`car-${carIndex}-${imgIndex}`} className="border rounded-lg overflow-hidden">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`${car.vehicleName} foto ${imgIndex + 1}`}
                                className="w-full h-48 object-cover"
                              />
                              <div className="p-2 bg-gray-50">
                                <div className="text-xs font-medium text-gray-800">{car.vehicleName}</div>
                                <div className="text-xs text-gray-600">Foto {imgIndex + 1}</div>
                              </div>
                            </div>
                          )),
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="descriptions">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Beschrijvingen en Teksten
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {Object.entries(bookingData.descriptions).map(([key, desc]: [string, any]) => (
                          <div key={key} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{desc.name || key}</h4>
                            <div className="text-sm text-gray-600 mb-2">
                              <Badge variant="outline">{desc.type}</Badge>
                            </div>
                            {desc.description && (
                              <div className="mb-2">
                                <span className="font-medium text-sm">Beschrijving:</span>
                                <p className="text-sm mt-1">{desc.description}</p>
                              </div>
                            )}
                            {desc.remarks && (
                              <div className="mb-2">
                                <span className="font-medium text-sm">Opmerkingen:</span>
                                <p className="text-sm mt-1">
                                  {Array.isArray(desc.remarks) ? desc.remarks.join(", ") : desc.remarks}
                                </p>
                              </div>
                            )}
                            {desc.included && (
                              <div className="mb-2">
                                <span className="font-medium text-sm">Inbegrepen:</span>
                                <p className="text-sm mt-1">
                                  {Array.isArray(desc.included) ? desc.included.join(", ") : desc.included}
                                </p>
                              </div>
                            )}
                            {desc.meetingPoint && (
                              <div className="mb-2">
                                <span className="font-medium text-sm">Ontmoetingspunt:</span>
                                <p className="text-sm mt-1">{desc.meetingPoint}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="client">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Klantgegevens
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookingData.client ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Naam</span>
                          <div className="font-medium">
                            {bookingData.client.name} {bookingData.client.lastName}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Email</span>
                          <div className="font-medium">{bookingData.client.email}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Telefoon</span>
                          <div className="font-medium">{bookingData.client.phone}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Land</span>
                          <div className="font-medium">{bookingData.client.country}</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Geen klantgegevens beschikbaar</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
