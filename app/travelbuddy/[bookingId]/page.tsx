"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Calendar, Users } from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import IntakeForm from "@/components/intake-form"

interface BookingData {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  client: {
    name: string
    email: string
    phone?: string
  }
  totalPrice: number
  currency: string
  services: any[]
  hotels: any[]
  activities: any[]
  images: string[]
}

export default function TravelBuddyPage() {
  const params = useParams()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showIntake, setShowIntake] = useState(true)
  const [intakeData, setIntakeData] = useState<any>(null)

  useEffect(() => {
    fetchBookingData()
  }, [bookingId])

  const fetchBookingData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch booking data from Travel Compositor
      const response = await fetch(`/api/travel-compositor/booking/${bookingId}/full-details`)

      if (!response.ok) {
        throw new Error(`Booking ${bookingId} niet gevonden`)
      }

      const data = await response.json()
      setBooking(data.booking)

      // Check if intake is already completed
      const savedIntake = localStorage.getItem(`intake-${bookingId}`)
      if (savedIntake) {
        setIntakeData(JSON.parse(savedIntake))
        setShowIntake(false)
      }
    } catch (err) {
      console.error("Error fetching booking:", err)
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
              We halen je reisgegevens op voor booking {bookingId.toUpperCase()}
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
            <h3 className="text-lg font-semibold mb-2 text-red-800">Booking niet gevonden</h3>
            <p className="text-sm text-red-600 text-center mb-4">{error}</p>
            <Button onClick={fetchBookingData} variant="outline">
              Opnieuw proberen
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="text-4xl mb-4">🤔</span>
            <h3 className="text-lg font-semibold mb-2">Geen booking data</h3>
            <p className="text-sm text-gray-600 text-center">
              Er kon geen data worden opgehaald voor {bookingId.toUpperCase()}
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
                {bookingId.toUpperCase()}
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
                    <h2 className="text-2xl font-bold mb-2">{booking.title}</h2>
                    <div className="flex items-center space-x-4 text-blue-100">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.destination}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {booking.startDate} - {booking.endDate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{booking.client.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">€{booking.totalPrice.toLocaleString()}</div>
                    <div className="text-blue-100 text-sm">Totaalprijs</div>
                  </div>
                </div>
              </div>

              {booking.images.length > 0 && (
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {booking.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Reis foto ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Intake Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">👋</span>
                  <span>Welkom bij je TravelBuddy!</span>
                </CardTitle>
                <p className="text-gray-600">
                  Vertel ons iets meer over jezelf zodat we je de beste reisadviezen kunnen geven tijdens je{" "}
                  {booking.destination} reis.
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
                      Je TravelBuddy is klaar om je te helpen met je {booking.destination} reis
                    </p>
                  </div>
                  <div className="text-right text-sm text-green-600">
                    <div className="flex items-center space-x-1 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {booking.startDate} - {booking.endDate}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.destination}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <ChatInterface
              uploadedDocuments={[]} // We'll populate this with booking data
              intakeData={intakeData}
              bookingData={booking}
            />
          </div>
        )}
      </div>
    </div>
  )
}
