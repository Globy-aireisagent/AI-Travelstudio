"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Star,
  Calendar,
  Utensils,
  Bed,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react"
import { HotelImageService, type HotelRichData } from "@/lib/hotel-image-service"

interface EnhancedHotelCardProps {
  hotel: any
  index: number
}

export function EnhancedHotelCard({ hotel, index }: EnhancedHotelCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const [richData, setRichData] = useState<HotelRichData | null>(null)
  const [richDataLoading, setRichDataLoading] = useState(true)
  const [allImages, setAllImages] = useState<string[]>([])

  useEffect(() => {
    const loadHotelData = async () => {
      try {
        const hotelName = hotel.name || hotel.displayName || "Hotel"
        const location = hotel.location || hotel.city || "Unknown"
        const hotelId = hotel.hotelId || hotel.id

        console.log(`🏨 Loading data for: ${hotelName} in ${location} (ID: ${hotelId})`)

        // Load rich data first to get all images
        if (hotelId) {
          const richHotelData = await HotelImageService.getRichHotelData(hotelId, hotelName, location)
          setRichData(richHotelData)

          console.log(`🏨 Hotel ${hotelName} facilities DEBUG:`, {
            richDataFacilities: richHotelData.facilities,
            richDataAmenities: richHotelData.amenities,
            hotelFacilities: hotel.facilities,
            hotelAmenities: hotel.amenities,
            allRichData: richHotelData,
          })

          console.log(`🏨 Hotel ${hotelName} facilities:`, {
            richDataFacilities: richHotelData.facilities,
            hotelFacilities: hotel.facilities,
            hotelAmenities: hotel.amenities,
            totalFacilities: facilities.length,
          })

          if (richHotelData.images && richHotelData.images.length > 0) {
            setAllImages(richHotelData.images)
            console.log(`📸 Found ${richHotelData.images.length} hotel images`)
          } else {
            // Fallback to single image
            const imageResult = await HotelImageService.getSpecificHotelImage(hotelName, location, hotelId)
            setAllImages([imageResult.url])
          }

          console.log(`📋 Rich data loaded:`, richHotelData)
        } else {
          // Fallback for hotels without ID
          const imageResult = await HotelImageService.getSpecificHotelImage(hotelName, location)
          setAllImages([imageResult.url])
        }
      } catch (error) {
        console.error("Failed to load hotel data:", error)
        setAllImages(["/placeholder.svg?height=200&width=300&text=Hotel"])
      } finally {
        setImageLoading(false)
        setRichDataLoading(false)
      }
    }

    loadHotelData()
  }, [hotel.name, hotel.displayName, hotel.location, hotel.city, hotel.hotelId, hotel.id])

  const nextImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    }
  }

  const prevImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Onbekend"
    return new Date(dateString).toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const locationDescription =
    richData?.location.description || HotelImageService.getLocationDescription(hotel.location || hotel.city)
  const roomDescription = HotelImageService.getRoomTypeDescription(hotel.roomType || "")
  const mealDescription = HotelImageService.getMealPlanDescription(hotel.mealPlan || "RO")

  // Get facilities from ALL possible sources in Travel Compositor data
  const facilities = [
    ...(richData?.facilities || []),
    ...(richData?.amenities || []),
    ...(hotel.facilities || []),
    ...(hotel.amenities || []),
    ...(hotel.hotelData?.facilities || []),
    ...(hotel.hotelData?.amenities || []),
  ].filter(Boolean)

  const amenities = richData?.amenities || []

  const getFacilityIcon = (facility: string | any) => {
    const facilityString =
      typeof facility === "string" ? facility : facility?.name || facility?.description || String(facility)
    const lowerFacility = facilityString.toLowerCase()

    if (lowerFacility.includes("wifi") || lowerFacility.includes("internet"))
      return <Wifi className="h-4 w-4 text-blue-600" />
    if (lowerFacility.includes("parking") || lowerFacility.includes("garage"))
      return <Car className="h-4 w-4 text-green-600" />
    if (lowerFacility.includes("restaurant") || lowerFacility.includes("breakfast") || lowerFacility.includes("bar"))
      return <Coffee className="h-4 w-4 text-orange-600" />
    if (lowerFacility.includes("gym") || lowerFacility.includes("fitness") || lowerFacility.includes("sport"))
      return <Dumbbell className="h-4 w-4 text-red-600" />
    if (lowerFacility.includes("pool") || lowerFacility.includes("zwembad"))
      return <span className="text-blue-600">🏊</span>
    if (lowerFacility.includes("spa") || lowerFacility.includes("wellness"))
      return <span className="text-purple-600">💆</span>
    if (lowerFacility.includes("airco") || lowerFacility.includes("air conditioning"))
      return <span className="text-blue-600">❄️</span>
    if (lowerFacility.includes("balkon") || lowerFacility.includes("balcony"))
      return <span className="text-green-600">🏡</span>
    if (lowerFacility.includes("room service")) return <span className="text-orange-600">🛎️</span>
    if (lowerFacility.includes("concierge")) return <span className="text-purple-600">👨‍💼</span>

    return <span className="text-gray-500">🏨</span>
  }

  const currentImage = allImages[currentImageIndex] || "/placeholder.svg"

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Hotel Image Slideshow */}
          <div className="md:w-1/3 relative">
            <div className="relative h-48 md:h-full min-h-[200px] group">
              {imageLoading ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 animate-pulse rounded-l-lg flex items-center justify-center">
                  <div className="text-gray-400">Laden...</div>
                </div>
              ) : (
                <>
                  <img
                    src={currentImage || "/placeholder.svg"}
                    alt={`${hotel.name || hotel.displayName} in ${hotel.location || hotel.city} - Foto ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover rounded-l-lg transition-opacity duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=200&width=300&text=Hotel"
                    }}
                  />

                  {/* Navigation Arrows - Only show if multiple images */}
                  {allImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Image Counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {currentImageIndex + 1}/{allImages.length}
                    </div>
                  )}
                </>
              )}

              {/* Hotel Category Badge */}
              {hotel.category && (
                <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800">{hotel.category}</Badge>
              )}

              {/* Nights Badge */}
              <Badge className="absolute top-3 right-3 bg-blue-600 text-white">
                {hotel.nights} {hotel.nights === 1 ? "nacht" : "nachten"}
              </Badge>

              {/* Real Data Badge */}
              {richData && richData.images.length > 0 && (
                <Badge className="absolute bottom-3 left-3 bg-green-600 text-white text-xs">
                  {richData.images.length} echte foto's
                </Badge>
              )}
            </div>

            {/* Image Dots Navigation */}
            {allImages.length > 1 && allImages.length <= 10 && (
              <div className="flex justify-center mt-2 gap-1">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === currentImageIndex ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Hotel Details */}
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{hotel.name || hotel.displayName}</h3>

                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="font-medium">{hotel.location || hotel.city}</span>
                  {hotel.country && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {hotel.country}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">{locationDescription}</p>

                {/* Rich Description */}
                {richData?.description && (
                  <p className="text-sm text-gray-700 mb-3 italic line-clamp-3">{richData.description}</p>
                )}

                {/* Star Rating */}
                {hotel.stars && (
                  <div className="flex items-center mb-2">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{hotel.stars} sterren</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-right ml-4">
                {hotel.price?.amount && (
                  <div className="text-2xl font-bold text-blue-600">€{hotel.price.amount.toLocaleString()}</div>
                )}
                <div className="text-sm text-gray-500">totaal</div>
              </div>
            </div>

            {/* Hotel Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <div className="font-medium">Check-in</div>
                    <div className="text-gray-600">{formatDate(hotel.checkInDate)}</div>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Bed className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <div className="font-medium">Kamertype</div>
                    <div className="text-gray-600">{roomDescription}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <div className="font-medium">Check-out</div>
                    <div className="text-gray-600">{formatDate(hotel.checkOutDate)}</div>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Utensils className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <div className="font-medium">Maaltijden</div>
                    <div className="text-gray-600">{mealDescription}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* REAL Hotel Facilities - ONLY show if we have actual data */}
            {facilities.length > 0 ? (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  🏨 Faciliteiten ({facilities.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {facilities.map((facility: string | any, fIndex: number) => {
                    const facilityText =
                      typeof facility === "string"
                        ? facility
                        : facility?.name || facility?.description || String(facility)
                    return (
                      <div key={fIndex} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                        {getFacilityIcon(facility)}
                        <span className="text-gray-700">{facilityText}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : richDataLoading ? (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-3">🏨 Faciliteiten</h4>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-600 text-sm">Faciliteiten worden geladen uit Travel Compositor...</p>
                </div>
              </div>
            ) : null}

            {/* Provider Info */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Provider:</span> {hotel.providerDescription || hotel.provider}
              </div>

              {hotel.bookingReference && (
                <Badge variant="outline" className="text-xs">
                  Ref: {hotel.bookingReference}
                </Badge>
              )}
            </div>

            {/* Hotel Address */}
            {hotel.address && (
              <div className="mt-3 text-sm text-gray-600">
                <MapPin className="h-3 w-3 inline mr-1" />
                {hotel.address}
                {hotel.postalCode && `, ${hotel.postalCode}`}
              </div>
            )}

            {/* Loading indicator for rich data */}
            {richDataLoading && (
              <div className="mt-3 text-xs text-gray-500 italic">Laden van extra hotel informatie...</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
