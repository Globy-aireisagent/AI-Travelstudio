"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface ImportResult {
  success: boolean
  type: string
  data?: any
  error?: string
  searchMethod?: string
  foundInMicrosite?: string
  debugInfo?: any
}

export function UniversalImportWizard() {
  const [singleType, setSingleType] = useState<string>("booking")
  const [singleId, setSingleId] = useState<string>("")
  const [singleMicrosite, setSingleMicrosite] = useState<string>("")
  const [batchRequests, setBatchRequests] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [batchResults, setBatchResults] = useState<ImportResult[]>([])

  const handleSingleImport = async () => {
    if (!singleType || !singleId) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/universal-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: singleType,
          id: singleId,
          micrositeId: singleMicrosite || undefined,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        type: singleType,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchImport = async () => {
    if (!batchRequests.trim()) return

    setIsLoading(true)
    setBatchResults([])

    try {
      const requests = batchRequests
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)
        .map((line) => {
          const [type, id, micrositeId] = line.split(",").map((s) => s.trim())
          return { type, id, micrositeId }
        })

      const response = await fetch("/api/universal-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests }),
      })

      const data = await response.json()
      setBatchResults(data.results || [])
    } catch (error) {
      setBatchResults([
        {
          success: false,
          type: "batch",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const renderResult = (result: ImportResult) => {
    if (result.success) {
      return (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">
                {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Imported
              </CardTitle>
            </div>
            <div className="flex gap-2 text-sm text-green-700">
              <Badge variant="secondary">{result.foundInMicrosite}</Badge>
              <Badge variant="outline">{result.searchMethod}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-green-800">
                  {result.data?.title || `${result.type} ${result.data?.id}`}
                </h4>
                <p className="text-sm text-green-700">
                  {result.data?.price?.amount
                    ? `€${result.data.price.amount}`
                    : result.data?.totalPrice
                      ? `€${result.data.totalPrice}`
                      : "€0"}
                </p>
              </div>

              {result.data?.destinations && result.data.destinations.length > 0 && (
                <div>
                  <Label className="text-green-800">Destinations:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.data.destinations.map((dest: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-green-700">
                        {typeof dest === "string" ? dest : dest.name || dest.city || dest.location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.data?.client && (
                <div>
                  <Label className="text-green-800">Client:</Label>
                  <p className="text-sm text-green-700">{result.data.client.name}</p>
                </div>
              )}

              {result.data?.startDate && (
                <div>
                  <Label className="text-green-800">Dates:</Label>
                  <p className="text-sm text-green-700">
                    {result.data.startDate} {result.data.endDate && `- ${result.data.endDate}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )
    } else {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">Import Failed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{result.error}</p>
          </CardContent>
        </Card>
      )
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Universal Travel Import</h1>
        <p className="text-muted-foreground">
          Import bookings, travel ideas, and holiday packages from Travel Compositor
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Import</TabsTrigger>
          <TabsTrigger value="batch">Batch Import</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Single Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={singleType} onValueChange={setSingleType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
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
                    value={singleId}
                    onChange={(e) => setSingleId(e.target.value)}
                    placeholder="Enter ID"
                  />
                </div>

                <div>
                  <Label htmlFor="microsite">Microsite (Optional)</Label>
                  <Select value={singleMicrosite} onValueChange={setSingleMicrosite}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Auto-detect</SelectItem>
                      <SelectItem value="1">Primary Microsite</SelectItem>
                      <SelectItem value="2">Secondary Microsite</SelectItem>
                      <SelectItem value="3">Tertiary Microsite</SelectItem>
                      <SelectItem value="4">Quaternary Microsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSingleImport} disabled={!singleType || !singleId || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${singleType || "item"}`
                )}
              </Button>
            </CardContent>
          </Card>

          {result && renderResult(result)}
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Import</CardTitle>
              <CardDescription>
                Enter one item per line in format: type,id,micrositeId (micrositeId optional)
                <br />
                Example: booking,RRP-1234,1
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={batchRequests}
                onChange={(e) => setBatchRequests(e.target.value)}
                placeholder="booking,RRP-1234&#10;idea,5678&#10;package,9012"
                rows={6}
              />

              <Button onClick={handleBatchImport} disabled={!batchRequests.trim() || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import Batch"
                )}
              </Button>
            </CardContent>
          </Card>

          {batchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Batch Results</h3>
              {batchResults.map((result, index) => (
                <div key={index}>{renderResult(result)}</div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
