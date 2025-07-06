"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WebhookLog {
  id: string
  type: "booking" | "idea" | "package"
  status: "success" | "error"
  message: string
  timestamp: string
  data?: any
}

export default function WebhookDashboard() {
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [ideas, setIdeas] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load bookings
      const bookingsRes = await fetch("/api/bookings")
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData.data || [])
      }

      // Load travel ideas
      const ideasRes = await fetch("/api/travel-ideas")
      if (ideasRes.ok) {
        const ideasData = await ideasRes.json()
        setIdeas(ideasData.data || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testBookingWebhook = async () => {
    setIsLoading(true)
    try {
      const testBookingData = {
        booking: {
          id: "TEST-BOOKING-001",
          bookingReference: "RRP-TEST-001",
          title: "Test Booking - Amsterdam Weekend",
          contactPerson: {
            name: "Test User",
            email: "test@example.com",
            phone: "+31612345678",
          },
          startDate: "2025-06-01",
          endDate: "2025-06-03",
          status: "CONFIRMED",
          pricebreakdown: {
            totalPrice: {
              microsite: {
                amount: 450.0,
                currency: "EUR",
              },
            },
          },
          hotelservice: [
            {
              locationName: "Amsterdam",
              destinationName: "Amsterdam",
              hotelName: "Test Hotel Amsterdam",
              checkIn: "2025-06-01",
              checkOut: "2025-06-03",
            },
          ],
          micrositeId: "test-microsite",
        },
      }

      const response = await fetch("/api/webhooks/travel-compositor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testBookingData),
      })

      const result = await response.json()

      const newLog: WebhookLog = {
        id: Date.now().toString(),
        type: "booking",
        status: response.ok ? "success" : "error",
        message: result.message || result.error || "Unknown response",
        timestamp: new Date().toISOString(),
        data: testBookingData,
      }

      setWebhookLogs((prev) => [newLog, ...prev])

      if (response.ok) {
        await loadData() // Reload data to show new booking
      }
    } catch (error) {
      const errorLog: WebhookLog = {
        id: Date.now().toString(),
        type: "booking",
        status: "error",
        message: `Network error: ${error}`,
        timestamp: new Date().toISOString(),
      }
      setWebhookLogs((prev) => [errorLog, ...prev])
    } finally {
      setIsLoading(false)
    }
  }

  const testIdeaWebhook = async () => {
    setIsLoading(true)
    try {
      const testIdeaData = {
        idea: {
          id: "TEST-IDEA-001",
          title: "Romantic Weekend in Paris",
          description: "Experience the city of love with this romantic weekend getaway",
          destination: "Paris, France",
          durationDays: 3,
          priceFrom: 299,
          priceTo: 599,
          currency: "EUR",
          category: "Romance",
          tags: ["romantic", "weekend", "city-break", "culture"],
          images: ["https://example.com/paris1.jpg", "https://example.com/paris2.jpg"],
          highlights: ["Visit the Eiffel Tower", "Seine River cruise", "Louvre Museum tour", "Romantic dinner"],
          includedServices: ["Hotel accommodation", "Breakfast", "City tour"],
          micrositeId: "test-microsite",
          status: "ACTIVE",
        },
      }

      const response = await fetch("/api/webhooks/travel-compositor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testIdeaData),
      })

      const result = await response.json()

      const newLog: WebhookLog = {
        id: Date.now().toString(),
        type: "idea",
        status: response.ok ? "success" : "error",
        message: result.message || result.error || "Unknown response",
        timestamp: new Date().toISOString(),
        data: testIdeaData,
      }

      setWebhookLogs((prev) => [newLog, ...prev])

      if (response.ok) {
        await loadData() // Reload data to show new idea
      }
    } catch (error) {
      const errorLog: WebhookLog = {
        id: Date.now().toString(),
        type: "idea",
        status: "error",
        message: `Network error: ${error}`,
        timestamp: new Date().toISOString(),
      }
      setWebhookLogs((prev) => [errorLog, ...prev])
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    setWebhookLogs([])
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhook Dashboard</h1>
          <p className="text-muted-foreground">Monitor Travel Compositor webhooks and data</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testBookingWebhook} disabled={isLoading}>
            Test Booking
          </Button>
          <Button onClick={testIdeaWebhook} disabled={isLoading}>
            Test Idea
          </Button>
          <Button variant="outline" onClick={clearLogs}>
            Clear Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">Via webhooks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Travel Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ideas.length}</div>
            <p className="text-xs text-muted-foreground">Active ideas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Webhook Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhookLogs.length}</div>
            <p className="text-xs text-muted-foreground">Recent events</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Webhook Logs</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="ideas">Travel Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Webhook Events</CardTitle>
              <CardDescription>Latest webhook calls and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {webhookLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No webhook logs yet. Test a webhook to see logs here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {webhookLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={log.status === "success" ? "default" : "destructive"}>{log.type}</Badge>
                          <div>
                            <p className="font-medium">{log.message}</p>
                            <p className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <Badge variant={log.status === "success" ? "default" : "destructive"}>{log.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Received Bookings</CardTitle>
              <CardDescription>Bookings received via webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {bookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No bookings received yet. Test a booking webhook to see data here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{booking.title}</h3>
                          <Badge>{booking.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {booking.booking_reference} • {booking.client_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.destination} • {booking.total_price} {booking.currency}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ideas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Travel Ideas</CardTitle>
              <CardDescription>Ideas received via webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {ideas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No travel ideas received yet. Test an idea webhook to see data here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {ideas.map((idea) => (
                      <div key={idea.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{idea.title}</h3>
                          <Badge variant="secondary">{idea.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{idea.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {idea.destination} • {idea.duration_days} days • {idea.price_from}-{idea.price_to}{" "}
                          {idea.currency}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
