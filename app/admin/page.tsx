"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Settings, Users, MessageCircle, Copy, ExternalLink, Plus, X, Link } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import VideoHeader from "@/components/video-header"
import { redirect } from "next/navigation"

export default function AdminDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([""])
  const [reisbuddyUrl, setReisbuddyUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [headerVideo, setHeaderVideo] = useState<any>(null)

  const handleVideoUpdate = (videoData: any) => {
    setHeaderVideo(videoData)
  }

  const handleFileUpload = async (files: FileList) => {
    setIsProcessing(true)

    // Simulate file processing
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: file.size,
          type: file.type,
          processed: true,
          extractedInfo: {
            destination: "Toscane, Italië",
            dates: "15-22 augustus 2024",
            hotels: ["Hotel Villa San Martino", "Borgo Santo Pietro"],
            activities: ["Wijnproeverij Chianti", "Cooking class Florence"],
            transport: "Huurauto - Fiat 500X",
          },
        },
      ])
    }

    setIsProcessing(false)

    // Generate unique reisbuddy URL
    const slug = `${Date.now()}-toscane-roadtrip`
    setReisbuddyUrl(`https://reisbuddy.roadbooks.nl/${slug}`)
  }

  const addUrlField = () => {
    setWebsiteUrls([...websiteUrls, ""])
  }

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...websiteUrls]
    newUrls[index] = value
    setWebsiteUrls(newUrls)
  }

  const removeUrl = (index: number) => {
    if (websiteUrls.length > 1) {
      const newUrls = websiteUrls.filter((_, i) => i !== index)
      setWebsiteUrls(newUrls)
    }
  }

  // Redirect to '/travelbuddy' if reisbuddyUrl is set
  if (reisbuddyUrl) {
    redirect("/travelbuddy")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">RB</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Reisbuddy Configurator</h1>
                <p className="text-sm text-gray-600">Stel je persoonlijke AI reisbuddy in voor klanten</p>
              </div>
            </div>
            <Badge variant="secondary">Configuratie Dashboard</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="video">0. Header Video</TabsTrigger>
            <TabsTrigger value="upload">1. Upload Documenten</TabsTrigger>
            <TabsTrigger value="configure">2. AI Configuratie</TabsTrigger>
            <TabsTrigger value="intake">3. Intake Setup</TabsTrigger>
            <TabsTrigger value="deploy">4. Reisbuddy Activeren</TabsTrigger>
            <TabsTrigger value="api-test">5. API Test & Debug</TabsTrigger>
          </TabsList>

          {/* Step 0: Header Video */}
          <TabsContent value="video">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Header Video Setup</h2>
                <p className="text-gray-600">
                  Voeg een persoonlijke video toe die je klanten zien wanneer ze je reisbuddy openen
                </p>
              </div>

              <VideoHeader isAdminMode={true} videoUrl={headerVideo?.url} onVideoUpdate={handleVideoUpdate} />

              {headerVideo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Video Instellingen</CardTitle>
                    <CardDescription>Configureer hoe je video wordt weergegeven</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="video-title">Video Titel (optioneel)</Label>
                        <Input id="video-title" placeholder="Welkom bij je Toscane reis!" />
                      </div>
                      <div>
                        <Label htmlFor="video-subtitle">Ondertitel (optioneel)</Label>
                        <Input id="video-subtitle" placeholder="Een persoonlijke boodschap van je reisagent" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Video Instellingen</Label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Automatisch afspelen</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Video herhalen (loop)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Start zonder geluid</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span className="text-sm">Toon video controls</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-medium text-amber-900 mb-2">📱 Mobiele Weergave</h4>
                      <p className="text-sm text-amber-800">
                        Op mobiele apparaten wordt de video automatisch geoptimaliseerd voor kleinere schermen en
                        langzamere verbindingen.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Step 1: Document Upload & URLs */}
          <TabsContent value="upload">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Reis Documenten & Websites</span>
                  </CardTitle>
                  <CardDescription>Upload documenten en voeg relevante website URLs toe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">📄 Documenten Uploaden</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => document.getElementById("file-input")?.click()}
                    >
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                      <div>
                        <p className="text-sm font-medium">Sleep bestanden hierheen</p>
                        <p className="text-xs text-gray-500 mt-1">of klik om te uploaden</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG (max 25MB)</p>
                      </div>
                    </div>

                    <input
                      id="file-input"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    />
                  </div>

                  {/* Website URLs */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">🌐 Website URLs Toevoegen</Label>
                    <div className="space-y-3">
                      {websiteUrls.map((url, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex-1 relative">
                            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="url"
                              placeholder="https://hotel-website.com"
                              value={url}
                              onChange={(e) => updateUrl(index, e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          {websiteUrls.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeUrl(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addUrlField} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Nog een URL toevoegen
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Bijv: hotel websites, activiteiten, restaurants, attracties
                    </p>
                  </div>

                  {isProcessing && (
                    <Alert>
                      <AlertDescription>
                        🤖 AI analyseert je documenten en websites... Dit kan even duren.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geüploade Content</CardTitle>
                  <CardDescription>AI geëxtraheerde informatie uit je documenten en websites</CardDescription>
                </CardHeader>
                <CardContent>
                  {uploadedFiles.length === 0 && websiteUrls.every((url) => !url.trim()) ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nog geen documenten of URLs toegevoegd</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Uploaded Files */}
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-sm">{file.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {file.processed ? "✅ Verwerkt" : "⏳ Verwerken..."}
                            </Badge>
                          </div>

                          {file.processed && (
                            <div className="bg-gray-50 rounded p-3 text-xs space-y-1">
                              <p>
                                <strong>Bestemming:</strong> {file.extractedInfo.destination}
                              </p>
                              <p>
                                <strong>Reisdata:</strong> {file.extractedInfo.dates}
                              </p>
                              <p>
                                <strong>Hotels:</strong> {file.extractedInfo.hotels.join(", ")}
                              </p>
                              <p>
                                <strong>Activiteiten:</strong> {file.extractedInfo.activities.join(", ")}
                              </p>
                              <p>
                                <strong>Transport:</strong> {file.extractedInfo.transport}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Website URLs */}
                      {websiteUrls
                        .filter((url) => url.trim())
                        .map((url, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Link className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-sm">Website</span>
                              <Badge variant="outline" className="text-xs">
                                🔄 Wordt geanalyseerd
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 break-all">{url}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Step 2: AI Configuration */}
          <TabsContent value="configure">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>AI Reisbuddy Configuratie</span>
                </CardTitle>
                <CardDescription>
                  Stel in hoe de AI moet reageren en welke richtlijnen gevolgd moeten worden
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="ai-personality">AI Persoonlijkheid & Toon</Label>
                  <Textarea
                    id="ai-personality"
                    placeholder="Bijv: Wees vriendelijk en enthousiast. Spreek de reiziger persoonlijk aan. Geef praktische tips..."
                    rows={3}
                    defaultValue="Je bent een vriendelijke en enthousiaste reisbuddy. Spreek reizigers persoonlijk aan met hun naam. Geef altijd praktische, realistische adviezen gebaseerd op de geüploade documenten en websites. Wees behulpzaam maar niet opdringerig."
                  />
                </div>

                <div>
                  <Label htmlFor="ai-guidelines">Belangrijke Richtlijnen</Label>
                  <Textarea
                    id="ai-guidelines"
                    placeholder="Bijv: Alle informatie moet gebaseerd zijn op werkelijke locaties. Geen fictieve restaurants of hotels..."
                    rows={4}
                    defaultValue={`BELANGRIJKE RICHTLIJNEN:
• Alle aanbevelingen moeten gebaseerd zijn op ECHTE, bestaande locaties
• Geen fictieve restaurants, hotels of attracties verzinnen
• Altijd verwijzen naar de geüploade documenten en websites waar mogelijk
• Bij onzekerheid: "Ik raad aan dit te verifiëren met je reisagent"
• Geef praktische informatie: openingstijden, prijzen, reserveringen
• Houd rekening met het seizoen en weer tijdens de reis`}
                  />
                </div>

                <div>
                  <Label htmlFor="emergency-info">Noodcontact Informatie</Label>
                  <Input
                    id="emergency-info"
                    placeholder="Reisagent contactgegevens voor noodgevallen"
                    defaultValue="Voor noodgevallen: bel je reisagent op +31 20 123 4567"
                  />
                </div>

                <div>
                  <Label htmlFor="special-instructions">Speciale Instructies</Label>
                  <Textarea
                    id="special-instructions"
                    placeholder="Andere specifieke instructies voor deze reis..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Intake Setup */}
          <TabsContent value="intake">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Intake Formulier Setup</span>
                </CardTitle>
                <CardDescription>Configureer welke informatie van de reiziger verzameld moet worden</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Basis Informatie</h3>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Namen van alle reizigers</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Leeftijden (vooral kinderen)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Relatie tussen reizigers</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Interesses & Voorkeuren</h3>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Hobby's en interesses</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Eetvoorkeuren & allergieën</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Activiteitenniveau (rustig/actief)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Praktische Zaken</h3>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Mobiliteitsbeperkingen</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Eerdere reiservaringen</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span>Budget indicatie</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Speciale Wensen</h3>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span>Bijzondere gelegenheden</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span>Fotografie interesses</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span>Lokale cultuur interesse</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="intake-instructions">Instructies voor Reizigers</Label>
                  <Textarea
                    id="intake-instructions"
                    rows={3}
                    defaultValue="Vul dit formulier zo compleet mogelijk in. Hoe meer we weten over je voorkeuren, hoe beter je persoonlijke reisbuddy je kan helpen tijdens je reis naar Toscane!"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Deploy Reisbuddy */}
          <TabsContent value="deploy">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>AI Reisbuddy Activeren</span>
                  </CardTitle>
                  <CardDescription>Genereer de unieke reisbuddy link voor je klanten</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="client-name">Klant Naam (voor URL)</Label>
                    <Input
                      id="client-name"
                      placeholder="jan-marie-toscane-2024"
                      defaultValue="jan-marie-toscane-2024"
                    />
                  </div>

                  <div>
                    <Label htmlFor="trip-title">Reis Titel</Label>
                    <Input
                      id="trip-title"
                      placeholder="Romantische Roadtrip door Toscane"
                      defaultValue="Romantische Roadtrip door Toscane"
                    />
                  </div>

                  <Button className="w-full" size="lg">
                    🤖 AI Reisbuddy Activeren
                  </Button>

                  {reisbuddyUrl && (
                    <Alert>
                      <AlertDescription>✅ AI Reisbuddy succesvol geactiveerd!</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {reisbuddyUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle>Jouw AI Reisbuddy is Klaar! 🎉</CardTitle>
                    <CardDescription>Deel deze link met je klanten</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-mono break-all">{reisbuddyUrl}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Kopieer Link
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Test Reisbuddy
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Link is direct actief en klaar voor gebruik</p>
                      <p>• Werkt op alle apparaten (mobiel, tablet, desktop)</p>
                      <p>• Reizigers vullen eerst intake formulier in</p>
                      <p>• Alle gesprekken worden opgeslagen</p>
                      {headerVideo && <p>• Header video wordt automatisch getoond</p>}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Step 5: API Test & Debug */}
          <TabsContent value="api-test">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">🔗 Travel Compositor API Test</h2>
                <p className="text-gray-600">Test de verbinding met Travel Compositor en bekijk booking data</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>API Verbinding Testen</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => window.open("/test-travel-compositor", "_blank")}
                      className="w-full"
                      variant="outline"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Volledige API Test Pagina
                    </Button>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Test alle API endpoints</p>
                      <p>• Bekijk alle bookings</p>
                      <p>• Zoek specifieke bookings</p>
                      <p>• Debug API responses</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>📊 API Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Travel Compositor API</span>
                        <Badge variant="default" className="bg-green-600">
                          ✅ Actief
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">Bookings Endpoint</span>
                        <Badge variant="default" className="bg-blue-600">
                          📋 100+ Bookings
                        </Badge>
                      </div>

                      <div className="text-xs text-gray-500 mt-4">
                        <p>Laatste test: Succesvol</p>
                        <p>Configuratie: rondreis-planner</p>
                        <p>Endpoints gevonden: 11/18</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertDescription>
                  💡 <strong>Tip:</strong> Gebruik booking IDs zoals RRP-3832, RRP-3833, RRP-3835 voor het testen van
                  individuele bookings.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
