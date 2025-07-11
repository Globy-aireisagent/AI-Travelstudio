"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ChatInterface from "@/components/chat-interface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Users, FileText, Globe } from "lucide-react"

interface TravelBuddyConfig {
  id: string
  title: string
  description: string
  pdfData?: {
    title: string
    summary: string
    destination?: string
    startDate?: string
    endDate?: string
    accommodations?: string[]
    activities?: string[]
    keyDetails?: string[]
  }
  websiteData?: Array<{
    url: string
    title: string
    summary: string
    accommodations?: string[]
    activities?: string[]
    restaurants?: string[]
  }>
  intakeData?: {
    naam: string
    leeftijden: string
    interesses: string[]
    eetvoorkeur: string
    reisstijl: string
  }
  createdAt: string
}

export default function TravelBuddyPage() {
  const params = useParams()
  const bookingId = params.bookingId as string
  const [config, setConfig] = useState<TravelBuddyConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load TravelBuddy configuration from localStorage
    const loadConfig = () => {
      try {
        const savedConfigs = localStorage.getItem("travelbuddy_configs")
        if (savedConfigs) {
          const configs: TravelBuddyConfig[] = JSON.parse(savedConfigs)
          const foundConfig = configs.find((c) => c.id === bookingId)

          if (foundConfig) {
            setConfig(foundConfig)
          } else {
            // Create a default config if not found
            const defaultConfig: TravelBuddyConfig = {
              id: bookingId,
              title: "Jouw TravelBuddy",
              description: "Stel je vragen over je reis!",
              createdAt: new Date().toISOString(),
            }
            setConfig(defaultConfig)
          }
        } else {
          // Create a default config
          const defaultConfig: TravelBuddyConfig = {
            id: bookingId,
            title: "Jouw TravelBuddy",
            description: "Stel je vragen over je reis!",
            createdAt: new Date().toISOString(),
          }
          setConfig(defaultConfig)
        }
      } catch (error) {
        console.error("Error loading TravelBuddy config:", error)
        // Fallback config
        const fallbackConfig: TravelBuddyConfig = {
          id: bookingId,
          title: "Jouw TravelBuddy",
          description: "Stel je vragen over je reis!",
          createdAt: new Date().toISOString(),
        }
        setConfig(fallbackConfig)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">TravelBuddy wordt geladen...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">TravelBuddy niet gevonden</h1>
            <p className="text-gray-600 mb-4">Deze TravelBuddy bestaat niet of is verlopen.</p>
            <a
              href="/travelbuddy"
              className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Nieuwe TravelBuddy maken
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">👋 Hoi! Ik ben Globy</h1>
          <p className="text-xl text-gray-600">Jouw persoonlijke reisassistent voor {config.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reis Overzicht */}
          <div className="lg:col-span-1 space-y-6">
            {/* Reis Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  Reis Overzicht
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{config.title}</h3>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>

                {config.pdfData && (
                  <div className="space-y-2">
                    {config.pdfData.destination && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{config.pdfData.destination}</span>
                      </div>
                    )}

                    {(config.pdfData.startDate || config.pdfData.endDate) && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {config.pdfData.startDate} - {config.pdfData.endDate}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {config.intakeData && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {config.intakeData.naam} ({config.intakeData.leeftijden})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {config.intakeData.interesses?.map((interesse, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interesse}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PDF Informatie */}
            {config.pdfData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Reisdocument
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{config.pdfData.summary}</p>

                    {config.pdfData.accommodations && config.pdfData.accommodations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-800 mb-1">Accommodaties:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {config.pdfData.accommodations.slice(0, 3).map((acc, index) => (
                            <li key={index}>• {acc}</li>
                          ))}
                          {config.pdfData.accommodations.length > 3 && (
                            <li className="text-gray-500">... en {config.pdfData.accommodations.length - 3} meer</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {config.pdfData.activities && config.pdfData.activities.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-800 mb-1">Activiteiten:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {config.pdfData.activities.slice(0, 3).map((act, index) => (
                            <li key={index}>• {act}</li>
                          ))}
                          {config.pdfData.activities.length > 3 && (
                            <li className="text-gray-500">... en {config.pdfData.activities.length - 3} meer</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Website Informatie */}
            {config.websiteData && config.websiteData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-500" />
                    Website Informatie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {config.websiteData.slice(0, 2).map((site, index) => (
                      <div key={index} className="border-l-2 border-green-200 pl-3">
                        <h4 className="font-medium text-sm text-gray-800">{site.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{site.summary}</p>

                        {site.activities && site.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {site.activities.slice(0, 3).map((activity, actIndex) => (
                              <Badge key={actIndex} variant="outline" className="text-xs">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {config.websiteData.length > 2 && (
                      <p className="text-xs text-gray-500 text-center">
                        ... en {config.websiteData.length - 2} meer websites
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                <ChatInterface
                  bookingId={bookingId}
                  uploadedDocuments={[]}
                  intakeData={config.intakeData}
                  bookingData={config}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>TravelBuddy gemaakt op {new Date(config.createdAt).toLocaleDateString("nl-NL")} • Powered by AI</p>
        </div>
      </div>
    </div>
  )
}
