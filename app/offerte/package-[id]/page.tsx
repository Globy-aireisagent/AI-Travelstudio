"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Clock, Users, Calendar, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface HolidayPackage {
  id: string
  title: string | null
  description: string | null
  price: {
    amount: number | null
    currency: string | null
  }
  startDate: string | null
  endDate: string | null
  destinations: string[]
  theme: string | null
  duration: {
    nights: number | null
    days: number | null
  }
  travelers: number | null
  images: string[]
  rawApiData: any
}

export default function PackageOffertePage() {
  const { id } = useParams<{ id: string }>()
  const [state, setState] = useState<{
    loading: boolean
    error: string | null
    data: HolidayPackage | null
  }>({
    loading: true,
    error: null,
    data: null,
  })

  const loadHolidayPackageData = async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }))

      // Remove 'package-' prefix from ID
      const packageId = id.replace("package-", "")
      console.log(`🔍 Loading Holiday Package data for ID: ${packageId}`)

      const response = await fetch(`/api/travel-compositor/packages/1/${packageId}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      console.log(`📡 Package API response status:`, response.status)

      if (!response.ok) {
        throw new Error("Holiday Package niet gevonden")
      }

      const json = await response.json()
      console.log(`📊 Package API full response:`, JSON.stringify(json, null, 2))

      if (!json.success || !json.package) {
        throw new Error(json.error || "Geen package data beschikbaar")
      }

      const packageData = parseHolidayPackageData(json.package, packageId)
      setState({ loading: false, error: null, data: packageData })
    } catch (e: any) {
      console.error("❌ Error loading Holiday Package data:", e)
      setState({
        loading: false,
        error: e.message ?? "Onbekende fout",
        data: null,
      })
    }
  }

  useEffect(() => {
    if (id) loadHolidayPackageData()
  }, [id])

  const parseHolidayPackageData = (rawData: any, packageId: string): HolidayPackage => {
    console.log("🔍 PARSING HOLIDAY PACKAGE DATA:")
    console.log("Raw data keys:", Object.keys(rawData))
    console.log("Full raw data:", JSON.stringify(rawData, null, 2))

    // Extract package information
    const title = rawData.title || rawData.name || rawData.packageName || `Holiday Package ${packageId}`
    const description = rawData.description || rawData.shortDescription || rawData.longDescription || null

    // Extract price
    const priceAmount = rawData.price?.amount || rawData.totalPrice?.amount || rawData.priceFrom?.amount || null
    const price = {
      amount: priceAmount ? Number.parseFloat(priceAmount) : null,
      currency: rawData.price?.currency || rawData.currency || "EUR",
    }

    // Extract dates
    const startDate = rawData.startDate || rawData.departureDate || rawData.validFrom || null
    const endDate = rawData.endDate || rawData.returnDate || rawData.validTo || null

    // Extract destinations
    const destinations = rawData.destinations || rawData.locations || rawData.cities || []

    // Extract theme
    const theme = rawData.theme || rawData.category || rawData.type || rawData.packageType || null

    // Extract duration
    const duration = {
      nights: rawData.nights || rawData.duration?.nights || null,
      days: rawData.days || rawData.duration?.days || null,
    }

    // Extract travelers
    const travelers = rawData.travelers || rawData.passengers || rawData.maxPersons || null

    // Extract images
    const images = rawData.images || rawData.photos || []

    return {
      id: packageId,
      title,
      description,
      price,
      startDate,
      endDate,
      destinations: Array.isArray(destinations) ? destinations : [],
      theme,
      duration,
      travelers,
      images: Array.isArray(images) ? images : [],
      rawApiData: rawData,
    }
  }

  const formatFullDate = (dateString: string | null) => {
    if (!dateString) return "Datum niet beschikbaar"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Ongeldige datum"
      return date.toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch {
      return "Datum niet beschikbaar"
    }
  }

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg">🔍 Holiday Package laden...</p>
          <p className="text-sm text-gray-500 mt-2">Package ID: {id?.replace("package-", "")}</p>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Fout bij laden Holiday Package</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{state.error}</p>
            <Button onClick={() => loadHolidayPackageData()} className="w-full">
              Probeer opnieuw
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!state.data) return null

  const { data } = state

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-purple-800 to-purple-600">
        {data.images.length > 0 && (
          <Image
            src={data.images[0] || "/placeholder.svg"}
            alt={data.title || "Holiday Package"}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <div className="text-white">
            <div className="flex items-center mb-2">
              <Package className="w-5 h-5 mr-2" />
              <span className="text-sm">Holiday Package</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{data.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Badge className="bg-purple-600 hover:bg-purple-700">Holiday Package</Badge>
              {data.destinations.length > 0 && <span>{data.destinations.join(", ")}</span>}
              <span>Package ID: {data.id}</span>
            </div>

            <Button className="mt-4 bg-purple-600 hover:bg-purple-700">Deel dit pakket</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-4 h-4 mr-2" /> Package Overzicht
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Bestemmingen:</h3>
                  <p className="text-gray-600">
                    {data.destinations.length > 0 ? data.destinations.join(", ") : "Geen bestemmingen beschikbaar"}
                  </p>
                </div>

                {data.theme && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Thema</h3>
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      {data.theme}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Beschrijving</CardTitle>
              </CardHeader>
              <CardContent>
                {data.description ? (
                  <p className="text-gray-700 leading-relaxed">{data.description}</p>
                ) : (
                  <p className="text-gray-500 italic">Geen beschrijving beschikbaar voor dit Holiday Package</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">Package Prijs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  {data.price.amount !== null ? (
                    <div className="text-4xl font-bold text-purple-600">€{data.price.amount.toLocaleString()}</div>
                  ) : (
                    <div className="text-lg text-gray-500">Prijs op aanvraag</div>
                  )}
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700 mb-4">Ik wil meer informatie!</Button>
              </CardContent>
            </Card>

            {/* Package Details */}
            <Card>
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.travelers !== null && (
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3 text-gray-500" />
                    <span>{data.travelers} Personen</span>
                  </div>
                )}

                {data.startDate && data.endDate && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                    <span>
                      {formatFullDate(data.startDate)} - {formatFullDate(data.endDate)}
                    </span>
                  </div>
                )}

                {data.duration.nights !== null && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-gray-500" />
                    <span>{data.duration.nights} nachten</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Debug Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs text-gray-500">Package Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>API Keys: {Object.keys(data.rawApiData).join(", ")}</p>
                  <p>Images: {data.images.length}</p>
                  <p>Destinations: {data.destinations.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
