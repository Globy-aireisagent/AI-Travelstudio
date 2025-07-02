"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Route,
  Camera,
  MessageCircle,
  Plus,
  Copy,
  ExternalLink,
  BarChart3,
  Settings,
  Download,
  Play,
  ImageIcon,
} from "lucide-react"

export default function Dashboard() {
  const [generatedRoadbook, setGeneratedRoadbook] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMedia, setGeneratedMedia] = useState<any[]>([])

  const handleGenerateRoadbook = async () => {
    setIsGenerating(true)
    // Simulate API call
    setTimeout(() => {
      setGeneratedRoadbook(`
🛣️ ROADBOOK: ROMANTISCHE ROUTE DOOR TOSCANE
📍 7 dagen • 850 km • Voor stellen

═══════════════════════════════════════════

DAG 1: FLORENCE - SIENA (68 km, 1u 15min)
🕐 Vertrek: 09:00 | Aankomst: 12:00

Route Details:
• A1 richting Siena via Poggibonsi
• Tussenstop: San Gimignano (30 min)
  - Beroemde torens bekijken
  - Gelato bij Gelateria Dondoli

📍 SIENA HIGHLIGHTS:
• Piazza del Campo (1 uur)
• Duomo di Siena (45 min)  
• Lunch: Osteria Le Logge (€45 p.p.)

🏨 Overnachting: Hotel Athena ⭐⭐⭐⭐
📧 Reservering: bevestigd | Check-in: 15:00

═══════════════════════════════════════════

DAG 2: SIENA - MONTALCINO (42 km, 50 min)
🕐 Vertrek: 10:00 | Aankomst: 11:30

Route Details:
• SR2 via Buonconvento
• Landelijke route door wijngaarden

📍 MONTALCINO HIGHLIGHTS:
• Brunello wijnproeverij (2 uur)
• Fortezza di Montalcino (30 min)
• Lunch: Il Grappolo Blu (€35 p.p.)

🍷 Geboekte activiteit: 
Brunello Wine Tour - 14:00-17:00 (€85 p.p.)

═══════════════════════════════════════════

[Roadbook continues for all 7 days...]

💡 PRAKTISCHE TIPS:
• Tankstations: Elke 50km aangegeven
• Tolwegen: €23 totaal
• Parkeren: Reserveer vooraf in stadscentra
• Noodcontact: +39 055 123 4567
      `)
      setIsGenerating(false)
    }, 3000)
  }

  const handleGenerateMedia = async () => {
    // Simulate media generation
    setGeneratedMedia([
      {
        type: "image",
        url: "/placeholder.svg?height=200&width=300",
        title: "Romantische zonsondergang in Toscaanse wijngaard",
        description: "Perfect voor social media en brochures",
      },
      {
        type: "video",
        url: "/placeholder.svg?height=200&width=300",
        title: "Roadtrip door Toscane - Promo Video",
        description: "30 seconden promotional video",
      },
      {
        type: "image",
        url: "/placeholder.svg?height=200&width=300",
        title: "Luchtfoto Piazza del Campo, Siena",
        description: "Hoge resolutie voor print materiaal",
      },
    ])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">RB</span>
            </div>
            <h1 className="text-xl font-semibold">Roadbooks Pro</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Professional Plan</Badge>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Instellingen
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roadbooks Deze Maand</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">van 200 gebruikt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Media Gegenereerd</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <p className="text-xs text-muted-foreground">156 foto's, 78 video's</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Chat Bots</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">van 50 gebruikt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Downloads</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,847</div>
              <p className="text-xs text-muted-foreground">+28% vs vorige maand</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="roadbooks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roadbooks">Roadbook Generator</TabsTrigger>
            <TabsTrigger value="media">Media Generator</TabsTrigger>
            <TabsTrigger value="chat-bots">Chat Bots</TabsTrigger>
          </TabsList>

          {/* Roadbook Generator Tab */}
          <TabsContent value="roadbooks">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Route className="w-5 h-5" />
                    <span>Nieuwe Roadbook Genereren</span>
                  </CardTitle>
                  <CardDescription>
                    Vul de reisdetails in en laat AI een complete roadbook voor je maken
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-location">Startlocatie</Label>
                      <Input id="start-location" placeholder="Florence, Italië" />
                    </div>
                    <div>
                      <Label htmlFor="end-location">Eindlocatie</Label>
                      <Input id="end-location" placeholder="Rome, Italië" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Reisduur</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer duur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 dagen</SelectItem>
                          <SelectItem value="5">5 dagen</SelectItem>
                          <SelectItem value="7">7 dagen</SelectItem>
                          <SelectItem value="10">10 dagen</SelectItem>
                          <SelectItem value="14">14 dagen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="travel-style">Reisstijl</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer stijl" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="romantic">Romantisch</SelectItem>
                          <SelectItem value="family">Familie</SelectItem>
                          <SelectItem value="adventure">Avontuurlijk</SelectItem>
                          <SelectItem value="cultural">Cultureel</SelectItem>
                          <SelectItem value="luxury">Luxe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="interests">Interesses & Voorkeuren</Label>
                    <Textarea
                      id="interests"
                      placeholder="Bijv. wijngaarden, historische steden, lokale keuken, musea..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget">Budget per dag</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="budget">€50-100</SelectItem>
                          <SelectItem value="mid">€100-200</SelectItem>
                          <SelectItem value="luxury">€200+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="transport">Vervoer</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Vervoermiddel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="car">Auto</SelectItem>
                          <SelectItem value="motorcycle">Motor</SelectItem>
                          <SelectItem value="camper">Camper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleGenerateRoadbook} disabled={isGenerating} className="w-full">
                    {isGenerating ? "Roadbook Genereren..." : "🛣️ Genereer Roadbook"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Gegenereerde Roadbook</span>
                    {generatedRoadbook && (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="w-4 h-4 mr-2" />
                          Kopiëren
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>Je gegenereerde roadbook verschijnt hier</CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedRoadbook ? (
                    <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-xs font-mono">{generatedRoadbook}</pre>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Route className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Vul het formulier in en klik op "Genereer Roadbook" om te beginnen</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Media Generator Tab */}
          <TabsContent value="media">
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Camera className="w-5 h-5" />
                      <span>Media Generator</span>
                    </CardTitle>
                    <CardDescription>Genereer foto's en video's voor je reizen en marketing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="media-destination">Bestemming</Label>
                      <Input id="media-destination" placeholder="Toscane, Italië" />
                    </div>

                    <div>
                      <Label htmlFor="media-type">Media Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="photos">Foto's (4K)</SelectItem>
                          <SelectItem value="videos">Video's (30s)</SelectItem>
                          <SelectItem value="both">Foto's + Video's</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="media-style">Stijl</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer stijl" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cinematic">Cinematisch</SelectItem>
                          <SelectItem value="documentary">Documentaire</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                          <SelectItem value="professional">Professioneel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="media-description">Beschrijving</Label>
                      <Textarea
                        id="media-description"
                        placeholder="Romantische zonsondergang over wijngaarden, stellen wandelend door historische straten..."
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleGenerateMedia} className="w-full">
                      🎨 Genereer Media
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recente Generaties</CardTitle>
                    <CardDescription>Je laatst gegenereerde media content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { type: "video", title: "Bali Sunset Timelapse", size: "1080p", date: "2 uur geleden" },
                        { type: "image", title: "Santorini Blue Domes", size: "4K", date: "5 uur geleden" },
                        { type: "image", title: "Tokyo Street Food", size: "4K", date: "1 dag geleden" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {item.type === "video" ? (
                              <Play className="w-5 h-5 text-blue-600" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-green-600" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{item.title}</p>
                              <p className="text-xs text-gray-500">
                                {item.size} • {item.date}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Generated Media Display */}
              {generatedMedia.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nieuw Gegenereerde Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {generatedMedia.map((media, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          <img
                            src={media.url || "/placeholder.svg"}
                            alt={media.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-3">
                            <h3 className="font-medium text-sm mb-1">{media.title}</h3>
                            <p className="text-xs text-gray-500 mb-2">{media.description}</p>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Copy className="w-3 h-3 mr-1" />
                                Link
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Chat Bots Tab - Same as before */}
          <TabsContent value="chat-bots">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Chat Bots</h2>
                  <p className="text-gray-600">Beheer persoonlijke AI-assistenten voor je klanten</p>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuwe Chat Bot
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "Jan & Marie - Toscane Roadtrip",
                    status: "Actief",
                    messages: 47,
                    created: "3 dagen geleden",
                    url: "chat.roadbooks.nl/jan-marie-toscane-2024",
                  },
                  {
                    name: "Familie Peters - Route 66",
                    status: "Actief",
                    messages: 23,
                    created: "1 week geleden",
                    url: "chat.roadbooks.nl/peters-route66-2024",
                  },
                  {
                    name: "Lisa - Solo Japan Road Trip",
                    status: "Inactief",
                    messages: 156,
                    created: "2 weken geleden",
                    url: "chat.roadbooks.nl/lisa-japan-solo",
                  },
                ].map((bot, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                        <Badge variant={bot.status === "Actief" ? "default" : "secondary"}>{bot.status}</Badge>
                      </div>
                      <CardDescription>{bot.created}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Berichten:</span>
                          <span className="font-medium">{bot.messages}</span>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">{bot.url}</div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Copy className="w-3 h-3 mr-1" />
                            Link
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Open
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
