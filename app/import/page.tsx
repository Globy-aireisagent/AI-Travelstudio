"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Home, Upload, Globe, FileText, Edit, CheckCircle, Loader2, AlertCircle } from "lucide-react"

interface Microsite {
  id: string
  name: string
  code: string
  configNumber: number
  username: string
}

export default function ImportPage() {
  const [selectedImportType, setSelectedImportType] = useState<string>("travel-compositor")
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string>("")
  const [importSuccess, setImportSuccess] = useState<string>("")

  // Form states
  const [bookingId, setBookingId] = useState("")
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [manualData, setManualData] = useState("")
  const [travelCompositorType, setTravelCompositorType] = useState<string>("booking")
  const [selectedMicrosite, setSelectedMicrosite] = useState<string>("auto")

  // Microsites
  const [microsites, setMicrosites] = useState<Microsite[]>([])
  const [loadingMicrosites, setLoadingMicrosites] = useState(true)

  const importTypes = [
    {
      id: "travel-compositor",
      title: "Travel Compositor",
      description: "Booking ID of RRP nummer",
      icon: <CheckCircle className="h-8 w-8" />,
      color: "border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100",
      badge: "Aanbevolen",
      badgeColor: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    },
    {
      id: "url-import",
      title: "URL Import",
      description: "Importeer van website",
      icon: <Globe className="h-8 w-8" />,
      color: "border-green-300 bg-gradient-to-br from-green-50 to-green-100",
      badge: "Betrouwbaar",
      badgeColor: "bg-gradient-to-r from-green-500 to-green-600 text-white",
    },
    {
      id: "pdf-document",
      title: "PDF Document",
      description: "Upload reisdocument",
      icon: <FileText className="h-8 w-8" />,
      color: "border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100",
      badge: "Experimenteel",
      badgeColor: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
    },
    {
      id: "manual-input",
      title: "Handmatige Invoer",
      description: "Typ reisgegevens in",
      icon: <Edit className="h-8 w-8" />,
      color: "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100",
      badge: "Handmatig",
      badgeColor: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
    },
  ]

  // Load microsites on component mount
  useEffect(() => {
    const loadMicrosites = async () => {
      try {
        const response = await fetch("/api/get-microsites")
        const data = await response.json()
        setMicrosites(data.microsites || [])
      } catch (error) {
        console.error("Failed to load microsites:", error)
      } finally {
        setLoadingMicrosites(false)
      }
    }

    loadMicrosites()
  }, [])

  const handleImport = async () => {
    console.log("🚀 handleImport called!", {
      selectedImportType,
      travelCompositorType,
      bookingId,
      selectedMicrosite,
    })

    if (!selectedImportType) {
      console.log("❌ No import type selected")
      return
    }

    setIsImporting(true)
    setImportError("")
    setImportSuccess("")

    try {
      if (selectedImportType === "travel-compositor" && travelCompositorType === "booking") {
        console.log("📋 Starting Travel Compositor booking import...")

        // Prepare the request data
        const requestData = {
          bookingId: bookingId.trim(),
          micrositeId: selectedMicrosite === "auto" ? null : selectedMicrosite,
        }

        console.log("📤 Sending request:", requestData)

        // Import from Travel Compositor using existing API
        const response = await fetch("/api/optimized-import-booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        })

        console.log("📥 Response status:", response.status)

        const data = await response.json()
        console.log("📥 Response data:", data)

        if (!response.ok) {
          throw new Error(data.error || "Import failed")
        }

        // Show success message
        setImportSuccess(`✅ Booking ${bookingId} succesvol geïmporteerd! (${data.searchMethod})`)

        // Debug: Log the booking data before saving
        console.log("🔍 Booking data to save:", data.booking)

        // Save booking data to localStorage for the werkblad
        try {
          const bookingDataString = JSON.stringify(data.booking)
          localStorage.setItem("importedBooking", bookingDataString)
          console.log("💾 Saved to localStorage:", bookingDataString)

          // Verify it was saved
          const savedData = localStorage.getItem("importedBooking")
          console.log("✅ Verified localStorage:", savedData)
        } catch (error) {
          console.error("❌ Failed to save to localStorage:", error)
        }

        // Redirect to werkblad after a short delay
        setTimeout(() => {
          window.location.href = "/werkblad"
        }, 2000)
      } else if (selectedImportType === "travel-compositor" && travelCompositorType === "travel-idea") {
        console.log("💡 Starting Travel Compositor travel idea import...")

        // Prepare the request data
        const requestData = {
          ideaId: bookingId.trim(), // Using same input field for idea ID
          micrositeId: selectedMicrosite === "auto" ? null : selectedMicrosite,
        }

        console.log("📤 Sending travel idea request:", requestData)

        // Import from Travel Compositor using new API
        const response = await fetch("/api/import-travel-idea", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        })

        console.log("📥 Travel idea response status:", response.status)

        const data = await response.json()
        console.log("📥 Travel idea response data:", data)

        if (!response.ok) {
          throw new Error(data.error || "Travel idea import failed")
        }

        // Show success message
        setImportSuccess(`✅ Travel Idea ${bookingId} succesvol geïmporteerd!`)

        // Save travel idea data to localStorage for the travelwerkblad
        try {
          const ideaDataString = JSON.stringify(data.idea)
          localStorage.setItem("importedTravelIdea", ideaDataString)
          console.log("💾 Saved travel idea to localStorage:", ideaDataString)
        } catch (error) {
          console.error("❌ Failed to save travel idea to localStorage:", error)
        }

        // Redirect to travelwerkblad after a short delay
        setTimeout(() => {
          window.location.href = "/travelwerkblad"
        }, 2000)
      } else if (selectedImportType === "manual-input") {
        // For manual input, redirect to intake preview
        window.location.href = "/intake-preview"
      } else {
        // Simulate other import types for now
        await new Promise((resolve) => setTimeout(resolve, 3000))
        // For now, redirect to agent dashboard for other types
        window.location.href = "/agent-dashboard"
      }
    } catch (error) {
      console.error("❌ Import error:", error)
      setImportError(error instanceof Error ? error.message : "Er is een onbekende fout opgetreden")
    } finally {
      setIsImporting(false)
    }
  }

  const canImport = () => {
    const result = (() => {
      switch (selectedImportType) {
        case "travel-compositor":
          return travelCompositorType && bookingId.trim().length > 0
        case "url-import":
          return url.trim().length > 0
        case "pdf-document":
          return file !== null
        case "manual-input":
          return manualData.trim().length > 0
        default:
          return false
      }
    })()

    return result
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Travel Import & Generator
                </h1>
                <p className="text-sm text-gray-600">Importeer reizen uit Travel Compositor</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                <Upload className="h-4 w-4 mr-1" />
                Import Tool
              </Badge>
              <Link href="/agent-dashboard">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 px-6 py-3 transform hover:scale-105">
                  <Home className="w-4 h-4 mr-2" />🏠 Agent HQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Import Type Selection */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Kies Import Methode
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {importTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 ${
                    selectedImportType === type.id
                      ? `${type.color} border-2 shadow-2xl ring-4 ring-blue-200`
                      : "border border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                  }`}
                  onClick={() => setSelectedImportType(type.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4 text-gray-600 transform transition-transform duration-300 hover:scale-110">
                      {type.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{type.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                    <Badge className={`text-xs ${type.badgeColor} shadow-lg`}>{type.badge}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Success Message */}
          {importSuccess && (
            <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-green-100 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="h-5 w-5 mr-2 animate-pulse" />
                  <div>
                    <p className="font-medium">Import Succesvol!</p>
                    <p className="text-sm">{importSuccess}</p>
                    <p className="text-xs mt-1">Je wordt doorgestuurd naar het werkblad...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {importError && (
            <Card className="mb-6 border-red-200 bg-gradient-to-r from-red-50 to-red-100 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2 animate-bounce" />
                  <div>
                    <p className="font-medium">Import Fout</p>
                    <p className="text-sm">{importError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Input Form */}
          {selectedImportType && (
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm transform transition-all duration-300 hover:shadow-3xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 text-white rounded-t-lg bg-size-200 animate-gradient">
                <CardTitle className="text-xl flex items-center">
                  <div className="transform transition-transform duration-300 hover:rotate-12">
                    {importTypes.find((t) => t.id === selectedImportType)?.icon}
                  </div>
                  <span className="ml-3">{importTypes.find((t) => t.id === selectedImportType)?.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {selectedImportType === "travel-compositor" && (
                    <div className="space-y-6">
                      {/* Sub-type selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Kies Travel Compositor Type:
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card
                            className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 ${
                              travelCompositorType === "booking"
                                ? "border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 border-2 shadow-2xl ring-4 ring-blue-200"
                                : "border border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                            }`}
                            onClick={() => setTravelCompositorType("booking")}
                          >
                            <CardContent className="p-4 text-center">
                              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2 transform transition-transform duration-300 hover:scale-110" />
                              <h3 className="font-semibold text-lg mb-1">Booking</h3>
                              <p className="text-sm text-gray-600">Volledige boeking</p>
                              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs mt-2 shadow-lg">
                                Roadbooks & Vouchers
                              </Badge>
                            </CardContent>
                          </Card>

                          <Card
                            className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 ${
                              travelCompositorType === "travel-idea"
                                ? "border-green-300 bg-gradient-to-br from-green-50 to-green-100 border-2 shadow-2xl ring-4 ring-green-200"
                                : "border border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                            }`}
                            onClick={() => setTravelCompositorType("travel-idea")}
                          >
                            <CardContent className="p-4 text-center">
                              <Globe className="h-8 w-8 text-green-600 mx-auto mb-2 transform transition-transform duration-300 hover:scale-110" />
                              <h3 className="font-semibold text-lg mb-1">Travel Idea</h3>
                              <p className="text-sm text-gray-600">Reis inspiratie</p>
                              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs mt-2 shadow-lg">
                                Offertes & Media
                              </Badge>
                            </CardContent>
                          </Card>

                          <Card
                            className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 ${
                              travelCompositorType === "holiday-package"
                                ? "border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 border-2 shadow-2xl ring-4 ring-purple-200"
                                : "border border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                            }`}
                            onClick={() => setTravelCompositorType("holiday-package")}
                          >
                            <CardContent className="p-4 text-center">
                              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2 transform transition-transform duration-300 hover:scale-110" />
                              <h3 className="font-semibold text-lg mb-1">Holiday Package</h3>
                              <p className="text-sm text-gray-600">Vakantie pakket</p>
                              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs mt-2 shadow-lg">
                                Offertes & Media
                              </Badge>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Input fields - side by side */}
                      {travelCompositorType && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Booking ID field */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {travelCompositorType === "booking" && "Booking ID of RRP Nummer:"}
                              {travelCompositorType === "travel-idea" && "Travel Idea ID:"}
                              {travelCompositorType === "holiday-package" && "Holiday Package ID:"}
                            </label>
                            <Input
                              value={bookingId}
                              onChange={(e) => setBookingId(e.target.value)}
                              placeholder={travelCompositorType === "booking" ? "RRP-9488" : "3000936"}
                              className="text-lg py-3 border-2 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                              {travelCompositorType === "booking" &&
                                "Voer je Travel Compositor booking ID of RRP nummer in"}
                              {travelCompositorType === "travel-idea" &&
                                "Voer je Travel Idea ID in voor reis inspiratie"}
                              {travelCompositorType === "holiday-package" && "Voer je Holiday Package ID in"}
                            </p>
                          </div>

                          {/* Microsite selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Zoekstrategie:</label>
                            <select
                              value={selectedMicrosite}
                              onChange={(e) => setSelectedMicrosite(e.target.value)}
                              className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            >
                              <option value="auto">🌍 Automatisch (alle microsites)</option>
                              <option value="1">📍 Rondreis Planner</option>
                              <option value="2">📍 Blauwe versie</option>
                              <option value="3">📍 Travel Time</option>
                              <option value="4">📍 Symphony Travel</option>
                              <option value="5">📍 Travel Time Europa</option>
                            </select>
                            <p className="text-sm text-gray-500 mt-2">
                              <strong>Aanbevolen:</strong> Automatisch zoekt door alle microsites en vindt je booking
                              het snelst
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedImportType === "url-import" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website URL:</label>
                      <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/reis-details"
                        className="text-lg py-3 border-2 focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all duration-300"
                      />
                      <p className="text-sm text-gray-500 mt-2">Voer de URL in van de website met reisinformatie</p>
                    </div>
                  )}

                  {selectedImportType === "pdf-document" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF Document:</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 transform hover:scale-105">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="pdf-upload"
                        />
                        <label htmlFor="pdf-upload" className="cursor-pointer">
                          <FileText className="h-12 w-12 text-orange-400 mx-auto mb-4 transform transition-transform duration-300 hover:scale-110" />
                          <p className="text-lg font-medium text-gray-700">
                            {file ? file.name : "Klik om PDF te uploaden"}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">Ondersteunde formaten: PDF (max 10MB)</p>
                        </label>
                      </div>
                    </div>
                  )}

                  {selectedImportType === "manual-input" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reisgegevens:</label>
                      <Textarea
                        value={manualData}
                        onChange={(e) => setManualData(e.target.value)}
                        placeholder="Voer hier je reisgegevens in: bestemming, data, hotels, activiteiten, etc."
                        rows={8}
                        className="text-lg border-2 focus:border-gray-500 focus:ring-4 focus:ring-gray-200 transition-all duration-300"
                      />
                      <p className="text-sm text-gray-500 mt-2">Typ alle relevante reisinformatie in dit veld</p>
                    </div>
                  )}

                  {/* Import Button */}
                  <Button
                    onClick={() => {
                      console.log("🔥 Button clicked!")
                      handleImport()
                    }}
                    disabled={!canImport() || isImporting}
                    className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 hover:from-blue-600 hover:via-purple-700 hover:to-blue-600 text-white py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 bg-size-200 animate-gradient disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {selectedImportType === "travel-compositor"
                          ? "Importeren uit Travel Compositor..."
                          : "Importeren..."}
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2 transform transition-transform duration-300 group-hover:scale-110" />
                        Importeer Reis
                      </>
                    )}
                  </Button>

                  {/* Help text */}
                  {selectedImportType === "travel-compositor" && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-lg">
                      <h4 className="font-medium text-blue-800 mb-2">💡 Tips voor Travel Compositor import:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Gebruik "Automatisch" voor de beste resultaten</li>
                        <li>• RRP nummers werken met of zonder "RRP-" prefix</li>
                        <li>• Het systeem zoekt automatisch door alle beschikbare microsites</li>
                        <li>• Import duurt meestal 5-15 seconden</li>
                        <li>• Recent booking voorbeeld: RRP-9488</li>
                        <li>• Totaal 9488+ bookings in het systeem</li>
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
