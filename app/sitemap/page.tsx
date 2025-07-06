"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  ExternalLink,
  Globe,
  Settings,
  FileText,
  Bot,
  Upload,
  Code,
  TestTube,
  Map,
  Home,
  User,
  Eye,
  Wrench,
  MessageCircle,
  BarChart3,
  Filter,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

export default function SitemapPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Complete sitemap data organized by categories
  const sitemapData = {
    "🏠 Main Pages": {
      icon: <Home className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-700",
      pages: [
        { path: "/", title: "Homepage", description: "AI Travel Studio hoofdpagina", status: "live", access: "public" },
        {
          path: "/about",
          title: "Over Ons",
          description: "Informatie over het platform",
          status: "live",
          access: "public",
        },
        {
          path: "/help",
          title: "Help & Support",
          description: "Hulp en documentatie",
          status: "live",
          access: "public",
        },
        { path: "/privacy", title: "Privacy Policy", description: "Privacybeleid", status: "live", access: "public" },
        {
          path: "/terms",
          title: "Terms of Service",
          description: "Algemene voorwaarden",
          status: "live",
          access: "public",
        },
      ],
    },
    "👤 User & Auth": {
      icon: <User className="h-5 w-5" />,
      color: "bg-green-100 text-green-700",
      pages: [
        {
          path: "/agent-dashboard",
          title: "Agent Dashboard",
          description: "Hoofddashboard voor reisagenten",
          status: "live",
          access: "agent",
        },
        {
          path: "/user-dashboard",
          title: "User Dashboard",
          description: "Gebruikersdashboard",
          status: "live",
          access: "user",
        },
        {
          path: "/admin-login",
          title: "Admin Login",
          description: "Inlogpagina voor beheerders",
          status: "live",
          access: "public",
        },
        {
          path: "/secure-user-import",
          title: "Secure User Import",
          description: "Veilige gebruikersimport",
          status: "live",
          access: "admin",
        },
      ],
    },
    "🔧 Admin & Control": {
      icon: <Settings className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-700",
      pages: [
        {
          path: "/admin/control-center",
          title: "Control Center",
          description: "Hoofdbeheercentrum",
          status: "live",
          access: "admin",
        },
        {
          path: "/master-dashboard",
          title: "Master Dashboard",
          description: "Master overzichtsdashboard",
          status: "live",
          access: "admin",
        },
        {
          path: "/demo-dashboard",
          title: "Demo Dashboard",
          description: "Demo versie van dashboard",
          status: "demo",
          access: "public",
        },
      ],
    },
    "🤖 AI Tools": {
      icon: <Bot className="h-5 w-5" />,
      color: "bg-pink-100 text-pink-700",
      pages: [
        {
          path: "/travel-generator",
          title: "Travel Content Generator",
          description: "AI content generator voor reizen",
          status: "live",
          access: "agent",
        },
        {
          path: "/travelbuddy",
          title: "Travel Buddy",
          description: "AI chatbot beheer",
          status: "live",
          access: "agent",
        },
        {
          path: "/travelbuddy-example",
          title: "Travel Buddy Example",
          description: "Voorbeeld van travel buddy",
          status: "demo",
          access: "public",
        },
        {
          path: "/gpt-builder",
          title: "GPT Builder",
          description: "Custom GPT builder interface",
          status: "beta",
          access: "agent",
        },
        {
          path: "/agent-travelbuddy-generator",
          title: "Agent Travel Buddy Generator",
          description: "Generator voor agent travel buddies",
          status: "live",
          access: "agent",
        },
      ],
    },
    "📥 Import & Data": {
      icon: <Upload className="h-5 w-5" />,
      color: "bg-orange-100 text-orange-700",
      pages: [
        { path: "/import", title: "Data Import", description: "Hoofdimport pagina", status: "live", access: "agent" },
        {
          path: "/import-v2",
          title: "Import V2",
          description: "Verbeterde import interface",
          status: "beta",
          access: "agent",
        },
        {
          path: "/universal-import",
          title: "Universal Import",
          description: "Universele import wizard",
          status: "live",
          access: "agent",
        },
        {
          path: "/selective-import",
          title: "Selective Import",
          description: "Selectieve import tool",
          status: "live",
          access: "agent",
        },
        {
          path: "/travel-compositor-import",
          title: "Travel Compositor Import",
          description: "Travel Compositor data import",
          status: "live",
          access: "agent",
        },
        {
          path: "/single-microsite-test",
          title: "Single Microsite Test",
          description: "Test voor enkele microsite",
          status: "dev",
          access: "admin",
        },
        {
          path: "/agent-booking-import",
          title: "Agent Booking Import",
          description: "Booking import voor agents",
          status: "live",
          access: "agent",
        },
      ],
    },
    "📋 Roadbooks & Templates": {
      icon: <FileText className="h-5 w-5" />,
      color: "bg-teal-100 text-teal-700",
      pages: [
        {
          path: "/werkblad",
          title: "Werkblad",
          description: "Hoofdwerkblad interface",
          status: "live",
          access: "agent",
        },
        {
          path: "/travelwerkblad",
          title: "Travel Werkblad",
          description: "Travel specifiek werkblad",
          status: "live",
          access: "agent",
        },
        {
          path: "/roadbook/[id]",
          title: "Roadbook Viewer",
          description: "Roadbook weergave",
          status: "live",
          access: "public",
        },
        {
          path: "/roadbook/universal/[id]",
          title: "Universal Roadbook",
          description: "Universele roadbook template",
          status: "live",
          access: "public",
        },
        {
          path: "/roadbook/booking-[id]",
          title: "Booking Roadbook",
          description: "Booking specifieke roadbook",
          status: "live",
          access: "public",
        },
        {
          path: "/offerte/[id]",
          title: "Offerte Viewer",
          description: "Offerte weergave",
          status: "live",
          access: "public",
        },
        {
          path: "/offerte/package-[id]",
          title: "Package Offerte",
          description: "Pakket offerte weergave",
          status: "live",
          access: "public",
        },
      ],
    },
    "💬 Chat & Communication": {
      icon: <MessageCircle className="h-5 w-5" />,
      color: "bg-indigo-100 text-indigo-700",
      pages: [
        {
          path: "/chat/[slug]",
          title: "Chat Interface",
          description: "Chat interface voor klanten",
          status: "live",
          access: "public",
        },
        {
          path: "/travelbuddy/[bookingId]",
          title: "Travel Buddy Chat",
          description: "Booking specifieke chat",
          status: "live",
          access: "public",
        },
        {
          path: "/intake-preview",
          title: "Intake Preview",
          description: "Preview van intake formulier",
          status: "live",
          access: "agent",
        },
      ],
    },
    "🔍 Testing & Debug": {
      icon: <TestTube className="h-5 w-5" />,
      color: "bg-red-100 text-red-700",
      pages: [
        {
          path: "/test-travel-compositor",
          title: "Test Travel Compositor",
          description: "Travel Compositor API test",
          status: "dev",
          access: "admin",
        },
        {
          path: "/debug-travel-compositor",
          title: "Debug Travel Compositor",
          description: "Travel Compositor debug tools",
          status: "dev",
          access: "admin",
        },
        {
          path: "/debug-auth",
          title: "Debug Auth",
          description: "Authenticatie debug tools",
          status: "dev",
          access: "admin",
        },
        {
          path: "/debug-connection",
          title: "Debug Connection",
          description: "Verbinding debug tools",
          status: "dev",
          access: "admin",
        },
        {
          path: "/test-booking-search",
          title: "Test Booking Search",
          description: "Booking zoek functie test",
          status: "dev",
          access: "admin",
        },
        {
          path: "/test-endpoints",
          title: "Test Endpoints",
          description: "API endpoints testen",
          status: "dev",
          access: "admin",
        },
        {
          path: "/debug-import",
          title: "Debug Import",
          description: "Import functionaliteit debuggen",
          status: "dev",
          access: "admin",
        },
      ],
    },
    "📊 Analytics & Reports": {
      icon: <BarChart3 className="h-5 w-5" />,
      color: "bg-yellow-100 text-yellow-700",
      pages: [
        {
          path: "/analyze-booking-data",
          title: "Analyze Booking Data",
          description: "Booking data analyse",
          status: "dev",
          access: "admin",
        },
        {
          path: "/analyze-content-data",
          title: "Analyze Content Data",
          description: "Content data analyse",
          status: "dev",
          access: "admin",
        },
        {
          path: "/swagger-analysis",
          title: "Swagger Analysis",
          description: "API documentatie analyse",
          status: "dev",
          access: "admin",
        },
        {
          path: "/discover-endpoints",
          title: "Discover Endpoints",
          description: "API endpoints ontdekken",
          status: "dev",
          access: "admin",
        },
        {
          path: "/webhook-dashboard",
          title: "Webhook Dashboard",
          description: "Webhook beheer dashboard",
          status: "live",
          access: "admin",
        },
      ],
    },
    "🌐 Remote & External": {
      icon: <Globe className="h-5 w-5" />,
      color: "bg-cyan-100 text-cyan-700",
      pages: [
        {
          path: "/remote-ideas",
          title: "Remote Ideas",
          description: "Externe travel ideas browser",
          status: "live",
          access: "agent",
        },
        {
          path: "/test-newreisplan-import",
          title: "NewReisplan Import Test",
          description: "NewReisplan import testen",
          status: "dev",
          access: "admin",
        },
      ],
    },
    "⚙️ System & Utils": {
      icon: <Wrench className="h-5 w-5" />,
      color: "bg-gray-100 text-gray-700",
      pages: [
        {
          path: "/sitemap",
          title: "Sitemap",
          description: "Deze pagina - overzicht van alle routes",
          status: "live",
          access: "public",
        },
        {
          path: "/feature-request",
          title: "Feature Requests",
          description: "Feature verzoeken en roadmap",
          status: "live",
          access: "agent",
        },
      ],
    },
  }

  // Calculate total pages
  const totalPages = Object.values(sitemapData).reduce((total, category) => total + category.pages.length, 0)
  const livePages = Object.values(sitemapData).reduce(
    (total, category) => total + category.pages.filter((page) => page.status === "live").length,
    0,
  )

  // Filter pages based on search and category
  const filteredData = Object.entries(sitemapData).reduce(
    (acc, [categoryName, categoryData]) => {
      const filteredPages = categoryData.pages.filter((page) => {
        const matchesSearch =
          searchTerm === "" ||
          page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.path.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory = selectedCategory === "all" || page.status === selectedCategory

        return matchesSearch && matchesCategory
      })

      if (filteredPages.length > 0) {
        acc[categoryName] = { ...categoryData, pages: filteredPages }
      }
      return acc
    },
    {} as typeof sitemapData,
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-100 text-green-700"
      case "beta":
        return "bg-blue-100 text-blue-700"
      case "dev":
        return "bg-orange-100 text-orange-700"
      case "demo":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getAccessColor = (access: string) => {
    switch (access) {
      case "public":
        return "bg-green-100 text-green-700"
      case "agent":
        return "bg-blue-100 text-blue-700"
      case "admin":
        return "bg-red-100 text-red-700"
      case "user":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Map className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Travel Studio - Sitemap
                </h1>
                <p className="text-sm text-gray-600">Overzicht van alle pagina's en functionaliteiten</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {livePages}/{totalPages} Live
              </Badge>
              <Link href="/">
                <Button
                  variant="outline"
                  className="rounded-xl shadow-sm hover:shadow-md transition-all bg-transparent"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Totaal Pagina's</p>
                  <p className="text-3xl font-bold">{totalPages}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Live Pagina's</p>
                  <p className="text-3xl font-bold">{livePages}</p>
                </div>
                <Eye className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Categorieën</p>
                  <p className="text-3xl font-bold">{Object.keys(sitemapData).length}</p>
                </div>
                <Filter className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">In Ontwikkeling</p>
                  <p className="text-3xl font-bold">
                    {Object.values(sitemapData).reduce(
                      (total, category) =>
                        total + category.pages.filter((page) => page.status === "dev" || page.status === "beta").length,
                      0,
                    )}
                  </p>
                </div>
                <Code className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Zoek pagina's, beschrijvingen, routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-2">
            {["all", "live", "beta", "dev", "demo"].map((status) => (
              <Button
                key={status}
                variant={selectedCategory === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(status)}
                className="rounded-xl"
              >
                {status === "all" ? "Alle" : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {Object.entries(filteredData).map(([categoryName, categoryData]) => (
            <Card
              key={categoryName}
              className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden"
            >
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${categoryData.color}`}>{categoryData.icon}</div>
                    <div>
                      <CardTitle className="text-xl text-gray-800">{categoryName}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {categoryData.pages.length} pagina{categoryData.pages.length !== 1 ? "'s" : ""}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {categoryData.pages.filter((page) => page.status === "live").length} Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {categoryData.pages.map((page, index) => (
                    <div
                      key={index}
                      className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{page.title}</h3>
                            <Badge className={`${getStatusColor(page.status)} px-2 py-1 rounded-full text-xs`}>
                              {page.status}
                            </Badge>
                            <Badge className={`${getAccessColor(page.access)} px-2 py-1 rounded-full text-xs`}>
                              {page.access}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{page.description}</p>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">
                            {page.path}
                          </code>
                        </div>
                        <div className="flex items-center gap-3 ml-6">
                          {page.status === "live" && (
                            <Link href={page.path}>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Bezoek
                              </Button>
                            </Link>
                          )}
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {Object.keys(filteredData).length === 0 && (
          <div className="text-center py-16">
            <Search className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-3">Geen pagina's gevonden</h3>
            <p className="text-gray-500 mb-6 text-lg">Probeer je zoekterm of filter aan te passen</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg rounded-3xl">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Travel Studio Platform</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Een complete suite van AI-tools en functionaliteiten voor reisagenten. Van content generatie tot booking
                management, alles wat je nodig hebt om je reisbusiness te digitaliseren en automatiseren.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/agent-dashboard">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                    <User className="h-4 w-4 mr-2" />
                    Agent Dashboard
                  </Button>
                </Link>
                <Link href="/admin/control-center">
                  <Button
                    variant="outline"
                    className="rounded-xl px-6 py-3 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Control Center
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
