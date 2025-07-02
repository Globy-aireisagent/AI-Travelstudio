"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Database,
  MapPin,
  Hotel,
  Calendar,
  Loader2,
  ExternalLink,
  Code,
  List,
  Globe,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

export default function DiscoverAllSchemasPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [expandedSchemas, setExpandedSchemas] = useState<{ [key: string]: boolean }>({})

  const fetchSchemas = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/travel-compositor/discover-all-schemas?config=1`)
      const result = await response.json()
      setData(result)
      console.log("🔍 All Schemas:", result)
    } catch (error) {
      console.error("❌ Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchemas()
  }, [])

  const toggleSchema = (schemaName: string) => {
    setExpandedSchemas((prev) => ({
      ...prev,
      [schemaName]: !prev[schemaName],
    }))
  }

  const SchemaCard = ({ schema }: { schema: any }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="w-5 h-5" />
            {schema.name}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{schema.propertyCount} props</Badge>
            {schema.hasArrays && <Badge className="bg-blue-100 text-blue-800">Arrays</Badge>}
            {schema.hasObjects && <Badge className="bg-green-100 text-green-800">Objects</Badge>}
            {schema.hasEnums && <Badge className="bg-purple-100 text-purple-800">Enums</Badge>}
          </div>
        </div>
        {schema.description && <p className="text-sm text-gray-600 mt-2">{schema.description}</p>}
      </CardHeader>
      <CardContent>
        <Button variant="ghost" size="sm" onClick={() => toggleSchema(schema.name)} className="mb-3">
          {expandedSchemas[schema.name] ? (
            <ChevronDown className="w-4 h-4 mr-2" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          {expandedSchemas[schema.name] ? "Verberg" : "Toon"} Properties
        </Button>

        {expandedSchemas[schema.name] && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {schema.properties.map((prop: string) => (
                <Badge key={prop} variant="outline" className="text-xs">
                  {prop}
                </Badge>
              ))}
            </div>

            {schema.required.length > 0 && (
              <div className="mt-3">
                <h5 className="font-medium text-sm mb-2">Required Fields:</h5>
                <div className="flex flex-wrap gap-1">
                  {schema.required.map((req: string) => (
                    <Badge key={req} className="bg-red-100 text-red-800 text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="w-8 h-8 text-blue-600" />
            Discover All Schemas
          </h1>
          <p className="text-gray-600 mt-2">Ontdek alle beschikbare schemas en endpoints in Travel Compositor</p>
        </div>
        <Button onClick={fetchSchemas} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Analyzing Travel Compositor API schemas...</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                API Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.analysis?.totalSchemas || 0}</div>
                  <div className="text-sm text-gray-600">Total Schemas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.analysis?.totalEndpoints || 0}</div>
                  <div className="text-sm text-gray-600">Total Endpoints</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.analysis?.destinationSchemas || 0}</div>
                  <div className="text-sm text-gray-600">Destination Schemas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{data.analysis?.hotelSchemas || 0}</div>
                  <div className="text-sm text-gray-600">Hotel Schemas</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open(data.rawSwaggerUrl, "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Raw Swagger
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different categories */}
          <Tabs defaultValue="destinations" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="destinations" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Destinations
              </TabsTrigger>
              <TabsTrigger value="hotels" className="flex items-center gap-2">
                <Hotel className="w-4 h-4" />
                Hotels
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                All Schemas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="destinations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Destination Schemas ({data.schemas?.destinations?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.schemas?.destinations?.map((schema: any) => (
                    <SchemaCard key={schema.name} schema={schema} />
                  ))}
                </CardContent>
              </Card>

              {/* Destination Endpoints */}
              <Card>
                <CardHeader>
                  <CardTitle>Destination Endpoints ({data.endpoints?.destinations?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.endpoints?.destinations?.map((endpoint: any, index: number) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono">{endpoint.path}</code>
                          <div className="flex gap-1">
                            {endpoint.methods.map((method: string) => (
                              <Badge key={method} variant="outline" className="text-xs">
                                {method.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {endpoint.summary && <p className="text-sm text-gray-600 mt-1">{endpoint.summary}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hotels" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="w-5 h-5" />
                    Hotel Schemas ({data.schemas?.hotels?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.schemas?.hotels?.map((schema: any) => (
                    <SchemaCard key={schema.name} schema={schema} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Booking Schemas ({data.schemas?.bookings?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.schemas?.bookings?.map((schema: any) => (
                    <SchemaCard key={schema.name} schema={schema} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    All Schemas (First 50)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.schemas?.all?.map((schema: any) => (
                    <SchemaCard key={schema.name} schema={schema} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
