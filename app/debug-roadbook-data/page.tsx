"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DebugRoadbookData() {
  const [bookingData, setBookingData] = useState<any>(null)
  const [realContent, setRealContent] = useState<any>(null)
  const [vouchers, setVouchers] = useState<any[]>([])
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState("RRP-9263")

  const testBookingData = async () => {
    setLoading(true)
    try {
      console.log("🔍 Testing booking data for:", bookingId)

      // Test 1: Get booking data
      const bookingResponse = await fetch(`/api/travel-compositor/booking-super-fast?bookingId=${bookingId}&config=1`)
      const bookingResult = await bookingResponse.json()
      setBookingData(bookingResult)
      console.log("📊 Booking data:", bookingResult)

      // Test 2: Get real content
      const contentResponse = await fetch(`/api/travel-compositor/get-real-content?bookingId=${bookingId}&config=1`)
      const contentResult = await contentResponse.json()
      setRealContent(contentResult)
      console.log("🌍 Real content:", contentResult)

      // Test 3: Get vouchers
      try {
        const voucherResponse = await fetch(`/api/travel-compositor/vouchers?bookingId=${bookingId}`)
        const voucherResult = await voucherResponse.json()
        setVouchers(voucherResult)
        console.log("📄 Vouchers:", voucherResult)
      } catch (e) {
        console.log("❌ Voucher API not found, testing manual extraction")
        // Manual voucher extraction
        if (bookingResult.success && bookingResult.booking) {
          const manualVouchers = extractVouchersManually(bookingResult.booking)
          setVouchers(manualVouchers)
          console.log("📄 Manual vouchers:", manualVouchers)
        }
      }

      // Test 4: Get destinations
      try {
        const destResponse = await fetch(`/api/travel-compositor/destinations`)
        const destResult = await destResponse.json()
        setDestinations(destResult)
        console.log("🗺️ Destinations:", destResult)
      } catch (e) {
        console.log("❌ Destinations API not found")
      }
    } catch (error) {
      console.error("❌ Test error:", error)
    } finally {
      setLoading(false)
    }
  }

  const extractVouchersManually = (booking: any) => {
    const vouchers = []

    // Main voucher
    if (booking.voucherUrl) {
      vouchers.push({
        type: "main",
        title: "Hoofdvoucher",
        url: booking.voucherUrl,
        description: `Voucher voor ${booking.bookingReference}`,
      })
    }

    // Hotel vouchers
    const hotels = booking.rawData?.hotelservice || []
    hotels.forEach((hotel: any, index: number) => {
      if (hotel.voucherUrl) {
        vouchers.push({
          type: "hotel",
          title: `${hotel.hotelName} Voucher`,
          url: hotel.voucherUrl,
          description: hotel.locationName,
        })
      }
    })

    // Transport vouchers
    const transports = booking.rawData?.transportservice || []
    transports.forEach((transport: any, index: number) => {
      if (transport.voucherUrl) {
        vouchers.push({
          type: "transport",
          title: "Transport Voucher",
          url: transport.voucherUrl,
          description: `${transport.departureAirport} → ${transport.arrivalAirport}`,
        })
      }
    })

    return vouchers
  }

  const extractFacilities = (booking: any) => {
    const facilities = []
    const hotels = booking.rawData?.hotelservice || []

    hotels.forEach((hotel: any) => {
      if (hotel.facilities && Array.isArray(hotel.facilities)) {
        hotel.facilities.forEach((facility: any) => {
          facilities.push({
            hotelName: hotel.hotelName,
            facility: facility.name || facility.description || facility,
          })
        })
      }

      // Check room facilities
      if (hotel.room && hotel.room[0] && hotel.room[0].facilities) {
        hotel.room[0].facilities.forEach((facility: any) => {
          facilities.push({
            hotelName: hotel.hotelName,
            facility: `Room: ${facility.name || facility.description || facility}`,
          })
        })
      }
    })

    return facilities
  }

  useEffect(() => {
    testBookingData()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Debug Roadbook Data</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="px-3 py-2 border rounded"
            placeholder="Booking ID"
          />
          <Button onClick={testBookingData} disabled={loading}>
            {loading ? "Testing..." : "Test Data"}
          </Button>
        </div>
      </div>

      {/* Booking Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Booking Data
            {bookingData?.success ? (
              <Badge className="bg-green-100 text-green-800">✅ Success</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">❌ Failed</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookingData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Booking ID:</strong> {bookingData.booking?.bookingReference || "N/A"}
                </div>
                <div>
                  <strong>Hotels:</strong> {bookingData.booking?.rawData?.hotelservice?.length || 0}
                </div>
                <div>
                  <strong>Transport:</strong> {bookingData.booking?.rawData?.transportservice?.length || 0}
                </div>
                <div>
                  <strong>Has Voucher:</strong> {bookingData.booking?.voucherUrl ? "✅" : "❌"}
                </div>
              </div>

              {/* Hotel Details */}
              {bookingData.booking?.rawData?.hotelservice && (
                <div>
                  <h4 className="font-medium mb-2">🏨 Hotels:</h4>
                  {bookingData.booking.rawData.hotelservice.map((hotel: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded mb-2">
                      <div className="font-medium">{hotel.hotelName}</div>
                      <div className="text-sm text-gray-600">{hotel.locationName}</div>
                      <div className="text-xs">
                        Facilities: {hotel.facilities?.length || 0} | Voucher: {hotel.voucherUrl ? "✅" : "❌"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p>No booking data loaded</p>
          )}
        </CardContent>
      </Card>

      {/* Real Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌍 Real Content
            {realContent?.success ? (
              <Badge className="bg-green-100 text-green-800">✅ Success</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">❌ Failed</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {realContent?.success ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Destinations:</strong> {realContent.realContent?.destinations?.length || 0}
                </div>
                <div>
                  <strong>Hotels:</strong> {realContent.realContent?.hotels?.length || 0}
                </div>
                <div>
                  <strong>Images:</strong> {realContent.realContent?.bookingImages?.length || 0}
                </div>
                <div>
                  <strong>Has Descriptions:</strong>{" "}
                  {realContent.realContent?.destinations?.some((d: any) => d.realDescription) ? "✅" : "❌"}
                </div>
              </div>

              {/* Destination Details */}
              {realContent.realContent?.destinations && (
                <div>
                  <h4 className="font-medium mb-2">🗺️ Destinations:</h4>
                  {realContent.realContent.destinations.map((dest: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded mb-2">
                      <div className="font-medium">{dest.name}</div>
                      <div className="text-sm">
                        Description: {dest.realDescription ? "✅" : "❌"} | Images: {dest.realImages?.length || 0} |
                        Attractions: {dest.realAttractions?.length || 0}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p>No real content loaded</p>
          )}
        </CardContent>
      </Card>

      {/* Vouchers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📄 Vouchers ({vouchers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {vouchers.length > 0 ? (
            <div className="space-y-2">
              {vouchers.map((voucher, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{voucher.title}</div>
                    <div className="text-sm text-gray-600">{voucher.description}</div>
                  </div>
                  <Badge>{voucher.type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p>No vouchers found</p>
          )}
        </CardContent>
      </Card>

      {/* Facilities */}
      {bookingData?.booking && (
        <Card>
          <CardHeader>
            <CardTitle>🏨 Hotel Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const facilities = extractFacilities(bookingData.booking)
              return facilities.length > 0 ? (
                <div className="space-y-2">
                  {facilities.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <strong>{item.hotelName}:</strong> {item.facility}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No facilities found in booking data</p>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Raw Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Raw Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-96">
            <pre>{JSON.stringify({ bookingData, realContent, vouchers }, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
