"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  TrendingUp,
  Sparkles,
  Rocket,
  Lightbulb,
  Zap,
  Star,
  Heart,
  Target,
  Award,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface FeatureRequest {
  id: string
  title: string
  description: string
  user_id: string
  category: string
  priority: string
  status: string
  votes: number
  created_at: string
  updated_at: string
}

interface Comment {
  id: string
  feature_id: string
  user_id: string
  user_name: string
  comment: string
  created_at: string
}

interface VoteData {
  votes: number
  upVotes: number
  downVotes: number
  userVote: "up" | "down" | null
}

const priorityConfig = {
  critical: {
    color: "from-red-500 to-red-600",
    bg: "bg-gradient-to-r from-red-50 to-red-100",
    text: "text-red-800",
    icon: Zap,
  },
  high: {
    color: "from-orange-500 to-orange-600",
    bg: "bg-gradient-to-r from-orange-50 to-orange-100",
    text: "text-orange-800",
    icon: Star,
  },
  medium: {
    color: "from-yellow-500 to-yellow-600",
    bg: "bg-gradient-to-r from-yellow-50 to-yellow-100",
    text: "text-yellow-800",
    icon: Target,
  },
  low: {
    color: "from-green-500 to-green-600",
    bg: "bg-gradient-to-r from-green-50 to-green-100",
    text: "text-green-800",
    icon: Heart,
  },
}

const statusConfig = {
  open: {
    color: "from-blue-500 to-blue-600",
    bg: "bg-gradient-to-r from-blue-50 to-blue-100",
    text: "text-blue-800",
  },
  in_progress: {
    color: "from-purple-500 to-purple-600",
    bg: "bg-gradient-to-r from-purple-50 to-purple-100",
    text: "text-purple-800",
  },
  completed: {
    color: "from-green-500 to-green-600",
    bg: "bg-gradient-to-r from-green-50 to-green-100",
    text: "text-green-800",
  },
  on_hold: {
    color: "from-gray-500 to-gray-600",
    bg: "bg-gradient-to-r from-gray-50 to-gray-100",
    text: "text-gray-800",
  },
  rejected: {
    color: "from-red-500 to-red-600",
    bg: "bg-gradient-to-r from-red-50 to-red-100",
    text: "text-red-800",
  },
  planned: {
    color: "from-indigo-500 to-indigo-600",
    bg: "bg-gradient-to-r from-indigo-50 to-indigo-100",
    text: "text-indigo-800",
  },
}

const categoryConfig = {
  ai: {
    color: "from-purple-500 to-pink-600",
    bg: "bg-gradient-to-r from-purple-50 to-pink-100",
    text: "text-purple-800",
    icon: Sparkles,
  },
  mobile: {
    color: "from-blue-500 to-cyan-600",
    bg: "bg-gradient-to-r from-blue-50 to-cyan-100",
    text: "text-blue-800",
    icon: Rocket,
  },
  feature: {
    color: "from-green-500 to-emerald-600",
    bg: "bg-gradient-to-r from-green-50 to-emerald-100",
    text: "text-green-800",
    icon: Lightbulb,
  },
  ui: {
    color: "from-orange-500 to-red-600",
    bg: "bg-gradient-to-r from-orange-50 to-red-100",
    text: "text-orange-800",
    icon: Award,
  },
  analytics: {
    color: "from-indigo-500 to-purple-600",
    bg: "bg-gradient-to-r from-indigo-50 to-purple-100",
    text: "text-indigo-800",
    icon: TrendingUp,
  },
  technical: {
    color: "from-gray-500 to-slate-600",
    bg: "bg-gradient-to-r from-gray-50 to-slate-100",
    text: "text-gray-800",
    icon: Zap,
  },
  integration: {
    color: "from-teal-500 to-cyan-600",
    bg: "bg-gradient-to-r from-teal-50 to-cyan-100",
    text: "text-teal-800",
    icon: Target,
  },
  general: {
    color: "from-slate-500 to-gray-600",
    bg: "bg-gradient-to-r from-slate-50 to-gray-100",
    text: "text-slate-800",
    icon: Star,
  },
}

