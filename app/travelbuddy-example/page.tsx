"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, ArrowLeft } from "lucide-react"
import ChatInterface from "@/components/chat-interface"

// Voorbeeld booking data
const exampleBooking = {
  id: "RRP-9124",
  title: "Engeland Roadtrip - Brighton & London",
  destination: "Brighton, London & Canterbury",
  startDate: "15 augustus 2024",
  endDate: "22 augustus 2024",
  client: {
    name: "Familie van der Berg",
    email: "info@vandenberg.nl",
    phone: "+31 6 12345678",
  },
  totalPrice: 2850,
  currency: "EUR",
  hotels: [
    {
      name: "Premier Inn Brighton City Centre",
      location: "Brighton",
      nights: 3,
      checkIn: "15 augustus",
      checkOut: "18 augustus",
    },
    {
      name: "The Grand Brighton",
      location: "Brighton",
      nights: 2,
      checkIn: "18 augustus",
      checkOut: "20 augustus",
    },
    {
      name: "Travelodge London Central",
      location: "London",
      nights: 2,
      checkIn: "20 augustus",
      checkOut: "22 augustus",
    },
  ],
  activities: [
    "Brighton Pier bezoek",
    "Royal Pavilion tour",
    "Fish & Chips tasting",
    "London Eye",
    "Tower Bridge",
    "Canterbury Cathedral",
  ],
  images: [
    "/brighton-pier.png",
    "/london-eye.png",
    "/canterbury-cathedral.png",
    "/brighton-pavilion.png",
  ],
}

// Voorbeeld intake data
const exampleIntakeData = {
  naam: "Sarah van der Berg",
  leeftijd: "35",
  reisgezelschap: "Familie met kinderen",
  kinderen: [
    { naam: "Emma", leeftijd: "8", hobbies: ["tekenen", "zwemmen"] },
    { naam: "Lucas", leeftijd: "12", hobbies: ["voetbal", "gaming"] },
  ],
  interests: ["geschiedenis", "cultuur", "lokaal eten"],
  activityLevel: "Gemiddeld actief",
  budget: "Gemiddeld budget",
  specialRequests: "Kinderen houden van interactieve activiteiten",
}

export default function TravelBuddyExamplePage() {
  const [showIntake, setShowIntake] = useState(false)

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
                  TravelBuddy - Voorbeeld
                </h1>
                <p className="text-sm text-gray-600">Test de AI reis-assistent functionaliteit</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {exampleBooking.id}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-green-800 mb-1">Welkom terug, {exampleIntakeData.naam}! 👋</h2>
                  <p className="text-green-700">
                    Je TravelBuddy is klaar om je te helpen met je {exampleBooking.destination} reis
                  </p>
                </div>
                <div className="text-right text-sm text-green-600">
                  <div className="flex items-center space-x-1 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {exampleBooking.startDate} - {exampleBooking.endDate}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{exampleBooking.destination}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Preview */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{exampleBooking.title}</h2>
                  <div className="flex items-center space-x-4 text-blue-100">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{exampleBooking.destination}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {exampleBooking.startDate} - {exampleBooking.endDate}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{exampleBooking.client.name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">€{exampleBooking.totalPrice.toLocaleString()}</div>
                  <div className="text-blue-100 text-sm">Totaalprijs</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {exampleBooking.images.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Reis foto ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">🏨 Hotels</h3>
                  <div className="space-y-2">
                    {exampleBooking.hotels.map((hotel, index) => (
                      <div key={index} className="bg-gray-50 rounded p-3 text-sm">
                        <div className="font-medium">{hotel.name}</div>
                        <div className="text-gray-600">
                          {hotel.location} • {hotel.nights} nachten • {hotel.checkIn} - {hotel.checkOut}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">🎯 Activiteiten</h3>
                  <div className="space-y-1">
                    {exampleBooking.activities.map((activity, index) => (
                      <div key={index} className="bg-gray-50 rounded p-2 text-sm">
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Chat Interface */}
          <ChatInterface
            uploadedDocuments={[]}
            intakeData={exampleIntakeData}
            bookingData={exampleBooking}
            customerSlug="voorbeeld"
          />

          {/* Test Suggestions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>💡 Test Suggesties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Probeer deze vragen om de AI te testen:</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded p-3 text-sm">
                  <strong>Booking specifiek:</strong>
                  <br />
                  "Welke hotels heb ik geboekt?"
                  <br />
                  "Wat kan ik doen in Brighton?"
                </div>
                <div className="bg-green-50 rounded p-3 text-sm">
                  <strong>Persoonlijk:</strong>
                  <br />
                  "Wat is leuk voor Emma en Lucas?"
                  <br />
                  "Restaurants voor families?"
                </div>
                <div className="bg-purple-50 rounded p-3 text-sm">
                  <strong>Praktisch:</strong>
                  <br />
                  "Hoe kom ik van Brighton naar London?"
                  <br />
                  "Wat moet ik meenemen?"
                </div>
                <div className="bg-orange-50 rounded p-3 text-sm">
                  <strong>Planning:</strong>
                  <br />
                  "Wat doen we op dag 2?"
                  <br />
                  "Openingstijden Royal Pavilion?"
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
