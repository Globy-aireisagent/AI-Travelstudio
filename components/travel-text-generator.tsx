"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MapPin,
  Route,
  Calendar,
  Hotel,
  ImageIcon,
  Sparkles,
  Plus,
  Mic,
  Briefcase,
  Smile,
  Users,
  Zap,
} from "lucide-react"

export default function TravelTextGenerator() {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [selectedContentType, setSelectedContentType] = useState("")
  const [selectedWritingStyle, setSelectedWritingStyle] = useState("beleefd")
  const [destination, setDestination] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const contentTypes = [
    {
      id: "bestemmings-tekst",
      name: "Bestemmings tekst",
      icon: MapPin,
      description: "Beschrijvingen van bestemmingen",
    },
    {
      id: "routebeschrijving",
      name: "Routebeschrijving",
      icon: Route,
      description: "Reisroutes en wegbeschrijvingen",
    },
    {
      id: "dagplanning",
      name: "Dagplanning",
      icon: Calendar,
      description: "Dagelijkse reisschema's",
    },
    {
      id: "hotel-zoeker",
      name: "Hotel zoeker",
      icon: Hotel,
      description: "Hotel aanbevelingen",
    },
    {
      id: "afbeelding-generator",
      name: "Afbeelding Generator",
      icon: ImageIcon,
      description: "AI gegenereerde reisafbeeldingen",
      premium: true,
    },
  ]

  const writingStyles = [
    {
      id: "zakelijk",
      name: "Zakelijk",
      icon: Briefcase,
      description: "Professioneel en formeel",
    },
    {
      id: "speels",
      name: "Speels",
      icon: Smile,
      description: "Vrolijk en informeel",
    },
    {
      id: "enthousiast",
      name: "Enthousiast",
      icon: Sparkles,
      description: "Energiek en inspirerend",
    },
    {
      id: "beleefd",
      name: "Beleefd",
      icon: Users,
      description: "Hoffelijk en respectvol",
    },
  ]

  const handleGenerateContent = async () => {
    if (!selectedContentType || !destination) return

    setIsGenerating(true)

    // Simuleer API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockContent = `Welkom in ${destination}! Deze prachtige bestemming biedt een unieke mix van cultuur, geschiedenis en natuurlijke schoonheid. Of je nu op zoek bent naar avontuur of ontspanning, ${destination} heeft voor ieder wat wils.`

    setGeneratedContent(mockContent)
    setIsGenerating(false)
    setIsNewChatOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">RB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Travel Text Generator</h1>
              <p className="text-sm text-gray-600">Genereer reisteksten, routes en planningen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">AI Travel Text Generator</CardTitle>
                <CardDescription>
                  Genereer professionele reisteksten, routebeschrijvingen, dagplanningen en hotel aanbevelingen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subscription Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Basis Plan</span>
                    <Button size="sm" variant="outline">
                      Upgrade
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">€4.99/maand</p>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">50 credits</span>
                    <span className="text-xs text-gray-500 ml-auto">0 gesprekken</span>
                  </div>
                </div>

                {/* New Chat Button */}
                <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      <Sparkles className="w-4 h-4 mr-2" />
                      Nieuwe Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Nieuwe Chat Maken</DialogTitle>
                      <DialogDescription>Kies het type content en schrijfstijl voor je nieuwe chat</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Content Type Selection */}
                      <div>
                        <h3 className="font-medium mb-3">Kies Content Type:</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {contentTypes.map((type) => {
                            const Icon = type.icon
                            return (
                              <button
                                key={type.id}
                                onClick={() => setSelectedContentType(type.id)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  selectedContentType === type.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <Icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                <p className="text-xs font-medium text-center">{type.name}</p>
                                {type.premium && (
                                  <Badge className="mt-1 text-xs bg-purple-100 text-purple-800">Premium</Badge>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Writing Style Selection */}
                      <div>
                        <h3 className="font-medium mb-3">Kies Schrijfstijl:</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {writingStyles.map((style) => {
                            const Icon = style.icon
                            return (
                              <button
                                key={style.id}
                                onClick={() => setSelectedWritingStyle(style.id)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  selectedWritingStyle === style.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <Icon className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                                <p className="text-xs font-medium text-center">{style.name}</p>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Destination Input */}
                      <div>
                        <h3 className="font-medium mb-2">Bestemming:</h3>
                        <div className="relative">
                          <Input
                            placeholder="Bijv. Amsterdam, Parijs, Rome..."
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="pr-10"
                          />
                          <Mic className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Generate Button */}
                      <Button
                        onClick={handleGenerateContent}
                        disabled={!selectedContentType || !destination || isGenerating}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Genereren...
                          </>
                        ) : (
                          <>Genereer {contentTypes.find((t) => t.id === selectedContentType)?.name || "Content"}</>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* History */}
                <div className="text-center py-4">
                  <div className="text-red-600 mb-2">🗑️</div>
                  <p className="text-sm text-gray-600">Wis Geschiedenis</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-8">
                {generatedContent ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">Gegenereerde Content</h2>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-800 leading-relaxed">{generatedContent}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Kopiëren
                      </Button>
                      <Button variant="outline" size="sm">
                        Bewerken
                      </Button>
                      <Button variant="outline" size="sm">
                        Opslaan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Welkom bij Travel Text Generator</h2>
                    <p className="text-gray-600 mb-6">
                      Selecteer een content type en begin met het genereren van professionele reisteksten
                    </p>

                    {/* Quick Start Options */}
                    <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
                      <Button
                        variant="outline"
                        className="p-6 h-auto flex-col space-y-2"
                        onClick={() => setIsNewChatOpen(true)}
                      >
                        <MapPin className="w-8 h-8 text-blue-600" />
                        <span className="font-medium">Bestemmings tekst</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="p-6 h-auto flex-col space-y-2"
                        onClick={() => setIsNewChatOpen(true)}
                      >
                        <Route className="w-8 h-8 text-blue-600" />
                        <span className="font-medium">Routebeschrijving</span>
                      </Button>
                    </div>

                    {/* Warning Message */}
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-center space-x-2 text-yellow-800">
                        <span>⚠️</span>
                        <span className="text-sm">Geen custom GPTs gevonden</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">Ga naar Super Admin → GPT Cloud Storage</p>
                    </div>
                  </div>
                )}

                {/* Bottom Input Area */}
                <div className="mt-8 pt-6 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Bijv. Amsterdam, Parijs, Rome..."
                      className="flex-1"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                    <Button onClick={() => setIsNewChatOpen(true)} disabled={!destination}>
                      Genereren
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
