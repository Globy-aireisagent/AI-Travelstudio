"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Zap, Search, FileText, MapPin, Activity, Rocket } from "lucide-react"
import PerformanceMonitor from "@/components/performance-monitor"

export default function DemoDashboard() {
  const [bookingId, setBookingId] = useState("RRP-9263")
  const [ideaId, setIdeaId] = useState("22999719")
  const [bookingResult, setBookingResult] = useState<any>(null)
  const [ideaResult, setIdeaResult] = useState<any>(null)
  const [loading, setLoading] = useState({ booking: false, idea: false })

  const testBookingSpeed = async (useUltraFast = false) => {
    setLoading((prev) => ({ ...prev, booking: true }))
    const startTime = Date.now()

    try {
      const endpoint = useUltraFast
        ? `/api/travel-compositor/booking-ultra-fast?bookingId=${bookingId}`
        : `/api/travel-compositor/booking-lightning-fast?bookingId=${bookingId}`

      const response = await fetch(endpoint)
      const data = await response.json()
      const endTime = Date.now()

      setBookingResult({
        ...data,
        actualResponseTime: `${endTime - startTime}ms`,
        endpoint: useUltraFast ? "ultra-fast" : "lightning-fast",
      })
    } catch (error) {
      setBookingResult({ success: false, error: error.message })
    }

    setLoading((prev) => ({ ...prev, booking: false }))
  }

  const testIdeaSpeed = async () => {
    setLoading((prev) => ({ ...prev, idea: true }))
    const startTime = Date.now()

    try {
      const response = await fetch("/api/travel-compositor/idea-lightning-fast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ideaId, micrositeConfig: "1" }),
      })
      const data = await response.json()
      const endTime = Date.now()

      setIdeaResult({
        ...data,
        actualResponseTime: `${endTime - startTime}ms`,
      })
    } catch (error) {
      setIdeaResult({ success: false, error: error.message })
    }

    setLoading((prev) => ({ ...prev, idea: false }))
  }

  const openRoadbook = () => {
    if (bookingResult?.success) {
      window.open(`/roadbook/${bookingId}`, "_blank")
    }
  }

  const openOfferte = () => {
    if (ideaResult?.success) {
      window.open(`/offerte/${ideaId}`, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 Travel Assistant Demo</h1>
          <p className="text-xl text-gray-600">Lightning Fast Data & Beautiful Templates</p>
        </header>

        <Tabs defaultValue="speed-test" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="speed-test">⚡ Speed Tests</TabsTrigger>
            <TabsTrigger value="performance">📊 Performance</TabsTrigger>
            <TabsTrigger value="templates">🎨 Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="speed-test" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Booking Speed Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Booking Speed Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="RRP-9263" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
                    <Button
                      onClick={() => testBookingSpeed(false)}
                      disabled={loading.booking}
                      className="whitespace-nowrap"
                    >
                      {loading.booking ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Test
                    </Button>
                  </div>

                  <Button
                    onClick={() => testBookingSpeed(true)}
                    disabled={loading.booking}
                    variant="outline"
                    className="w-full"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Ultra Fast Test
                  </Button>

                  {bookingResult && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={bookingResult.success ? "default" : "destructive"}>
                          {bookingResult.success ? "✅ SUCCESS" : "❌ FAILED"}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {bookingResult.actualResponseTime}
                        </Badge>
                        <Badge variant="outline">{bookingResult.performance || "UNKNOWN"}</Badge>
                        {bookingResult.endpoint && <Badge variant="secondary">{bookingResult.endpoint}</Badge>}
                      </div>

                      {bookingResult.success && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Method: {bookingResult.method}
                            {bookingResult.winningConfig && ` (Config ${bookingResult.winningConfig})`}
                            {bookingResult.winningConfigTime && ` in ${bookingResult.winningConfigTime}`}
                          </p>
                          <Button onClick={openRoadbook} className="w-full">
                            <FileText className="w-4 h-4 mr-2" />
                            Open Roadbook
                          </Button>
                        </div>
                      )}

                      {!bookingResult.success && <p className="text-sm text-red-600">{bookingResult.error}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Idea Speed Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-green-500" />
                    Idea Speed Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="22999719" value={ideaId} onChange={(e) => setIdeaId(e.target.value)} />
                    <Button onClick={testIdeaSpeed} disabled={loading.idea} className="whitespace-nowrap">
                      {loading.idea ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Test
                    </Button>
                  </div>

                  {ideaResult && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={ideaResult.success ? "default" : "destructive"}>
                          {ideaResult.success ? "✅ SUCCESS" : "❌ FAILED"}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {ideaResult.actualResponseTime}
                        </Badge>
                        <Badge variant="outline">{ideaResult.performance || "UNKNOWN"}</Badge>
                      </div>

                      {ideaResult.success && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Method: {ideaResult.method}
                            {ideaResult.winningConfig && ` (Config ${ideaResult.winningConfig})`}
                          </p>
                          <Button onClick={openOfferte} className="w-full">
                            <FileText className="w-4 h-4 mr-2" />
                            Open Offerte
                          </Button>
                        </div>
                      )}

                      {!ideaResult.success && <p className="text-sm text-red-600">{ideaResult.error}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Demo Templates & Dashboards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Button variant="outline" onClick={() => window.open("/roadbook/RRP-9263", "_blank")}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Sample Roadbook
                  </Button>
                  <Button variant="outline" onClick={() => window.open("/offerte/22999719", "_blank")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Sample Offerte
                  </Button>
                  <Button variant="outline" onClick={() => window.open("/super-admin", "_blank")}>
                    <Zap className="w-4 h-4 mr-2" />
                    Super Admin
                  </Button>
                  <Button variant="outline" onClick={() => window.open("/master-dashboard", "_blank")}>
                    <Activity className="w-4 h-4 mr-2" />
                    Master Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Template Previews */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>📋 Roadbook Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-blue-700">Interactive Travel Roadbook</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete travel itinerary with hotels, activities, and transport details
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open("/roadbook/RRP-9263", "_blank")}
                  >
                    View Roadbook
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>💰 Offerte Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-green-700">Professional Travel Quote</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Beautiful travel proposal with pricing, itinerary, and booking options
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open("/offerte/22999719", "_blank")}
                  >
                    View Offerte
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
