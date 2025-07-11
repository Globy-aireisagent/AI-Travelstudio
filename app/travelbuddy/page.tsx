"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Home,
  Bot,
  Upload,
  FileText,
  Brain,
  ArrowRight,
  CheckCircle,
  Circle,
  LinkIcon,
  Sparkles,
  Users,
  MapPin,
  Loader2,
  X,
  Plus,
  Globe,
} from "lucide-react"

export default function TravelBuddyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfData, setPdfData] = useState<any>(null)
  const [urls, setUrls] = useState<string[]>([""])
  const [websiteData, setWebsiteData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [progress, setProgress] = useState(0)

  const [intakeData, setIntakeData] = useState({
    clientName: "",
    destination: "",
    travelers: "",
    duration: "",
    interests: "",
    budget: "",
    specialRequests: "",
  })
  const [gptInstructions, setGptInstructions] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")

  const steps = [
    {
      id: 1,
      title: "Documenten & URLs",
      description: "Upload reisdocument en voeg relevante URLs toe",
      icon: <Upload className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      title: "Intake Formulier",
      description: "Vul klantgegevens en reiswensen in",
      icon: <FileText className="h-6 w-6" />,
      color: "from-green-500 to-green-600",
    },
    {
      id: 3,
      title: "GPT Configuratie",
      description: "Stel AI instructies en gedrag in",
      icon: <Brain className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: 4,
      title: "Link Genereren",
      description: "Maak een unieke TravelBuddy link",
      icon: <LinkIcon className="h-6 w-6" />,
      color: "from-orange-500 to-orange-600",
    },
  ]

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setPdfData(null) // Reset previous data
    } else {
      alert("Upload een geldig PDF-bestand.")
    }
  }

  const extractTextFromPdf = async (file: File): Promise<any> => {
    const arrayBuffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    const response = await fetch("/api/extract-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileBase64: base64 }),
    })

    if (!response.ok) {
      throw new Error("Failed to extract PDF content")
    }

    const data = await response.json()
    return data
  }

  const scrapeWebsiteData = async (url: string): Promise<any> => {
    const response = await fetch("/api/scrape-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error(`Failed to scrape ${url}`)
    }

    const data = await response.json()
    return data
  }

  const handleNextStep = async () => {
    if (!pdfFile) {
      alert("Upload eerst een PDF-bestand.")
      return
    }

    setLoading(true)
    setProgress(0)

    try {
      // Step 1: Extract PDF content
      setProcessingStep("PDF-bestand analyseren...")
      setProgress(20)
      const extractedPdfData = await extractTextFromPdf(pdfFile)
      setPdfData(extractedPdfData)

      // Step 2: Scrape website data
      const validUrls = urls.filter((url) => url.trim())
      const scrapedData: any[] = []

      for (let i = 0; i < validUrls.length; i++) {
        setProcessingStep(`Website ${i + 1} van ${validUrls.length} analyseren...`)
        setProgress(20 + (60 / validUrls.length) * (i + 1))

        try {
          const websiteData = await scrapeWebsiteData(validUrls[i])
          scrapedData.push({
            url: validUrls[i],
            data: websiteData.success ? websiteData.data : null,
            error: websiteData.success ? null : websiteData.error,
          })
        } catch (error) {
          console.error(`Failed to scrape ${validUrls[i]}:`, error)
          scrapedData.push({
            url: validUrls[i],
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      setWebsiteData(scrapedData)

      // Step 3: Pre-fill intake data from extracted information
      setProcessingStep("Intake gegevens voorbereiden...")
      setProgress(90)

      if (extractedPdfData.keyDetails) {
        setIntakeData((prev) => ({
          ...prev,
          destination: extractedPdfData.keyDetails.destination || prev.destination,
          clientName: prev.clientName, // Keep user input
        }))
      }

      setProgress(100)
      setProcessingStep("Voltooid!")

      // Move to next step
      setTimeout(() => {
        setCurrentStep(2)
        setLoading(false)
        setProcessingStep("")
        setProgress(0)
      }, 500)
    } catch (error) {
      console.error("Processing error:", error)
      alert("Er ging iets mis met het verwerken van de data. Probeer het opnieuw.")
      setLoading(false)
      setProcessingStep("")
      setProgress(0)
    }
  }

  const addUrl = () => {
    setUrls((prev) => [...prev, ""])
  }

  const updateUrl = (index: number, value: string) => {
    setUrls((prev) => prev.map((url, i) => (i === index ? value : url)))
  }

  const removeUrl = (index: number) => {
    if (urls.length > 1) {
      setUrls((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const generateTravelBuddyLink = () => {
    const linkId = Math.random().toString(36).substring(2, 15)
    const link = `${window.location.origin}/travelbuddy/${linkId}`
    setGeneratedLink(link)

    // Save comprehensive configuration
    const config = {
      pdfData,
      websiteData,
      urls: urls.filter((url) => url.trim()),
      intake: intakeData,
      gptInstructions,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(`travelbuddy-${linkId}`, JSON.stringify(config))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  TravelBuddy Generator
                </h1>
                <p className="text-sm text-gray-600">Maak een persoonlijke reis-assistent voor je klanten</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                <Brain className="w-4 h-4 mr-1" />
                AI Powered
              </Badge>
              <Link href="/agent-dashboard">
                <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 px-6 py-3">
                  <Home className="w-4 h-4 mr-2" />
                  Agent HQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-300 ${
                    currentStep === step.id
                      ? `bg-gradient-to-r ${step.color} text-white shadow-lg scale-105`
                      : currentStep > step.id
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : currentStep === step.id ? (
                    step.icon
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                  <div>
                    <div className="font-semibold text-sm">{step.title}</div>
                    <div className="text-xs opacity-80">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && <ArrowRight className="h-5 w-5 text-gray-400 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-3xl p-6">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Upload className="h-6 w-6 mr-3" />
                  Reisdocument & Websites Uploaden
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Upload het reisdocument (PDF) en voeg relevante websites toe voor complete informatie
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* PDF Upload */}
                <div>
                  <Label className="text-lg font-semibold text-gray-700 mb-4 block">Reisdocument (PDF) *</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("pdf-upload")?.click()}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">
                      {pdfFile ? `Geselecteerd: ${pdfFile.name}` : "Klik om PDF te uploaden"}
                    </p>
                    <p className="text-sm text-gray-500">PDF-bestand (max 10MB)</p>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handlePdfUpload}
                    />
                  </div>

                  {pdfFile && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">{pdfFile.name}</p>
                            <p className="text-xs text-blue-600">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPdfFile(null)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {pdfData && (
                    <div className="mt-4 p-4 bg-green-50 rounded-xl">
                      <h4 className="font-semibold text-green-800 mb-2">✅ PDF Succesvol Geanalyseerd</h4>
                      <p className="text-sm text-green-700 mb-2">{pdfData.summary}</p>
                      {pdfData.keyDetails?.destination && (
                        <p className="text-xs text-green-600">
                          📍 Bestemming gevonden: {pdfData.keyDetails.destination}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* URL Input */}
                <div>
                  <Label className="text-lg font-semibold text-gray-700 mb-4 block">
                    Relevante Websites (optioneel)
                  </Label>
                  <div className="space-y-3">
                    {urls.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="url"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => updateUrl(index, e.target.value)}
                            className="pl-10 rounded-xl"
                          />
                        </div>
                        {urls.length > 1 && (
                          <Button variant="outline" size="sm" onClick={() => removeUrl(index)} className="rounded-xl">
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addUrl}
                      className="w-full rounded-xl border-dashed bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nog een URL toevoegen
                    </Button>
                  </div>

                  {websiteData.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Website analyse resultaten:</Label>
                      {websiteData.map((site, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-xl ${
                            site.data ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate flex-1 mr-2">{site.url}</p>
                            {site.data ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                ✅ Succesvol
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-red-100 text-red-800">
                                ❌ Fout
                              </Badge>
                            )}
                          </div>
                          {site.data && (
                            <p className="text-xs text-green-600 mt-1">
                              {site.data.accommodations?.length || 0} accommodaties, {site.data.activities?.length || 0}{" "}
                              activiteiten gevonden
                            </p>
                          )}
                          {site.error && <p className="text-xs text-red-600 mt-1">{site.error}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Processing Status */}
                {loading && (
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-3" />
                      <span className="text-blue-800 font-medium">{processingStep}</span>
                    </div>
                    <Progress value={progress} className="mb-2" />
                    <p className="text-xs text-blue-600">{progress}% voltooid</p>
                  </div>
                )}

                <Button
                  onClick={handleNextStep}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  disabled={!pdfFile || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Verwerken...
                    </>
                  ) : (
                    <>
                      Volgende Stap: Intake Formulier
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl p-6">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Users className="h-6 w-6 mr-3" />
                  Klant Intake Formulier
                </CardTitle>
                <CardDescription className="text-green-100">
                  Vul de klantgegevens en reiswensen in (sommige velden zijn mogelijk al ingevuld uit het PDF)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {pdfData && (
                  <div className="bg-blue-50 p-4 rounded-xl mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">📄 Informatie uit PDF:</h4>
                    <p className="text-sm text-blue-700">{pdfData.summary}</p>
                    {pdfData.keyDetails?.destination && (
                      <p className="text-xs text-blue-600 mt-1">Bestemming: {pdfData.keyDetails.destination}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Naam van de klant *</Label>
                    <Input
                      value={intakeData.clientName}
                      onChange={(e) => setIntakeData((prev) => ({ ...prev, clientName: e.target.value }))}
                      placeholder="Bijv. Familie Jansen"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Bestemming *</Label>
                    <Input
                      value={intakeData.destination}
                      onChange={(e) => setIntakeData((prev) => ({ ...prev, destination: e.target.value }))}
                      placeholder="Bijv. Londen, Engeland"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Wie gaan er mee?</Label>
                    <Input
                      value={intakeData.travelers}
                      onChange={(e) => setIntakeData((prev) => ({ ...prev, travelers: e.target.value }))}
                      placeholder="Bijv. 2 volwassenen, 2 kinderen (8 en 12 jaar)"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Reisduur</Label>
                    <Input
                      value={intakeData.duration}
                      onChange={(e) => setIntakeData((prev) => ({ ...prev, duration: e.target.value }))}
                      placeholder="Bijv. 5 dagen, 4 nachten"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Interesses en voorkeuren</Label>
                  <Textarea
                    value={intakeData.interests}
                    onChange={(e) => setIntakeData((prev) => ({ ...prev, interests: e.target.value }))}
                    placeholder="Bijv. Musea, lokaal eten, wandelen, geschiedenis, kindvriendelijke activiteiten..."
                    className="mt-2 rounded-xl"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Budget indicatie</Label>
                  <Input
                    value={intakeData.budget}
                    onChange={(e) => setIntakeData((prev) => ({ ...prev, budget: e.target.value }))}
                    placeholder="Bijv. €150 per dag voor activiteiten en eten"
                    className="mt-2 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Speciale wensen of beperkingen</Label>
                  <Textarea
                    value={intakeData.specialRequests}
                    onChange={(e) => setIntakeData((prev) => ({ ...prev, specialRequests: e.target.value }))}
                    placeholder="Bijv. Vegetarisch eten, rolstoel toegankelijk, allergieën..."
                    className="mt-2 rounded-xl"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1 rounded-2xl py-3">
                    Vorige Stap
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    disabled={!intakeData.clientName || !intakeData.destination}
                  >
                    Volgende Stap: GPT Configuratie
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-3xl p-6">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Brain className="h-6 w-6 mr-3" />
                  AI Instructies & Gedrag
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Configureer hoe de TravelBuddy zich moet gedragen en welke instructies hij moet volgen
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label className="text-lg font-semibold text-gray-700 mb-4 block">GPT Instructies</Label>
                  <Textarea
                    value={gptInstructions}
                    onChange={(e) => setGptInstructions(e.target.value)}
                    placeholder={`Je bent een persoonlijke TravelBuddy voor ${intakeData.clientName || "de klant"} tijdens hun reis naar ${intakeData.destination || "hun bestemming"}. 

Je hebt toegang tot alle reisdocumenten en kent de volgende details:
- Reizigers: ${intakeData.travelers || "Nog niet ingevuld"}
- Duur: ${intakeData.duration || "Nog niet ingevuld"}
- Interesses: ${intakeData.interests || "Nog niet ingevuld"}
- Budget: ${intakeData.budget || "Nog niet ingevuld"}
- Speciale wensen: ${intakeData.specialRequests || "Geen"}

${pdfData ? `\nUit het reisdocument weet je:\n${pdfData.summary}` : ""}

${
  websiteData.length > 0
    ? `\nExtra informatie van websites:\n${websiteData
        .filter((site) => site.data)
        .map((site) => `- ${site.url}: ${site.data.title || "Relevante reisinformatie"}`)
        .join("\n")}`
    : ""
}

Gedrag:
- Wees vriendelijk, behulpzaam en enthousiast
- Geef praktische, actionable adviezen
- Houd rekening met het budget en de voorkeuren
- Suggereer alternatieven als iets niet mogelijk is
- Vraag door als je meer informatie nodig hebt
- Gebruik emoji's om je berichten levendiger te maken

Je kunt helpen met:
- Restaurant aanbevelingen
- Activiteiten en bezienswaardigheden
- Transport en routes
- Praktische tips en lokale gewoonten
- Noodgevallen en belangrijke contacten
- Weer en wat aan te trekken
- Budgetbeheer tijdens de reis`}
                    className="rounded-xl"
                    rows={20}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Tips voor goede instructies:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Wees specifiek over de rol en het gedrag</li>
                    <li>• Vermeld alle belangrijke klantgegevens</li>
                    <li>• Geef duidelijke richtlijnen over wat wel/niet te doen</li>
                    <li>• Voeg voorbeelden toe van gewenste antwoorden</li>
                    <li>• De AI heeft automatisch toegang tot PDF en website data</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1 rounded-2xl py-3">
                    Vorige Stap
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    disabled={!gptInstructions.trim()}
                  >
                    Volgende Stap: Link Genereren
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-3xl p-6">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Sparkles className="h-6 w-6 mr-3" />
                  TravelBuddy Link Genereren
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Genereer een unieke link die je klant kan gebruiken tijdens hun reis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {!generatedLink ? (
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <Sparkles className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Klaar om je TravelBuddy te maken!</h3>
                    <p className="text-gray-600 mb-6">
                      Alle informatie is ingevuld en verwerkt. Klik op de knop hieronder om een unieke TravelBuddy link
                      te genereren.
                    </p>

                    <div className="bg-gray-50 p-4 rounded-xl mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Samenvatting:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Klant:</strong> {intakeData.clientName}
                        </p>
                        <p>
                          <strong>Bestemming:</strong> {intakeData.destination}
                        </p>
                        <p>
                          <strong>PDF Document:</strong> {pdfFile?.name}
                        </p>
                        <p>
                          <strong>Websites:</strong> {websiteData.filter((site) => site.data).length} succesvol
                          geanalyseerd
                        </p>
                        <p>
                          <strong>GPT Instructies:</strong> {gptInstructions.length} karakters
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={generateTravelBuddyLink}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105"
                    >
                      <Sparkles className="h-6 w-6 mr-3" />
                      Genereer TravelBuddy Link
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <CheckCircle className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-green-800">🎉 TravelBuddy Succesvol Aangemaakt!</h3>

                    <div className="bg-green-50 p-6 rounded-2xl mb-6">
                      <Label className="text-sm font-semibold text-green-800 mb-2 block">Jouw TravelBuddy Link:</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={generatedLink}
                          readOnly
                          className="flex-1 bg-white border-green-200 text-green-800 font-mono text-sm"
                        />
                        <Button
                          onClick={() => copyToClipboard(generatedLink)}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                        >
                          Kopieer
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl mb-6">
                      <h4 className="font-semibold text-blue-800 mb-2">📱 Hoe te gebruiken:</h4>
                      <ul className="text-sm text-blue-700 space-y-1 text-left">
                        <li>• Stuur deze link naar je klant via email of WhatsApp</li>
                        <li>• De klant kan de link openen op hun telefoon tijdens de reis</li>
                        <li>• De TravelBuddy heeft toegang tot alle PDF en website informatie</li>
                        <li>• De AI kan realtime vragen beantwoorden en adviezen geven</li>
                        <li>• Alle voorkeuren en speciale wensen zijn al geconfigureerd</li>
                      </ul>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentStep(1)
                          setGeneratedLink("")
                          setPdfFile(null)
                          setPdfData(null)
                          setUrls([""])
                          setWebsiteData([])
                          setIntakeData({
                            clientName: "",
                            destination: "",
                            travelers: "",
                            duration: "",
                            interests: "",
                            budget: "",
                            specialRequests: "",
                          })
                          setGptInstructions("")
                        }}
                        className="flex-1 rounded-2xl py-3"
                      >
                        Nieuwe TravelBuddy Maken
                      </Button>
                      <Button
                        onClick={() => window.open(generatedLink, "_blank")}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <MapPin className="h-5 w-5 mr-2" />
                        Test TravelBuddy
                      </Button>
                    </div>
                  </div>
                )}

                {!generatedLink && (
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1 rounded-2xl py-3">
                      Vorige Stap
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
