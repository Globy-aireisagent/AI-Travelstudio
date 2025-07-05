"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Bot,
  Users,
  Plus,
  Settings,
  Clock,
  CheckCircle,
  Eye,
  Download,
  Search,
  MessageCircle,
  MoreHorizontal,
  Copy,
  Share,
  Trash2,
  ExternalLink,
  Edit,
  Save,
  Globe,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Project {
  id: string
  clientName: string
  bookingReference: string
  importMethod: string
  hasWorksheet: boolean
  onTemplate: boolean
  destination: string
  status: "active" | "completed" | "paused" | "draft"
  lastModified: string
  worksheetUrl?: string
  templateUrl?: string
  createdAt: string
  totalValue?: number
  pax?: number
}

interface TravelBuddy {
  id: string
  name: string
  client: string
  bookingId?: string
  status: "active" | "draft" | "published"
  conversations: number
  lastUsed: string
  type: "booking-specific" | "general" | "destination-specific"
  description: string
  chatUrl?: string
  isPublished: boolean
  publishedUrl?: string
  configuration?: any
}

export default function AgentDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [travelBuddies, setTravelBuddies] = useState<TravelBuddy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load projects from localStorage and API
      await loadProjects()
      await loadTravelBuddies()
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProjects = async () => {
    // Load from localStorage (for imported travel ideas and bookings)
    const savedProjects: Project[] = []

    // Check for imported travel ideas
    const importedIdea = localStorage.getItem("importedTravelIdea")
    if (importedIdea && importedIdea !== "undefined") {
      try {
        const ideaData = JSON.parse(importedIdea)
        savedProjects.push({
          id: `idea-${ideaData.id}`,
          clientName: ideaData.customer?.name || "Onbekende klant",
          bookingReference: ideaData.originalIdeaId || ideaData.id,
          importMethod: "Travel Compositor Import",
          hasWorksheet: true, // We have the travelwerkblad page
          onTemplate: false,
          destination: ideaData.destinations?.[0]?.name || "Onbekend",
          status: "active",
          lastModified: new Date().toISOString().split("T")[0],
          worksheetUrl: "/travelwerkblad",
          createdAt: ideaData.creationDate || new Date().toISOString(),
          totalValue: ideaData.totalPrice?.amount || 0,
          pax: ideaData.counters?.adults + ideaData.counters?.children || 2,
        })
      } catch (error) {
        console.error("Error parsing imported travel idea:", error)
      }
    }

    // Check for other saved projects
    const savedProjectsData = localStorage.getItem("agentProjects")
    if (savedProjectsData) {
      try {
        const parsedProjects = JSON.parse(savedProjectsData)
        savedProjects.push(...parsedProjects)
      } catch (error) {
        console.error("Error parsing saved projects:", error)
      }
    }

    // Add some demo projects if no real data
    if (savedProjects.length === 0) {
      savedProjects.push(
        {
          id: "demo-1",
          clientName: "Familie Jansen",
          bookingReference: "TC-2025-001",
          importMethod: "Travel Compositor Import",
          hasWorksheet: true,
          onTemplate: false,
          destination: "Zuid-Korea",
          status: "active",
          lastModified: "2025-01-05",
          worksheetUrl: "/travelwerkblad",
          createdAt: "2025-01-01",
          totalValue: 3450,
          pax: 2,
        },
        {
          id: "demo-2",
          clientName: "Nieuwe klant",
          bookingReference: "AI-2025-002",
          importMethod: "AI Content Generator",
          hasWorksheet: true,
          onTemplate: true,
          destination: "Japan",
          status: "completed",
          lastModified: "2025-01-04",
          templateUrl: "/roadbook/ai-2025-002",
          createdAt: "2025-01-02",
          totalValue: 2800,
          pax: 2,
        },
      )
    }

    setProjects(savedProjects)
  }

  const loadTravelBuddies = async () => {
    // Load from localStorage
    const savedBuddies: TravelBuddy[] = []

    // Check for saved travel buddies
    const savedBuddiesData = localStorage.getItem("travelBuddies")
    if (savedBuddiesData) {
      try {
        const parsedBuddies = JSON.parse(savedBuddiesData)
        savedBuddies.push(...parsedBuddies)
      } catch (error) {
        console.error("Error parsing saved travel buddies:", error)
      }
    }

    // Add demo buddies if no real data
    if (savedBuddies.length === 0) {
      savedBuddies.push(
        {
          id: "buddy-1",
          name: "Zuid-Korea Expert",
          client: "Familie Jansen",
          bookingId: "TC-2025-001",
          status: "active",
          conversations: 23,
          lastUsed: "2025-01-05",
          type: "booking-specific",
          description: "AI assistent voor Zuid-Korea reis",
          chatUrl: "/travelbuddy/TC-2025-001",
          isPublished: true,
          publishedUrl: "https://travelbuddy.app/TC-2025-001",
        },
        {
          id: "buddy-2",
          name: "Algemene Reis Assistent",
          client: "Alle klanten",
          status: "active",
          conversations: 156,
          lastUsed: "2025-01-05",
          type: "general",
          description: "Algemene reisadvies chatbot",
          chatUrl: "/travelbuddy",
          isPublished: true,
          publishedUrl: "https://travelbuddy.app/general",
        },
        {
          id: "buddy-3",
          name: "Japan Specialist",
          client: "Diverse klanten",
          status: "draft",
          conversations: 0,
          lastUsed: "Nooit",
          type: "destination-specific",
          description: "Specialist voor Japan reizen",
          isPublished: false,
        },
      )
    }

    setTravelBuddies(savedBuddies)
  }

  const saveProject = (project: Project) => {
    const updatedProjects = projects.map((p) => (p.id === project.id ? project : p))
    setProjects(updatedProjects)

    // Save to localStorage
    const projectsToSave = updatedProjects.filter((p) => !p.id.startsWith("demo-"))
    localStorage.setItem("agentProjects", JSON.stringify(projectsToSave))
  }

  const saveTravelBuddy = (buddy: TravelBuddy) => {
    const updatedBuddies = travelBuddies.map((b) => (b.id === buddy.id ? buddy : b))
    setTravelBuddies(updatedBuddies)

    // Save to localStorage
    const buddiesToSave = updatedBuddies.filter((b) => !b.id.startsWith("buddy-"))
    localStorage.setItem("travelBuddies", JSON.stringify(buddiesToSave))
  }

  const publishTravelBuddy = async (buddyId: string) => {
    const buddy = travelBuddies.find((b) => b.id === buddyId)
    if (!buddy) return

    // Generate published URL
    const publishedUrl = `https://travelbuddy.app/${buddy.type === "general" ? "general" : buddy.bookingId || buddy.id}`

    const updatedBuddy = {
      ...buddy,
      status: "active" as const,
      isPublished: true,
      publishedUrl,
    }

    saveTravelBuddy(updatedBuddy)

    // Show success message
    alert(`Travel Buddy gepubliceerd! URL: ${publishedUrl}`)
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

  const getBuddyStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700"
      case "published":
        return "bg-blue-100 text-blue-700"
      case "draft":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredProjects = projects.filter((project: Project) => {
    const matchesSearch =
      project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = projectFilter === "all" || project.status?.toLowerCase() === projectFilter
    return matchesSearch && matchesFilter
  })

  const filteredBuddies = travelBuddies.filter((buddy: TravelBuddy) => {
    return (
      buddy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buddy.client?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard laden...</p>
        </div>
      </div>
    )
  }

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
              <Link href="/">
                <Button
                  variant="outline"
                  className="rounded-xl shadow-sm hover:shadow-md transition-all bg-transparent"
                >
                  🏠 Home
                </Button>
              </Link>
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

          {/* Beautiful Enhanced Tabs */}
          <Tabs defaultValue="projects" className="space-y-6">
            <div className="flex items-center justify-center">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl p-2">
                <TabsTrigger
                  value="projects"
                  className="flex items-center gap-3 rounded-xl py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Mijn Projecten</span>
                  <Badge className="bg-green-100 text-green-700 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    {filteredProjects.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="buddies"
                  className="flex items-center gap-3 rounded-xl py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Bot className="h-5 w-5" />
                  <span className="font-medium">Travel Buddies</span>
                  <Badge className="bg-pink-100 text-pink-700 data-[state=active]:bg-white/20 data-[state=active]:text-white">
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
                          {filteredProjects.map((project: Project) => (
                            <tr
                              key={project.id}
                              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                            >
                              <td className="p-6">
                                <div>
                                  <div className="font-semibold text-gray-900 text-lg">{project.clientName}</div>
                                  <div className="text-sm text-gray-500 mt-1">{project.destination}</div>
                                  {project.totalValue && (
                                    <div className="text-sm text-green-600 font-medium">
                                      €{project.totalValue.toLocaleString()}
                                    </div>
                                  )}
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
                                  {project.worksheetUrl && (
                                    <Link href={project.worksheetUrl}>
                                      <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl"
                                      >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Werkblad
                                      </Button>
                                    </Link>
                                  )}
                                  {project.templateUrl && (
                                    <Link href={project.templateUrl}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="hover:bg-purple-50 hover:border-purple-200 bg-transparent rounded-xl"
                                      >
                                        <Globe className="h-4 w-4 mr-2" />
                                        Live
                                      </Button>
                                    </Link>
                                  )}
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
                                        <Edit className="h-4 w-4 mr-2" />
                                        Bewerken
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
                  filteredBuddies.map((buddy: TravelBuddy, index: number) => (
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
                              <Badge className={`${getBuddyStatusColor(buddy.status)} px-3 py-1 rounded-full`}>
                                {buddy.status === "active" && "Actief"}
                                {buddy.status === "published" && "Gepubliceerd"}
                                {buddy.status === "draft" && "Concept"}
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
                              {buddy.chatUrl && (
                                <DropdownMenuItem className="rounded-xl">
                                  <Link href={buddy.chatUrl} className="flex items-center w-full">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Test Chat
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="rounded-xl">
                                <Settings className="h-4 w-4 mr-2" />
                                Configureren
                              </DropdownMenuItem>
                              {buddy.publishedUrl && (
                                <DropdownMenuItem className="rounded-xl">
                                  <a
                                    href={buddy.publishedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center w-full"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open Live URL
                                  </a>
                                </DropdownMenuItem>
                              )}
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

                          {buddy.publishedUrl && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                              <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                                <Globe className="h-4 w-4" />
                                <span className="font-medium">Live URL uitgedeeld</span>
                              </div>
                              <div className="text-xs text-green-600 font-mono break-all">{buddy.publishedUrl}</div>
                            </div>
                          )}

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
                              {buddy.chatUrl ? (
                                <Link href={buddy.chatUrl} className="flex-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300 rounded-xl"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Chat
                                  </Button>
                                </Link>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300 rounded-xl"
                                  disabled
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Chat
                                </Button>
                              )}

                              {buddy.status === "draft" ? (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl"
                                  onClick={() => publishTravelBuddy(buddy.id)}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Publiceer
                                </Button>
                              ) : (
                                <Link href="/travelbuddy" className="flex-1">
                                  <Button
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl"
                                  >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Setup
                                  </Button>
                                </Link>
                              )}
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
      </div>
    </div>
  )
}
