"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Lightbulb,
  Users,
  Calendar,
  MapPin,
  Euro,
  Clock,
  Plus,
  Search,
  Filter,
  Share,
  Eye,
  Edit,
  Plane,
} from "lucide-react"

interface Project {
  id: string
  type: "booking" | "idea"
  title: string
  client: string
  destination: string
  status: "draft" | "confirmed" | "completed"
  date: string
  price?: number
  description?: string
}

interface TravelBuddy {
  id: string
  bookingId: string
  clientName: string
  destination: string
  startDate: string
  endDate: string
  status: "active" | "completed" | "draft"
  lastActivity: string
}

export default function AgentDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [travelBuddies, setTravelBuddies] = useState<TravelBuddy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: "1",
        type: "booking",
        title: "Familie vakantie Spanje",
        client: "Familie Jansen",
        destination: "Costa Brava",
        status: "confirmed",
        date: "2024-07-15",
        price: 2850,
        description: "2 weken all-inclusive resort",
      },
      {
        id: "2",
        type: "idea",
        title: "Romantisch weekend Parijs",
        client: "M. & S. de Vries",
        destination: "Parijs",
        status: "draft",
        date: "2024-05-20",
        price: 890,
        description: "Luxe hotel nabij Eiffeltoren",
      },
      {
        id: "3",
        type: "booking",
        title: "Zakenreis Londen",
        client: "TechCorp B.V.",
        destination: "Londen",
        status: "completed",
        date: "2024-03-10",
        price: 1200,
        description: "3 dagen business hotel",
      },
      {
        id: "4",
        type: "idea",
        title: "Avontuurlijke safari",
        client: "Avontuur Groep",
        destination: "Kenia",
        status: "draft",
        date: "2024-09-01",
        price: 4500,
        description: "10 dagen wildlife safari",
      },
    ]

    const mockTravelBuddies: TravelBuddy[] = [
      {
        id: "tb1",
        bookingId: "RRP-001",
        clientName: "Familie Jansen",
        destination: "Costa Brava",
        startDate: "2024-07-15",
        endDate: "2024-07-29",
        status: "active",
        lastActivity: "2 uur geleden",
      },
      {
        id: "tb2",
        bookingId: "RRP-002",
        clientName: "M. & S. de Vries",
        destination: "Parijs",
        startDate: "2024-05-20",
        endDate: "2024-05-22",
        status: "draft",
        lastActivity: "1 dag geleden",
      },
      {
        id: "tb3",
        bookingId: "RRP-003",
        clientName: "TechCorp B.V.",
        destination: "Londen",
        startDate: "2024-03-10",
        endDate: "2024-03-13",
        status: "completed",
        lastActivity: "1 week geleden",
      },
    ]

    setTimeout(() => {
      setProjects(mockProjects)
      setTravelBuddies(mockTravelBuddies)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.destination.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || project.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const filteredTravelBuddies = travelBuddies.filter((buddy) => {
    const matchesSearch =
      buddy.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buddy.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buddy.bookingId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || buddy.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Bevestigd"
      case "active":
        return "Actief"
      case "draft":
        return "Concept"
      case "completed":
        return "Voltooid"
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agent Dashboard</h1>
        <p className="text-gray-600">Beheer je projecten en travel buddies</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Zoek projecten, klanten of bestemmingen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle statussen</option>
            <option value="draft">Concept</option>
            <option value="confirmed">Bevestigd</option>
            <option value="active">Actief</option>
            <option value="completed">Voltooid</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg h-auto">
          <TabsTrigger
            value="projects"
            className="flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
          >
            <FileText className="h-4 w-4" />
            Mijn Projecten
            <Badge variant="secondary" className="ml-2 bg-white/20 text-current border-0 text-xs px-2 py-0.5">
              {projects.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="travel-buddies"
            className="flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all data-[state=active]:bg-gray-500 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
          >
            <Users className="h-4 w-4" />
            Travel Buddies
            <Badge variant="secondary" className="ml-2 bg-white/20 text-current border-0 text-xs px-2 py-0.5">
              {travelBuddies.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mijn Projecten ({filteredProjects.length})</h2>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {project.type === "booking" ? (
                        <Plane className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {project.type === "booking" ? "Booking" : "Idee"}
                      </Badge>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                  <CardDescription className="text-sm">{project.client}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {project.destination}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(project.date).toLocaleDateString("nl-NL")}
                  </div>
                  {project.price && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Euro className="h-4 w-4" />€{project.price.toLocaleString("nl-NL")}
                    </div>
                  )}
                  {project.description && <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Eye className="h-4 w-4 mr-1" />
                      Bekijk
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit className="h-4 w-4 mr-1" />
                      Bewerk
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen projecten gevonden</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Probeer je zoekopdracht of filter aan te passen"
                  : "Begin met het maken van je eerste project"}
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Project
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Travel Buddies Tab */}
        <TabsContent value="travel-buddies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Travel Buddies ({filteredTravelBuddies.length})</h2>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Travel Buddy
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTravelBuddies.map((buddy) => (
              <Card key={buddy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <Badge variant="outline" className="text-xs">
                        {buddy.bookingId}
                      </Badge>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(buddy.status)}`}>{getStatusText(buddy.status)}</Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{buddy.clientName}</CardTitle>
                  <CardDescription className="text-sm">{buddy.destination}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(buddy.startDate).toLocaleDateString("nl-NL")} -{" "}
                    {new Date(buddy.endDate).toLocaleDateString("nl-NL")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    Laatste activiteit: {buddy.lastActivity}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Eye className="h-4 w-4 mr-1" />
                      Open Chat
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Share className="h-4 w-4 mr-1" />
                      Deel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTravelBuddies.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen travel buddies gevonden</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Probeer je zoekopdracht of filter aan te passen"
                  : "Travel buddies worden automatisch aangemaakt voor bevestigde bookings"}
              </p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Travel Buddy
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Totaal Projecten</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Actieve Buddies</p>
                <p className="text-2xl font-bold">{travelBuddies.filter((b) => b.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Concepten</p>
                <p className="text-2xl font-bold">{projects.filter((p) => p.status === "draft").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Euro className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Totale Waarde</p>
                <p className="text-2xl font-bold">
                  €{projects.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString("nl-NL")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
