"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Database, Globe, FileText, PlusCircle, MapPin, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const MICROSITE_CONFIGS = [
  { id: "1", name: "Microsite 1", description: "Travel Compositor Config 1" },
  { id: "2", name: "Microsite 2", description: "Travel Compositor Config 2" },
  { id: "3", name: "Microsite 3", description: "Travel Compositor Config 3" },
  { id: "4", name: "Microsite 4", description: "Travel Compositor Config 4" },
]

export default function ReisImporterenPage() {
  const [selectedImportType, setSelectedImportType] = useState("travel-compositor")
  const [contentType, setContentType] = useState("booking")
  const [bookingId, setBookingId] = useState("")
  const [selectedConfig, setSelectedConfig] = useState("4")
  const [bookingData, setBookingData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleImport = async () => {
    if (selectedImportType !== "travel-compositor") {
      setError("Alleen Travel Compositor import is momenteel beschikbaar")
      return
    }

    setIsLoading(true)
    setError("")
    setBookingData(null)

    try {
      const trimmedBookingId = bookingId.trim()
      console.log(`🔍 Searching for booking: "${trimmedBookingId}" on config ${selectedConfig}`)

      if (!trimmedBookingId) {
        setError("Voer een booking ID in")
        return
      }

      // Optimized API call - starts from highest numbers first
      const url = `/api/travel-compositor/booking-super-fast?bookingId=${encodeURIComponent(trimmedBookingId)}&config=${selectedConfig}&optimized=true`
      console.log(`🔍 Calling optimized API: ${url}`)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`📊 API Response:`, data)

      if (data.success && data.booking) {
        setBookingData(data.booking)
        console.log(`✅ Found booking: ${data.booking.bookingReference || data.booking.id}`)
      } else {
        setError(data.error || "Booking niet gevonden")
      }
    } catch (e: any) {
      console.error("❌ Booking search error:", e)
      setError(e.message || "Er is een onverwachte fout opgetreden")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRoadbook = () => {
    if (bookingData) {
      const bookingRef = bookingData.bookingReference || bookingData.id
      router.push(`/roadbook/universal/${bookingRef}`)
    }
  }

  const importOptions = [
    {
      id: "travel-compositor",
      title: "Travel Compositor",
      description: "Booking ID of RRP nummer",
      icon: Database,
      badge: "Aanbevolen",
      badgeColor: "bg-blue-600",
    },
    {
      id: "url-import",
      title: "URL Import",
      description: "Importeer van website",
      icon: Globe,
      badge: "Betrouwbaar",
      badgeColor: "bg-green-600",
    },
    {
      id: "pdf-document",
      title: "PDF Document",
      description: "Upload reisdocument",
      icon: FileText,
      badge: "Experimenteel",
      badgeColor: "bg-orange-600",
    },
    {
      id: "manual-input",
      title: "Handmatige Invoer",
      description: "Typ reisgegevens in",
      icon: PlusCircle,
      badge: null,
      badgeColor: null,
    },
  ]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧳 Reis Importeren</h1>
        <p className="text-muted-foreground">Import Bron</p>
      </div>

      {/* Import Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {importOptions.map((option) => {
          const Icon = option.icon
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedImportType === option.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setSelectedImportType(option.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <Icon className="h-8 w-8 text-blue-600" />
                    {option.badge && (
                      <Badge className={`absolute -top-2 -right-2 text-xs ${option.badgeColor} text-white`}>
                        {option.badge}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Travel Compositor Import Form */}
      {selectedImportType === "travel-compositor" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Travel Compositor Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Type Selection */}
            <div className="space-y-3">
              <Label>Content Type</Label>
              <div className="flex gap-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    contentType === "booking" ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => setContentType("booking")}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Booking</p>
                      <p className="text-sm text-muted-foreground">Bevestigde reisboeking</p>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all ${
                    contentType === "travel-idea" ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => setContentType("travel-idea")}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Travel Idea</p>
                      <p className="text-sm text-muted-foreground">Reisidee of offerte</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingId">Booking ID</Label>
                <Input
                  id="bookingId"
                  placeholder="RRP-9400"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleImport()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="microsite">Microsite</Label>
                <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer microsite" />
                  </SelectTrigger>
                  <SelectContent>
                    {MICROSITE_CONFIGS.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        Microsite {config.id}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={isLoading || !bookingId.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isLoading ? "Reis Importeren..." : "Reis Importeren"}
            </Button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Fout:</p>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Success Display */}
            {bookingData && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">✅ Booking Succesvol Geïmporteerd</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <p>
                        <strong>Referentie:</strong> {bookingData.bookingReference || bookingData.id}
                      </p>
                      <p>
                        <strong>Status:</strong> {bookingData.status}
                      </p>
                      <p>
                        <strong>Klant:</strong> {bookingData.contactPerson?.name} {bookingData.contactPerson?.lastName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <strong>Reisperiode:</strong> {bookingData.startDate} - {bookingData.endDate}
                      </p>
                      <p>
                        <strong>Bestemmingen:</strong> {bookingData.destinationCount}
                      </p>
                      <p>
                        <strong>Totaalprijs:</strong> €
                        {bookingData.pricebreakdown?.totalPrice?.microsite?.amount || "0"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleViewRoadbook} className="flex-1">
                      📖 Bekijk Roadbook
                    </Button>
                    <Button variant="outline" className="flex-1">
                      ✏️ Bewerk Reis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Other Import Types Placeholder */}
      {selectedImportType !== "travel-compositor" && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {importOptions.find((opt) => opt.id === selectedImportType)?.title} import komt binnenkort beschikbaar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
