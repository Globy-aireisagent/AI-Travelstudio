"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Camera, Star, ChevronLeft, ChevronRight, Clock, Thermometer, Globe, Info } from "lucide-react"

interface DestinationCardProps {
  destination: {
    name: string
    country?: string
    nights?: number
  }
  bookingId: string
}

interface DestinationData {
  images: string[]
  description: string | null
  attractions: string[]
  climate: string | null
  currency: string | null
  language: string | null
  timeZone: string | null
  geolocation: {
    latitude: number
    longitude: number
  } | null
  hasRichContent: boolean
}

export default function DestinationCard({ destination, bookingId }: DestinationCardProps) {
  const [destinationData, setDestinationData] = useState<DestinationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    const fetchDestinationData = async () => {
      try {
        console.log(`🗺️ Fetching destination data for: ${destination.name}`)

        const response = await fetch(`/api/travel-compositor/get-rich-destination-data?bookingId=${bookingId}&config=1`)

        if (response.ok) {
          const result = await response.json()

          // Find matching destination
          const matchingDest = result.richDestinationData?.find(
            (d: any) =>
              d.bookingDestination.name.toLowerCase().includes(destination.name.toLowerCase()) ||
              destination.name.toLowerCase().includes(d.bookingDestination.name.toLowerCase()),
          )

          if (matchingDest?.richData) {
            console.log(`✅ Found rich destination data for ${destination.name}:`, matchingDest.richData)

            setDestinationData({
              images: matchingDest.richData.images || [],
              description: matchingDest.richData.description || matchingDest.richData.detailedInfo?.description,
              attractions: matchingDest.richData.attractions || matchingDest.richData.detailedInfo?.attractions || [],
              climate: matchingDest.richData.climate || matchingDest.richData.detailedInfo?.climate,
              currency: matchingDest.richData.currency || matchingDest.richData.detailedInfo?.currency,
              language: matchingDest.richData.language || matchingDest.richData.detailedInfo?.language,
              timeZone: matchingDest.richData.timeZone || matchingDest.richData.detailedInfo?.timeZone,
              geolocation: matchingDest.richData.geolocation,
              hasRichContent: matchingDest.richData.hasRichContent,
            })
          } else {
            console.log(`⚠️ No rich data found for destination: ${destination.name}`)
            setDestinationData({
              images: [],
              description: null,
              attractions: [],
              climate: null,
              currency: null,
              language: null,
              timeZone: null,
              geolocation: null,
              hasRichContent: false,
            })
          }
        }
      } catch (error) {
        console.error(`❌ Error fetching destination data for ${destination.name}:`, error)
        setDestinationData({
          images: [],
          description: null,
          attractions: [],
          climate: null,
          currency: null,
          language: null,
          timeZone: null,
          geolocation: null,
          hasRichContent: false,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDestinationData()
  }, [destination.name, bookingId])

  const nextImage = () => {
    if (destinationData && destinationData.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % destinationData.images.length)
    }
  }

  const prevImage = () => {
    if (destinationData && destinationData.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + destinationData.images.length) % destinationData.images.length)
    }
  }

  const truncateText = (text: string, maxLength = 200) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full overflow-hidden">
      {/* Image Gallery */}
      {destinationData?.images && destinationData.images.length > 0 ? (
        <div className="relative h-64 group">
          <img
            src={destinationData.images[currentImageIndex] || "/placeholder.svg"}
            alt={`${destination.name} foto ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `/placeholder.svg?height=300&width=500&text=${encodeURIComponent(destination.name)}`
            }}
          />

          {/* Navigation arrows */}
          {destinationData.images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Image counter and badge */}
          <div className="absolute top-2 right-2 flex gap-2">
            {destinationData.hasRichContent && (
              <Badge className="bg-green-600 text-white">
                <Camera className="w-3 h-3 mr-1" />
                Echte foto's
              </Badge>
            )}
            {destinationData.images.length > 1 && (
              <Badge variant="secondary" className="bg-black/50 text-white">
                {currentImageIndex + 1}/{destinationData.images.length}
              </Badge>
            )}
          </div>
        </div>
      ) : (
        <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Geen foto's beschikbaar</p>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{destination.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {destination.country && (
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {destination.country}
                </span>
              )}
              {destination.nights && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {destination.nights} nachten
                </span>
              )}
            </div>
          </div>

          {destinationData?.geolocation && (
            <Badge variant="outline" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              GPS: {destinationData.geolocation.latitude.toFixed(2)}, {destinationData.geolocation.longitude.toFixed(2)}
            </Badge>
          )}
        </div>

        {/* Description */}
        {destinationData?.description && (
          <div className="mb-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              {showFullDescription ? destinationData.description : truncateText(destinationData.description, 200)}
            </p>
            {destinationData.description.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-800"
              >
                {showFullDescription ? "Minder lezen" : "Lees verder"}
              </Button>
            )}
          </div>
        )}

        {/* Travel Info */}
        {(destinationData?.climate ||
          destinationData?.currency ||
          destinationData?.language ||
          destinationData?.timeZone) && (
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            {destinationData.climate && (
              <div className="flex items-center gap-1 text-gray-600">
                <Thermometer className="w-3 h-3" />
                <span>{destinationData.climate}</span>
              </div>
            )}
            {destinationData.currency && (
              <div className="flex items-center gap-1 text-gray-600">
                <span className="font-mono">€</span>
                <span>{destinationData.currency}</span>
              </div>
            )}
            {destinationData.language && (
              <div className="flex items-center gap-1 text-gray-600">
                <Globe className="w-3 h-3" />
                <span>{destinationData.language}</span>
              </div>
            )}
            {destinationData.timeZone && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-3 h-3" />
                <span>{destinationData.timeZone}</span>
              </div>
            )}
          </div>
        )}

        {/* Attractions */}
        {destinationData?.attractions && destinationData.attractions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              Bezienswaardigheden
            </h4>
            <div className="flex flex-wrap gap-1">
              {destinationData.attractions.slice(0, 6).map((attraction, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {attraction}
                </Badge>
              ))}
              {destinationData.attractions.length > 6 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{destinationData.attractions.length - 6} meer
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* No data message */}
        {!destinationData?.hasRichContent && (
          <div className="text-center py-4 text-gray-500">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Geen uitgebreide informatie beschikbaar uit Travel Compositor</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
