"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Home,
  Bot,
  FileText,
  Brain,
  ArrowRight,
  CheckCircle,
  Circle,
  LinkIcon,
  Sparkles,
  MapPin,
  Plus,
  X,
  Hotel,
  Plane,
} from "lucide-react"

export default function TravelBuddyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([])
  const [urls, setUrls] = useState<string[]>([""])

  // Booking Information
  const [bookingData, setBookingData] = useState({
    bookingReference: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    destination: "",
    startDate: "",
    endDate: "",
    totalPrice: "",
    currency: "EUR",
    travelers: "",
    tripType: "",
  })

  // Hotels
  const [hotels, setHotels] = useState([
    {
      name: "",
      address: "",
      checkIn: "",
      checkOut: "",
      roomType: "",
      nights: "",
      pricePerNight: "",
    },
  ])

  // Activities
  const [activities, setActivities] = useState([
    {
      name: "",
      date: "",
      time: "",
      location: "",
      description: "",
      price: "",
    },
  ])

  // Transport
  const [transports, setTransports] = useState([
    {
      type: "flight", // flight, train, bus, car
      from: "",
      to: "",
      date: "",
      time: "",
      details: "",
    },
  ])

  const [gptInstructions, setGptInstructions] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")

  const steps = [
    {
      id: 1,
      title: "Booking Details",
      description: "Vul alle booking informatie in",
      icon: <FileText className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      title: "Hotels & Accommodatie",
      description: "Voeg hotels en verblijven toe",
      icon: <Hotel className="h-6 w-6" />,
      color: "from-green-500 to-green-600",
    },
    {
      id: 3,
      title: "Activiteiten & Transport",
      description: "Voeg activiteiten en vervoer toe",
      icon: <Plane className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: 4,
      title: "AI Configuratie",
      description: "Stel AI instructies in",
      icon: <Brain className="h-6 w-6" />,
      color: "from-orange-500 to-orange-600",
    },
    {
      id: 5,
      title: "Link Genereren",
      description: "Maak TravelBuddy link",
      icon: <LinkIcon className="h-6 w-6" />,
      color: "from-pink-500 to-pink-600",
    },
  ]

  const handleDocumentUpload = (files: FileList) => {
    const fileNames = Array.from(files).map((file) => file.name)
    setUploadedDocuments((prev) => [...prev, ...fileNames])
  }

  const addUrl = () => {
    setUrls((prev) => [...prev, ""])
  }

  const updateUrl = (index: number, value: string) => {
    setUrls((prev) => prev.map((url, i) => (i === index ? value : url)))
  }

  const removeUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const addHotel = () => {
    setHotels((prev) => [
      ...prev,
      {
        name: "",
        address: "",
        checkIn: "",
        checkOut: "",
        roomType: "",
        nights: "",
        pricePerNight: "",
      },
    ])
  }

  const updateHotel = (index: number, field: string, value: string) => {
    setHotels((prev) => prev.map((hotel, i) => (i === index ? { ...hotel, [field]: value } : hotel)))
  }

  const removeHotel = (index: number) => {
    setHotels((prev) => prev.filter((_, i) => i !== index))
  }

  const addActivity = () => {
    setActivities((prev) => [
      ...prev,
      {
        name: "",
        date: "",
        time: "",
        location: "",
        description: "",
        price: "",
      },
    ])
  }

  const updateActivity = (index: number, field: string, value: string) => {
    setActivities((prev) => prev.map((activity, i) => (i === index ? { ...activity, [field]: value } : activity)))
  }

  const removeActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index))
  }

  const addTransport = () => {
    setTransports((prev) => [
      ...prev,
      {
        type: "flight",
        from: "",
        to: "",
        date: "",
        time: "",
        details: "",
      },
    ])
  }

  const updateTransport = (index: number, field: string, value: string) => {
    setTransports((prev) => prev.map((transport, i) => (i === index ? { ...transport, [field]: value } : transport)))
  }

  const removeTransport = (index: number) => {
    setTransports((prev) => prev.filter((_, i) => i !== index))
  }

  const generateTravelBuddyLink = async () => {
    try {
      const linkId = Math.random().toString(36).substring(2, 15)
      const link = `${window.location.origin}/travelbuddy/${linkId}`
      setGeneratedLink(link)

      // Save complete configuration
      const config = {
        id: linkId,
        documents: uploadedDocuments,
        urls: urls.filter((url) => url.trim()),
        booking: bookingData,
        hotels: hotels.filter((hotel) => hotel.name.trim()),
        activities: activities.filter((activity) => activity.name.trim()),
        transports: transports.filter((transport) => transport.from.trim() && transport.to.trim()),
        gptInstructions,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

      // Save to localStorage (in production: save to database)
      localStorage.setItem(`travelbuddy-${linkId}`, JSON.stringify(config))
    } catch (error) {
      console.error("Error creating TravelBuddy:", error)
      alert("Er ging iets mis bij het aanmaken van de TravelBuddy")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  TravelBuddy Generator
                </h1>
                <p className="text-sm text-gray-600">Maak een persoonlijke reis-assistent voor je klanten</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                <Brain className="h-4 w-4 mr-1" />
                AI Powered
              </Badge>
              <Link href="/agent-dashboard">
                <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 px-6 py-3">
                  <Home className="w-4 h-4 mr-2" />
                  Agent HQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center mb-12 overflow-x-auto">
          <div className="flex items-center space-x-2 min-w-max">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center space-x-2 p-3 rounded-2xl transition-all duration-300 ${
                    currentStep === step.id
                      ? `bg-gradient-to-r ${step.color} text-white shadow-lg scale-105`
                      : currentStep > step.id
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : currentStep === step.id ? (
                    step.icon
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                  <div className="hidden md:block">
                    <div className="font-semibold text-xs">{step.title}</div>
                  </div>
                </div>
                {index < steps.length - 1 && <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-3xl p-6">
                <CardTitle className="text-xl font-bold flex items-center">
                  <FileText className="h-6 w-6 mr-3" />
                  Booking Details
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Vul alle booking informatie in voor de TravelBuddy
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Booking Referentie</Label>
                    <Input
                      value={bookingData.bookingReference}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, bookingReference: e.target.value }))}
                      placeholder="TC-2024-001"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Bestemming</Label>
                    <Input
                      value={bookingData.destination}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, destination: e.target.value }))}
                      placeholder="Parijs, Frankrijk"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Klant Naam</Label>
                    <Input
                      value={bookingData.clientName}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, clientName: e.target.value }))}
                      placeholder="Jan & Marie Jansen"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Klant Email</Label>
                    <Input
                      type="email"
                      value={bookingData.clientEmail}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, clientEmail: e.target.value }))}
                      placeholder="jan.jansen@email.com"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Klant Telefoon</Label>
                    <Input
                      value={bookingData.clientPhone}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, clientPhone: e.target.value }))}
                      placeholder="+31 6 12345678"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Aantal Reizigers</Label>
                    <Input
                      value={bookingData.travelers}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, travelers: e.target.value }))}
                      placeholder="2 volwassenen, 1 kind"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Startdatum</Label>
                    <Input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Einddatum</Label>
                    <Input
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Totaalprijs</Label>
                    <Input
                      type="number"
                      value={bookingData.totalPrice}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, totalPrice: e.target.value }))}
                      placeholder="1250"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Type Reis</Label>
                    <Input
                      value={bookingData.tripType}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, tripType: e.target.value }))}
                      placeholder="Romantische stedentrip"
                      className="mt-2 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  disabled={!bookingData.clientName || !bookingData.destination}
                >
                  Volgende Stap: Hotels & Accommodatie
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl p-6">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Hotel className="h-6 w-6 mr-3" />
                  Hotels & Accommodatie
                </CardTitle>
                <CardDescription className="text-green-100">
                  Voeg alle hotels en verblijven toe aan de reis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {hotels.map((hotel, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-2xl bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800">Hotel {index + 1}</h4>
                      {hotels.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => removeHotel(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Hotel Naam</Label>
                        <Input
                          value={hotel.name}
                          onChange={(e) => updateHotel(index, "name", e.target.value)}
                          placeholder="Hotel des Grands Boulevards"
                          className="mt-1 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Adres</Label>
                        <Input
                          value={hotel.address}
                          onChange={(e) => updateHotel(index, "address", e.target.value)}
                          placeholder="17 Boulevard Poissonnière, 75002 Paris"
                          className="mt-1 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Check-in</Label>
                        <Input
                          type="date"
                          value={hotel.checkIn}
                          onChange={(e) => updateHotel(index, "checkIn", e.target.value)}
                          className="mt-1 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Check-out</Label>
                        <Input
                          type="date"
                          value={hotel.checkOut}
                          onChange={(e) => updateHotel(index, "checkOut", e.target.value)}
                          className="mt-1 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Kamertype</Label>
                        <Input
                          value={hotel.roomType}
                          onChange={(e) => updateHotel(index, "roomType", e.target.value)}
                          placeholder="Superior Double Room"
                          className="mt-1 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Aantal Nachten</Label>
                        <Input
                          type="number"
                          value={hotel.nights}
                          onChange={(e) => updateHotel(index, "nights", e.target.value)}
                          placeholder="3"
                          className="mt-1 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addHotel}
                  className="w-full rounded-2xl border-dashed bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nog een Hotel Toevoegen
                </Button>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1 rounded-2xl py-3">
                    Vorige Stap
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    Volgende Stap: Activiteiten & Transport
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-3xl p-6">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Plane className="h-6 w-6 mr-3" />
                  Activiteiten & Transport
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Voeg activiteiten en vervoer toe aan de reis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Activities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Activiteiten</h3>
                  {activities.map((activity, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-2xl bg-gray-50 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">Activiteit {index + 1}</h4>
                        {activities.length > 1 && (
                          <Button variant="outline" size="sm" onClick={() => removeActivity(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Activiteit Naam</Label>
                          <Input
                            value={activity.name}
                            onChange={(e) => updateActivity(index, "name", e.target.value)}
                            placeholder="Eiffeltoren Skip-the-Line"
                            className="mt-1 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Locatie</Label>
                          <Input
                            value={activity.location}
                            onChange={(e) => updateActivity(index, "location", e.target.value)}
                            placeholder="Champ de Mars, 5 Avenue Anatole France"
                            className="mt-1 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Datum</Label>
                          <Input
                            type="date"
                            value={activity.date}
                            onChange={(e) => updateActivity(index, "date", e.target.value)}
                            className="mt-1 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Tijd</Label>
                          <Input
                            type="time"
                            value={activity.time}
                            onChange={(e) => updateActivity(index, "time", e.target.value)}
                            className="mt-1 rounded-xl"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium text-gray-700">Beschrijving</Label>
                          <Textarea
                            value={activity.description}
                            onChange={(e) => updateActivity(index, "description", e.target.value)}
                            placeholder="Skip-the-line toegang tot de Eiffeltoren met lift naar de 2e verdieping"
                            className="mt-1 rounded-xl"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addActivity}
                    className="w-full rounded-2xl border-dashed bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nog een Activiteit Toevoegen
                  </Button>
                </div>

                {/* Transport */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Transport</h3>
                  {transports.map((transport, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-2xl bg-gray-50 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">Transport {index + 1}</h4>
                        {transports.length > 1 && (
                          <Button variant="outline" size="sm" onClick={() => removeTransport(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Type</Label>
                          <select
                            value={transport.type}
                            onChange={(e) => updateTransport(index, "type", e.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
                          >
                            <option value="flight">Vlucht</option>
                            <option value="train">Trein</option>
                            <option value="bus">Bus</option>
                            <option value="car">Auto</option>
                            <option value="transfer">Transfer</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Van</Label>
                          <Input
                            value={transport.from}
                            onChange={(e) => updateTransport(index, "from", e.target.value)}
                            placeholder="Amsterdam Schiphol"
                            className="mt-1 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Naar</Label>
                          <Input
                            value={transport.to}
                            onChange={(e) => updateTransport(index, "to", e.target.value)}
                            placeholder="Paris Charles de Gaulle"
                            className="mt-1 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Datum</Label>
                          <Input
                            type="date"
                            value={transport.date}
                            onChange={(e) => updateTransport(index, "date", e.target.value)}
                            className="mt-1 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Tijd</Label>
                          <Input
                            type="time"
                            value={transport.time}
                            onChange={(e) => updateTransport(index, "time", e.target.value)}
                            className="mt-1 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Details</Label>
                          <Input
                            value={transport.details}
                            onChange={(e) => updateTransport(index, "details", e.target.value)}
                            placeholder="KL1234, Terminal 1, Gate A5"
                            className="mt-1 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addTransport}
                    className="w-full rounded-2xl border-dashed bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nog een Transport Toevoegen
                  </Button>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1 rounded-2xl py-3">
                    Vorige Stap
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    Volgende Stap: AI Configuratie
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-3xl p-6">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Brain className="h-6 w-6 mr-3" />
                  AI Instructies & Gedrag
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Configureer hoe de TravelBuddy zich moet gedragen
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label className="text-lg font-semibold text-gray-700 mb-4 block">GPT Instructies</Label>
                  <Textarea
                    value={gptInstructions}
                    onChange={(e) => setGptInstructions(e.target.value)}
                    placeholder={`Je bent een persoonlijke TravelBuddy voor ${bookingData.clientName || "de klant"} tijdens hun reis naar ${bookingData.destination || "hun bestemming"}. 

BOOKING INFORMATIE:
- Booking: ${bookingData.bookingReference || "Nog niet ingevuld"}
- Bestemming: ${bookingData.destination || "Nog niet ingevuld"}
- Periode: ${bookingData.startDate || "Nog niet ingevuld"} tot ${bookingData.endDate || "Nog niet ingevuld"}
- Reizigers: ${bookingData.travelers || "Nog niet ingevuld"}
- Type reis: ${bookingData.tripType || "Nog niet ingevuld"}

HOTELS:
${
  hotels
    .filter((h) => h.name)
    .map((hotel, i) => `${i + 1}. ${hotel.name} - ${hotel.address}`)
    .join("\n") || "Nog geen hotels toegevoegd"
}

ACTIVITEITEN:
${
  activities
    .filter((a) => a.name)
    .map((activity, i) => `${i + 1}. ${activity.name} - ${activity.date} ${activity.time}`)
    .join("\n") || "Nog geen activiteiten toegevoegd"
}

TRANSPORT:
${
  transports
    .filter((t) => t.from && t.to)
    .map(
      (transport, i) =>
        `${i + 1}. ${transport.type}: ${transport.from} → ${transport.to} (${transport.date} ${transport.time})`,
    )
    .join("\n") || "Nog geen transport toegevoegd"
}

GEDRAG:
- Wees vriendelijk, behulpzaam en enthousiast
- Geef praktische, actionable adviezen
- Verwijs naar specifieke hotels, activiteiten en transport uit de booking
- Suggereer alternatieven als iets niet mogelijk is
- Vraag door als je meer informatie nodig hebt
- Gebruik emoji's om je berichten levendiger te maken

Je kunt helpen met:
- Restaurant aanbevelingen rond de hotels
- Praktische tips voor de geplande activiteiten
- Transport en routes tussen locaties
- Lokale gewoonten en cultuur
- Noodgevallen en belangrijke contacten
- Weer en wat aan te trekken
- Budgetbeheer tijdens de reis`}
                    className="rounded-xl"
                    rows={20}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Tips voor goede instructies:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• De AI heeft automatisch toegang tot alle booking details</li>
                    <li>• Wees specifiek over de rol en het gewenste gedrag</li>
                    <li>• Geef duidelijke richtlijnen over wat wel/niet te doen</li>
                    <li>• Voeg voorbeelden toe van gewenste antwoorden</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1 rounded-2xl py-3">
                    Vorige Stap
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(5)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    disabled={!gptInstructions.trim()}
                  >
                    Volgende Stap: Link Genereren
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-t-3xl p-6">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Sparkles className="h-6 w-6 mr-3" />
                  TravelBuddy Link Genereren
                </CardTitle>
                <CardDescription className="text-pink-100">
                  Genereer een unieke link die je klant kan gebruiken tijdens hun reis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {!generatedLink ? (
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <Sparkles className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">Klaar om je TravelBuddy te maken!</h3>
                    <p className="text-gray-600 mb-6">
                      Alle informatie is ingevuld. Klik op de knop hieronder om een unieke TravelBuddy link te
                      genereren.
                    </p>

                    <div className="bg-gray-50 p-4 rounded-xl mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Samenvatting:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Klant:</strong> {bookingData.clientName}
                        </p>
                        <p>
                          <strong>Bestemming:</strong> {bookingData.destination}
                        </p>
                        <p>
                          <strong>Periode:</strong> {bookingData.startDate} - {bookingData.endDate}
                        </p>
                        <p>
                          <strong>Hotels:</strong> {hotels.filter((h) => h.name.trim()).length} hotels
                        </p>
                        <p>
                          <strong>Activiteiten:</strong> {activities.filter((a) => a.name.trim()).length} activiteiten
                        </p>
                        <p>
                          <strong>Transport:</strong> {transports.filter((t) => t.from.trim() && t.to.trim()).length}{" "}
                          vervoersmiddelen
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={generateTravelBuddyLink}
                      className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-2xl px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105"
                    >
                      <Sparkles className="h-6 w-6 mr-3" />
                      Genereer TravelBuddy Link
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <CheckCircle className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-green-800">🎉 TravelBuddy Succesvol Aangemaakt!</h3>

                    <div className="bg-green-50 p-6 rounded-2xl mb-6">
                      <Label className="text-sm font-semibold text-green-800 mb-2 block">Jouw TravelBuddy Link:</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={generatedLink}
                          readOnly
                          className="flex-1 bg-white border-green-200 text-green-800 font-mono text-sm"
                        />
                        <Button
                          onClick={() => copyToClipboard(generatedLink)}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                        >
                          Kopieer
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl mb-6">
                      <h4 className="font-semibold text-blue-800 mb-2">📱 Hoe te gebruiken:</h4>
                      <ul className="text-sm text-blue-700 space-y-1 text-left">
                        <li>• Stuur deze link naar {bookingData.clientName} via email of WhatsApp</li>
                        <li>• De klant kan de link openen op hun telefoon tijdens de reis</li>
                        <li>• De TravelBuddy heeft toegang tot alle booking details</li>
                        <li>• De AI kan realtime vragen beantwoorden en adviezen geven</li>
                      </ul>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentStep(1)
                          setGeneratedLink("")
                          setUploadedDocuments([])
                          setUrls([""])
                          setBookingData({
                            bookingReference: "",
                            clientName: "",
                            clientEmail: "",
                            clientPhone: "",
                            destination: "",
                            startDate: "",
                            endDate: "",
                            totalPrice: "",
                            currency: "EUR",
                            travelers: "",
                            tripType: "",
                          })
                          setHotels([
                            {
                              name: "",
                              address: "",
                              checkIn: "",
                              checkOut: "",
                              roomType: "",
                              nights: "",
                              pricePerNight: "",
                            },
                          ])
                          setActivities([
                            {
                              name: "",
                              date: "",
                              time: "",
                              location: "",
                              description: "",
                              price: "",
                            },
                          ])
                          setTransports([
                            {
                              type: "flight",
                              from: "",
                              to: "",
                              date: "",
                              time: "",
                              details: "",
                            },
                          ])
                          setGptInstructions("")
                        }}
                        className="flex-1 rounded-2xl py-3"
                      >
                        Nieuwe TravelBuddy Maken
                      </Button>
                      <Button
                        onClick={() => window.open(generatedLink, "_blank")}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <MapPin className="h-5 w-5 mr-2" />
                        Test TravelBuddy
                      </Button>
                    </div>
                  </div>
                )}

                {!generatedLink && (
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setCurrentStep(4)} className="flex-1 rounded-2xl py-3">
                      Vorige Stap
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
