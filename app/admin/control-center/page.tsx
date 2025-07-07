"use client"
import { useState } from "react"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  Brain,
  Bug,
  CheckCircle,
  Clock,
  CreditCard,
  Database,
  Home,
  Plane,
  Rocket,
  Settings,
  Users,
  Hotel,
  Car,
  Ticket,
  Ship,
  MapPin,
  FileText,
  Search,
  Zap,
  Shield,
  Crown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// ––––– OPTIONAL / LAZY-LOADED COMPONENTS ––––– //
import GPTBuilderInterface from "@/components/gpt-builder-interface"
import GPTAutoGenerator from "@/components/gpt-auto-generator"
import GPTBackupManager from "@/components/gpt-backup-manager"
import OpportunityMatrix from "@/components/opportunity-matrix"
import MicrositeCredentialsTester from "@/components/microsite-credentials-tester"
import FeatureManagementDashboard from "@/components/feature-management-dashboard"

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const kpis = [
    { title: "Total Users", value: "1 234", change: "+12%", icon: Users },
    { title: "Active Sessions", value: "89", change: "+5%", icon: Activity },
    { title: "Database Size", value: "2.4 GB", change: "+8%", icon: Database },
    { title: "Response Time", value: "245 ms", change: "-3%", icon: Clock },
  ]

  const recent = [
    { action: "User registration", user: "john@example.com", time: "2 min ago", ok: true },
    { action: "GPT generation", user: "admin@travel.com", time: "5 min ago", ok: true },
    { action: "Database backup", user: "system", time: "1 h ago", ok: true },
    { action: "API throttling", user: "api@client.com", time: "2 h ago", ok: false },
  ]

  const colorByChange = (c: string) => (c.startsWith("+") ? "text-green-600" : "text-red-600")
  const statusBadge = (ok: boolean) =>
    ok ? <Badge variant="default">OK</Badge> : <Badge variant="destructive">WARN</Badge>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                  Super-Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Full system oversight & Travel Compositor API management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-red-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
                <Crown className="h-4 w-4 mr-1" />
                Super Admin
              </Badge>
              <Link href="/agent-dashboard">
                <Button className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 px-6 py-3">
                  <Home className="w-4 h-4 mr-2" />🏠 Agent HQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-8 w-full bg-white rounded-2xl shadow-lg p-2">
            <TabsTrigger
              value="overview"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              📊 Overview
            </TabsTrigger>
            <TabsTrigger
              value="travel-api"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              🌍 Travel API
            </TabsTrigger>
            <TabsTrigger
              value="gpt-builder"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              🤖 GPT Builder
            </TabsTrigger>
            <TabsTrigger
              value="gpt-auto"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              🚀 Auto Gen
            </TabsTrigger>
            <TabsTrigger
              value="backup"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              💾 Backup
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              ⚙️ System
            </TabsTrigger>
            <TabsTrigger
              value="todo"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              📋 Todo
            </TabsTrigger>
            <TabsTrigger
              value="opportunities"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              💡 Opportunities
            </TabsTrigger>
            <TabsTrigger
              value="microsites"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              🌐 Microsites
            </TabsTrigger>
            <TabsTrigger
              value="feature-management"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
            >
              🎯 Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map(({ title, value, change, icon: Icon }) => (
                <Card
                  key={title}
                  className="bg-white rounded-3xl shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 transform hover:scale-105"
                >
                  <CardContent className="p-6 flex justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{title}</p>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className={`text-sm ${colorByChange(change)}`}>{change}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <Activity className="w-5 h-5" />
                  Recent activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recent.map(({ action, user, time, ok }, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 rounded-2xl px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex gap-2 items-center">
                      {ok ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">{action}</p>
                        <p className="text-xs text-gray-500">{user}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {statusBadge(ok)}
                      <span className="text-xs">{time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <BugFixes />
            <SuccessfulImplementations />
          </TabsContent>

          <TabsContent value="travel-api">
            <TravelCompositorAPIOverview />
          </TabsContent>

          <TabsContent value="gpt-builder">
            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-3xl">
                <CardTitle className="flex gap-2 items-center">
                  <Brain className="w-5 h-5" />
                  GPT Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <GPTBuilderInterface />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gpt-auto">
            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-3xl">
                <CardTitle className="flex gap-2 items-center">
                  <Rocket className="w-5 h-5" />
                  GPT Auto-Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <GPTAutoGenerator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup">
            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-t-3xl">
                <CardTitle className="flex gap-2 items-center">
                  <Database className="w-5 h-5" />
                  GPT Backups
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <GPTBackupManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-3xl">
                <CardTitle className="flex gap-2 items-center">
                  <Settings className="w-5 h-5" />
                  System settings
                </CardTitle>
                <CardDescription className="text-indigo-100">Configure API keys &amp; DB.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-500 text-sm">Settings UI komt hier …</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="todo">
            <PageOverview />
          </TabsContent>
          <TabsContent value="opportunities">
            <OpportunityMatrix />
          </TabsContent>
          <TabsContent value="microsites">
            <MicrositeCredentialsTester />
          </TabsContent>
          <TabsContent value="feature-management">
            <FeatureManagementDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function TravelCompositorAPIOverview() {
  const [tab, setTab] = useState<"endpoints" | "schemas" | "opportunities" | "performance">("endpoints")

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-3xl shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-t-3xl">
          <CardTitle className="flex gap-2 items-center">
            <Plane className="w-5 h-5" />
            Travel Compositor API - Complete Documentation
          </CardTitle>
          <CardDescription className="text-green-100">
            Alle endpoints, schemas en strategische mogelijkheden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "endpoints", label: "🔗 Endpoints", color: "from-blue-500 to-blue-600" },
              { id: "schemas", label: "🔧 Schemas", color: "from-green-500 to-green-600" },
              { id: "opportunities", label: "💡 Opportunities", color: "from-purple-500 to-purple-600" },
              { id: "performance", label: "⚡ Performance", color: "from-orange-500 to-orange-600" },
            ].map((item) => (
              <Button
                key={item.id}
                size="sm"
                onClick={() => setTab(item.id as any)}
                className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 ${
                  tab === item.id
                    ? `bg-gradient-to-r ${item.color} text-white`
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {tab === "endpoints" && <EndpointsOverview />}
          {tab === "schemas" && <SchemasOverview />}
          {tab === "opportunities" && <StrategicOpportunities />}
          {tab === "performance" && <PerformanceOptimizations />}
        </CardContent>
      </Card>
    </div>
  )
}

function EndpointsOverview() {
  const endpointCategories = [
    {
      category: "Booking Management",
      icon: FileText,
      endpoints: [
        {
          method: "GET",
          path: "/resources/booking/getBookings",
          description: "Alle bookings ophalen (paginatie)",
          status: "✅",
        },
        {
          method: "GET",
          path: "/resources/booking/{bookingReference}",
          description: "Specifieke booking details",
          status: "✅",
        },
        {
          method: "GET",
          path: "/resources/booking/{bookingReference}/accommodations/{accommodationBookingReference}",
          description: "Hotel details",
          status: "✅",
        },
        {
          method: "GET",
          path: "/resources/booking/{bookingReference}/transports/{transportBookingReference}",
          description: "Transport details",
          status: "✅",
        },
        {
          method: "GET",
          path: "/resources/booking/{bookingReference}/tickets/{ticketBookingReference}",
          description: "Ticket details",
          status: "✅",
        },
        {
          method: "GET",
          path: "/resources/booking/{bookingReference}/cancellation-fee",
          description: "Annuleringskosten",
          status: "✅",
        },
      ],
    },
    {
      category: "Accommodation Services",
      icon: Hotel,
      endpoints: [
        { method: "GET", path: "/resources/accommodations", description: "Actieve accommodaties", status: "✅" },
        {
          method: "GET",
          path: "/resources/accommodations/{accommodationId}/datasheet",
          description: "Hotel datasheet",
          status: "✅",
        },
        {
          method: "GET",
          path: "/resources/accommodations/preferred/{micrositeId}",
          description: "Preferred hotels",
          status: "✅",
        },
        { method: "GET", path: "/resources/hotel/{supplierId}", description: "Hotels per supplier", status: "✅" },
        {
          method: "GET",
          path: "/resources/hotel/{supplierId}/{providerCode}",
          description: "Hotel details",
          status: "✅",
        },
      ],
    },
    {
      category: "Transport Services",
      icon: Car,
      endpoints: [
        { method: "GET", path: "/resources/transportbases", description: "Transport bases", status: "✅" },
        {
          method: "GET",
          path: "/resources/transportbases/{code}",
          description: "Transport base details",
          status: "✅",
        },
        {
          method: "GET",
          path: "/resources/airline/{micrositeId}",
          description: "Airlines per microsite",
          status: "✅",
        },
        { method: "POST", path: "/resources/transports/quote", description: "Transport quote", status: "🔄" },
        { method: "POST", path: "/resources/transports/book", description: "Transport booking", status: "🔄" },
      ],
    },
    {
      category: "Activity & Tickets",
      icon: Ticket,
      endpoints: [
        {
          method: "GET",
          path: "/resources/ticket/datasheet/{micrositeId}/{ticketId}",
          description: "Ticket datasheet",
          status: "✅",
        },
        {
          method: "GET",
          path: "/resources/ticket/preferred/{micrositeId}",
          description: "Preferred tickets",
          status: "✅",
        },
        { method: "POST", path: "/resources/tickets/quote", description: "Ticket quote", status: "🔄" },
      ],
    },
    {
      category: "Cruise Services",
      icon: Ship,
      endpoints: [
        { method: "GET", path: "/resources/cruise/{micrositeId}", description: "Alle cruises", status: "✅" },
        {
          method: "GET",
          path: "/resources/cruise/{micrositeId}/{cruiseId}/departures",
          description: "Cruise departures",
          status: "✅",
        },
        {
          method: "GET",
          path: "/resources/cruise/{cruiseId}/itinerary",
          description: "Cruise itinerary",
          status: "✅",
        },
        { method: "GET", path: "/resources/cruise/{micrositeId}/ship", description: "Cruise ships", status: "✅" },
        { method: "GET", path: "/resources/cruise/port", description: "Cruise ports", status: "✅" },
      ],
    },
    {
      category: "Destination Management",
      icon: MapPin,
      endpoints: [
        {
          method: "GET",
          path: "/resources/destination/countries/{micrositeId}",
          description: "Landen per microsite",
          status: "✅",
        },
        { method: "GET", path: "/resources/destination/{micrositeId}", description: "Bestemmingen", status: "✅" },
        {
          method: "GET",
          path: "/resources/destination/{micrositeId}/{destinationId}",
          description: "Bestemming details",
          status: "✅",
        },
        { method: "GET", path: "/resources/facilities", description: "Alle faciliteiten", status: "✅" },
        { method: "GET", path: "/resources/mealplan/{micrositeId}", description: "Maaltijdplannen", status: "✅" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {endpointCategories.map((category) => {
        const Icon = category.icon
        return (
          <Card key={category.category} className="bg-white rounded-3xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.endpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>{endpoint.method}</Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{endpoint.description}</span>
                      <span className="text-lg">{endpoint.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function SchemasOverview() {
  const schemaCategories = [
    {
      name: "Booking Schemas",
      schemas: [
        "ApiBookingVO - Complete booking object",
        "ApiHotelServiceVO - Hotel service details",
        "ApiTransportServiceVO - Transport service details",
        "ApiTicketServiceVO - Ticket service details",
        "MoneyVO - Price/currency objects",
        "ApiContactPersonVO - Contact person details",
      ],
    },
    {
      name: "Accommodation Schemas",
      schemas: [
        "ApiAccommodationDataSheetVO - Hotel datasheet",
        "ApiAccommodationCombinationVO - Hotel combinations",
        "ApiHotelDataVO - Hotel master data",
        "ApiRoomVO - Room details",
        "ApiFacilityVO - Hotel facilities",
      ],
    },
    {
      name: "Transport Schemas",
      schemas: [
        "ApiTransportBaseVO - Transport base info",
        "ApiFlightSegmentVO - Flight segment details",
        "ApiAirlineVO - Airline information",
        "ApiBaggageVO - Baggage details",
      ],
    },
    {
      name: "Destination Schemas",
      schemas: [
        "ApiDestinationVO - Destination details",
        "ApiCountryVO - Country information",
        "ApiMealPlanVO - Meal plan details",
        "ApiThemeVO - Travel themes",
      ],
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {schemaCategories.map((category) => (
        <Card key={category.name} className="bg-white rounded-3xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg">{category.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {category.schemas.map((schema) => (
                <div key={schema} className="p-2 bg-blue-50 rounded-xl text-sm">
                  <code>{schema}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function StrategicOpportunities() {
  const opportunities = [
    {
      title: "🏨 AI Hotel Recommendation Engine",
      impact: "HIGH",
      effort: "MEDIUM",
      revenue: "Commission + Subscription",
      description:
        "Intelligente hotel aanbevelingen op basis van reisgeschiedenis, voorkeuren en real-time beschikbaarheid",
      stack: ["Travel Compositor API", "OpenAI GPT-4", "Vector Database", "Next.js"],
      features: ["Persoonlijke aanbevelingen", "Real-time prijzen", "Beschikbaarheidscheck", "Review integratie"],
    },
    {
      title: "🤖 Complete Travel Concierge",
      impact: "MAX",
      effort: "HIGH",
      revenue: "Subscription + Transaction fees",
      description: "AI-powered travel assistant die complete reizen plant, boekt en beheert via natuurlijke taal",
      stack: ["Travel Compositor API", "OpenAI GPT-4o", "Function Calling", "Real-time booking"],
      features: ["Natuurlijke taal planning", "Automatisch boeken", "Real-time updates", "24/7 support"],
    },
    {
      title: "📊 Travel Analytics Dashboard",
      impact: "MEDIUM",
      effort: "LOW",
      revenue: "SaaS subscription",
      description:
        "Business intelligence dashboard voor travel agencies met booking trends, revenue analytics en performance metrics",
      stack: ["Travel Compositor API", "Chart.js", "Data aggregation", "Export tools"],
      features: ["Revenue tracking", "Booking trends", "Client analytics", "Performance KPIs"],
    },
    {
      title: "🚀 Dynamic Pricing Engine",
      impact: "HIGH",
      effort: "HIGH",
      revenue: "Revenue share",
      description:
        "Machine learning model voor dynamische prijsstelling op basis van vraag, seizoen, concurrentie en beschikbaarheid",
      stack: ["Travel Compositor API", "ML models", "Real-time data", "Price optimization"],
      features: ["Demand forecasting", "Competitor analysis", "Seasonal adjustments", "Profit optimization"],
    },
    {
      title: "📱 White-label Travel App",
      impact: "HIGH",
      effort: "MEDIUM",
      revenue: "License + Revenue share",
      description: "Complete white-label travel booking app voor agencies met hun eigen branding en commissiestructuur",
      stack: ["React Native", "Travel Compositor API", "Payment integration", "Push notifications"],
      features: ["Custom branding", "Mobile booking", "Offline access", "Push notifications"],
    },
    {
      title: "🔄 Multi-supplier Comparison",
      impact: "MEDIUM",
      effort: "MEDIUM",
      revenue: "Commission optimization",
      description: "Vergelijk prijzen en beschikbaarheid across multiple suppliers en kies automatisch de beste optie",
      stack: ["Multiple APIs", "Price comparison", "Availability check", "Auto-selection"],
      features: ["Price comparison", "Quality scoring", "Auto-booking", "Supplier management"],
    },
  ]

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "MAX":
        return "bg-red-100 text-red-800"
      case "HIGH":
        return "bg-orange-100 text-orange-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "LOW":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "HIGH":
        return "bg-red-100 text-red-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "LOW":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid gap-6">
      {opportunities.map((opportunity) => (
        <Card key={opportunity.title} className="border-l-4 border-blue-500 bg-white rounded-3xl shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{opportunity.title}</CardTitle>
              <div className="flex gap-2">
                <Badge className={getImpactColor(opportunity.impact)}>Impact: {opportunity.impact}</Badge>
                <Badge className={getEffortColor(opportunity.effort)}>Effort: {opportunity.effort}</Badge>
              </div>
            </div>
            <CardDescription>{opportunity.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Revenue Model: {opportunity.revenue}</span>
            </div>

            <div>
              <h4 className="font-medium mb-2">Tech Stack:</h4>
              <div className="flex gap-1 flex-wrap">
                {opportunity.stack.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Key Features:</h4>
              <div className="grid grid-cols-2 gap-1 text-sm">
                {opportunity.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PerformanceOptimizations() {
  const optimizations = [
    {
      area: "Booking Search",
      icon: Search,
      current: "Linear search through all bookings",
      optimized: "Reverse chronological search + caching",
      improvement: "90% faster",
      implementation: "Start from highest booking IDs, cache recent results",
    },
    {
      area: "Data Extraction",
      icon: Zap,
      current: "Manual field mapping",
      optimized: "Automated schema-based extraction",
      improvement: "100% accuracy",
      implementation: "Use Travel Compositor schemas for reliable data parsing",
    },
    {
      area: "API Calls",
      icon: Database,
      current: "Sequential API calls",
      optimized: "Parallel requests + connection pooling",
      improvement: "70% faster",
      implementation: "Batch requests, reuse connections, smart retries",
    },
    {
      area: "Image Loading",
      icon: FileText,
      current: "On-demand image fetching",
      optimized: "Preload + CDN caching",
      improvement: "80% faster",
      implementation: "Preload hotel images, use CDN, lazy loading",
    },
  ]

  return (
    <div className="space-y-4">
      {optimizations.map((opt) => {
        const Icon = opt.icon
        return (
          <Card key={opt.area} className="bg-white rounded-3xl shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{opt.area}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current:</p>
                      <p className="text-sm bg-red-50 p-2 rounded-xl">{opt.current}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Optimized:</p>
                      <p className="text-sm bg-green-50 p-2 rounded-xl">{opt.optimized}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-800">{opt.improvement} improvement</Badge>
                    <p className="text-sm text-gray-600">{opt.implementation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function BugFixes() {
  const fixes = [
    "🔧 Roadbook data extraction - Fixed hotel/transport parsing",
    "🔧 Search optimization - Reverse chronological booking search",
    "🔧 Client data mapping - Proper contactPerson extraction",
    "🔧 Price display - Correct currency formatting",
    "🔧 TypeScript types - Fixed syntax error in travel-compositor-types.ts",
    "✅ Import Travel Compositor PERFECT - 24-04-2025 om 22:43 - /import-v2 werkt 100%",
  ]
  return (
    <Card className="bg-white rounded-3xl shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <Bug className="w-5 h-5" />
          Critical Fixes Applied
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 md:grid-cols-2">
        {fixes.map((f) => (
          <div key={f} className="flex items-center gap-2 bg-green-50 rounded-2xl p-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">{f}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function SuccessfulImplementations() {
  const successes = [
    {
      title: "🚀 Import Travel Compositor V2",
      date: "24-04-2025 om 22:43",
      url: "/import-v2",
      description: "Perfect werkende import voor Bookings, Travel Ideas & Holiday Packages",
      features: ["Cache-busting", "Correcte API routing", "Real-time feedback", "3 content types"],
    },
  ]

  return (
    <Card className="bg-white rounded-3xl shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Successful Implementations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {successes.map((success) => (
          <div key={success.title} className="p-4 bg-green-50 rounded-2xl border-l-4 border-green-500">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{success.title}</h3>
              <Badge className="bg-green-100 text-green-800">{success.date}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{success.description}</p>
            <div className="flex items-center gap-2 mb-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{success.url}</code>
            </div>
            <div className="flex gap-1 flex-wrap">
              {success.features.map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function PageOverview() {
  return (
    <Card className="bg-white rounded-3xl shadow-xl border-0">
      <CardHeader>
        <CardTitle>Todo Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Todo items will be displayed here...</p>
      </CardContent>
    </Card>
  )
}
