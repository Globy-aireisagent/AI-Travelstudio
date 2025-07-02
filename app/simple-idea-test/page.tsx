"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Loader2, Search, Database, Clock } from "lucide-react"

export default function SimpleIdeaTestPage() {
  const [ideaId, setIdeaId] = useState("29223863")
  const [config, setConfig] = useState("1")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    if (!ideaId.trim()) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      console.log(`🧪 Running simple test for idea ${ideaId} with config ${config}`)

      const response = await fetch(`/api/travel-compositor/simple-idea-test?ideaId=${ideaId}&config=${config}`)
      const data = await response.json()

      if (data.success) {
        setResults(data)
        console.log("✅ Test results:", data)
      } else {
        setError(data.error || "Test failed")
      }
    } catch (err) {
      console.error("❌ Test error:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🧪 Simple Idea Test</h1>
              <p className="text-gray-600 mt-1">Test exact endpoints zoals de debug tool</p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Database className="w-4 h-4 mr-2" />
              Direct API Test
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Test Form */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Test Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idea-id">Idea ID</Label>
                <Input id="idea-id" placeholder="29223863" value={ideaId} onChange={(e) => setIdeaId(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="config">Config</Label>
                <Select value={config} onValueChange={setConfig}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Config 1</SelectItem>
                    <SelectItem value="2">Config 2</SelectItem>
                    <SelectItem value="3">Config 3</SelectItem>
                    <SelectItem value="4">Config 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={runTest} disabled={loading || !ideaId.trim()} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Run Simple Test
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Test Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.summary.totalEndpoints}</div>
                    <div className="text-sm text-blue-800">Endpoints Tested</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.summary.successfulEndpoints}</div>
                    <div className="text-sm text-green-800">Successful</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{results.summary.config}</div>
                    <div className="text-sm text-purple-800">Config Used</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{results.summary.ideaId}</div>
                    <div className="text-sm text-orange-800">Idea ID</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <div className="space-y-4">
              {results.testResults.map((result: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        Endpoint {index + 1}
                      </CardTitle>
                      <div className="flex gap-2">
                        {result.duration && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.duration}ms
                          </Badge>
                        )}
                        {result.success && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Success
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="font-medium mb-2">Endpoint URL</div>
                        <div className="text-sm bg-gray-100 p-2 rounded font-mono break-all">{result.endpoint}</div>
                      </div>

                      {result.success ? (
                        <div className="space-y-3">
                          <div>
                            <div className="font-medium mb-2">Sample Data</div>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(result.sampleData).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium">{key}:</span>{" "}
                                  <span className="text-gray-600">{String(value) || "null"}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="font-medium mb-2">Data Keys ({result.keys.length})</div>
                            <div className="flex flex-wrap gap-1">
                              {result.keys.map((key: string) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="font-medium mb-2">Raw Data (first 500 chars)</div>
                            <div className="text-xs bg-gray-100 p-3 rounded font-mono overflow-auto max-h-40">
                              <pre>{JSON.stringify(result.rawData, null, 2).substring(0, 500)}...</pre>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium mb-2 text-red-700">Error</div>
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{result.error}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
