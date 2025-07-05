"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Plus, Search, Clock, CheckCircle, AlertCircle, Lightbulb, Users, Calendar } from "lucide-react"

interface FeatureRequest {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  vote_count: number
  submitter_name?: string
  submitter_email?: string
  created_at: string
  updated_at: string
}

interface FeatureStats {
  total: number
  completed: number
  inDevelopment: number
  planned: number
  submitted: number
  totalVotes: number
}

export default function FeatureRoadmapInteractive() {
  const [features, setFeatures] = useState<FeatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState<string | null>(null)
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("vote_count")

  // Mock user email for voting (in real app, get from auth)
  const userEmail = "user@aitravelstudio.nl"

  const fetchFeatures = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        sortBy: sortBy,
        sortOrder: sortBy === "vote_count" ? "desc" : "desc",
      })

      const response = await fetch(`/api/feature-requests?${params}`)
      if (!response.ok) throw new Error("Failed to fetch features")

      const data = await response.json()
      setFeatures(data.features || [])

      // Check which features user has voted for
      const voteChecks = await Promise.all(
        data.features.map(async (feature: FeatureRequest) => {
          try {
            const voteResponse = await fetch(`/api/feature-requests/${feature.id}/vote?voterEmail=${userEmail}`)
            if (voteResponse.ok) {
              const voteData = await voteResponse.json()
              return { id: feature.id, hasVoted: voteData.hasVoted }
            }
          } catch (error) {
            console.error("Error checking vote status:", error)
          }
          return { id: feature.id, hasVoted: false }
        }),
      )

      const votedFeatures = new Set(voteChecks.filter((check) => check.hasVoted).map((check) => check.id))
      setUserVotes(votedFeatures)
    } catch (error) {
      console.error("Error fetching features:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeatures()
  }, [searchTerm, statusFilter, categoryFilter, sortBy])

  const handleVote = async (featureId: string) => {
    if (voting) return

    setVoting(featureId)
    const hasVoted = userVotes.has(featureId)
    const action = hasVoted ? "unvote" : "vote"

    try {
      const response = await fetch(`/api/feature-requests/${featureId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterEmail: userEmail,
          voterName: "AI Travel Studio User",
          action,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to vote")
      }

      // Update local state
      const newUserVotes = new Set(userVotes)
      if (hasVoted) {
        newUserVotes.delete(featureId)
      } else {
        newUserVotes.add(featureId)
      }
      setUserVotes(newUserVotes)

      // Update vote count in features list
      setFeatures((prev) =>
        prev.map((feature) =>
          feature.id === featureId ? { ...feature, vote_count: feature.vote_count + (hasVoted ? -1 : 1) } : feature,
        ),
      )
    } catch (error) {
      console.error("Error voting:", error)
    } finally {
      setVoting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-development":
        return "bg-blue-100 text-blue-800"
      case "planned":
        return "bg-yellow-100 text-yellow-800"
      case "submitted":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in-development":
        return <Clock className="h-4 w-4" />
      case "planned":
        return <Calendar className="h-4 w-4" />
      case "submitted":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ai":
        return "🤖"
      case "mobile":
        return "📱"
      case "feature":
        return "✨"
      case "ui":
        return "🎨"
      case "analytics":
        return "📊"
      case "technical":
        return "⚙️"
      case "integration":
        return "🔗"
      default:
        return "💡"
    }
  }

  const stats: FeatureStats = {
    total: features.length,
    completed: features.filter((f) => f.status === "completed").length,
    inDevelopment: features.filter((f) => f.status === "in-development").length,
    planned: features.filter((f) => f.status === "planned").length,
    submitted: features.filter((f) => f.status === "submitted").length,
    totalVotes: features.reduce((sum, f) => sum + f.vote_count, 0),
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white rounded-3xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Afgerond</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-green-600">✅ Live</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">In Ontwikkeling</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inDevelopment}</p>
              <p className="text-xs text-blue-600">🔄 Actief</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Pipeline</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.planned + stats.submitted}</p>
              <p className="text-xs text-yellow-600">📋 Gepland</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Totaal Stemmen</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalVotes}</p>
              <p className="text-xs text-purple-600">❤️ Community</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="bg-white rounded-3xl shadow-lg border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Feature Roadmap & Verzoeken
              </CardTitle>
              <CardDescription>Stem op features en dien nieuwe verzoeken in</CardDescription>
            </div>
            <Link href="/feature-request">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Verzoek
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Zoek features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-2xl"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 rounded-2xl">
                <SelectValue placeholder="Status filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="submitted">Ingediend</SelectItem>
                <SelectItem value="planned">Gepland</SelectItem>
                <SelectItem value="in-development">In ontwikkeling</SelectItem>
                <SelectItem value="completed">Afgerond</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 rounded-2xl">
                <SelectValue placeholder="Categorie filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                <SelectItem value="ai">🤖 AI & ML</SelectItem>
                <SelectItem value="mobile">📱 Mobile</SelectItem>
                <SelectItem value="feature">✨ Features</SelectItem>
                <SelectItem value="ui">🎨 UI/UX</SelectItem>
                <SelectItem value="analytics">📊 Analytics</SelectItem>
                <SelectItem value="technical">⚙️ Technical</SelectItem>
                <SelectItem value="integration">🔗 Integraties</SelectItem>
                <SelectItem value="general">💡 Algemeen</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 rounded-2xl">
                <SelectValue placeholder="Sorteer op" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vote_count">Meeste stemmen</SelectItem>
                <SelectItem value="created_at">Nieuwste eerst</SelectItem>
                <SelectItem value="updated_at">Recent geüpdatet</SelectItem>
                <SelectItem value="title">Alfabetisch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            {features.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Geen features gevonden met de huidige filters.</p>
              </div>
            ) : (
              features.map((feature) => (
                <div
                  key={feature.id}
                  className="p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getCategoryIcon(feature.category)}</span>
                        <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                          {feature.title}
                        </h3>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(feature.status)}>
                            {getStatusIcon(feature.status)}
                            <span className="ml-1 capitalize">{feature.status.replace("-", " ")}</span>
                          </Badge>
                          <Badge className={getPriorityColor(feature.priority)}>{feature.priority}</Badge>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {feature.submitter_name && <span>Door: {feature.submitter_name}</span>}
                        <span>
                          {new Date(feature.created_at).toLocaleDateString("nl-NL", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 ml-6">
                      <Button
                        onClick={() => handleVote(feature.id)}
                        disabled={voting === feature.id}
                        variant="ghost"
                        size="sm"
                        className={`rounded-2xl transition-all duration-300 hover:scale-110 ${
                          userVotes.has(feature.id)
                            ? "text-red-600 hover:text-red-700"
                            : "text-gray-400 hover:text-red-600"
                        }`}
                      >
                        {voting === feature.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <Heart className={`h-5 w-5 ${userVotes.has(feature.id) ? "fill-current" : ""}`} />
                        )}
                      </Button>
                      <span className="text-sm font-medium text-gray-700">{feature.vote_count}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
