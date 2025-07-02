"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Clock, MapPin, Users, Car, Calendar, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface TravelCompositorIdea {
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
  distance: number | null
  travelers: number | null
  itinerary: any[]
  images: string[]
  rawApiData: any
}

export default function OffertePage() {
  const { id } = useParams<{ id: string }>()
  const [state, setState] = useState<{
    loading: boolean
    error: string | null
    data: TravelCompositorIdea | null
  }>({
    loading: true,
    error: null,
    data: null,
  })

  const loadRealTravelCompositorData = async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }))

      console.log(`🔍 Loading REAL Travel Compositor data for ID: ${id}`)

      // Try multiple API endpoints to get the most complete data
      const endpoints = [
        "/api/travel-compositor/idea-lightning-fast",
        "/api/travel-compositor/idea-optimized",
        "/api/travel-compositor/travelidea/1/" + id,
        "/api/travel-compositor/ideas/1",
      ]

      let bestData = null
      let usedEndpoint = ""

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${endpoint}`)

          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id,
              ideaId: id,
              micrositeConfig: "1",
              micrositeId: "1",
              includeFullDetails: true,
              includeItinerary: true,
              includePricing: true,
              includeImages: true,
              language: "nl",
            }),
          })

          console.log(`📡 ${endpoint} response status:`, res.status)

          if (res.ok) {
            const json = await res.json()
            console.log(`📊 ${endpoint} full response:`, JSON.stringify(json, null, 2))

            if (json.success && json.data) {
              bestData = json.data
              usedEndpoint = endpoint
              console.log(`✅ Got data from: ${endpoint}`)
              break
            }
          }
        } catch (e) {
          console.log(`⚠️ ${endpoint} failed:`, e)
        }
      }

      if (!bestData) {
        throw new Error("Geen data beschikbaar van Travel Compositor API")
      }

      console.log(`🎯 Using REAL data from: ${usedEndpoint}`)
      const realData = parseOnlyRealApiData(bestData, id)
      setState({ loading: false, error: null, data: realData })
    } catch (e: any) {
      console.error("❌ Error loading Travel Compositor data:", e)
      setState({
        loading: false,
        error: e.message ?? "Onbekende fout",
        data: null,
      })
    }
  }

  useEffect(() => {
    if (id) loadRealTravelCompositorData()
  }, [id])

  const parseOnlyRealApiData = (rawData: any, ideaId: string): TravelCompositorIdea => {
    console.log("🔍 PARSING ONLY REAL API DATA:")
    console.log("Raw data keys:", Object.keys(rawData))
    console.log("Full raw data:", JSON.stringify(rawData, null, 2))

    // Extract ONLY what exists in API - NO FALLBACKS
    const title = rawData.title || rawData.name || rawData.tripName || rawData.ideaTitle || null

    const description =
      rawData.description ||
      rawData.shortDescription ||
      rawData.longDescription ||
      rawData.summary ||
      rawData.content ||
      null

    // Extract price ONLY from API
    const priceAmount = extractRealPriceOnly(rawData)
    const price = {
      amount: priceAmount,
      currency: rawData.currency || rawData.priceCurrency || null,
    }

    // Extract dates ONLY from API
    const startDate = rawData.startDate || rawData.departureDate || rawData.beginDate || rawData.fromDate || null
    const endDate = rawData.endDate || rawData.returnDate || rawData.finishDate || rawData.toDate || null

    // Extract destinations ONLY from API
    const destinations = extractRealDestinationsOnly(rawData)

    // Extract theme ONLY from API
    const theme = rawData.theme || rawData.category || rawData.type || rawData.travelType || rawData.tripType || null

    // Extract duration ONLY from API
    const duration = extractRealDurationOnly(rawData, startDate, endDate)

    // Extract distance ONLY from API
    const distance = rawData.distance || rawData.totalDistance || rawData.kilometers || rawData.totalKilometers || null

    // Extract travelers ONLY from API
    const travelers =
      rawData.travelers || rawData.passengers || rawData.adults || rawData.persons || rawData.pax || null

    // Extract itinerary ONLY from API
    const itinerary = extractRealItineraryOnly(rawData)

    // Extract images ONLY from API
    const images = extractRealImagesOnly(rawData)

    console.log("🎯 PARSED REAL DATA:")
    console.log("Title:", title)
    console.log("Price amount:", priceAmount)
    console.log("Theme:", theme)
    console.log("Destinations:", destinations)
    console.log("Itinerary items:", itinerary.length)
    console.log("Duration:", duration)

    return {
      id: ideaId,
      title,
      description,
      price,
      startDate,
      endDate,
      destinations,
      theme,
      duration,
      distance,
      travelers,
      itinerary,
      images,
      rawApiData: rawData,
    }
  }

  const extractRealPriceOnly = (rawData: any): number | null => {
    console.log("💰 EXTRACTING REAL PRICE ONLY:")

    // Try all possible price fields from API
    const priceFields = [
      "price.amount",
      "price",
      "totalPrice.amount",
      "totalPrice",
      "priceFrom.amount",
      "priceFrom",
      "cost.amount",
      "cost",
      "amount",
      "value",
      "totalAmount",
      "finalPrice",
      "basePrice",
      "netPrice",
      "grossPrice",
    ]

    for (const field of priceFields) {
      const value = getNestedValue(rawData, field)
      if (value && !isNaN(Number(value))) {
        console.log(`✅ Found REAL price in ${field}:`, value)
        return Number.parseFloat(value)
      }
    }

    // Calculate from components if available in API
    let calculatedPrice = 0
    let hasComponents = false

    if (rawData.hotels && Array.isArray(rawData.hotels)) {
      rawData.hotels.forEach((hotel: any, index: number) => {
        const hotelPrice = extractItemRealPrice(hotel)
        if (hotelPrice !== null) {
          console.log(`Hotel ${index} REAL price:`, hotelPrice)
          calculatedPrice += hotelPrice
          hasComponents = true
        }
      })
    }

    if (rawData.transports && Array.isArray(rawData.transports)) {
      rawData.transports.forEach((transport: any, index: number) => {
        const transportPrice = extractItemRealPrice(transport)
        if (transportPrice !== null) {
          console.log(`Transport ${index} REAL price:`, transportPrice)
          calculatedPrice += transportPrice
          hasComponents = true
        }
      })
    }

    if (rawData.cars && Array.isArray(rawData.cars)) {
      rawData.cars.forEach((car: any, index: number) => {
        const carPrice = extractItemRealPrice(car)
        if (carPrice !== null) {
          console.log(`Car ${index} REAL price:`, carPrice)
          calculatedPrice += carPrice
          hasComponents = true
        }
      })
    }

    if (rawData.activities && Array.isArray(rawData.activities)) {
      rawData.activities.forEach((activity: any, index: number) => {
        const activityPrice = extractItemRealPrice(activity)
        if (activityPrice !== null) {
          console.log(`Activity ${index} REAL price:`, activityPrice)
          calculatedPrice += activityPrice
          hasComponents = true
        }
      })
    }

    if (hasComponents && calculatedPrice > 0) {
      console.log("💰 Calculated REAL total price:", calculatedPrice)
      return calculatedPrice
    }

    console.log("💰 NO REAL PRICE FOUND IN API")
    return null
  }

  const extractItemRealPrice = (item: any): number | null => {
    const priceFields = ["price.amount", "price", "priceFrom.amount", "priceFrom", "cost", "amount"]

    for (const field of priceFields) {
      const value = getNestedValue(item, field)
      if (value && !isNaN(Number(value))) {
        return Number.parseFloat(value)
      }
    }
    return null
  }

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }

  const extractRealDestinationsOnly = (rawData: any): string[] => {
    console.log("🗺️ EXTRACTING REAL DESTINATIONS ONLY:")

    const destinations: string[] = []

    // Try multiple destination fields from API
    const destinationSources = [
      rawData.destinations,
      rawData.cities,
      rawData.locations,
      rawData.places,
      rawData.stops,
      rawData.itinerary?.map((day: any) => day.destination || day.location || day.city),
      rawData.hotels?.map((hotel: any) => hotel.city || hotel.destination || hotel.location),
      rawData.tripSpots?.map((spot: any) => spot.city || spot.destination || spot.location),
    ]

    destinationSources.forEach((source, index) => {
      if (Array.isArray(source)) {
        console.log(`Destination source ${index}:`, source)
        source.forEach((item: any) => {
          let destName = ""
          if (typeof item === "string") {
            destName = item
          } else if (item?.name) {
            destName = item.name
          } else if (item?.city) {
            destName = item.city
          } else if (item?.destination) {
            destName = item.destination
          }

          if (destName && !destinations.includes(destName)) {
            destinations.push(destName)
          }
        })
      }
    })

    console.log("🗺️ REAL destinations found:", destinations)
    return destinations
  }

  const extractRealDurationOnly = (rawData: any, startDate: string | null, endDate: string | null) => {
    console.log("⏱️ EXTRACTING REAL DURATION ONLY:")

    // Try direct duration fields from API
    if (rawData.duration) {
      if (typeof rawData.duration === "object") {
        console.log("Found REAL duration object:", rawData.duration)
        return {
          nights: rawData.duration.nights || rawData.duration.numberOfNights || null,
          days: rawData.duration.days || rawData.duration.numberOfDays || null,
        }
      }
    }

    // Try other duration fields from API
    const nights = rawData.nights || rawData.numberOfNights || rawData.totalNights
    const days = rawData.days || rawData.numberOfDays || rawData.totalDays

    if (nights !== undefined || days !== undefined) {
      console.log("Found REAL nights/days:", { nights, days })
      return {
        nights: nights || null,
        days: days || null,
      }
    }

    // Calculate from dates ONLY if both exist in API
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        console.log("Calculated REAL duration from API dates:", { days: diffDays, nights: diffDays - 1 })
        return {
          nights: diffDays - 1,
          days: diffDays,
        }
      }
    }

    console.log("⏱️ NO REAL DURATION FOUND IN API")
    return { nights: null, days: null }
  }

  const extractRealItineraryOnly = (rawData: any) => {
    console.log("📅 EXTRACTING REAL ITINERARY ONLY:")

    if (!rawData.itinerary || !Array.isArray(rawData.itinerary)) {
      console.log("📅 NO REAL ITINERARY FOUND IN API")
      return []
    }

    console.log("Found REAL itinerary with", rawData.itinerary.length, "items")

    const itinerary: any[] = []

    rawData.itinerary.forEach((day: any, index: number) => {
      console.log(`REAL Day ${index + 1}:`, day)

      itinerary.push({
        day: day.day || index + 1,
        date: day.date || null,
        title: day.title || day.name || day.description || null,
        transport: extractRealTransportForDay(day),
        accommodation: extractRealAccommodationForDay(day),
        activities: day.activities || day.events || day.attractions || [],
        rawDayData: day,
      })
    })

    console.log("📅 REAL itinerary parsed:", itinerary.length, "days")
    return itinerary
  }

  const extractRealTransportForDay = (day: any) => {
    if (!day.transport) return null

    return {
      type: day.transport.type || null,
      company: day.transport.company || day.transport.airline || null,
      flightNumber: day.transport.flightNumber || null,
      departure: {
        time: day.transport.departureTime || null,
        airport: day.transport.departureAirport || null,
        code: day.transport.departureCode || null,
      },
      arrival: day.transport.arrivalTime
        ? {
            time: day.transport.arrivalTime || null,
            airport: day.transport.arrivalAirport || null,
            code: day.transport.arrivalCode || null,
          }
        : null,
    }
  }

  const extractRealAccommodationForDay = (day: any) => {
    const acc = day.accommodation || day.hotel
    if (!acc) return null

    return {
      name: acc.name || null,
      location: acc.location || acc.city || null,
      type: acc.type || null,
    }
  }

  const extractRealImagesOnly = (rawData: any): string[] => {
    console.log("🖼️ EXTRACTING REAL IMAGES ONLY:")

    const images: string[] = []

    // Extract from main images in API
    if (rawData.images && Array.isArray(rawData.images)) {
      images.push(...rawData.images.filter(Boolean))
    }
    if (rawData.image) {
      images.push(rawData.image)
    }

    // Extract from destinations in API
    if (rawData.destinations && Array.isArray(rawData.destinations)) {
      rawData.destinations.forEach((dest: any) => {
        if (dest.images && Array.isArray(dest.images)) {
          images.push(...dest.images.filter(Boolean))
        }
        if (dest.image) {
          images.push(dest.image)
        }
      })
    }

    // Extract from hotels in API
    if (rawData.hotels && Array.isArray(rawData.hotels)) {
      rawData.hotels.forEach((hotel: any) => {
        if (hotel.images && Array.isArray(hotel.images)) {
          images.push(...hotel.images.filter(Boolean))
        }
        if (hotel.image) {
          images.push(hotel.image)
        }
      })
    }

    // Extract from tripSpots in API
    if (rawData.tripSpots && Array.isArray(rawData.tripSpots)) {
      rawData.tripSpots.forEach((spot: any) => {
        if (spot.images && Array.isArray(spot.images)) {
          images.push(...spot.images.filter(Boolean))
        }
        if (spot.image) {
          images.push(spot.image)
        }
      })
    }

    const uniqueImages = [...new Set(images)]
    console.log("🖼️ REAL images found:", uniqueImages.length)
    return uniqueImages
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-lg">🔍 ECHTE Travel Compositor data laden...</p>
          <p className="text-sm text-gray-500 mt-2">ID: {id}</p>
          <p className="text-xs text-gray-400 mt-1">Geen fallbacks - alleen API data</p>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Fout bij laden Travel Compositor data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{state.error}</p>
            <Button onClick={() => loadRealTravelCompositorData()} className="w-full">
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
      <div className="relative h-96 bg-gradient-to-r from-green-800 to-green-600">
        {data.images.length > 0 && (
          <Image
            src={data.images[0] || "/placeholder.svg"}
            alt={data.title || "Travel Idea"}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <div className="text-white">
            <div className="flex items-center mb-2">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="text-sm">{data.destinations[0] || "Locatie niet beschikbaar"}</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{data.title || `Travel Idea ${data.id}`}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Badge className="bg-orange-600 hover:bg-orange-700">Autorondreisplanner</Badge>
              {data.startDate && <span>Dit reisidee is gemaakt op: {formatFullDate(data.startDate)}</span>}
              {data.startDate && <span>Vertrek: {formatFullDate(data.startDate)}</span>}
              <span>Ref ID: {data.id}</span>
            </div>

            <Button className="mt-4 bg-orange-600 hover:bg-orange-700">Deel deze reis</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Destinations */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Bestemmingen:</h3>
                  <p className="text-gray-600">
                    {data.destinations.length > 0
                      ? data.destinations.join(", ")
                      : "Geen bestemmingen beschikbaar in API"}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Thema</h3>
                  {data.theme ? (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      {data.theme}
                    </Badge>
                  ) : (
                    <p className="text-gray-500 text-sm">Geen thema beschikbaar in API</p>
                  )}
                </div>
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
                  <p className="text-gray-500 italic">Geen beschrijving beschikbaar in Travel Compositor API</p>
                )}
              </CardContent>
            </Card>

            {/* Day by Day Itinerary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="w-5 h-5 mr-2" />
                  Van dag tot dag
                  <Button variant="outline" size="sm" className="ml-auto">
                    Bekijk route in Google Maps
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.itinerary.length > 0 ? (
                  <div className="space-y-6">
                    {data.itinerary.map((day, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-6 relative">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-orange-600 rounded-full"></div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center mb-1">
                                <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-bold">
                                  {String(day.day).padStart(2, "0")}
                                </span>
                                <span className="ml-3 font-semibold">{day.title || `Dag ${day.day}`}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Vertrek
                            </Button>
                          </div>

                          {day.transport && (
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                  <span className="text-green-600 text-xs">✈️</span>
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {day.transport.company || "Vervoer"}{" "}
                                    {day.transport.flightNumber && `- ${day.transport.flightNumber}`}
                                  </p>
                                  {day.transport.departure.time && (
                                    <p className="text-xs">
                                      {day.transport.departure.time} - {day.transport.departure.airport}{" "}
                                      {day.transport.departure.code && `(${day.transport.departure.code})`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {day.accommodation && (
                            <div className="mb-3 text-sm text-gray-600">
                              {day.accommodation.name && (
                                <p>
                                  <strong>Accommodatie:</strong> {day.accommodation.name}
                                </p>
                              )}
                              {day.accommodation.location && (
                                <p>
                                  <strong>Locatie:</strong> {day.accommodation.location}
                                </p>
                              )}
                            </div>
                          )}

                          {day.activities.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Activiteiten:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {day.activities.map((activity, actIndex) => (
                                  <li key={actIndex}>• {activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Geen itinerary beschikbaar in Travel Compositor API</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Totale prijs o.v.v. wijzigingen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  {data.price.amount !== null ? (
                    <div className="text-4xl font-bold text-orange-600">
                      {data.price.amount.toLocaleString()} {data.price.currency || "EUR"}
                    </div>
                  ) : (
                    <div className="text-lg text-gray-500">Prijs niet beschikbaar in API</div>
                  )}
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700 mb-4">Ik wil meer informatie!</Button>
              </CardContent>
            </Card>

            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle>Reisoverzicht</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-gray-500" />
                  <span>
                    {data.travelers !== null ? `${data.travelers} Volwassenen` : "Aantal reizigers niet beschikbaar"}
                  </span>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                  <span>
                    {data.startDate && data.endDate
                      ? `${formatFullDate(data.startDate)} - ${formatFullDate(data.endDate)}`
                      : "Datums niet beschikbaar in API"}
                  </span>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-gray-500" />
                  <span>
                    {data.duration.nights !== null ? `${data.duration.nights} nachten` : "Duur niet beschikbaar"}
                  </span>
                </div>

                {data.distance !== null && (
                  <div className="flex items-center">
                    <Car className="w-5 h-5 mr-3 text-gray-500" />
                    <span>{data.distance} Kilometers</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle>Dit voorstel bestaat uit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {data.destinations.length > 0 && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                      <span>Bestemmingen ({data.destinations.length})</span>
                    </div>
                  )}
                  {data.rawApiData.hotels && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                      <span>Accommodaties ({data.rawApiData.hotels.length})</span>
                    </div>
                  )}
                  {data.rawApiData.transports && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                      <span>Vervoer ({data.rawApiData.transports.length})</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Debug Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs text-gray-500">API Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>API Keys: {Object.keys(data.rawApiData).join(", ")}</p>
                  <p>Images: {data.images.length}</p>
                  <p>Itinerary: {data.itinerary.length} dagen</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
