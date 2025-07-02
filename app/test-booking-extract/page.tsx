"use client"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Define types for the data
interface BookingData {
  services: {
    hotels: any[]
    flights: any[]
    transfers: any[]
  }
  client: {
    name: string
  }
  totalPrice: {
    amount: number
    currency: string
  }
  images: string[]
}

interface SearchResult {
  success: boolean
  booking: BookingData
  foundInConfig: string
  method: string
  extractionInfo: {
    originalDataType: string
    hotelsExtracted: number
    imagesFound: number
    totalPrice: number
    clientName: string
  }
}

const extractBookingData = (booking: any): BookingData => {
  const hotels = booking.hotelservice?.hotels || []
  const flights = booking.flightservice?.flights || []
  const transfers = booking.transferservice?.transfers || []
  const clientName =
    booking.hotelservice?.client?.name ||
    booking.flightservice?.client?.name ||
    booking.transferservice?.client?.name ||
    "Unknown Client"
  const totalPriceAmount =
    booking.hotelservice?.totalPrice?.amount ||
    booking.flightservice?.totalPrice?.amount ||
    booking.transferservice?.totalPrice?.amount ||
    0
  const totalPriceCurrency =
    booking.hotelservice?.totalPrice?.currency ||
    booking.flightservice?.totalPrice?.currency ||
    booking.transferservice?.totalPrice?.currency ||
    "USD"
  const images = booking.hotelservice?.hotels?.flatMap((hotel: any) => hotel.images) || []

  return {
    services: {
      hotels: hotels,
      flights: flights,
      transfers: transfers,
    },
    client: {
      name: clientName,
    },
    totalPrice: {
      amount: totalPriceAmount,
      currency: totalPriceCurrency,
    },
    images: images,
  }
}

const TestBookingExtract = () => {
  const [bookingId, setBookingId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SearchResult | null>(null)

  const searchBooking = async () => {
    if (!bookingId.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Use the working booking search API that we know works
      const response = await fetch(`/api/travel-compositor/booking-search-optimized`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingReference: bookingId.trim(),
          searchAllConfigs: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to search booking")
      }

      if (!data.bookings || data.bookings.length === 0) {
        throw new Error(`Booking ${bookingId} not found in any configuration`)
      }

      // Extract the first found booking
      const foundBooking = data.bookings[0]
      const extractedBooking = extractBookingData(foundBooking)

      setResult({
        success: true,
        booking: extractedBooking,
        foundInConfig: data.foundInConfig || "unknown",
        method: "search_api",
        extractionInfo: {
          originalDataType: foundBooking.hotelservice ? "complete_booking" : "single_service",
          hotelsExtracted: extractedBooking.services.hotels.length,
          imagesFound: extractedBooking.images.length,
          totalPrice: extractedBooking.totalPrice.amount,
          clientName: extractedBooking.client.name,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Booking Extract</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/2">
          <Label htmlFor="bookingId">Booking ID</Label>
          <Input
            type="text"
            id="bookingId"
            placeholder="Enter booking ID"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/2 flex items-end">
          <Button onClick={searchBooking} disabled={loading || !bookingId.trim()} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Searching via Working API...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search via Working API
              </>
            )}
          </Button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}

      {result && result.success && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Client Name:</strong> {result.booking.client.name}
            </p>
            <p>
              <strong>Total Price:</strong> {result.booking.totalPrice.amount} {result.booking.totalPrice.currency}
            </p>
            <p>
              <strong>Found in Config:</strong> {result.foundInConfig}
            </p>
            <p>
              <strong>Method:</strong> {result.method}
            </p>
            <p>
              <strong>Original Data Type:</strong> {result.extractionInfo.originalDataType}
            </p>
            <p>
              <strong>Hotels Extracted:</strong> {result.extractionInfo.hotelsExtracted}
            </p>
            <p>
              <strong>Images Found:</strong> {result.extractionInfo.imagesFound}
            </p>
            <p>
              <strong>Client Name:</strong> {result.extractionInfo.clientName}
            </p>

            {result.booking.services.hotels.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-4">Hotels</h3>
                <Table>
                  <TableCaption>A list of hotels found in the booking.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.booking.services.hotels.map((hotel: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{hotel.name}</TableCell>
                        <TableCell>{hotel.address}</TableCell>
                        <TableCell>{hotel.rating}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}

            {result.booking.images.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-4">Images</h3>
                <div className="flex flex-wrap gap-2">
                  {result.booking.images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`Hotel ${index + 1}`}
                      className="w-32 h-24 object-cover"
                    />
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TestBookingExtract
