"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThumbsUp, MessageSquare, Plus, Clock, CheckCircle, Zap, Users, Lightbulb, Calendar, Star } from "lucide-react"

interface FeatureRequest {
  id: number
  title: string
  description: string
  category: string
  status: "idea" | "planned" | "in-progress" | "completed"
  votes: number
  comments: number
  author: string
  createdAt: string
  priority: "low" | "medium" | "high"
}

interface FeatureRoadmapInteractiveProps {
  userEmail: string
  userName: string
}

export default function FeatureRoadmapInteractive({ userEmail, userName }: FeatureRoadmapInteractiveProps) {
  const [features, setFeatures] = useState<FeatureRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newFeatureTitle, setNewFeatureTitle] = useState("")
  const [newFeatureDescription, setNewFeatureDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)

  // Demo data
  const demoFeatures: FeatureRequest[] = [
    {
      id: 1,
      title: "AI Foto Generator voor Bestemmingen",
      description: "Automatisch genereren van mooie foto's voor bestemmingen die nog geen afbeeldingen hebben",
      category: "ai-tools",
      status: "planned",
      votes: 23,
      comments: 8,
      author: "Agent Sarah",
      createdAt: "2025-01-03",
      priority: "high",
    },
    {
      id: 2,
      title: "WhatsApp Integratie voor Travel Buddy",
      description: "Klanten kunnen direct via WhatsApp chatten met hun Travel Buddy AI assistent",
      category: "integrations",
      status: "idea",
      votes: 18,
      comments: 12,
      author: "Agent Mark",
      createdAt: "2025-01-02",
      priority: "medium",
    },
    {
      id: 3,
      title: "Automatische Prijsupdate Notificaties",
      description: "Automatisch klanten informeren wanneer prijzen van hun reis wijzigen",
      category: "automation",
      status: "in-progress",
      votes: 31,
      comments: 5,
      author: "Agent Lisa",
      createdAt: "2025-01-01",
      priority: "high",
    },
    {
      id: 4,
      title: "Multi-taal Support voor Roadbooks",
      description: "Roadbooks automatisch vertalen naar verschillende talen voor internationale klanten",
      category: "features",
      status: "completed",
      votes: 45,
      comments: 15,
      author: "Agent Tom",
      createdAt: "2024-12-28",
      priority: "medium",
    },
    {
      id: 5,
      title: "Drag & Drop Roadbook Editor",
      description: "Visuele editor om roadbook secties te verslepen en aanpassen",
      category: "ui-ux",
      status: "planned",
      votes: 27,
      comments: 9,
      author: "Agent Emma",
      createdAt: "2024-12-25",
      priority: "medium",
    },
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setFeatures(demoFeatures)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleVote = (featureId: number) => {
    setFeatures((prev) =>
      prev.map((feature) => (feature.id === featureId ? { ...feature, votes: feature.votes + 1 } : feature)),
    )
  }

  const handleAddFeature = () => {
    if (!newFeatureTitle.trim() || !newFeatureDescription.trim()) return

    const newFeature: FeatureRequest = {
      id: Date.now(),
      title: newFeatureTitle,
      description: newFeatureDescription,
      category: "features",
      status: "idea",
      votes: 1,
      comments: 0,
      author: userName,
      createdAt: new Date().toISOString().split("T")[0],
      priority: "medium",
    }

    setFeatures((prev) => [newFeature, ...prev])
    setNewFeatureTitle("")
    setNewFeatureDescription("")
    setShowAddForm(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "in-progress":
        return "bg-blue-100 text-blue-700"
      case "planned":
        return "bg-yellow-100 text-yellow-700"
      case "idea":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in-progress":
        return <Zap className="h-4 w-4" />
      case "planned":
        return <Calendar className="h-4 w-4" />
      case "idea":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const filteredFeatures =
    selectedCategory === "all" ? features : features.filter((f) => f.category === selectedCategory)

  const categories = [
    { id: "all", name: "Alle Categorieën", count: features.length },
    { id: "ai-tools", name: "AI Tools", count: features.filter((f) => f.category === "ai-tools").length },
    { id: "integrations", name: "Integraties", count: features.filter((f) => f.category === "integrations").length },
    { id: "automation", name: "Automatisering", count: features.filter((f) => f.category === "automation").length },
    { id: "features", name: "Features", count: features.filter((f) => f.category === "features").length },
    { id: "ui-ux", name: "UI/UX", count: features.filter((f) => f.category === "ui-ux").length },
  ]

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Feature roadmap laden...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 p-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-gray-800 mb-2">🚀 Feature Roadmap & Stemboard</CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Stem op nieuwe features en deel je eigen ideeën voor de AI Travel Studio
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Idee
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {/* Add New Feature Form */}
        {showAddForm && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">💡 Nieuw Feature Idee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Feature titel..."
                value={newFeatureTitle}
                onChange={(e) => setNewFeatureTitle(e.target.value)}
                className="bg-white/80"
              />
              <Textarea
                placeholder="Beschrijf je idee in detail..."
                value={newFeatureDescription}
                onChange={(e) => setNewFeatureDescription(e.target.value)}
                className="bg-white/80 min-h-[100px]"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleAddFeature}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Idee Toevoegen
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Annuleren
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl p-1 h-auto">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2 rounded-xl py-3 px-4 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <span>{category.name}</span>
                <Badge className="bg-blue-100 text-blue-700 data-[state=active]:bg-white/20 data-[state=active]:text-white text-xs px-2 py-0.5 min-w-[1.5rem] h-5 flex items-center justify-center">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFeatures.map((feature) => (
                <Card
                  key={feature.id}
                  className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white shadow-xl rounded-2xl overflow-hidden"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(feature.status)} px-3 py-1 text-sm`}>
                          {getStatusIcon(feature.status)}
                          <span className="ml-1 capitalize">
                            {feature.status === "in-progress" && "In Ontwikkeling"}
                            {feature.status === "planned" && "Gepland"}
                            {feature.status === "completed" && "Afgerond"}
                            {feature.status === "idea" && "Idee"}
                          </span>
                        </Badge>
                        <Star className={`h-4 w-4 ${getPriorityColor(feature.priority)}`} />
                      </div>
                      <div className="text-xs text-gray-500">{feature.createdAt}</div>
                    </div>
                    <CardTitle className="text-lg leading-tight mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {feature.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {feature.comments}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVote(feature.id)}
                        className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 rounded-xl"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="font-semibold">{feature.votes}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFeatures.length === 0 && (
              <div className="text-center py-16">
                <Lightbulb className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-3">Geen features gevonden</h3>
                <p className="text-gray-500 mb-6">Wees de eerste om een idee te delen voor deze categorie!</p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Eerste Idee Toevoegen
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Stats Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{features.length}</div>
              <div className="text-sm text-gray-600">Totaal Ideeën</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {features.filter((f) => f.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">Afgerond</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {features.filter((f) => f.status === "in-progress").length}
              </div>
              <div className="text-sm text-gray-600">In Ontwikkeling</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{features.reduce((sum, f) => sum + f.votes, 0)}</div>
              <div className="text-sm text-gray-600">Totaal Stemmen</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
