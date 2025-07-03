"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MapPin, Users, Euro, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface ImportRequest {
  type: "booking" | "idea" | "package"
  id: string
  micrositeId?: string
}

interface ImportResult {
  success: boolean
  type: "booking" | "idea" | "package"
  data?: any
  error?: string
  searchMethod?: string
  foundInMicrosite?: string
}

export default function UniversalImportWizard() {
  const [activeTab, setActiveTab] = useState("single")

  // Single import state
  const [singleImport, setSingleImport] = useState<ImportRequest>({
    type: "booking",
    id: "",
    micrositeId: undefined,
  })
  const [singleResult, setSingleResult] = useState<ImportResult | null>(null)
  const [singleLoading, setSingleLoading] = useState(false)

  // Batch import state
  const [batchInput, setBatchInput] = useState("")
  const [batchResults, setBatchResults] = useState<ImportResult[]>([])
  const [batchLoading, setBatchLoading] = useState(false)

  // Single import handler
  const handleSingleImport = async () => {
    if (!singleImport.id.trim()) return

    setSingleLoading(true)
    setSingleResult(null)

    try {
      const response = await fetch("/api/universal-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleImport),
      })

      const result = await response.json()
      setSingleResult(result)
    } catch (error) {
      setSingleResult({
        success: false,
        type: singleImport.type,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setSingleLoading(false)
    }
  }

  // Batch import handler
  const handleBatchImport = async () => {
    if (!batchInput.trim()) return

    setBatchLoading(true)
    setBatchResults([])

    try {
      // Parse batch input
      const lines = batchInput.trim().split("\n")
      const requests: ImportRequest[] = []

      for (const line of lines) {
        const parts = line.trim().split(",")
        if (parts.length >= 2) {
          requests.push({
            type: parts[0].trim() as "booking" | "idea" | "package",
            id: parts[1].trim(),
            micrositeId: parts[2]?.trim() || undefined,
          })
        }
      }

      const response = await fetch("/api/universal-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests }),
      })

      const result = await response.json()
      setBatchResults(result.results || [])
    } catch (error) {
      console.error("Batch import error:", error)
    } finally {
      setBatchLoading(false)
    }
  }

  const renderImportResult = (result: ImportResult) => {
    if (!result.success) {
      return (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="w-5 h-5 mr-2" />
              Import Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{result.error}</p>
          </CardContent>
        </Card>
      )
    }

    const { data } = result

    return (
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            {result.type === "booking" && "Booking Imported"}
            {result.type === "idea" && "Travel Idea Imported"}
            {result.type === "package" && "Holiday Package Imported"}
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{result.foundInMicrosite}</Badge>
            <Badge variant="secondary">{result.searchMethod}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{data.title}</h3>
            {data.description && <p className="text-gray-600 mt-1">{data.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {data.client && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                <span>{data.client.name}</span>
              </div>
            )}

            {data.destination && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span>{data.destination}</span>
              </div>
            )}

            {data.startDate && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>{new Date(data.startDate).toLocaleDateString()}</span>
              </div>
            )}

            {(data.totalPrice?.amount || data.price?.amount) && (
              <div className="flex items-center">
                <Euro className="w-4 h-4 mr-2 text-gray-500" />
                <span>€{(data.totalPrice?.amount || data.price?.amount).toLocaleString()}</span>
              </div>
            )}
          </div>

          {result.type === "booking" && (
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold">{data.accommodations?.length || 0}</div>
                <div className="text-gray-500">Hotels</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{data.activities?.length || 0}</div>
                <div className="text-gray-500">Activities</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{data.transports?.length || 0}</div>
                <div className="text-gray-500">Transports</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{data.vouchers?.length || 0}</div>
                <div className="text-gray-500">Vouchers</div>
              </div>
            </div>
          )}

          {result.type === "package" && data.destinations && (
            <div>
              <Label className="text-sm font-medium">Destinations:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.destinations.map((dest: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {typeof dest === "string" ? dest : dest.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Universal Travel Import</h1>
        <p className="text-gray-600">Import bookings, travel ideas, and holiday packages from Travel Compositor</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Import</TabsTrigger>
          <TabsTrigger value="batch">Batch Import</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Single Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={singleImport.type}
                    onValueChange={(value: "booking" | "idea" | "package") =>
                      setSingleImport((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="idea">Travel Idea</SelectItem>
                      <SelectItem value="package">Holiday Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="id">ID</Label>
                  <Input
                    id="id"
                    value={singleImport.id}
                    onChange={(e) => setSingleImport((prev) => ({ ...prev, id: e.target.value }))}
                    placeholder="Enter ID..."
                  />
                </div>

                <div>
                  <Label htmlFor="microsite">Microsite (Optional)</Label>
                  <Select
                    value={singleImport.micrositeId || "auto"}
                    onValueChange={(value) =>
                      setSingleImport((prev) => ({ ...prev, micrositeId: value === "auto" ? undefined : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="1">Primary Microsite</SelectItem>
                      <SelectItem value="2">Secondary Microsite</SelectItem>
                      <SelectItem value="3">Tertiary Microsite</SelectItem>
                      <SelectItem value="4">Quaternary Microsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleSingleImport}
                disabled={singleLoading || !singleImport.id.trim()}
                className="w-full"
              >
                {singleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${singleImport.type}`
                )}
              </Button>
            </CardContent>
          </Card>

          {singleResult && renderImportResult(singleResult)}
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="batch-input">Import List</Label>
                <Textarea
                  id="batch-input"
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder={`Enter one per line in format: type,id,microsite
Example:
booking,RRP123456,1
idea,789,2
package,PKG001,auto`}
                  rows={8}
                />
              </div>

              <Button onClick={handleBatchImport} disabled={batchLoading || !batchInput.trim()} className="w-full">
                {batchLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Start Batch Import"
                )}
              </Button>
            </CardContent>
          </Card>

          {batchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Badge variant="outline" className="text-green-600">
                  ✅ {batchResults.filter((r) => r.success).length} Successful
                </Badge>
                <Badge variant="outline" className="text-red-600">
                  ❌ {batchResults.filter((r) => !r.success).length} Failed
                </Badge>
              </div>

              {batchResults.map((result, idx) => (
                <div key={idx}>{renderImportResult(result)}</div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
