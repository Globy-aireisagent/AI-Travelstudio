"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Download, Loader2, CheckCircle, XCircle, Lightbulb, List, Eye } from "lucide-react"

const AVAILABLE_MICROSITES = [
  { id: "rondreis-planner", name: "Rondreis Planner", configNumber: 1 },
  { id: "reisbureaunederland", name: "Reisbureau Nederland", configNumber: 2 },
  { id: "auto", name: "Auto Microsite", configNumber: 3 },
  { id: "microsite-4", name: "Microsite 4", configNumber: 4 },
]

export default function TestIdeasPage() {
  const [selectedMicrosite, setSelectedMicrosite] = useState("microsite-4")
  const [ideaId, setIdeaId] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [ideasList, setIdeasList] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testSingleIdea = async () => {
    if (!ideaId.trim() || !selectedMicrosite) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const selectedMicrositeConfig = AVAILABLE_MICROSITES.find((m) => m.id === selectedMicrosite)
      const configNumber = selectedMicrositeConfig?.configNumber || 1

      console.log(`🔍 Testing idea ${ideaId} in microsite ${selectedMicrosite} with config ${configNumber}`)

      const response = await fetch(`/api/travel-compositor/idea/${selectedMicrosite}/${ideaId}?config=${configNumber}`)
      const data = await response.json()

      setResult(data)

      if (data.success) {
        console.log("✅ Idea data retrieved successfully")
        console.log("📊 Idea structure:", data.idea)
      } else {
        setError(data.error || "Failed to fetch idea")
      }
    } catch (err) {
      console.error("❌ Error testing idea:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const testIdeasList = async () => {
    if (!selectedMicrosite) return

    setLoadingList(true)
    setError(null)
    setIdeasList(null)

    try {
      const selectedMicrositeConfig = AVAILABLE_MICROSITES.find((m) => m.id === selectedMicrosite)
      const configNumber = selectedMicrositeConfig?.configNumber || 1

      console.log(`🔍 Testing ideas list in microsite ${selectedMicrosite} with config ${configNumber}`)

      const response = await fetch(`/api/travel-compositor/ideas/${selectedMicrosite}?config=${configNumber}&limit=10`)
      const data = await response.json()

      setIdeasList(data)

      if (data.success) {
        console.log("✅ Ideas list retrieved successfully")
        console.log("📊 Ideas found:", data.ideas?.length || 0)
      } else {
        setError(data.error || "Failed to fetch ideas list")
      }
    } catch (err) {
      console.error("❌ Error testing ideas list:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoadingList(false)
    }
  }

  const downloadData = (data: any, filename: string) => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🧪 Travel Ideas API Tester</h1>
              <p className="text-gray-600 mt-1">
                Test de echte Travel Compositor Ideas API endpoints - geen fallbacks!
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuratie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="microsite">Microsite</Label>
                <Select value={selectedMicrosite} onValueChange={setSelectedMicrosite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer microsite" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MICROSITES.map((microsite) => (
                      <SelectItem key={microsite.id} value={microsite.id}>
                        <div>
                          <div className="font-medium">{microsite.name}</div>
                          <div className="text-xs text-gray-500">Config {microsite.configNumber}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="idea-id">Idea ID (voor single test)</Label>
                <Input
                  id="idea-id"
                  placeholder="bijv. 12345"
                  value={ideaId}
                  onChange={(e) => setIdeaId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && testSingleIdea()}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Test Single Idea
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testSingleIdea} disabled={loading || !ideaId.trim()} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Test Idea API
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Test Ideas List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testIdeasList} disabled={loadingList} className="w-full">
                {loadingList ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <List className="w-4 h-4 mr-2" />
                    Test Ideas List API
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Single Idea Result */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  Single Idea Test Result
                </CardTitle>
                {result.success && (
                  <Button
                    onClick={() => downloadData(result, `idea-${ideaId}-${selectedMicrosite}.json`)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Endpoint Used</div>
                      <Badge variant="outline">{result.endpoint}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Source</div>
                      <div className="text-sm font-mono">{result.source}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Idea ID</div>
                      <div className="text-sm font-medium">{result.idea?.id || "N/A"}</div>
                    </div>
                  </div>

                  {result.idea && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Idea Details</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.idea.title && (
                            <div>
                              <div className="text-xs text-gray-400">Title</div>
                              <div className="font-medium">{result.idea.title}</div>
                            </div>
                          )}
                          {result.idea.largeTitle && (
                            <div>
                              <div className="text-xs text-gray-400">Large Title</div>
                              <div className="font-medium">{result.idea.largeTitle}</div>
                            </div>
                          )}
                          {result.idea.totalPrice && (
                            <div>
                              <div className="text-xs text-gray-400">Total Price</div>
                              <div className="font-medium">
                                {result.idea.totalPrice.amount} {result.idea.totalPrice.currency}
                              </div>
                            </div>
                          )}
                          {result.idea.destinations && (
                            <div>
                              <div className="text-xs text-gray-400">Destinations</div>
                              <div className="font-medium">{result.idea.destinations.length} destinations</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-2">Raw API Response</div>
                        <Textarea
                          value={JSON.stringify(result.idea, null, 2)}
                          readOnly
                          className="font-mono text-xs h-64"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-red-600">{result.error}</div>
                  {result.endpoints_tried && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Endpoints Tried</div>
                      <ul className="list-disc list-inside space-y-1">
                        {result.endpoints_tried.map((endpoint: string, index: number) => (
                          <li key={index} className="text-sm font-mono">
                            {endpoint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ideas List Result */}
        {ideasList && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {ideasList.success ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  Ideas List Test Result
                </CardTitle>
                {ideasList.success && (
                  <Button
                    onClick={() => downloadData(ideasList, `ideas-list-${selectedMicrosite}.json`)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {ideasList.success ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Ideas</div>
                      <div className="text-2xl font-bold">{ideasList.total || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Source</div>
                      <div className="text-sm font-mono">{ideasList.source}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pagination</div>
                      <div className="text-sm">{ideasList.pagination ? "Available" : "Not available"}</div>
                    </div>
                  </div>

                  {ideasList.ideas && ideasList.ideas.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-2">Ideas Preview</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {ideasList.ideas.slice(0, 6).map((idea: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="font-medium text-sm">
                                {idea.title || idea.largeTitle || `Idea ${idea.id}`}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">ID: {idea.id}</div>
                              {idea.totalPrice && (
                                <div className="text-xs text-green-600 mt-1">
                                  {idea.totalPrice.amount} {idea.totalPrice.currency}
                                </div>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 w-full"
                                onClick={() => {
                                  setIdeaId(idea.id.toString())
                                  testSingleIdea()
                                }}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Test This Idea
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-2">Raw API Response</div>
                        <Textarea
                          value={JSON.stringify(ideasList, null, 2)}
                          readOnly
                          className="font-mono text-xs h-64"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-600">{ideasList.error}</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
