"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Webhook, Calendar, User, MapPin } from "lucide-react"

interface Booking {
  id: string
  bookingReference: string
  title: string
  client: {
    name: string
    email: string
  }
  destination: string
  startDate: string
  endDate: string
  status: string
  totalPrice: number
  currency: string
  webhookReceivedAt: string
}

export default function WebhookDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/bookings?limit=20")
      const data = await response.json()

      if (data.success) {
        setBookings(data.bookings)
      } else {
        setError("Failed to fetch bookings")
      }
    } catch (err) {
      setError("Network error")
      console.error("Error fetching bookings:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const testWebhook = async () => {
    try {
      const testData = {
        booking: {
          id: `TEST-${Date.now()}`,
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      if (response.ok) {
        await fetchBookings() // Refresh the list
      }
    } catch (error) {
      console.error("Test webhook error:", error)
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
          <p className="text-muted-foreground">Real-time bookings received via webhooks</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testWebhook} variant="outline">
            Test Webhook
          </Button>
          <Button onClick={fetchBookings} disabled={loading}>
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

      <div className="grid gap-4">
        {bookings.length === 0 && !loading ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No bookings received yet. Webhooks will appear here automatically.
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
                  <Button variant="outline" size="sm" onClick={() => window.open(`/roadbook/${booking.id}`, "_blank")}>
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
      </div>
    </div>
  )
}
