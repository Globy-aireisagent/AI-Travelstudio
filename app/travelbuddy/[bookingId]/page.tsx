"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Calendar, Users, Hotel, Plane, Clock } from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import IntakeForm from "@/components/intake-form"

interface TravelBuddyConfig {
  id: string
  booking: {
    bookingReference: string
    clientName: string
    clientEmail: string
    clientPhone: string
    destination: string
    startDate: string
    endDate: string
    totalPrice: string
    currency: string
    travelers: string
    tripType: string
  }
  hotels: Array<{
    name: string
    address: string
    checkIn: string
    checkOut: string
    roomType: string
    nights: string
    pricePerNight: string
  }>
  activities: Array<{
    name: string
    date: string
    time: string
    location: string
    description: string
    price: string
  }>
  transports: Array<{
    type: string
    from: string
    to: string
    date: string
    time: string
    details: string
  }>
  gptInstructions: string
  createdAt: string
  expiresAt: string
}

export default function TravelBuddyPage() {
  const params = useParams()
  const bookingId = params.bookingId as string

  const [config, setConfig] = useState<TravelBuddyConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showIntake, setShowIntake] = useState(true)
  const [intakeData, setIntakeData] = useState<any>(null)

  useEffect(() => {
    fetchTravelBuddyConfig()
  }, [bookingId])

  const fetchTravelBuddyConfig = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get configuration from localStorage (in production: fetch from database)
      const savedConfig = localStorage.getItem(`travelbuddy-${bookingId}`)

      if (!savedConfig) {
        throw new Error(`TravelBuddy ${bookingId} niet gevonden`)
      }

      const parsedConfig = JSON.parse(savedConfig)

      // Check if expired
      if (parsedConfig.expiresAt && new Date() > new Date(parsedConfig.expiresAt)) {
        throw new Error("Deze TravelBuddy is verlopen")
      }

      setConfig(parsedConfig)

      // Check if intake is already completed
      const savedIntake = localStorage.getItem(`intake-${bookingId}`)
      if (savedIntake) {
        setIntakeData(JSON.parse(savedIntake))
        setShowIntake(false)
      }
    } catch (err) {
      console.error("Error fetching TravelBuddy:", err)
      setError(err instanceof Error ? err.message : "Er ging iets mis")
    } finally {
      setLoading(false)
    }
  }

  const handleIntakeComplete = (data: any) => {
    setIntakeData(data)
    localStorage.setItem(`intake-${bookingId}`, JSON.stringify(data))
    setShowIntake(false)
  }

  const resetIntake = () => {
    localStorage.removeItem(`intake-${bookingId}`)
    setIntakeData(null)
    setShowIntake(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">TravelBuddy wordt geladen...</h3>
            <p className="text-sm text-gray-600 text-center">
              We halen je reisgegevens op voor {bookingId.toUpperCase()}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-800">TravelBuddy niet gevonden</h3>
            <p className="text-sm text-red-600 text-center mb-4">{error}</p>
            <Button onClick={fetchTravelBuddyConfig} variant="outline">
              Opnieuw proberen
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="text-4xl mb-4">🤔</span>
            <h3 className="text-lg font-semibold mb-2">Geen configuratie gevonden</h3>
            <p className="text-sm text-gray-600 text-center">
              Er kon geen configuratie worden geladen voor {bookingId.toUpperCase()}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🤖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TravelBuddy
                </h1>
                <p className="text-sm text-gray-600">Je persoonlijke reis-assistent</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {config.booking.bookingReference || bookingId.toUpperCase()}
              </Badge>
              {intakeData && (
                <Button variant="ghost" size="sm" onClick={resetIntake}>
                  Voorkeuren wijzigen
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {showIntake ? (
          <div className="max-w-4xl mx-auto">
            {/* Booking Preview */}
            <Card className="mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {config.booking.tripType || `Reis naar ${config.booking.destination}`}
                    </h2>
                    <div className="flex items-center space-x-4 text-blue-100">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{config.booking.destination}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {config.booking.startDate} - {config.booking.endDate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{config.booking.travelers}</span>
                      </div>
                    </div>
                  </div>
                  {config.booking.totalPrice && (
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        €{Number.parseInt(config.booking.totalPrice).toLocaleString()}
                      </div>
                      <div className="text-blue-100 text-sm">Totaalprijs</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hotels, Activities, Transport Preview */}
              <div className="p-6 space-y-6">
                {config.hotels.filter((h) => h.name).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Hotel className="w-5 h-5 mr-2" />
                      Hotels & Accommodatie
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {config.hotels
                        .filter((h) => h.name)
                        .map((hotel, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold">{hotel.name}</h4>
                            <p className="text-sm text-gray-600">{hotel.address}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>
                                {hotel.checkIn} - {hotel.checkOut}
                              </span>
                              <span>{hotel.roomType}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {config.activities.filter((a) => a.name).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Activiteiten
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {config.activities
                        .filter((a) => a.name)
                        .map((activity, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold">{activity.name}</h4>
                            <p className="text-sm text-gray-600">{activity.location}</p>
                            <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>
                                {activity.date} {activity.time}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {config.transports.filter((t) => t.from && t.to).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Plane className="w-5 h-5 mr-2" />
                      Transport
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {config.transports
                        .filter((t) => t.from && t.to)
                        .map((transport, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold capitalize">{transport.type}</h4>
                            <p className="text-sm text-gray-600">
                              {transport.from} → {transport.to}
                            </p>
                            <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>
                                {transport.date} {transport.time}
                              </span>
                            </div>
                            {transport.details && <p className="text-xs text-gray-500 mt-1">{transport.details}</p>}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Intake Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">👋</span>
                  <span>Welkom bij je TravelBuddy!</span>
                </CardTitle>
                <p className="text-gray-600">
                  Hallo {config.booking.clientName}! Vertel ons iets meer over jezelf zodat we je de beste reisadviezen
                  kunnen geven tijdens je {config.booking.destination} reis.
                </p>
              </CardHeader>
              <CardContent>
                <IntakeForm onComplete={handleIntakeComplete} uploadedDocuments={[]} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Welcome Back */}
            <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-green-800 mb-1">Welkom terug, {intakeData.naam}! 👋</h2>
                    <p className="text-green-700">
                      Je TravelBuddy is klaar om je te helpen met je {config.booking.destination} reis
                    </p>
                  </div>
                  <div className="text-right text-sm text-green-600">
                    <div className="flex items-center space-x-1 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {config.booking.startDate} - {config.booking.endDate}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{config.booking.destination}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <ChatInterface
              uploadedDocuments={[]}
              intakeData={intakeData}
              bookingData={{
                id: config.booking.bookingReference || bookingId,
                title: config.booking.tripType || `Reis naar ${config.booking.destination}`,
                destination: config.booking.destination,
                startDate: config.booking.startDate,
                endDate: config.booking.endDate,
                client: {
                  name: config.booking.clientName,
                  email: config.booking.clientEmail,
                  phone: config.booking.clientPhone,
                },
                totalPrice: Number.parseInt(config.booking.totalPrice) || 0,
                currency: config.booking.currency,
                services: config.activities.filter((a) => a.name),
                hotels: config.hotels.filter((h) => h.name),
                activities: config.activities.filter((a) => a.name),
                transports: config.transports.filter((t) => t.from && t.to),
                images: [],
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
