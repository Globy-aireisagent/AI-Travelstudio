"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  ExternalLink,
  Home,
  Users,
  FileText,
  Bot,
  Upload,
  Shield,
  Wrench,
  Map,
  Sparkles,
  Eye,
  Clock,
  CheckCircle,
  Info,
} from "lucide-react"
import Link from "next/link"

interface SitemapPage {
  title: string
  path: string
  description: string
  category: string
  status: "live" | "beta" | "dev" | "demo"
  accessLevel: "public" | "agent" | "admin" | "user"
  icon?: React.ReactNode
}

const sitemapPages: SitemapPage[] = [
  // Main Pages
  {
    title: "Home",
    path: "/",
    description: "AI Travel Studio hoofdpagina",
    category: "main",
    status: "live",
    accessLevel: "public",
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: "Agent Dashboard",
    path: "/agent-dashboard",
    description: "Hoofddashboard voor reisagenten",
    category: "main",
    status: "live",
    accessLevel: "agent",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Travel Generator",
    path: "/travel-generator",
    description: "AI content generator voor reizen",
    category: "main",
    status: "live",
    accessLevel: "agent",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    title: "Travel Buddy",
    path: "/travelbuddy",
    description: "AI chatbot beheer voor klanten",
    category: "main",
    status: "live",
    accessLevel: "agent",
    icon: <Bot className="h-4 w-4" />,
  },
  {
    title: "Import Center",
    path: "/import",
    description: "Data import uit Travel Compositor",
    category: "main",
    status: "live",
    accessLevel: "agent",
    icon: <Upload className="h-4 w-4" />,
  },

  // Travel Content & Generation
  {
    title: "Travel Content Generator Final",
    path: "/travel-generator",
    description: "Definitieve versie van content generator",
    category: "content",
    status: "live",
    accessLevel: "agent",
  },
  {
    title: "Travel Werkblad",
    path: "/travelwerkblad",
    description: "Werkblad voor reisplanning",
    category: "content",
    status: "live",
    accessLevel: "agent",
  },
  {
    title: "Werkblad",
    path: "/werkblad",
    description: "Algemeen werkblad systeem",
    category: "content",
    status: "live",
    accessLevel: "agent",
  },

  // Roadbooks & Templates
  {
    title: "Roadbook Universal",
    path: "/roadbook/universal/[id]",
    description: "Universele roadbook template",
    category: "roadbooks",
    status: "live",
    accessLevel: "user",
  },

  // Travel Buddy & Chat
  {
    title: "Travel Buddy Generator",
    path: "/agent-travelbuddy-generator",
    description: "Generator voor travel buddy bots",
    category: "chatbots",
    status: "live",
    accessLevel: "agent",
  },
  {
    title: "Travel Buddy Example",
    path: "/travelbuddy-example",
    description: "Voorbeeld van travel buddy",
    category: "chatbots",
    status: "demo",
    accessLevel: "public",
  },

  // Import & Data Management
  {
    title: "Import V2",
    path: "/import-v2",
    description: "Verbeterde import functionaliteit",
    category: "import",
    status: "beta",
    accessLevel: "agent",
  },
  {
    title: "Universal Import",
    path: "/universal-import",
    description: "Universele import wizard",
    category: "import",
    status: "beta",
    accessLevel: "agent",
  },

  // Admin & Management
  {
    title: "Admin Control Center",
    path: "/admin/control-center",
    description: "Hoofdbeheer centrum",
    category: "admin",
    status: "live",
    accessLevel: "admin",
  },
  {
    title: "Master Dashboard",
    path: "/master-dashboard",
    description: "Master beheer dashboard",
    category: "admin",
    status: "live",
    accessLevel: "admin",
  },

  // Feature Management
  {
    title: "Feature Requests",
    path: "/feature-request",
    description: "Feature verzoeken en roadmap",
    category: "features",
    status: "live",
    accessLevel: "agent",
  },

  // Utilities & Tools
  {
    title: "Sitemap",
    path: "/sitemap",
    description: "Complete site overzicht",
    category: "utilities",
    status: "live",
    accessLevel: "public",
  },
  {
    title: "Help",
    path: "/help",
    description: "Help en documentatie",
    category: "utilities",
    status: "live",
    accessLevel: "public",
  },
  {
    title: "About",
    path: "/about",
    description: "Over AI Travel Studio",
    category: "utilities",
    status: "live",
    accessLevel: "public",
  },
]

