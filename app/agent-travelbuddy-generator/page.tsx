"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  Copy,
  ExternalLink,
  Search,
  Plus,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Euro,
  Zap,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

interface Booking {
  id: string
  title: string
  destination: string
  client: {
    name: string
    email: string
  }
  startDate: string
  endDate: string
  totalPrice: number
  status: string
  hasTravelBuddy?: boolean
  travelBuddyUrl?: string
}

export default function AgentTravelBuddyGenerator() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState("")

  // Mock bookings data - in real app this would come from API
  const [bookings] = useState<Booking[]>([
    {
      id: "RRP-9400",
      title: "Australië Rondreis Deluxe",
      destination: "Australië",
      client: { name: "Maarten den Hollander", email: "maarten@example.com" },
      startDate: "27-12-2025",
      endDate: "9-1-2026",
      totalPrice: 4332,
      status: "Bevestigd",
      hasTravelBuddy: true,
      travelBuddyUrl: "travelbuddy.roadbooks.nl/rrp9400",
    },
    {
      id: "RRP-8756",
      title: "Romantische Toscane",
      destination: "Italië",
      client: { name: "Familie Jansen", email: "jansen@example.com" },
      startDate: "15-8-2024",
      endDate: "22-8-2024",
      totalPrice: 2850,
      status: "Bevestigd",
      hasTravelBuddy: false,
    },
    {
      id: "RRP-7234",
      title: "Japan Avontuur",
      destination: "Japan",
      client: { name: "Lisa & Mark", email: "lisa@example.com" },
      startDate: "10-10-2024",
      endDate: "24-10-2024",
      totalPrice: 5200,
      status: "Concept",
      hasTravelBuddy: false,
    },
    {
      id: "RRP-6789",
      title: "Noorwegen Fjorden",
      destination: "Noorwegen",
      client: { name: "Peter de Vries", email: "peter@example.com" },
      startDate: "5-7-2024",
      endDate: "12-7-2024",
      totalPrice: 3400,
      status: "Bevestigd",
      hasTravelBuddy: false,
    },
  ])

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.destination.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleGenerateTravelBuddy = async () => {
    if (!selectedBooking) return

    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      const url = `travelbuddy.roadbooks.nl/${selectedBooking.id.toLowerCase()}`
      setGeneratedUrl(url)
      setIsGenerating(false)

      // Update booking to show it has TravelBuddy
      selectedBooking.hasTravelBuddy = true
      selectedBooking.travelBuddyUrl = url
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">TravelBuddy Generator</h1>
                <p className="text-sm text-gray-600">Maak persoonlijke AI chatbots voor je klanten</p>
              </div>
            </div>
            <Link href="/agent-dashboard">
              <Button variant="outline">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Terug naar Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Selecteer Booking</span>
                </CardTitle>
                <CardDescription>Kies een booking om een TravelBuddy voor te maken</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="search">Zoek booking</Label>
                  <Input
                    id="search"
                    placeholder="Zoek op booking ID, klant naam of bestemming..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedBooking?.id === booking.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{booking.id}</Badge>
                            <Badge variant={booking.status === "Bevestigd" ? "default" : "secondary"}>
                              {booking.status}
                            </Badge>
                            {booking.hasTravelBuddy && (
                              <Badge className="bg-emerald-100 text-emerald-700">
                                <Bot className="w-3 h-3 mr-1" />
                                TravelBuddy
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-lg mb-1">{booking.title}</h3>
                          <p className="text-gray-600 mb-2">{booking.client.name}</p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{booking.destination}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {booking.startDate} - {booking.endDate}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Euro className="w-3 h-3" />
                              <span>€{booking.totalPrice.toLocaleString()}</span>
                            </div>
                          </div>

                          {booking.hasTravelBuddy && booking.travelBuddyUrl && (
                            <div className="mt-3 p-2 bg-emerald-50 rounded border border-emerald-200">
                              <div className="text-xs text-emerald-600 mb-1">TravelBuddy URL:</div>
                              <div className="text-sm font-mono text-emerald-700">{booking.travelBuddyUrl}</div>
                            </div>
                          )}
                        </div>

                        {selectedBooking?.id === booking.id && (
                          <CheckCircle className="w-5 h-5 text-emerald-600 ml-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* TravelBuddy Generator */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  <span>TravelBuddy Generator</span>
                </CardTitle>
                <CardDescription>Genereer een persoonlijke AI chatbot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedBooking ? (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Selecteer eerst een booking</p>
                  </div>
                ) : selectedBooking.hasTravelBuddy ? (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-emerald-800 mb-2">TravelBuddy Actief!</h3>
                      <p className="text-sm text-emerald-600">Deze booking heeft al een TravelBuddy</p>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <Label className="text-emerald-700 font-medium">TravelBuddy URL:</Label>
                      <div className="mt-2 p-2 bg-white rounded border font-mono text-sm break-all">
                        {selectedBooking.travelBuddyUrl}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button className="flex-1" onClick={() => copyToClipboard(selectedBooking.travelBuddyUrl || "")}>
                        <Copy className="w-4 h-4 mr-2" />
                        Kopieer Link
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={`https://${selectedBooking.travelBuddyUrl}`} target="_blank" rel="noreferrer noopener">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-2">Geselecteerde Booking:</h3>
                      <div className="space-y-1 text-sm text-blue-700">
                        <div>
                          <strong>ID:</strong> {selectedBooking.id}
                        </div>
                        <div>
                          <strong>Klant:</strong> {selectedBooking.client.name}
                        </div>
                        <div>
                          <strong>Bestemming:</strong> {selectedBooking.destination}
                        </div>
                        <div>
                          <strong>Periode:</strong> {selectedBooking.startDate} - {selectedBooking.endDate}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>TravelBuddy URL Preview:</Label>
                      <div className="mt-2 p-2 bg-gray-50 rounded border font-mono text-sm">
                        travelbuddy.roadbooks.nl/{selectedBooking.id.toLowerCase()}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                      onClick={handleGenerateTravelBuddy}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          TravelBuddy wordt gegenereerd...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Genereer TravelBuddy
                        </>
                      )}
                    </Button>

                    {generatedUrl && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">✅ TravelBuddy Gegenereerd!</h4>
                        <div className="text-sm text-green-700 mb-3">
                          Je TravelBuddy is klaar en kan gedeeld worden met je klant.
                        </div>
                        <div className="bg-white p-2 rounded border font-mono text-sm break-all mb-3">
                          {generatedUrl}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => copyToClipboard(generatedUrl)}>
                            <Copy className="w-3 h-3 mr-1" />
                            Kopieer
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={`https://${generatedUrl}`} target="_blank" rel="noreferrer noopener">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Open
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
