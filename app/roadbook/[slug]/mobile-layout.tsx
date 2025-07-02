"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Clock,
  Car,
  Camera,
  Utensils,
  Bed,
  MessageCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  Navigation,
} from "lucide-react"

interface MobileRoadbookProps {
  roadbookData: any
  roadbookInfo: any
}

export default function MobileRoadbookLayout({ roadbookData, roadbookInfo }: MobileRoadbookProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day)
    setExpandedSection(null)
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{roadbookInfo.title}</h1>
              <p className="text-sm text-gray-600">
                {roadbookData.overview.totalDays} dagen • {roadbookData.overview.totalDistance}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {roadbookInfo.hasReisbuddy && (
              <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                AI Chat
              </Button>
            )}
            <Button size="sm" variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Delen
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* Overview Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-orange-400 to-red-500">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-3 left-3 text-white">
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {roadbookData.overview.startLocation} → {roadbookData.overview.endLocation}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Car className="w-3 h-3" />
                  <span>{roadbookData.overview.totalDistance}</span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {roadbookData.overview.highlights.map((highlight: string, index: number) => (
                <div key={index} className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg mb-1">
                    {index === 0 && "🍷"}
                    {index === 1 && "🏛️"}
                    {index === 2 && "🍽️"}
                    {index === 3 && "🛣️"}
                  </div>
                  <p className="text-xs font-medium text-gray-700">{highlight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Days List */}
        <div className="space-y-3">
          {roadbookData.days.map((day: any) => (
            <Card key={day.day} className="overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => toggleDay(day.day)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline">Dag {day.day}</Badge>
                      <h3 className="font-medium text-sm">{day.title}</h3>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Navigation className="w-3 h-3" />
                        <span>{day.distance}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{day.duration}</span>
                      </div>
                    </div>
                  </div>
                  {expandedDay === day.day ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedDay === day.day && (
                <div className="border-t bg-gray-50">
                  {/* Route */}
                  <div className="p-4 border-b">
                    <h4 className="font-medium text-sm mb-2 flex items-center">🛣️ Route</h4>
                    <p className="text-xs text-gray-600">{day.route}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs">
                      <span>Vertrek: {day.departure}</span>
                      <span>Aankomst: {day.arrival}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="p-4 border-b">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection(`highlights-${day.day}`)}
                    >
                      <h4 className="font-medium text-sm flex items-center">
                        <Camera className="w-4 h-4 mr-2 text-green-500" />
                        Highlights ({day.highlights.length})
                      </h4>
                      {expandedSection === `highlights-${day.day}` ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    {expandedSection === `highlights-${day.day}` && (
                      <div className="mt-3 space-y-3">
                        {day.highlights.map((highlight: any, index: number) => (
                          <div key={index} className="bg-white rounded p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  {highlight.type === "sightseeing" && <Camera className="w-3 h-3 text-blue-500" />}
                                  {highlight.type === "restaurant" && <Utensils className="w-3 h-3 text-red-500" />}
                                  {highlight.type === "activity" && <MapPin className="w-3 h-3 text-green-500" />}
                                  <span className="font-medium text-sm">{highlight.name}</span>
                                </div>
                                {highlight.price && <p className="text-xs text-gray-600">💰 {highlight.price}</p>}
                              </div>
                              {highlight.duration && (
                                <Badge variant="outline" className="text-xs">
                                  {highlight.duration}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Accommodation */}
                  {day.accommodation && (
                    <div className="p-4 border-b">
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <Bed className="w-4 h-4 mr-2 text-purple-500" />
                        Overnachting
                      </h4>
                      <div className="bg-purple-50 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{day.accommodation.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex">
                                {Array.from({ length: day.accommodation.rating }, (_, i) => (
                                  <span key={i} className="text-yellow-400 text-xs">
                                    ⭐
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-600">Check-in: {day.accommodation.checkIn}</span>
                            </div>
                          </div>
                          <Badge className="bg-purple-600 text-xs">{day.accommodation.status}</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {day.tips && day.tips.length > 0 && (
                    <div className="p-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection(`tips-${day.day}`)}
                      >
                        <h4 className="font-medium text-sm">💡 Tips ({day.tips.length})</h4>
                        {expandedSection === `tips-${day.day}` ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      {expandedSection === `tips-${day.day}` && (
                        <div className="mt-3 space-y-2">
                          {day.tips.map((tip: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="text-yellow-500 text-sm mt-0.5">💡</span>
                              <p className="text-xs text-gray-700 flex-1">{tip}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* AI Reisbuddy CTA */}
        {roadbookInfo.hasReisbuddy && (
          <Card className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-bold">Vragen over je reis?</h3>
              </div>
              <p className="mb-4 text-sm opacity-90">Je persoonlijke AI Reisbuddy helpt je verder!</p>
              <Button
                size="sm"
                className="w-full bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => window.open(roadbookInfo.reisbuddyUrl, "_blank")}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
