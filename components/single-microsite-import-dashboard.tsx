"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Building2, Download, RefreshCw, CheckCircle, AlertCircle, Database } from "lucide-react"

interface ImportedAgency {
  id: string
  name: string
  micrositeId: string
  usersCount: number
  creditBalance: number
  users: any[]
}

interface ImportData {
  totalAgencies: number
  totalUsers: number
  totalBookings: number
  totalIdeas: number
  agencies: ImportedAgency[]
}

export default function SingleMicrositeImportDashboard() {
  const [importData, setImportData] = useState<ImportData | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const startImport = async () => {
    setIsImporting(true)
    setImportStatus("idle")
    setProgress(0)
    setErrorMessage("")

    // Simuleer progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90))
    }, 500)

    try {
      const response = await fetch("/api/single-microsite-import", {
        method: "POST",
      })

      clearInterval(progressInterval)
      setProgress(100)

      const result = await response.json()

      if (response.ok && result.success) {
        setImportData(result.data)
        setImportStatus("success")
        console.log("✅ Import successful:", result)
      } else {
        setImportStatus("error")
        setErrorMessage(result.error || "Unknown error")
        console.error("❌ Import failed:", result)

        // Toon debug info
        if (result.debug) {
          console.log("🔍 Debug info:", result.debug)
        }
      }
    } catch (error) {
      clearInterval(progressInterval)
      setImportStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Network error")
      console.error("❌ Import error:", error)
    } finally {
      setIsImporting(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Single Microsite Import (Test)</h1>
          <p className="text-xl text-gray-600">Test import van alleen microsite 1 - agencies only</p>
        </div>

        {/* Import Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Test Import - Microsite 1
            </CardTitle>
            <CardDescription>
              Importeer alleen agencies van microsite 1 om de authenticatie en API te testen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={startImport} disabled={isImporting} size="lg" className="flex items-center gap-2">
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Test Import
                  </>
                )}
              </Button>

              {importStatus === "success" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Import successful!
                </div>
              )}

              {importStatus === "error" && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Import failed: {errorMessage}
                </div>
              )}
            </div>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Testing authentication and fetching agencies...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-blue-600">Dit is een test om te zien of de authenticatie en API werken...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Results */}
        {importData && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Agencies</p>
                      <p className="text-3xl font-bold text-gray-900">{importData.totalAgencies}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Users</p>
                      <p className="text-3xl font-bold text-gray-500">Not yet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bookings</p>
                      <p className="text-3xl font-bold text-gray-500">Not yet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ideas</p>
                      <p className="text-3xl font-bold text-gray-500">Not yet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agencies List */}
            <Card>
              <CardHeader>
                <CardTitle>Imported Agencies</CardTitle>
                <CardDescription>Agencies gevonden in microsite 1</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {importData.agencies.map((agency) => (
                      <div key={agency.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{agency.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>ID: {agency.id}</span>
                              <span>Microsite: {agency.micrositeId}</span>
                              <Badge variant="outline">Test Import</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </>
        )}

        {/* Info Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">🧪 Test Import - Wat doen we?</h3>
            <div className="space-y-2 text-blue-800">
              <p>
                🔐 <strong>Test authenticatie</strong> voor microsite 1
              </p>
              <p>
                🏢 <strong>Haal alleen agencies op</strong> - geen users/bookings/ideas
              </p>
              <p>
                📊 <strong>Kijk of de API werkt</strong> en data teruggeeft
              </p>
              <p>
                ✅ <strong>Als dit werkt</strong> kunnen we users en bookings toevoegen
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
