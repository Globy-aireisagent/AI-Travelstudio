"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface EndpointInfo {
  endpoint: string
  status: number
  dataKeys: string[]
  totalCount: number
  agencyId?: number
  agencyName?: string
}

interface DiscoveryResult {
  workingEndpoints: EndpointInfo[]
  failedEndpoints: { endpoint: string; status?: number; error?: string }[]
  agencies: any[]
  sampleBookings: any[]
}

export default function BookingEndpointDiscoverer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DiscoveryResult | null>(null)

  const handleDiscover = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/discover-booking-endpoints")
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const json = (await res.json()) as DiscoveryResult
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Booking Endpoint Discovery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDiscover} disabled={loading}>
          {loading ? "Discovering…" : "Discover Booking Endpoints"}
        </Button>

        {error && <p className="text-destructive">{error}</p>}

        {data && (
          <Tabs defaultValue="working" className="w-full">
            <TabsList>
              <TabsTrigger value="working">Working ({data.workingEndpoints.length})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({data.failedEndpoints.length})</TabsTrigger>
              <TabsTrigger value="bookings">Sample bookings ({data.sampleBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="working">
              <ScrollArea className="h-64 w-full rounded-md border p-2">
                {data.workingEndpoints.map((ep) => (
                  <div key={ep.endpoint} className="mb-3">
                    <p className="font-mono text-sm break-all">{ep.endpoint}</p>
                    <Badge variant="outline" className="mr-1">
                      {ep.status}
                    </Badge>
                    <Badge variant="secondary" className="mr-1">
                      {ep.totalCount} items
                    </Badge>
                    {ep.agencyName && <Badge variant="outline">{ep.agencyName}</Badge>}
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="failed">
              <ScrollArea className="h-64 w-full rounded-md border p-2">
                {data.failedEndpoints.map((ep) => (
                  <div key={ep.endpoint} className="mb-3">
                    <p className="font-mono text-sm break-all">{ep.endpoint}</p>
                    <Badge variant="destructive" className="mr-1">
                      {ep.status ?? "ERROR"}
                    </Badge>
                    {ep.error && <span className="text-xs">{ep.error}</span>}
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="bookings">
              <ScrollArea className="h-64 w-full rounded-md border p-2">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(data.sampleBookings, null, 2)}</pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
