"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  MapPin,
  Hotel,
  Route,
  MessageCircle,
  Mic,
  Clock,
  DollarSign,
  Utensils,
  Camera,
  Navigation,
  Heart,
  Star,
  Users,
  Loader2,
} from "lucide-react"
import ChatInterface from "@/components/chat-interface"

interface Dag {
  datum: string
  bestemming: string
  hotel: string
  beschrijving: string
  route?: string
  stops?: string[]
  activiteiten?: string[]
  restaurants?: string[]
  budget?: string
  tips?: string[]
}

export default function TravelBuddyPage() {
  const params = useParams()
  const bookingId = params?.bookingId as string
  const [dagen, setDagen] = useState<Dag[]>([])
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/trip-days?bookingId=${bookingId}`)
        const data = await res.json()
        setDagen(data.dagen || [])
      } catch (error) {
        console.error("Error fetching trip data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      fetchData()
    }
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Globy is jullie reis aan het voorbereiden...</h3>
            <p className="text-sm text-gray-600 text-center">
              Even geduld, ik maak de perfecte planning voor jullie! 🌟
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Chat met Globy 🤖</h1>
                <p className="text-gray-600">Stel me alles over jullie reis!</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowChat(false)} className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Terug naar planning</span>
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <ChatInterface
              bookingId={bookingId}
              uploadedDocuments={[]}
              intakeData={{
                naam: "Familie",
                bestemming: "Amsterdam",
                interesses: ["cultuur", "geschiedenis", "fotografie"],
              }}
              bookingData={{
                id: bookingId,
                destination: "Amsterdam",
                dagen: dagen,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                Hallo! Dit is jullie reis met Globy
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Jouw persoonlijke reisplanning voor {dagen.length} dagen vol avontuur! ✨
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{dagen.length} dagen</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Familie reis</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Gemaakt met liefde door Globy</span>
            </div>
          </div>
        </div>

        {/* Dag Kaarten */}
        <div className="max-w-4xl mx-auto space-y-6 mb-8">
          {dagen.map((dag, index) => (
            <Card
              key={index}
              className={`overflow-hidden transition-all duration-300 hover:shadow-xl ${
                selectedDay === index ? "ring-2 ring-orange-500 shadow-xl" : ""
              }`}
            >
              <CardHeader className="bg-gradient-to-r from-orange-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6" />
                    <span className="text-xl">{dag.datum}</span>
                  </CardTitle>
                  <Badge className="bg-white/20 text-white border-white/30">Dag {index + 1}</Badge>
                </div>
                <div className="flex items-center space-x-4 text-orange-100">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{dag.bestemming}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Hotel className="h-4 w-4" />
                    <span>{dag.hotel}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Beschrijving */}
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed text-lg">{dag.beschrijving}</p>
                </div>

                {/* Route */}
                {dag.route && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Route className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-800">Route van de dag</h3>
                    </div>
                    <p className="text-blue-700 bg-blue-50 p-3 rounded-lg">{dag.route}</p>
                  </div>
                )}

                {/* Stops */}
                {dag.stops && dag.stops.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Navigation className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-gray-800">Belangrijke stops</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dag.stops.map((stop, stopIndex) => (
                        <div key={stopIndex} className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg">
                          <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-green-800">{stop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activiteiten */}
                {dag.activiteiten && dag.activiteiten.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-800">Geplande activiteiten</h3>
                    </div>
                    <div className="space-y-2">
                      {dag.activiteiten.map((activiteit, actIndex) => (
                        <div key={actIndex} className="flex items-center space-x-2 bg-purple-50 p-2 rounded-lg">
                          <Star className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-purple-800">{activiteit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Restaurants */}
                {dag.restaurants && dag.restaurants.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Utensils className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-gray-800">Aanbevolen restaurants</h3>
                    </div>
                    <div className="space-y-2">
                      {dag.restaurants.map((restaurant, restIndex) => (
                        <div key={restIndex} className="bg-red-50 p-3 rounded-lg">
                          <span className="text-sm text-red-800">{restaurant}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget */}
                {dag.budget && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-semibold text-gray-800">Budget indicatie</h3>
                    </div>
                    <p className="text-yellow-700 bg-yellow-50 p-3 rounded-lg">{dag.budget}</p>
                  </div>
                )}

                {/* Tips */}
                {dag.tips && dag.tips.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Camera className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-semibold text-gray-800">Globy's tips</h3>
                    </div>
                    <div className="space-y-2">
                      {dag.tips.map((tip, tipIndex) => (
                        <div key={tipIndex} className="flex items-start space-x-2 bg-indigo-50 p-3 rounded-lg">
                          <span className="text-indigo-600 font-bold text-sm">💡</span>
                          <span className="text-sm text-indigo-800">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Dag Acties */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                    className="flex items-center space-x-2"
                  >
                    <Heart className={`h-4 w-4 ${selectedDay === index ? "text-red-500" : ""}`} />
                    <span>{selectedDay === index ? "Favoriet!" : "Markeer favoriet"}</span>
                  </Button>

                  <div className="text-sm text-gray-500">
                    Dag {index + 1} van {dagen.length}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chat Knop */}
        <div className="text-center">
          <Card className="max-w-md mx-auto bg-gradient-to-r from-orange-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <MessageCircle className="h-12 w-12 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">Vragen over jullie reis?</h3>
                <p className="text-orange-100">
                  Ik ben Globy, jullie persoonlijke reisassistent! Stel me alles wat je wilt weten. 🌟
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setShowChat(true)}
                  className="w-full bg-white text-orange-600 hover:bg-orange-50 font-semibold py-3"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />💬 Chat met Globy
                </Button>

                <Button
                  onClick={() => setShowChat(true)}
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white/10 font-semibold py-3"
                  size="lg"
                >
                  <Mic className="h-5 w-5 mr-2" />🎤 Spreek met Globy
                </Button>
              </div>

              <div className="mt-4 text-center text-xs text-orange-100">
                Ik kan helpen met restaurants, activiteiten, routes en meer!
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Reis planning gemaakt door Globy AI • Booking ID: {bookingId?.toUpperCase()} • Veel plezier met jullie
            avontuur! 🎉
          </p>
        </div>
      </div>
    </div>
  )
}
