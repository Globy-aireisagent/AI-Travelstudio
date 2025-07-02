"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BookingDataAnalysis {
  structure: any
  availableFields: string[]
  missingFields: string[]
  dataQuality: {
    completeness: number
    hasClientInfo: boolean
    hasTransportDetails: boolean
    hasHotelDetails: boolean
    hasVoucherUrls: boolean
  }
  recommendations: string[]
}

export default function BookingDataExplorer() {
  const [bookingData, setBookingData] = useState("")
  const [analysis, setAnalysis] = useState<BookingDataAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeData = async () => {
    if (!bookingData.trim()) return

    setLoading(true)
    try {
      const parsedData = JSON.parse(bookingData)

      const response = await fetch("/api/analyze-booking-structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingData: parsedData }),
      })

      const result = await response.json()

      if (result.success) {
        setAnalysis(result.analysis)
      } else {
        alert("Analysis failed: " + result.error)
      }
    } catch (error) {
      alert("Invalid JSON or analysis error: " + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Booking Data Structure Explorer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Plak hier je booking JSON data:</label>
            <Textarea
              value={bookingData}
              onChange={(e) => setBookingData(e.target.value)}
              placeholder="Plak hier de volledige JSON response van Travel Compositor..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <Button onClick={analyzeData} disabled={loading || !bookingData.trim()} className="w-full">
            {loading ? "Analyzing..." : "Analyseer Data Structuur"}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid gap-6">
          {/* Data Quality Overview */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Data Quality Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold">{Math.round(analysis.dataQuality.completeness)}%</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${analysis.dataQuality.completeness}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant={analysis.dataQuality.hasClientInfo ? "default" : "destructive"}>
                    {analysis.dataQuality.hasClientInfo ? "✅" : "❌"}
                  </Badge>
                  <span className="text-sm">Client Info</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={analysis.dataQuality.hasTransportDetails ? "default" : "destructive"}>
                    {analysis.dataQuality.hasTransportDetails ? "✅" : "❌"}
                  </Badge>
                  <span className="text-sm">Transport Details</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={analysis.dataQuality.hasHotelDetails ? "default" : "destructive"}>
                    {analysis.dataQuality.hasHotelDetails ? "✅" : "❌"}
                  </Badge>
                  <span className="text-sm">Hotel Details</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={analysis.dataQuality.hasVoucherUrls ? "default" : "destructive"}>
                    {analysis.dataQuality.hasVoucherUrls ? "✅" : "❌"}
                  </Badge>
                  <span className="text-sm">Voucher URLs</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm">
                    {rec}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Fields */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Available Fields ({analysis.availableFields.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                  {analysis.availableFields.map((field, index) => (
                    <div key={index} className="text-sm font-mono p-1 hover:bg-gray-50 rounded">
                      {field}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Missing Fields */}
          {analysis.missingFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>⚠️ Missing Expected Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {analysis.missingFields.map((field, index) => (
                    <div key={index} className="text-sm font-mono p-1 text-red-600">
                      {field}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Structure */}
          <Card>
            <CardHeader>
              <CardTitle>🏗️ Data Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(analysis.structure, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
