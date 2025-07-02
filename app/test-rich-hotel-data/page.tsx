"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Hotel, MapPin, Phone, Wifi, Car, Utensils, Dumbbell } from "lucide-react"

export default function TestRichHotelDataPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState("RRP-9263")

  const fetchRichHotelData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/travel-compositor/get-rich-hotel-data?bookingId=${bookingId}&config=1`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRichHotelData()
  }, [])

  const getFacilityIcon = (facility: string) => {
    const lower = facility.toLowerCase()
    if (lower.includes("wifi") || lower.includes("internet")) return <Wifi className="w-4 h-4" />
    if (lower.includes("parking") || lower.includes("garage")) return <Car className="w-4 h-4" />
    if (lower.includes("restaurant") || lower.includes("dining")) return <Utensils className="w-4 h-4" />
    if (lower.includes("fitness") || lower.includes("gym")) return <Dumbbell className="w-4 h-4" />
    return <Hotel className="w-4 h-4" />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">🏨 Rich Hotel Data Test</h1>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="Booking ID"
            className="border rounded px-3 py-2"
          />
          <Button onClick={fetchRichHotelData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Test Rich Hotel Data
          </Button>
        </div>
      </div>

      {data && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Rich Data Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.summary?.hotelsAnalyzed || 0}</div>
                  <div className="text-sm text-gray-600">Hotels Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.summary?.hotelsWithGiataId || 0}</div>
                  <div className="text-sm text-gray-600">With GIATA ID</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.summary?.hotelsWithServices || 0}</div>
                  <div className="text-sm text-gray-600">With Services</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{data.summary?.totalImages || 0}</div>
                  <div className="text-sm text-gray-600">Total Images</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rich Hotel Data */}
          <div className="space-y-6">
            {data.richHotelData?.map((hotel: any, index: number) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Hotel className="w-5 h-5" />
                        {hotel.bookingHotel.name}
                      </CardTitle>
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {hotel.bookingHotel.location}
                      </p>
                    </div>
                    <div className="text-right">
                      {hotel.richData?.giataId && (
                        <Badge className="bg-green-100 text-green-800 mb-2">GIATA: {hotel.richData.giataId}</Badge>
                      )}
                      {hotel.richData?.category && <Badge variant="outline">{hotel.richData.category}</Badge>}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {hotel.error ? (
                    <div className="text-red-600 bg-red-50 p-4 rounded">❌ Error: {hotel.error}</div>
                  ) : hotel.richData ? (
                    <>
                      {/* Images */}
                      {hotel.richData.images?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">📸 Images ({hotel.richData.images.length})</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {hotel.richData.images.slice(0, 8).map((image: string, imgIndex: number) => (
                              <img
                                key={imgIndex}
                                src={image || "/placeholder.svg"}
                                alt={`${hotel.bookingHotel.name} ${imgIndex + 1}`}
                                className="w-full h-24 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {hotel.richData.description && (
                        <div>
                          <h4 className="font-semibold mb-2">📝 Description</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded">{hotel.richData.description}</p>
                        </div>
                      )}

                      {/* Contact & Location */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {hotel.richData.address && (
                          <div>
                            <h4 className="font-semibold mb-2">📍 Address</h4>
                            <p className="text-gray-700">{hotel.richData.address}</p>
                          </div>
                        )}
                        {hotel.richData.phoneNumber && (
                          <div>
                            <h4 className="font-semibold mb-2">📞 Phone</h4>
                            <p className="text-gray-700 flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {hotel.richData.phoneNumber}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Services */}
                      {hotel.richData.includedServices?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-green-700">✅ Included Services</h4>
                          <div className="flex flex-wrap gap-2">
                            {hotel.richData.includedServices.map((service: string, sIndex: number) => (
                              <Badge key={sIndex} className="bg-green-100 text-green-800">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {hotel.richData.nonIncludedServices?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-red-700">❌ Not Included</h4>
                          <div className="flex flex-wrap gap-2">
                            {hotel.richData.nonIncludedServices.map((service: string, sIndex: number) => (
                              <Badge key={sIndex} className="bg-red-100 text-red-800">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {hotel.richData.otherServices?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-blue-700">💰 Additional Services</h4>
                          <div className="flex flex-wrap gap-2">
                            {hotel.richData.otherServices.map((service: string, sIndex: number) => (
                              <Badge key={sIndex} className="bg-blue-100 text-blue-800">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Facilities */}
                      {hotel.richData.facilities && (
                        <div>
                          <h4 className="font-semibold mb-2">🏨 Facilities</h4>
                          <div className="bg-gray-50 p-3 rounded">
                            <pre className="text-xs overflow-auto">
                              {JSON.stringify(hotel.richData.facilities, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Ratings */}
                      {hotel.richData.ratings && (
                        <div>
                          <h4 className="font-semibold mb-2">⭐ Ratings</h4>
                          <div className="bg-yellow-50 p-3 rounded">
                            <pre className="text-xs overflow-auto">
                              {JSON.stringify(hotel.richData.ratings, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        {hotel.richData.accommodationType && (
                          <div>
                            <strong>Type:</strong> {hotel.richData.accommodationType}
                          </div>
                        )}
                        {hotel.richData.chain && (
                          <div>
                            <strong>Chain:</strong> {hotel.richData.chain}
                          </div>
                        )}
                        {hotel.richData.accommodationSubtype && (
                          <div>
                            <strong>Subtype:</strong> {hotel.richData.accommodationSubtype}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 bg-gray-50 p-4 rounded">⚠️ No rich data available for this hotel</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
