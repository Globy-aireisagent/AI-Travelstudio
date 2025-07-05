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
  Clock,
  CheckCircle,
  Lightbulb,
  Plane,
  Eye,
  Download,
  Search,
  MessageCircle,
  MoreHorizontal,
  Copy,
  Share,
  Trash2,
  ExternalLink,
  ChevronRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import FeatureRoadmapInteractive from "@/components/feature-roadmap-interactive"

export default function AgentDashboard() {
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
      console.error("Failed to load dashboard data:", error)
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

  // Demo data for projects - simplified for table view
  const demoProjects = [
    {
      id: 1,
      clientName: "Familie Jansen",
      bookingReference: "TC-2025-001",
      importMethod: "Travel Compositor Import",
      hasWorksheet: true,
      onTemplate: false,
      destination: "Zuid-Korea",
      status: "active",
      lastModified: "2025-01-05",
    },
    {
      id: 2,
      clientName: "Nieuwe klant",
      bookingReference: "AI-2025-002",
      importMethod: "AI Content Generator",
      hasWorksheet: true,
      onTemplate: true,
      destination: "Japan",
      status: "completed",
      lastModified: "2025-01-04",
    },
    {
      id: 3,
      clientName: "Familie Peters",
      bookingReference: "TC-2025-003",
      importMethod: "PDF Upload",
      hasWorksheet: false,
      onTemplate: false,
      destination: "Middellandse Zee",
      status: "draft",
      lastModified: "2025-01-03",
    },
    {
      id: 4,
      clientName: "Meneer de Vries",
      bookingReference: "TC-2025-002",
      importMethod: "Travel Compositor Import",
      hasWorksheet: true,
      onTemplate: false,
      destination: "Parijs",
      status: "paused",
      lastModified: "2025-01-02",
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

  const filteredProjects = demoProjects.filter((project: any) => {
    const matchesSearch =
      project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        {/* My Projects & Work Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🎯 Mijn Werk & Projecten</h2>
            <p className="text-gray-600 text-lg">Overzicht van al je actieve projecten en AI assistenten</p>
          </div>

          {/* Beautiful Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Mijn Bookings</p>
                    <p className="text-3xl font-bold">{userBookings.length || 3}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plane className="h-8 w-8 text-blue-200" />
                    <ChevronRight className="h-5 w-5 text-blue-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Travel Ideas</p>
                    <p className="text-3xl font-bold">{userIdeas.length || 4}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-8 w-8 text-purple-200" />
                    <ChevronRight className="h-5 w-5 text-purple-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Mijn Projecten</p>
                    <p className="text-3xl font-bold">{demoProjects.length}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-green-200" />
                    <ChevronRight className="h-5 w-5 text-green-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Travel Buddies</p>
                    <p className="text-3xl font-bold">{demoTravelBuddies.length}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="h-8 w-8 text-pink-200" />
                    <ChevronRight className="h-5 w-5 text-pink-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Zoek projecten, klanten, bestemmingen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-gray-200">
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

          {/* Fixed Enhanced Tabs */}
          <Tabs defaultValue="projects" className="space-y-6">
            <div className="flex items-center justify-center">
              <TabsList className="grid w-full max-w-lg grid-cols-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl p-1 h-auto">
                <TabsTrigger
                  value="projects"
                  className="flex items-center gap-2 rounded-xl py-3 px-4 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <FileText className="h-4 w-4" />
                  <span>Mijn Projecten</span>
                  <Badge className="bg-green-100 text-green-700 data-[state=active]:bg-white/20 data-[state=active]:text-white text-xs px-2 py-0.5 min-w-[1.5rem] h-5 flex items-center justify-center">
                    {filteredProjects.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="buddies"
                  className="flex items-center gap-2 rounded-xl py-3 px-4 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Bot className="h-4 w-4" />
                  <span>Travel Buddies</span>
                  <Badge className="bg-pink-100 text-pink-700 data-[state=active]:bg-white/20 data-[state=active]:text-white text-xs px-2 py-0.5 min-w-[1.5rem] h-5 flex items-center justify-center">
                    {filteredBuddies.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="projects">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  {filteredProjects.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                          <tr>
                            <th className="text-left p-6 font-semibold text-gray-700">Klant</th>
                            <th className="text-left p-6 font-semibold text-gray-700">Reservering</th>
                            <th className="text-left p-6 font-semibold text-gray-700">Import Methode</th>
                            <th className="text-center p-6 font-semibold text-gray-700">Werkblad</th>
                            <th className="text-center p-6 font-semibold text-gray-700">Template</th>
                            <th className="text-left p-6 font-semibold text-gray-700">Status</th>
                            <th className="text-center p-6 font-semibold text-gray-700">Acties</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredProjects.map((project: any) => (
                            <tr
                              key={project.id}
                              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                            >
                              <td className="p-6">
                                <div>
                                  <div className="font-semibold text-gray-900 text-lg">{project.clientName}</div>
                                  <div className="text-sm text-gray-500 mt-1">{project.destination}</div>
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg inline-block">
                                  {project.bookingReference}
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="text-sm text-gray-600">{project.importMethod}</div>
                              </td>
                              <td className="p-6 text-center">
                                {project.hasWorksheet ? (
                                  <Badge className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Ja
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500 px-3 py-1 rounded-full">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Nee
                                  </Badge>
                                )}
                              </td>
                              <td className="p-6 text-center">
                                {project.onTemplate ? (
                                  <Badge className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Live
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500 px-3 py-1 rounded-full">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Concept
                                  </Badge>
                                )}
                              </td>
                              <td className="p-6">
                                <Badge className={`${getProjectStatusColor(project.status)} px-3 py-1 rounded-full`}>
                                  {project.status === "active" && "Actief"}
                                  {project.status === "completed" && "Afgerond"}
                                  {project.status === "paused" && "Gepauzeerd"}
                                  {project.status === "draft" && "Concept"}
                                </Badge>
                              </td>
                              <td className="p-6">
                                <div className="flex items-center gap-3 justify-center">
                                  <Link href={`/werkblad?booking=${project.bookingReference}`}>
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl"
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Werkblad
                                    </Button>
                                  </Link>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-xl">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl rounded-2xl"
                                    >
                                      <DropdownMenuItem className="rounded-xl">
                                        <Eye className="h-4 w-4 mr-2" />
                                        Bekijk Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="rounded-xl">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Roadbook
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="rounded-xl">
                                        <Bot className="h-4 w-4 mr-2" />
                                        Travel Buddy
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="rounded-xl">
                                        <Copy className="h-4 w-4 mr-2" />
                                        Dupliceer
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="rounded-xl">
                                        <Share className="h-4 w-4 mr-2" />
                                        Delen
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600 rounded-xl">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Verwijderen
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <FileText className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold text-gray-600 mb-3">Geen projecten gevonden</h3>
                      <p className="text-gray-500 mb-6 text-lg">
                        {searchTerm || projectFilter !== "all"
                          ? "Probeer je zoekterm of filter aan te passen"
                          : "Begin met het importeren van data of maak een nieuw project"}
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Link href="/import">
                          <Button
                            variant="outline"
                            className="rounded-xl px-6 py-3 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Importeer Data
                          </Button>
                        </Link>
                        <Link href="/travel-generator">
                          <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <Plus className="h-4 w-4 mr-2" />
                            Nieuw Project
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buddies">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredBuddies.length > 0 ? (
                  filteredBuddies.map((buddy: any, index: number) => (
                    <Card
                      key={index}
                      className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden"
                    >
                      <CardHeader className="pb-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl">
                                <Bot className="h-5 w-5 text-white" />
                              </div>
                              <Badge
                                variant={buddy.status === "active" ? "default" : "secondary"}
                                className={`${buddy.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"} px-3 py-1 rounded-full`}
                              >
                                {buddy.status === "active" ? "Actief" : "Concept"}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl mb-2 text-gray-800">{buddy.name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              {buddy.client}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-white/80 rounded-xl">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-xl rounded-2xl"
                            >
                              <DropdownMenuItem className="rounded-xl">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Test Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl">
                                <Settings className="h-4 w-4 mr-2" />
                                Configureren
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl">
                                <Copy className="h-4 w-4 mr-2" />
                                Dupliceren
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 rounded-xl">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Verwijderen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <p className="text-gray-600 leading-relaxed">{buddy.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded-xl">
                              <span className="text-gray-500 block">Gesprekken</span>
                              <span className="font-semibold text-lg text-gray-800">{buddy.conversations}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl">
                              <span className="text-gray-500 block">Laatst gebruikt</span>
                              <span className="font-semibold text-sm text-gray-800">{buddy.lastUsed}</span>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex gap-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300 rounded-xl"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Chat
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Setup
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <Bot className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-600 mb-3">Geen travel buddies gevonden</h3>
                    <p className="text-gray-500 mb-6 text-lg">
                      {searchTerm
                        ? "Probeer je zoekterm aan te passen"
                        : "Maak je eerste AI travel buddy voor je klanten"}
                    </p>
                    <Link href="/travelbuddy">
                      <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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

        {/* Travel Management System - Now with Interactive Feature Roadmap */}
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
          </div>

          {/* Interactive Feature Roadmap Component */}
          <FeatureRoadmapInteractive userEmail="demo@roadbooks.nl" userName="Demo Agent" />
        </section>
      </div>
    </div>
  )
}
