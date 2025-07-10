"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Lightbulb,
  Plus,
  Heart,
  HeartOff,
  Search,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react"
import Link from "next/link"

interface FeatureRequest {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  vote_count: number
  eta: string
  submitted_by_name?: string
  created_at: string
}

interface FeatureRoadmapProps {
  userEmail?: string
  userName?: string
}

export default function FeatureRoadmapInteractive({
  userEmail = "demo@example.com",
  userName = "Demo User",
}: FeatureRoadmapProps) {
  const [features, setFeatures] = useState<FeatureRequest[]>([])
  const [userVotes, setUserVotes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("vote_count")
  const [isVoting, setIsVoting] = useState<string | null>(null)

  useEffect(() => {
    loadFeatures()
  }, [statusFilter, categoryFilter, sortBy])

  const loadFeatures = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        userEmail,
        status: statusFilter,
        category: categoryFilter,
        sortBy,
        order: "desc",
      })

      const response = await fetch(`/api/feature-requests?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFeatures(data.features || [])
        setUserVotes(data.userVotes || [])
      }
    } catch (error) {
      console.error("Failed to load features:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = async (featureId: string, hasVoted: boolean) => {
    setIsVoting(featureId)
    try {
      const response = await fetch(`/api/feature-requests/${featureId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterEmail: userEmail,
          voterName: userName,
          action: hasVoted ? "unvote" : "vote",
        }),
      })

      if (response.ok) {
        // Update local state
        if (hasVoted) {
          setUserVotes((prev) => prev.filter((id) => id !== featureId))
          setFeatures((prev) => prev.map((f) => (f.id === featureId ? { ...f, vote_count: f.vote_count - 1 } : f)))
        } else {
          setUserVotes((prev) => [...prev, featureId])
          setFeatures((prev) => prev.map((f) => (f.id === featureId ? { ...f, vote_count: f.vote_count + 1 } : f)))
        }
      }
    } catch (error) {
      console.error("Failed to vote:", error)
    } finally {
      setIsVoting(null)
    }
  }

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredFeatures = features.filter((feature) => {
    const matchesSearch =
      feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const stats = {
    completed: features.filter((f) => f.status === "completed").length,
    inDevelopment: features.filter((f) => f.status === "in-development").length,
    pipeline: features.filter((f) => f.status === "pipeline").length,
    totalVotes: features.reduce((sum, f) => sum + f.vote_count, 0),
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-3xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-3xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white rounded-3xl shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl p-6">
            <CardTitle className="flex items-center text-lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Afgerond
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.completed}</div>
            <p className="text-gray-600 text-sm">Features voltooid</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-3xl p-6">
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2" />
              In Ontwikkeling
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.inDevelopment}</div>
            <p className="text-gray-600 text-sm">Features in uitvoering</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-t-3xl p-6">
            <CardTitle className="flex items-center text-lg">
              <AlertCircle className="h-5 w-5 mr-2" />
              Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pipeline}</div>
            <p className="text-gray-600 text-sm">Features gepland</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-3xl p-6">
            <CardTitle className="flex items-center text-lg">
              <Heart className="h-5 w-5 mr-2" />
              Stemmen
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalVotes}</div>
            <p className="text-gray-600 text-sm">Totaal stemmen</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Zoek features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 rounded-xl border-gray-200">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statussen</SelectItem>
              <SelectItem value="pipeline">Pipeline</SelectItem>
              <SelectItem value="in-development">In Ontwikkeling</SelectItem>
              <SelectItem value="completed">Afgerond</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 rounded-xl border-gray-200">
              <SelectValue placeholder="Sorteer op" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vote_count">Meeste stemmen</SelectItem>
              <SelectItem value="created_at">Nieuwste eerst</SelectItem>
              <SelectItem value="priority">Prioriteit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/feature-request">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl px-6 py-3">
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Verzoek
          </Button>
        </Link>
      </div>

      {/* Feature List */}
      <Card className="bg-white rounded-3xl shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-3xl p-6">
          <CardTitle className="flex items-center">
            <Lightbulb className="h-6 w-6 mr-2" />
            Feature Roadmap & Verzoeken
          </CardTitle>
          <CardDescription className="text-purple-100">
            Stem op features en bekijk de ontwikkelingsvoortgang
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredFeatures.length > 0 ? (
              filteredFeatures.map((feature) => {
                const hasVoted = userVotes.includes(feature.id)
                const isCurrentlyVoting = isVoting === feature.id

                return (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(feature.status)}
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status === "completed"
                            ? "Afgerond"
                            : feature.status === "in-development"
                              ? "In Ontwikkeling"
                              : "Pipeline"}
                        </Badge>
                        <Badge className={getPriorityColor(feature.priority)}>
                          {feature.priority === "high" ? "Hoog" : feature.priority === "medium" ? "Gemiddeld" : "Laag"}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{feature.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {feature.eta}
                          </span>
                          {feature.submitted_by_name && (
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {feature.submitted_by_name}
                            </span>
                          )}
                          <span className="flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {new Date(feature.created_at).toLocaleDateString("nl-NL")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800">{feature.eta}</div>
                        <div className="text-xs text-gray-500">ETA</div>
                      </div>
                      <Button
                        variant={hasVoted ? "default" : "outline"}
                        size="sm"
                        className={`flex items-center space-x-2 rounded-xl transition-all duration-200 ${
                          hasVoted
                            ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
                            : "hover:shadow-md bg-transparent"
                        }`}
                        disabled={feature.status === "completed" || isCurrentlyVoting}
                        onClick={() => handleVote(feature.id, hasVoted)}
                      >
                        {isCurrentlyVoting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : hasVoted ? (
                          <Heart className="h-4 w-4 fill-current" />
                        ) : (
                          <HeartOff className="h-4 w-4" />
                        )}
                        <span>{feature.vote_count}</span>
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Geen features gevonden</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? "Probeer je zoekterm aan te passen" : "Er zijn nog geen feature verzoeken"}
                </p>
                <Link href="/feature-request">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl px-6 py-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Eerste Verzoek Indienen
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
