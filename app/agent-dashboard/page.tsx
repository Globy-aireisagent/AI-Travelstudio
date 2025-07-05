"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Bot,
  Upload,
  CreditCard,
  Users,
  Plus,
  Sparkles,
  ArrowRight,
  Settings,
  Vote,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Calendar,
  MapPin,
  Plane,
  Eye,
  Download,
  Search,
  UserCheck,
  Globe,
  Heart,
  Edit,
  Play,
  Pause,
  RotateCcw,
  FileUp,
  MessageCircle,
  Zap,
  MoreHorizontal,
  Copy,
  Share,
  Trash2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import RealAnalyticsDashboard from "@/components/real-analytics-dashboard"

export default function AgentDashboard() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [userBookings, setUserBookings] = useState([])
  const [userIdeas, setUserIdeas] = useState([])
  const [clients, setClients] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [travelBuddies, setTravelBuddies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load analytics data
      const analyticsResponse = await fetch("/api/analytics")
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalyticsData(analyticsData)
      }

      // Load user bookings (from imported TC data)
      const bookingsResponse = await fetch("/api/user-bookings")
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setUserBookings(bookingsData.bookings || [])
      }

      // Load user travel ideas
      const ideasResponse = await fetch("/api/user-ideas")
      if (ideasResponse.ok) {
        const ideasData = await ideasResponse.json()
        setUserIdeas(ideasData.ideas || [])
      }

      // Load clients
      const clientsResponse = await fetch("/api/user-clients")
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json()
        setClients(clientsData.clients || [])
      }

      // Load my projects (AI Travel Studio work)
      const projectsResponse = await fetch("/api/my-projects")
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setMyProjects(projectsData.projects || [])
      }

      // Load travel buddies
      const buddiesResponse = await fetch("/api/travel-buddies")
      if (buddiesResponse.ok) {
        const buddiesData = await buddiesResponse.json()
        setTravelBuddies(buddiesData.buddies || [])
      }
    } catch (error) {
      console.error("Failed toload dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const aiTools = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Travel Content Generator",
      description: "Genereer bestemmingsteksten, routes, dagplanningen en hotel aanbevelingen met AI",
      href: "/travel-generator",
      color: "from-blue-500 to-purple-600",
      badge: "🤖 AI Powered",
      features: ["Bestemmingsteksten", "Routebeschrijvingen", "Dagplanningen", "Hotel zoeker"],
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: "Travel Buddy Admin",
      description: "Beheer AI chatbots voor je klanten en configureer intake formulieren",
      href: "/travelbuddy",
      color: "from-green-500 to-green-600",
      badge: "💬 Chat AI",
      features: ["AI Chatbot Setup", "Intake Formulieren", "Document Upload", "Chat Interface"],
    },
    {
      icon: <Upload className="h-8 w-8" />,
      title: "Travel Import & Generator",
      description: "Importeer bookings en travel ideas uit Travel Compositor met alle content",
      href: "/import",
      color: "from-purple-500 to-pink-600",
      badge: "📥 Import",
      features: ["Booking Import", "Travel Ideas", "Content Extractie", "Foto's & Data"],
    },
  ]

  const extraTools = [
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Voucher Generator",
      description: "Genereer professionele vouchers en reisdocumenten voor je klanten",
      href: "/vouchers",
      color: "from-orange-500 to-red-600",
      badge: "🎫 Generator",
      features: ["PDF Vouchers", "Email Templates", "Branding", "Multi-taal"],
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Websites Admin",
      description: "Beheer je websites, domeinen en online aanwezigheid",
      href: "/websites",
      color: "from-gray-600 to-gray-700",
      badge: "🌐 Admin",
      features: ["Domain Management", "Website Builder", "SEO Tools", "Analytics"],
    },
  ]

  // Demo data for projects
  const demoProjects = [
    {
      id: 1,
      title: "Rondreis Zuid-Korea - Familie Jansen",
      type: "imported",
      source: "travel-compositor",
      status: "active",
      progress: 75,
      lastModified: "2025-01-05",
      client: "Familie Jansen",
      destination: "Seoul, Busan, Jeju",
      createdAt: "2025-01-01",
      description: "Geïmporteerd uit Travel Compositor, bezig met AI content generatie",
      actions: ["roadbook", "travelbuddy", "content"],
    },
    {
      id: 2,
      title: "Authentiek Japan Avontuur",
      type: "manual",
      source: "ai-studio",
      status: "completed",
      progress: 100,
      lastModified: "2025-01-04",
      client: "Nieuwe klant",
      destination: "Tokyo, Kyoto, Osaka",
      createdAt: "2025-01-02",
      description: "Handmatig aangemaakt met AI Travel Content Generator",
      actions: ["roadbook", "share", "duplicate"],
    },
    {
      id: 3,
      title: "Cruise Middellandse Zee",
      type: "uploaded",
      source: "pdf-upload",
      status: "draft",
      progress: 25,
      lastModified: "2025-01-03",
      client: "Familie Peters",
      destination: "Barcelona, Rome, Athene",
      createdAt: "2025-01-03",
      description: "Geüpload via PDF, nog niet volledig bewerkt",
      actions: ["edit", "enhance"],
    },
    {
      id: 4,
      title: "Romantisch Parijs Weekend",
      type: "imported",
      source: "travel-compositor",
      status: "paused",
      progress: 50,
      lastModified: "2025-01-02",
      client: "Meneer de Vries",
      destination: "Paris, Frankrijk",
      createdAt: "2025-01-01",
      description: "Geïmporteerd, tijdelijk gepauzeerd",
      actions: ["resume", "edit"],
    },
  ]

  const demoTravelBuddies = [
    {
      id: 1,
      name: "Zuid-Korea Expert",
      client: "Familie Jansen",
      bookingId: "TC-2025-001",
      status: "active",
      conversations: 23,
      lastUsed: "2025-01-05",
      type: "booking-specific",
      description: "AI assistent voor Zuid-Korea reis",
    },
    {
      id: 2,
      name: "Algemene Reis Assistent",
      client: "Alle klanten",
      bookingId: null,
      status: "active",
      conversations: 156,
      lastUsed: "2025-01-05",
      type: "general",
      description: "Algemene reisadvies chatbot",
    },
    {
      id: 3,
      name: "Japan Specialist",
      client: "Diverse klanten",
      bookingId: null,
      status: "draft",
      conversations: 0,
      lastUsed: "Nooit",
      type: "destination-specific",
      description: "Specialist voor Japan reizen",
    },
  ]

  // Roadmap data
  const roadmapFeatures = [
    {
      id: 1,
      title: "AI Video Generator",
      description: "Automatisch reisvideos genereren uit foto's en tekst",
      status: "in-development",
      votes: 47,
      priority: "high",
      eta: "Q2 2025",
    },
    {
      id: 2,
      title: "Multi-language Support",
      description: "Volledige ondersteuning voor 15+ talen",
      status: "completed",
      votes: 32,
      priority: "medium",
      eta: "Completed",
    },
    {
      id: 3,
      title: "Mobile App",
      description: "Native iOS en Android app voor agents",
      status: "pipeline",
      votes: 89,
      priority: "high",
      eta: "Q3 2025",
    },
    {
      id: 4,
      title: "Advanced Analytics",
      description: "Uitgebreide rapportage en business intelligence",
      status: "in-development",
      votes: 23,
      priority: "medium",
      eta: "Q2 2025",
    },
    {
      id: 5,
      title: "API Marketplace",
      description: "Marketplace voor third-party integraties",
      status: "pipeline",
      votes: 15,
      priority: "low",
      eta: "Q4 2025",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "in-development":
        return "bg-blue-100 text-blue-700"
      case "pipeline":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in-development":
        return <Clock className="h-4 w-4" />
      case "pipeline":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getBookingStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getProjectStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "active":
        return "bg-blue-100 text-blue-700"
      case "paused":
        return "bg-yellow-100 text-yellow-700"
      case "draft":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getProjectStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "active":
        return <Play className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      case "draft":
        return <Edit className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case "imported":
        return <Download className="h-4 w-4" />
      case "manual":
        return <Edit className="h-4 w-4" />
      case "uploaded":
        return <FileUp className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case "imported":
        return "Geïmporteerd"
      case "manual":
        return "Handmatig"
      case "uploaded":
        return "Geüpload"
      default:
        return "Onbekend"
    }
  }

  const filteredBookings = userBookings.filter((booking: any) => {
    const matchesSearch =
      booking.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || booking.status?.toLowerCase() === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredIdeas = userIdeas.filter((idea: any) => {
    return (
      idea.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const filteredProjects = demoProjects.filter((project: any) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = projectFilter === "all" || project.status?.toLowerCase() === projectFilter
    return matchesSearch && matchesFilter
  })

  const filteredBuddies = demoTravelBuddies.filter((buddy: any) => {
    return (
      buddy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buddy.client?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Roadbooks Pro - Agent Dashboard
                </h1>
                <p className="text-sm text-gray-600">Professional Plan</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-700 px-3 py-1 rounded-full">Professional Plan</Badge>
              <Button
                variant="outline"
                className="rounded-xl shadow-sm hover:shadow-md transition-all bg-transparent"
                onClick={() => (window.location.href = "/")}
              >
                🏠 Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Analytics Dashboard */}
        <div className="mb-12">
          <RealAnalyticsDashboard />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Mijn Bookings</p>
                  <p className="text-3xl font-bold">{userBookings.length}</p>
                </div>
                <Plane className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Travel Ideas</p>
                  <p className="text-3xl font-bold">{userIdeas.length}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Mijn Projecten</p>
                  <p className="text-3xl font-bold">{demoProjects.length}</p>
                </div>
                <FileText className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100">Travel Buddies</p>
                  <p className="text-3xl font-bold">{demoTravelBuddies.length}</p>
                </div>
                <Bot className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Projects & Work Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">🎯 Mijn Werk & Projecten</h2>
              <p className="text-gray-600 text-lg">
                Overzicht van al je werk in de AI Travel Studio - actieve projecten, travel buddies en voortgang
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadDashboardData} disabled={isLoading}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {isLoading ? "Laden..." : "Vernieuwen"}
              </Button>
              <Link href="/travel-generator">
                <Button className="bg-gradient-to-r from-green-500 to-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuw Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Zoek projecten, klanten, bestemmingen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle projecten</SelectItem>
                <SelectItem value="active">Actief</SelectItem>
                <SelectItem value="completed">Afgerond</SelectItem>
                <SelectItem value="paused">Gepauzeerd</SelectItem>
                <SelectItem value="draft">Concept</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects & Buddies Tabs */}
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Mijn Projecten ({filteredProjects.length})
              </TabsTrigger>
              <TabsTrigger value="buddies" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Travel Buddies ({filteredBuddies.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <div className="space-y-4">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project: any, index: number) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                {getProjectTypeIcon(project.type)}
                                <Badge variant="outline" className="text-xs">
                                  {getProjectTypeLabel(project.type)}
                                </Badge>
                              </div>
                              <Badge className={getProjectStatusColor(project.status)}>
                                {getProjectStatusIcon(project.status)}
                                <span className="ml-1 capitalize">{project.status}</span>
                              </Badge>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">{project.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {project.client}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {project.destination}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Laatst bewerkt: {project.lastModified}
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm">{project.description}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Bekijk Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Dupliceer
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share className="h-4 w-4 mr-2" />
                                Delen
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Verwijderen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Voortgang</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {project.actions.includes("roadbook") && (
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-1" />
                              Roadbook
                            </Button>
                          )}
                          {project.actions.includes("travelbuddy") && (
                            <Button size="sm" variant="outline">
                              <Bot className="h-4 w-4 mr-1" />
                              Travel Buddy
                            </Button>
                          )}
                          {project.actions.includes("content") && (
                            <Button size="sm" variant="outline">
                              <Sparkles className="h-4 w-4 mr-1" />
                              AI Content
                            </Button>
                          )}
                          {project.actions.includes("edit") && (
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              Bewerken
                            </Button>
                          )}
                          {project.actions.includes("resume") && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Play className="h-4 w-4 mr-1" />
                              Hervatten
                            </Button>
                          )}
                          {project.actions.includes("enhance") && (
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                              <Zap className="h-4 w-4 mr-1" />
                              AI Verbeteren
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Geen projecten gevonden</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || projectFilter !== "all"
                        ? "Probeer je zoekterm of filter aan te passen"
                        : "Begin met het importeren van data of maak een nieuw project"}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Link href="/import">
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Importeer Data
                        </Button>
                      </Link>
                      <Link href="/travel-generator">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Nieuw Project
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="buddies">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBuddies.length > 0 ? (
                  filteredBuddies.map((buddy: any, index: number) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Bot className="h-5 w-5 text-blue-600" />
                              <Badge
                                variant={buddy.status === "active" ? "default" : "secondary"}
                                className={buddy.status === "active" ? "bg-green-100 text-green-700" : ""}
                              >
                                {buddy.status === "active" ? "Actief" : "Concept"}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg mb-1">{buddy.name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              {buddy.client}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Test Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Configureren
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Dupliceren
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Verwijderen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">{buddy.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Gesprekken:</span>
                            <span className="font-medium">{buddy.conversations}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Laatst gebruikt:</span>
                            <span className="font-medium">{buddy.lastUsed}</span>
                          </div>
                          <div className="pt-3 border-t">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Chat
                              </Button>
                              <Button size="sm" className="flex-1">
                                <Settings className="h-4 w-4 mr-1" />
                                Setup
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Geen travel buddies gevonden</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? "Probeer je zoekterm aan te passen"
                        : "Maak je eerste AI travel buddy voor je klanten"}
                    </p>
                    <Link href="/travelbuddy">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nieuwe Travel Buddy
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* My Travel Data Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">✈️ Mijn Travel Data</h2>
              <p className="text-gray-600 text-lg">Jouw bookings, ideas en klanten uit Travel Compositor</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadDashboardData} disabled={isLoading}>
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? "Laden..." : "Vernieuwen"}
              </Button>
              <Link href="/remote-ideas">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Importeer Data
                </Button>
              </Link>
            </div>
          </div>

          {/* Travel Data Tabs */}
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Mijn Bookings ({filteredBookings.length})
              </TabsTrigger>
              <TabsTrigger value="ideas" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Travel Ideas ({filteredIdeas.length})
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Klanten ({clients.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking: any, index: number) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">
                              {booking.title || `Booking ${booking.bookingReference}`}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              {booking.destination || "Onbekende bestemming"}
                            </div>
                          </div>
                          <Badge className={getBookingStatusColor(booking.status)}>
                            {booking.status || "Onbekend"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Klant:</span>
                            <span className="font-medium">{booking.clientName || booking.clientEmail}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Vertrek:</span>
                            <span className="font-medium">{booking.departureDate || "TBD"}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Prijs:</span>
                            <span className="font-bold text-green-600">
                              €{booking.totalPrice?.toLocaleString() || "0"}
                            </span>
                          </div>
                          <div className="pt-3 border-t">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                <Eye className="h-4 w-4 mr-1" />
                                Bekijk
                              </Button>
                              <Button size="sm" className="flex-1">
                                <FileText className="h-4 w-4 mr-1" />
                                Roadbook
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Geen bookings gevonden</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || filterStatus !== "all"
                        ? "Probeer je zoekterm of filter aan te passen"
                        : "Importeer je bookings uit Travel Compositor"}
                    </p>
                    <Link href="/remote-ideas">
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Importeer Bookings
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ideas">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredIdeas.length > 0 ? (
                  filteredIdeas.map((idea: any, index: number) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{idea.title || `Travel Idea ${idea.id}`}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Globe className="h-4 w-4" />
                              {idea.destination || "Diverse bestemmingen"}
                            </div>
                          </div>
                          <Badge variant="secondary">{idea.category || "Algemeen"}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {idea.description || "Geen beschrijving beschikbaar"}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Prijs vanaf:</span>
                            <span className="font-bold text-blue-600">
                              €{idea.priceFrom?.toLocaleString() || "Op aanvraag"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {idea.duration || "Flexibele duur"}
                          </div>
                          <div className="pt-3 border-t">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button size="sm" className="flex-1">
                                <Heart className="h-4 w-4 mr-1" />
                                Gebruik
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Geen travel ideas gevonden</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? "Probeer je zoekterm aan te passen"
                        : "Importeer je travel ideas uit Travel Compositor"}
                    </p>
                    <Link href="/remote-ideas">
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Importeer Ideas
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="clients">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {clients.length > 0 ? (
                  clients.map((client: any, index: number) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{client.name || client.email}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              {client.email}
                            </div>
                          </div>
                          <Badge variant="outline">{client.bookingCount || 0} bookings</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Laatste booking:</span>
                            <span className="font-medium">{client.lastBookingDate || "Nooit"}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Totale waarde:</span>
                            <span className="font-bold text-green-600">
                              €{client.totalValue?.toLocaleString() || "0"}
                            </span>
                          </div>
                          <div className="pt-3 border-t">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                <Eye className="h-4 w-4 mr-1" />
                                Profiel
                              </Button>
                              <Button size="sm" className="flex-1">
                                <Plus className="h-4 w-4 mr-1" />
                                Nieuwe Reis
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Geen klanten gevonden</h3>
                    <p className="text-gray-500 mb-4">Klanten worden automatisch toegevoegd bij booking import</p>
                    <Link href="/remote-ideas">
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Importeer Data
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* AI Tools Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">🤖 AI Tools voor Reisagenten</h2>
              <p className="text-gray-600 text-lg">Krachtige AI-tools om je werk te versnellen</p>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Powered
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {aiTools.map((tool, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-0 bg-white rounded-3xl shadow-xl overflow-hidden"
              >
                <CardHeader className="p-8 pb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-r ${tool.color} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      {tool.icon}
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full shadow-sm">
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors mb-3">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Features:</h4>
                    <ul className="space-y-2">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={tool.href}>
                    <Button
                      className={`w-full bg-gradient-to-r ${tool.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 rounded-2xl py-6 text-lg font-semibold shadow-lg`}
                    >
                      Open Tool <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Extra Tools Section */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Sparkles className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Extra Tools</h2>
              <p className="text-gray-600 text-lg">Aanvullende tools voor je reisbusiness</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {extraTools.map((tool, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-0 bg-white rounded-3xl shadow-xl overflow-hidden"
              >
                <CardHeader className="p-8 pb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-r ${tool.color} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      {tool.icon}
                    </div>
                    <Badge className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full shadow-sm">
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors mb-3">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Features:</h4>
                    <ul className="space-y-2">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={tool.href}>
                    <Button
                      className={`w-full bg-gradient-to-r ${tool.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 rounded-2xl py-6 text-lg font-semibold shadow-lg`}
                    >
                      Open Tool <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Travel Management System */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Travel Management System</h2>
                <p className="text-gray-600 text-lg">
                  Bekijk hier de stand van zaken hoe ver we zijn met de ontwikkeling van de AI-travelstudio. Heb je
                  wensen, geef ze door en we zetten ze op het stembord. Stem zelf mee op ideeën van je collega's
                </p>
              </div>
            </div>
            <Link href="/feature-request">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 rounded-2xl px-6 py-3 shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Nieuw Verzoek
              </Button>
            </Link>
          </div>

          {/* Roadmap Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl p-6">
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Afgerond
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {roadmapFeatures.filter((f) => f.status === "completed").length}
                </div>
                <p className="text-gray-600">Features voltooid</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-3xl p-6">
                <CardTitle className="flex items-center">
                  <Clock className="h-6 w-6 mr-2" />
                  In Ontwikkeling
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {roadmapFeatures.filter((f) => f.status === "in-development").length}
                </div>
                <p className="text-gray-600">Features in uitvoering</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-t-3xl p-6">
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {roadmapFeatures.filter((f) => f.status === "pipeline").length}
                </div>
                <p className="text-gray-600">Features gepland</p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Roadmap */}
          <Card className="bg-white rounded-3xl shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-3xl p-6">
              <CardTitle className="flex items-center">
                <Lightbulb className="h-6 w-6 mr-2" />
                Feature Roadmap & Verzoeken
              </CardTitle>
              <CardDescription className="text-purple-100">
                Stem op features en dien nieuwe verzoeken in
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {roadmapFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(feature.status)}
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status === "completed"
                            ? "Afgerond"
                            : feature.status === "in-development"
                              ? "In Ontwikkeling"
                              : "Pipeline"}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800">{feature.eta}</div>
                        <div className="text-xs text-gray-500">ETA</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2 rounded-xl hover:shadow-md transition-all bg-transparent"
                        disabled={feature.status === "completed"}
                      >
                        <Vote className="h-4 w-4" />
                        <span>{feature.votes}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Mis je een feature?</h4>
                    <p className="text-sm text-gray-600">Dien een nieuw verzoek in en laat anderen stemmen</p>
                  </div>
                  <Link href="/feature-request">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 rounded-2xl px-6 py-3 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Nieuw Verzoek
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
