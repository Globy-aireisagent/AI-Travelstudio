"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Webhook, Calendar, User, MapPin, Lightbulb, Package } from "lucide-react"

interface Booking {
  id: string
  bookingReference: string
  title: string
  client: { name: string; email: string }
  destination: string
  startDate: string
  endDate: string
  status: string
  totalPrice: number
  currency: string
  webhookReceivedAt: string
}

interface TravelIdea {
  id: string
  title: string
  description: string
  destination: string
  durationDays: number
  priceFrom: number
  priceTo: number
  currency: string
  category: string
  tags: string[]
  webhookReceivedAt: string
  micrositeSource: string
}

export default function WebhookDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [ideas, setIdeas] = useState<TravelIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("bookings")

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch bookings
      const bookingsResponse = await fetch("/api/bookings?limit=10")
      const bookingsData = await bookingsResponse.json()

      // Fetch travel ideas
      const ideasResponse = await fetch("/api/travel-ideas?limit=10")
      const ideasData = await ideasResponse.json()

      if (bookingsData.success) {
        setBookings(bookingsData.bookings)
      }

      if (ideasData.success) {
        setIdeas(ideasData.ideas)
      }
    } catch (err) {
      setError("Network error")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const testBookingWebhook = async () => {
    try {
      const testData = {
        booking: {
          id: `TEST-BOOKING-${Date.now()}`,
          bookingReference: `TEST-${Date.now()}`,
          title: "Test Booking via Webhook",
          contactPerson: {
            name: "Test User",
            email: "test@example.com",
            phone: "+31612345678",
          },
          startDate: "2025-07-01T00:00:00Z",
          endDate: "2025-07-08T00:00:00Z",
          status: "CONFIRMED",
          pricebreakdown: {
            totalPrice: {
              microsite: {
                amount: 1500.0,
                currency: "EUR",
              },
            },
          },
          hotelservice: [
            {
              locationName: "Amsterdam",
              hotelName: "Test Hotel",
            },
          ],
        },
      }

      const response = await fetch("/api/webhooks/travel-compositor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Test booking webhook error:", error)
    }
  }

  const testIdeaWebhook = async () => {
    try {
      const testData = {
        idea: {
          id: `TEST-IDEA-${Date.now()}`,
          title: "Amazing City Break in Amsterdam",
          description: "Discover the charming canals and vibrant culture of Amsterdam",
          destination: "Amsterdam, Netherlands",
          durationDays: 4,
          priceFrom: 299,
          priceTo: 599,
          currency: "EUR",
          category: "City Break",
          tags: ["culture", "canals", "museums", "nightlife"],
          images: ["/placeholder.svg?height=200&width=300"],
          highlights: ["Anne Frank House", "Van Gogh Museum", "Canal Cruise"],
          includedServices: ["Hotel", "Breakfast", "City Tour"],
          micrositeId: "test-microsite",
          status: "ACTIVE",
        },
      }

      const response = await fetch("/api/webhooks/travel-compositor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Test idea webhook error:", error)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Webhook className="h-8 w-8" />
            Webhook Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time data received via webhooks</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testBookingWebhook} variant="outline" size="sm">
            Test Booking
          </Button>
          <Button onClick={testIdeaWebhook} variant="outline" size="sm">
            Test Idea
          </Button>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bookings ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="ideas" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Travel Ideas ({ideas.length})
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Packages (0)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          {bookings.length === 0 && !loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No bookings received yet. Booking webhooks will appear here automatically.
                </p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{booking.title}</CardTitle>
                    <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"}>{booking.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{booking.bookingReference}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{booking.client.name}</p>
                        <p className="text-sm text-muted-foreground">{booking.client.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{booking.destination}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.totalPrice > 0 && `${booking.currency} ${booking.totalPrice.toFixed(2)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {new Date(booking.startDate).toLocaleDateString()} -{" "}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Received: {new Date(booking.webhookReceivedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/roadbook/${booking.id}`, "_blank")}
                    >
                      View Roadbook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/bookings/${booking.id}`, "_blank")}
                    >
                      View JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="ideas" className="space-y-4">
          {ideas.length === 0 && !loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No travel ideas received yet. Idea webhooks will appear here automatically.
                </p>
              </CardContent>
            </Card>
          ) : (
            ideas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <Badge variant="secondary">{idea.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{idea.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{idea.destination}</p>
                        <p className="text-sm text-muted-foreground">{idea.durationDays} days</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg">💰</span>
                      <div>
                        <p className="font-medium">
                          {idea.currency} {idea.priceFrom} - {idea.priceTo}
                        </p>
                        <p className="text-sm text-muted-foreground">Price range</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{idea.micrositeSource}</p>
                        <p className="text-sm text-muted-foreground">
                          Received: {new Date(idea.webhookReceivedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {idea.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {idea.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/travel-ideas/${idea.id}`, "_blank")}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No holiday packages received yet. Package webhooks will appear here automatically.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
