"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Plane,
  Car,
  Train,
  Hotel,
  Camera,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Navigation,
} from "lucide-react"
import Image from "next/image"

interface TimelineDay {
  day: number
  date: string
  title: string
  location: string
  transport?: {
    type: "plane" | "car" | "train" | "bus"
    from: string
    to: string
    time: string
    details: string
  }
  accommodation?: {
    name: string
    type: string
    address: string
    rating: number
    image: string
    amenities: string[]
  }
  activities: {
    time: string
    title: string
    description: string
    location: string
    duration: string
    image?: string
    type: "sightseeing" | "dining" | "activity" | "free-time"
  }[]
  meals: {
    type: "breakfast" | "lunch" | "dinner"
    included: boolean
    location?: string
    description?: string
  }[]
  photos: string[]
  highlights: string[]
}

interface TravelTimelineProps {
  days: TimelineDay[]
  destination: string
}

export default function TravelTimeline({ days, destination }: TravelTimelineProps) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [currentPhoto, setCurrentPhoto] = useState(0)

  const currentDay = days[selectedDay]

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "plane":
        return <Plane className="w-5 h-5" />
      case "car":
        return <Car className="w-5 h-5" />
      case "train":
        return <Train className="w-5 h-5" />
      default:
        return <Car className="w-5 h-5" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sightseeing":
        return <Camera className="w-4 h-4" />
      case "dining":
        return <Users className="w-4 h-4" />
      case "activity":
        return <Navigation className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const nextPhoto = () => {
    if (currentDay.photos.length > 0) {
      setCurrentPhoto((prev) => (prev + 1) % currentDay.photos.length)
    }
  }

  const prevPhoto = () => {
    if (currentDay.photos.length > 0) {
      setCurrentPhoto((prev) => (prev - 1 + currentDay.photos.length) % currentDay.photos.length)
    }
  }

  return (
    <div className="space-y-6">
      {/* Timeline Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            {destination} - Reis Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {days.map((day, index) => (
              <Button
                key={day.day}
                variant={selectedDay === index ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedDay(index)
                  setCurrentPhoto(0)
                }}
                className="whitespace-nowrap"
              >
                Dag {day.day}
                <br />
                <span className="text-xs opacity-75">{day.date}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      {currentDay && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Day Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      Dag {currentDay.day}: {currentDay.title}
                    </CardTitle>
                    <p className="text-lg text-gray-600 mt-1">{currentDay.location}</p>
                    <p className="text-sm text-gray-500">{currentDay.date}</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    Dag {currentDay.day}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Transport */}
            {currentDay.transport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getTransportIcon(currentDay.transport.type)}
                    <span className="ml-2">Vervoer</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="font-semibold">{currentDay.transport.from}</p>
                        <p className="text-sm text-gray-500">Vertrek</p>
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {getTransportIcon(currentDay.transport.type)}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{currentDay.transport.to}</p>
                        <p className="text-sm text-gray-500">Aankomst</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {currentDay.transport.time}
                    </Badge>
                    <span className="text-gray-600">{currentDay.transport.details}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activities Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Dagprogramma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentDay.activities.map((activity, index) => (
                    <div key={index} className="flex space-x-4 pb-4 border-b last:border-b-0">
                      <div className="flex-shrink-0 w-16 text-center">
                        <Badge variant="outline" className="text-xs">
                          {activity.time}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start space-x-2">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <h4 className="font-semibold">{activity.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {activity.location}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {activity.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        {activity.image && (
                          <div className="mt-3">
                            <Image
                              src={activity.image || "/placeholder.svg"}
                              alt={activity.title}
                              width={300}
                              height={200}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Photos Gallery */}
            {currentDay.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Foto's van Dag {currentDay.day}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={currentDay.photos[currentPhoto] || "/placeholder.svg?height=400&width=600&text=Reis+Foto"}
                        alt={`${currentDay.location} - Foto ${currentPhoto + 1}`}
                        fill
                        className="object-cover"
                      />

                      {currentDay.photos.length > 1 && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                            onClick={prevPhoto}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                            onClick={nextPhoto}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {currentPhoto + 1} / {currentDay.photos.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Strip */}
                    {currentDay.photos.length > 1 && (
                      <div className="flex space-x-2 mt-3 overflow-x-auto">
                        {currentDay.photos.map((photo, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPhoto(index)}
                            className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors ${
                              index === currentPhoto ? "border-blue-500" : "border-gray-200"
                            }`}
                          >
                            <Image
                              src={photo || "/placeholder.svg"}
                              alt={`Thumbnail ${index + 1}`}
                              width={64}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Accommodation */}
            {currentDay.accommodation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Hotel className="w-5 h-5 mr-2" />
                    Accommodatie
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <Image
                      src={currentDay.accommodation.image || "/placeholder.svg?height=200&width=300&text=Hotel"}
                      alt={currentDay.accommodation.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">{currentDay.accommodation.name}</h3>
                    <p className="text-sm text-gray-600">{currentDay.accommodation.type}</p>
                    <p className="text-xs text-gray-500 mt-1">{currentDay.accommodation.address}</p>

                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < currentDay.accommodation.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-gray-500 ml-2">({currentDay.accommodation.rating}/5)</span>
                    </div>
                  </div>

                  {currentDay.accommodation.amenities.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Faciliteiten:</h4>
                      <div className="flex flex-wrap gap-1">
                        {currentDay.accommodation.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Meals */}
            <Card>
              <CardHeader>
                <CardTitle>Maaltijden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentDay.meals.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{meal.type}</p>
                        {meal.location && <p className="text-sm text-gray-600">{meal.location}</p>}
                        {meal.description && <p className="text-xs text-gray-500">{meal.description}</p>}
                      </div>
                      <Badge variant={meal.included ? "default" : "outline"}>
                        {meal.included ? "Inbegrepen" : "Eigen kosten"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Highlights */}
            {currentDay.highlights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hoogtepunten</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentDay.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
