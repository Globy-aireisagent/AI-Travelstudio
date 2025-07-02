"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, MapPin, CheckCircle, AlertCircle } from "lucide-react"

const MICROSITES = [
  { id: "1", name: "Rondreis Planner", config: "1" },
  { id: "2", name: "Reisbureau Nederland", config: "2" },
  { id: "3", name: "Travel Expert", config: "3" },
  { id: "4", name: "Premium Travel", config: "4" },
]

export default function ImportV2Page() {
  const [bookingId, setBookingId] = useState("")
  const [selectedMicrosite, setSelectedMicrosite] = useState("1")
  const [contentType, setContentType] = useState<"booking" | "idea">("idea") // Default to idea
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleImport = async () => {
    if (!bookingId.trim()) {
      setError("Voer een ID in")
      return
    }

    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      console.log(`🚨 NEW PAGE - Content Type: ${contentType}`)
      console.log(`🚨 NEW PAGE - ID: ${bookingId}`)

      if (contentType === "idea") {
        console.log(`🎯 CALLING IDEA API`)

        const response = await fetch("/api/travel-compositor/idea-lightning-fast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: bookingId.trim(),
            micrositeConfig: selectedMicrosite,
          }),
        })

        const data = await response.json()
        console.log(`✅ IDEA Response:`, data)

        if (data.success) {
          setResult({ success: true, data: data.data })
        } else {
          setError(data.error || "Travel Idea niet gevonden")
        }
      } else {
        console.log(`🎯 CALLING BOOKING API`)
        // Booking logic here
        setError("Booking import nog niet geïmplementeerd in v2")
      }
    } catch (e: any) {
      console.error(`❌ Error:`, e)
      setError(e.message || "Er is een fout opgetreden")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 Import V2 (NIEUW)</h1>
          <p className="text-gray-600">Test versie zonder cache problemen</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Travel Compositor Import V2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Type */}
            <div className="space-y-3">
              <Label>Content Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    contentType === "booking" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setContentType("booking")}
                >
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium">Booking</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all ${
                    contentType === "idea" ? "ring-2 ring-orange-500 bg-orange-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setContentType("idea")}
                >
                  <CardContent className="p-4 text-center">
                    <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="font-medium">Travel Idea</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{contentType === "booking" ? "Booking ID" : "Idea ID"}</Label>
                <Input
                  placeholder={contentType === "booking" ? "RRP-9263" : "24270384"}
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Microsite</Label>
                <Select value={selectedMicrosite} onValueChange={setSelectedMicrosite}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MICROSITES.map((microsite) => (
                      <SelectItem key={microsite.id} value={microsite.config}>
                        {microsite.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleImport} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importeren...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  {contentType === "booking" ? "Booking" : "Idea"} Importeren
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <AlertCircle className="w-5 h-5 text-red-600 inline mr-2" />
              <span className="text-red-800">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {result && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <CheckCircle className="w-5 h-5 text-green-600 inline mr-2" />
              <span className="text-green-800">Success! Data geladen.</span>
              <pre className="mt-4 text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
