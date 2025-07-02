"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Calendar,
  List,
  CreditCard,
  ArrowLeft,
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
} from "lucide-react"

interface HolidayPackageInfo {
  endpoints: Array<{
    name: string
    method: string
    url: string
    description: string
    parameters: Array<{
      name: string
      type: string
      required: boolean
      description: string
    }>
    headers: Array<{
      name: string
      required: boolean
      description: string
    }>
    body?: any
    example: string
  }>
  authentication: {
    method: string
    url: string
    description: string
    body: any
  }
  microsites: Array<{
    id: string
    name: string
    description: string
  }>
}

export default function TestHolidayPackagesPage() {
  const [packageInfo, setPackageInfo] = useState<HolidayPackageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<any>({})
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null)

  // Test parameters
  const [micrositeId, setMicrositeId] = useState("")
  const [packageId, setPackageId] = useState("PKG-001")
  const [language, setLanguage] = useState("nl")
  const [currency, setCurrency] = useState("EUR")

  useEffect(() => {
    loadPackageInfo()
  }, [])

  const loadPackageInfo = async () => {
    try {
      const response = await fetch("/api/travel-compositor/holiday-package-info")
      const data = await response.json()

      if (data.success) {
        setPackageInfo(data.data)
        // Set default microsite
        if (data.data.microsites.length > 0) {
          setMicrositeId(data.data.microsites[0].id)
        }
      }
    } catch (error) {
      console.error("Failed to load package info:", error)
    } finally {
      setLoading(false)
    }
  }

  const testEndpoint = async (endpointName: string) => {
    setTestingEndpoint(endpointName)

    try {
      let testUrl = ""
      let testMethod = "GET"

      switch (endpointName) {
        case "Package Details":
          testUrl = `/api/travel-compositor/packages/${micrositeId}/${packageId}?lang=${language}`
          break
        case "Package Calendar":
          testUrl = `/api/travel-compositor/packages/${micrositeId}/calendar/${packageId}?currency=${currency}`
          break
        case "List All Packages":
          testUrl = `/api/travel-compositor/packages/${micrositeId}?lang=${language}&limit=10`
          break
        case "Book Package":
          testUrl = `/api/travel-compositor/packages/destinations/book`
          testMethod = "POST"
          break
        default:
          throw new Error("Unknown endpoint")
      }

      const response = await fetch(testUrl, {
        method: testMethod,
        headers: testMethod === "POST" ? { "Content-Type": "application/json" } : {},
        body:
          testMethod === "POST"
            ? JSON.stringify({
                micrositeId,
                packageId,
                passengers: [{ name: "Test User", email: "test@example.com" }],
                departureDate: "2024-06-01",
              })
            : undefined,
      })

      const result = await response.json()

      setTestResults((prev) => ({
        ...prev,
        [endpointName]: {
          success: response.ok,
          status: response.status,
          data: result,
          timestamp: new Date().toISOString(),
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [endpointName]: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      }))
    } finally {
      setTestingEndpoint(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Holiday Package API info laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Holiday Package API Tester
                </h1>
                <p className="text-sm text-gray-600">Test Travel Compositor Holiday Package endpoints</p>
              </div>
            </div>
            <Link href="/import">
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar Import
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Test Parameters */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
            <CardTitle>Test Parameters</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Microsite</label>
                <select
                  value={micrositeId}
                  onChange={(e) => setMicrositeId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  {packageInfo?.microsites.map((microsite) => (
                    <option key={microsite.id} value={microsite.id}>
                      {microsite.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package ID</label>
                <Input value={packageId} onChange={(e) => setPackageId(e.target.value)} placeholder="PKG-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taal</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="nl">Nederlands</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valuta</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
            <TabsTrigger value="results">Test Resultaten</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-4">
            {packageInfo?.endpoints.map((endpoint, index) => (
              <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {endpoint.name === "Package Details" && <Package className="h-5 w-5 mr-2" />}
                        {endpoint.name === "Package Calendar" && <Calendar className="h-5 w-5 mr-2" />}
                        {endpoint.name === "List All Packages" && <List className="h-5 w-5 mr-2" />}
                        {endpoint.name === "Book Package" && <CreditCard className="h-5 w-5 mr-2" />}
                        {endpoint.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{endpoint.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={endpoint.method === "GET" ? "secondary" : "default"}>{endpoint.method}</Badge>
                      <Button
                        onClick={() => testEndpoint(endpoint.name)}
                        disabled={testingEndpoint === endpoint.name}
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {testingEndpoint === endpoint.name ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">URL Pattern</h4>
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm">{endpoint.url}</code>
                    </div>

                    {endpoint.parameters.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Parameters</h4>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="flex items-center space-x-2 text-sm">
                              <Badge variant={param.required ? "destructive" : "secondary"} className="text-xs">
                                {param.type}
                              </Badge>
                              <code className="bg-gray-100 px-2 py-1 rounded">{param.name}</code>
                              <span className="text-gray-600">{param.description}</span>
                              {param.required && <span className="text-red-500">*</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Voorbeeld</h4>
                      <code className="bg-blue-50 px-3 py-2 rounded text-sm block">{endpoint.example}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {Object.keys(testResults).length === 0 ? (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Nog geen tests uitgevoerd. Klik op de play buttons om endpoints te testen.
                  </p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(testResults).map(([endpointName, result]: [string, any]) => (
                <Card key={endpointName} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      {endpointName}
                      <Badge variant={result.success ? "secondary" : "destructive"} className="ml-2">
                        {result.status || "Error"}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Getest op: {new Date(result.timestamp).toLocaleString("nl-NL")}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm overflow-auto max-h-96">
                        {JSON.stringify(result.data || result.error, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