export default function FeatureRoadmapPage() {
  const [features, setFeatures] = useState<FeatureRequest[]>([])
  const [filteredFeatures, setFilteredFeatures] = useState<FeatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("votes")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedFeature, setSelectedFeature] = useState<FeatureRequest | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [userVotes, setUserVotes] = useState<Record<string, VoteData>>({})
  const [showNewFeatureDialog, setShowNewFeatureDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newFeature, setNewFeature] = useState({
    title: "",
    description: "",
    category: "feature",
    priority: "medium",
  })

  const currentUserId = "demo-user-" + Math.random().toString(36).substr(2, 9)

  useEffect(() => {
    fetchFeatures()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [features, searchTerm, categoryFilter, statusFilter, priorityFilter, sortBy, sortOrder])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/feature-requests")
      const data = await response.json()

      if (response.ok) {
        setFeatures(data || [])
        // Initialize vote data for each feature
        const voteMap: Record<string, VoteData> = {}
        data?.forEach((feature: FeatureRequest) => {
          voteMap[feature.id] = {
            votes: feature.votes || 0,
            upVotes: 0,
            downVotes: 0,
            userVote: null,
          }
        })
        setUserVotes(voteMap)
      } else {
        console.error("Error fetching features:", data)
        setFeatures([])
      }
    } catch (error) {
      console.error("Error fetching features:", error)
      setFeatures([])
      toast({
        title: "Fout bij laden",
        description: "Kon feature requests niet laden. Probeer het opnieuw.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...features]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (feature) =>
          feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feature.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((feature) => feature.category === categoryFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((feature) => feature.status === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((feature) => feature.priority === priorityFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof FeatureRequest]
      let bValue: any = b[sortBy as keyof FeatureRequest]

      if (sortBy === "votes") {
        aValue = userVotes[a.id]?.votes || a.votes || 0
        bValue = userVotes[b.id]?.votes || b.votes || 0
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredFeatures(filtered)
  }

  const handleVote = async (featureId: string, voteType: "up" | "down") => {
    try {
      const response = await fetch(`/api/feature-requests/${featureId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vote_type: voteType,
          user_id: currentUserId,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        // Update local vote data
        setUserVotes((prev) => ({
          ...prev,
          [featureId]: {
            votes: result.votes || 0,
            upVotes: prev[featureId]?.upVotes || 0,
            downVotes: prev[featureId]?.downVotes || 0,
            userVote: result.user_vote,
          },
        }))

        // Update feature votes in the list
        setFeatures((prev) =>
          prev.map((feature) => (feature.id === featureId ? { ...feature, votes: result.votes || 0 } : feature)),
        )

        toast({
          title: "Stem geregistreerd",
          description: `Je ${voteType === "up" ? "upvote" : "downvote"} is geregistreerd.`,
        })
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Fout",
        description: "Kon je stem niet registreren. Probeer het opnieuw.",
        variant: "destructive",
      })
    }
  }

  const handleCreateFeature = async () => {
    if (!newFeature.title.trim() || !newFeature.description.trim()) {
      toast({
        title: "Fout",
        description: "Vul alle verplichte velden in.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch("/api/feature-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newFeature,
          user_id: currentUserId,
          created_by: "Agent User",
        }),
      })

      const result = await response.json()
      if (response.ok) {
        setFeatures((prev) => [result, ...prev])
        setNewFeature({
          title: "",
          description: "",
          category: "feature",
          priority: "medium",
        })
        setShowNewFeatureDialog(false)
        toast({
          title: "Feature request aangemaakt",
          description: "Je feature request is succesvol ingediend.",
        })
      } else {
        throw new Error(result.error || "Failed to create feature request")
      }
    } catch (error) {
      console.error("Error creating feature:", error)
      toast({
        title: "Fout",
        description: "Kon feature request niet aanmaken. Probeer het opnieuw.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openFeatureDetails = (feature: FeatureRequest) => {
    setSelectedFeature(feature)
    // fetchComments(feature.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 animate-pulse"></div>
              </div>
              <p className="text-gray-600 font-medium">Feature requests laden...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                    AI Travel Studio
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Help vorm geven aan de toekomst van ons reisplatform door te stemmen op features en je ideeën te
                    delen.
                  </p>
                </div>
              </div>
              <Dialog open={showNewFeatureDialog} onOpenChange={setShowNewFeatureDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Plus className="w-5 h-5 mr-2" />
                    Nieuwe Feature
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
                  <DialogHeader className="pb-6">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Nieuwe Feature Request
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-base">
                      Beschrijf de feature die je graag toegevoegd zou zien aan ons platform.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                        Titel *
                      </Label>
                      <Input
                        id="title"
                        value={newFeature.title}
                        onChange={(e) => setNewFeature((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Korte titel voor je feature request"
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                        Beschrijving *
                      </Label>
                      <Textarea
                        id="description"
                        value={newFeature.description}
                        onChange={(e) => setNewFeature((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Gedetailleerde beschrijving van de feature en waarom deze waardevol zou zijn"
                        rows={4}
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                          Categorie
                        </Label>
                        <Select
                          value={newFeature.category}
                          onValueChange={(value) => setNewFeature((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                            <SelectItem value="ai">🤖 AI Features</SelectItem>
                            <SelectItem value="mobile">📱 Mobile App</SelectItem>
                            <SelectItem value="feature">✨ Nieuwe Feature</SelectItem>
                            <SelectItem value="ui">🎨 UI/UX</SelectItem>
                            <SelectItem value="analytics">📊 Analytics</SelectItem>
                            <SelectItem value="technical">⚙️ Technisch</SelectItem>
                            <SelectItem value="integration">🔗 Integratie</SelectItem>
                            <SelectItem value="general">📋 Algemeen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">
                          Prioriteit
                        </Label>
                        <Select
                          value={newFeature.priority}
                          onValueChange={(value) => setNewFeature((prev) => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                            <SelectItem value="low">🟢 Laag</SelectItem>
                            <SelectItem value="medium">🟡 Gemiddeld</SelectItem>
                            <SelectItem value="high">🟠 Hoog</SelectItem>
                            <SelectItem value="critical">🔴 Kritiek</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                      <Button
                        variant="outline"
                        onClick={() => setShowNewFeatureDialog(false)}
                        className="px-6 py-2 rounded-xl border-gray-200 hover:bg-gray-50"
                      >
                        Annuleren
                      </Button>
                      <Button
                        onClick={handleCreateFeature}
                        disabled={submitting}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Bezig...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Versturen
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Zoek features..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12">
                    <SelectValue placeholder="Alle Categorieën" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                    <SelectItem value="all">Alle Categorieën</SelectItem>
                    <SelectItem value="ai">🤖 AI Features</SelectItem>
                    <SelectItem value="mobile">📱 Mobile</SelectItem>
                    <SelectItem value="feature">✨ Features</SelectItem>
                    <SelectItem value="ui">🎨 UI/UX</SelectItem>
                    <SelectItem value="analytics">📊 Analytics</SelectItem>
                    <SelectItem value="technical">⚙️ Technisch</SelectItem>
                    <SelectItem value="integration">🔗 Integratie</SelectItem>
                    <SelectItem value="general">📋 Algemeen</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12">
                    <SelectValue placeholder="Alle Statussen" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                    <SelectItem value="all">Alle Statussen</SelectItem>
                    <SelectItem value="open">🔵 Open</SelectItem>
                    <SelectItem value="in_progress">🟣 In Behandeling</SelectItem>
                    <SelectItem value="completed">🟢 Voltooid</SelectItem>
                    <SelectItem value="planned">🔷 Gepland</SelectItem>
                    <SelectItem value="on_hold">⏸️ On Hold</SelectItem>
                    <SelectItem value="rejected">🔴 Afgewezen</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12">
                    <SelectValue placeholder="Alle Prioriteiten" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                    <SelectItem value="all">Alle Prioriteiten</SelectItem>
                    <SelectItem value="critical">🔴 Kritiek</SelectItem>
                    <SelectItem value="high">🟠 Hoog</SelectItem>
                    <SelectItem value="medium">🟡 Gemiddeld</SelectItem>
                    <SelectItem value="low">🟢 Laag</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [newSortBy, newSortOrder] = value.split("-")
                    setSortBy(newSortBy)
                    setSortOrder(newSortOrder)
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-12">
                    <SelectValue placeholder="Sorteer op" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                    <SelectItem value="votes-desc">📈 Meeste Stemmen</SelectItem>
                    <SelectItem value="votes-asc">📉 Minste Stemmen</SelectItem>
                    <SelectItem value="created_at-desc">🆕 Nieuwste</SelectItem>
                    <SelectItem value="created_at-asc">📅 Oudste</SelectItem>
                    <SelectItem value="title-asc">🔤 Titel A-Z</SelectItem>
                    <SelectItem value="title-desc">🔤 Titel Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <p className="text-gray-600 font-medium">
              <span className="font-bold text-gray-900">{filteredFeatures.length}</span> van{" "}
              <span className="font-bold text-gray-900">{features.length}</span> feature requests
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>
                Totaal stemmen: {features.reduce((sum, f) => sum + (userVotes[f.id]?.votes || f.votes || 0), 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="grid gap-6">
          {filteredFeatures.map((feature) => {
            const voteData = userVotes[feature.id] || {
              votes: feature.votes || 0,
              upVotes: 0,
              downVotes: 0,
              userVote: null,
            }
            const categoryInfo =
              categoryConfig[feature.category as keyof typeof categoryConfig] || categoryConfig.general
            const priorityInfo =
              priorityConfig[feature.priority as keyof typeof priorityConfig] || priorityConfig.medium
            const statusInfo = statusConfig[feature.status as keyof typeof statusConfig] || statusConfig.open
            const CategoryIcon = categoryInfo.icon
            const PriorityIcon = priorityInfo.icon

            return (
              <Card
                key={feature.id}
                className="group bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] rounded-3xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <Badge
                          className={`${categoryInfo.bg} ${categoryInfo.text} border-0 px-3 py-1 rounded-full font-medium shadow-sm`}
                        >
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {feature.category}
                        </Badge>
                        <Badge
                          className={`${priorityInfo.bg} ${priorityInfo.text} border-0 px-3 py-1 rounded-full font-medium shadow-sm`}
                        >
                          <PriorityIcon className="w-3 h-3 mr-1" />
                          {feature.priority}
                        </Badge>
                        <Badge
                          className={`${statusInfo.bg} ${statusInfo.text} border-0 px-3 py-1 rounded-full font-medium shadow-sm`}
                        >
                          {feature.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <CardTitle
                        className="text-xl mb-3 cursor-pointer hover:text-blue-600 transition-colors duration-300 font-bold"
                        onClick={() => openFeatureDetails(feature)}
                      >
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-center space-y-2 ml-6">
                      <Button
                        variant={voteData.userVote === "up" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleVote(feature.id, "up")}
                        className={`rounded-xl transition-all duration-300 transform hover:scale-110 ${
                          voteData.userVote === "up"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                            : "border-gray-200 hover:border-green-500 hover:bg-green-50"
                        }`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <div className="text-center">
                        <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {voteData.votes}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">stemmen</div>
                      </div>
                      <Button
                        variant={voteData.userVote === "down" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleVote(feature.id, "down")}
                        className={`rounded-xl transition-all duration-300 transform hover:scale-110 ${
                          voteData.userVote === "down"
                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                            : "border-gray-200 hover:border-red-500 hover:bg-red-50"
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span className="font-medium">{feature.user_id}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(feature.created_at).toLocaleDateString("nl-NL")}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openFeatureDetails(feature)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 max-w-md mx-auto">
                <div className="text-gray-400 mb-6">
                  <Filter className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Geen features gevonden</h3>
                <p className="text-gray-600 mb-6">Probeer je filters of zoektermen aan te passen.</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("all")
                    setStatusFilter("all")
                    setPriorityFilter("all")
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Filters Wissen
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Feature Details Dialog */}
        <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
            {selectedFeature && (
              <>
                <DialogHeader className="pb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {(() => {
                      const categoryInfo =
                        categoryConfig[selectedFeature.category as keyof typeof categoryConfig] ||
                        categoryConfig.general
                      const priorityInfo =
                        priorityConfig[selectedFeature.priority as keyof typeof priorityConfig] || priorityConfig.medium
                      const statusInfo =
                        statusConfig[selectedFeature.status as keyof typeof statusConfig] || statusConfig.open
                      const CategoryIcon = categoryInfo.icon
                      const PriorityIcon = priorityInfo.icon

                      return (
                        <>
                          <Badge
                            className={`${categoryInfo.bg} ${categoryInfo.text} border-0 px-3 py-1 rounded-full font-medium shadow-sm`}
                          >
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {selectedFeature.category}
                          </Badge>
                          <Badge
                            className={`${priorityInfo.bg} ${priorityInfo.text} border-0 px-3 py-1 rounded-full font-medium shadow-sm`}
                          >
                            <PriorityIcon className="w-3 h-3 mr-1" />
                            {selectedFeature.priority}
                          </Badge>
                          <Badge
                            className={`${statusInfo.bg} ${statusInfo.text} border-0 px-3 py-1 rounded-full font-medium shadow-sm`}
                          >
                            {selectedFeature.status.replace("_", " ")}
                          </Badge>
                        </>
                      )
                    })()}
                  </div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {selectedFeature.title}
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-600 leading-relaxed">
                    {selectedFeature.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6 text-sm bg-gray-50/50 rounded-2xl p-4">
                    <div>
                      <span className="font-semibold text-gray-700">Ingediend door:</span>
                      <p className="text-gray-600 mt-1">{selectedFeature.user_id}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Aangemaakt:</span>
                      <p className="text-gray-600 mt-1">
                        {new Date(selectedFeature.created_at).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Laatst bijgewerkt:</span>
                      <p className="text-gray-600 mt-1">
                        {new Date(selectedFeature.updated_at).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Huidige stemmen:</span>
                      <p className="text-gray-600 mt-1 font-bold">
                        {userVotes[selectedFeature.id]?.votes || selectedFeature.votes || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-6 py-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl border border-blue-100/50">
                    <Button
                      variant={userVotes[selectedFeature.id]?.userVote === "up" ? "default" : "outline"}
                      onClick={() => handleVote(selectedFeature.id, "up")}
                      className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        userVotes[selectedFeature.id]?.userVote === "up"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                          : "border-gray-200 hover:border-green-500 hover:bg-green-50"
                      }`}
                    >
                      <ChevronUp className="w-5 h-5 mr-2" />
                      Upvote
                    </Button>
                    <div className="text-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {userVotes[selectedFeature.id]?.votes || selectedFeature.votes || 0}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">stemmen</div>
                    </div>
                    <Button
                      variant={userVotes[selectedFeature.id]?.userVote === "down" ? "default" : "outline"}
                      onClick={() => handleVote(selectedFeature.id, "down")}
                      className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        userVotes[selectedFeature.id]?.userVote === "down"
                          ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                          : "border-gray-200 hover:border-red-500 hover:bg-red-50"
                      }`}
                    >
                      <ChevronDown className="w-5 h-5 mr-2" />
                      Downvote
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