const categories = [
  { id: "main", name: "Hoofdpagina's", icon: <Home className="h-5 w-5" />, color: "from-blue-500 to-blue-600" },
  {
    id: "content",
    name: "Content & Generatie",
    icon: <FileText className="h-5 w-5" />,
    color: "from-green-500 to-green-600",
  },
  { id: "roadbooks", name: "Roadbooks", icon: <Map className="h-5 w-5" />, color: "from-purple-500 to-purple-600" },
  { id: "chatbots", name: "Chatbots & AI", icon: <Bot className="h-5 w-5" />, color: "from-pink-500 to-pink-600" },
  { id: "import", name: "Import & Data", icon: <Upload className="h-5 w-5" />, color: "from-orange-500 to-orange-600" },
  { id: "admin", name: "Beheer", icon: <Shield className="h-5 w-5" />, color: "from-red-500 to-red-600" },
  { id: "utilities", name: "Utilities", icon: <Wrench className="h-5 w-5" />, color: "from-gray-500 to-gray-600" },
]

export default function SitemapContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredPages = useMemo(() => {
    return sitemapPages.filter((page) => {
      const matchesSearch =
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.path.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || page.status === statusFilter
      const matchesCategory = categoryFilter === "all" || page.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [searchTerm, statusFilter, categoryFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live":
        return <CheckCircle className="h-3 w-3" />
      case "beta":
        return <Clock className="h-3 w-3" />
      case "dev":
        return <Wrench className="h-3 w-3" />
      case "demo":
        return <Eye className="h-3 w-3" />
      default:
        return <Info className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-100 text-green-700"
      case "beta":
        return "bg-blue-100 text-blue-700"
      case "dev":
        return "bg-yellow-100 text-yellow-700"
      case "demo":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "public":
        return "bg-green-50 text-green-600 border-green-200"
      case "agent":
        return "bg-blue-50 text-blue-600 border-blue-200"
      case "admin":
        return "bg-red-50 text-red-600 border-red-200"
      case "user":
        return "bg-purple-50 text-purple-600 border-purple-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  const stats = {
    total: sitemapPages.length,
    live: sitemapPages.filter((p) => p.status === "live").length,
    beta: sitemapPages.filter((p) => p.status === "beta").length,
    dev: sitemapPages.filter((p) => p.status === "dev").length,
    demo: sitemapPages.filter((p) => p.status === "demo").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Map className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Travel Studio - Sitemap
                </h1>
                <p className="text-sm text-gray-600">Complete overzicht van alle pagina's</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="rounded-xl shadow-sm hover:shadow-md transition-all bg-transparent">
                <Home className="h-4 w-4 mr-2" />
                Terug naar Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-blue-100 text-sm">Totaal Pagina's</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.live}</div>
              <div className="text-green-100 text-sm">Live</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-400 to-blue-500 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.beta}</div>
              <div className="text-blue-100 text-sm">Beta</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.dev}</div>
              <div className="text-yellow-100 text-sm">Development</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.demo}</div>
              <div className="text-purple-100 text-sm">Demo</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Zoek pagina's, beschrijvingen, routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/80 backdrop-blur-sm border-gray-200">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="dev">Development</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/80 backdrop-blur-sm border-gray-200">
                  <SelectValue placeholder="Filter categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle categorieën</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredPages.length} van {sitemapPages.length} pagina's
            {searchTerm && ` voor "${searchTerm}"`}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryPages = filteredPages.filter((page) => page.category === category.id)
            if (categoryPages.length === 0) return null

            return (
              <div key={category.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color} text-white shadow-lg`}>
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                    <p className="text-gray-600">{categoryPages.length} pagina's</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryPages.map((page, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm shadow-xl"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {page.icon}
                            <CardTitle className="text-lg">{page.title}</CardTitle>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={`${getStatusColor(page.status)} px-2 py-1 text-xs`}>
                              {getStatusIcon(page.status)}
                              <span className="ml-1 capitalize">{page.status}</span>
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="text-sm leading-relaxed">{page.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Route:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{page.path}</code>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={`${getAccessLevelColor(page.accessLevel)} text-xs px-2 py-1`}
                            >
                              {page.accessLevel}
                            </Badge>
                            {page.status === "live" && !page.path.includes("[") ? (
                              <Link href={page.path}>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Bezoek
                                </Button>
                              </Link>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                {page.path.includes("[") ? "Dynamic" : "Niet Live"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {filteredPages.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-3">Geen pagina's gevonden</h3>
            <p className="text-gray-500 mb-6">Probeer je zoekterm of filters aan te passen</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setCategoryFilter("all")
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
