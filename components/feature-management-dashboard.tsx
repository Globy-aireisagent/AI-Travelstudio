"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ThumbsUp, MessageCircle, Search, Clock, CheckCircle, Star, Zap } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"

interface FeatureRequest {
  id: string
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "rejected"
  priority: "low" | "medium" | "high" | "critical"
  votes: number
  comments_count: number
  created_at: string
  updated_at: string
  category: string
  user_email?: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_email?: string
}

const FeatureManagementDashboard = () => {
  const [features, setFeatures] = useState<FeatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<FeatureRequest | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewFeatureForm, setShowNewFeatureForm] = useState(false)
  const [newFeature, setNewFeature] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
  })

  // Load features from API
  useEffect(() => {
    async function fetchFeatures() {
      try {
        const response = await fetch("/api/feature-requests")
        if (response.ok) {
          const data = await response.json()
          setFeatures(data)
        } else {
          console.error("Failed to fetch features:", response.statusText)
          toast({
            title: "Error",
            description: "Failed to load feature requests. Please check your database connection.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching features:", error)
        toast({
          title: "Connection Error",
          description: "Unable to connect to the database. Please check your Supabase configuration.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFeatures()
  }, [])

  const loadComments = async (featureId: string) => {
    try {
      const response = await fetch(`/api/feature-requests/${featureId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const handleVote = async (featureId: string) => {
    try {
      const response = await fetch(`/api/feature-requests/${featureId}/vote`, {
        method: "POST",
      })
      if (response.ok) {
        // Refresh features
        const updatedResponse = await fetch("/api/feature-requests")
        if (updatedResponse.ok) {
          const data = await updatedResponse.json()
          setFeatures(data)
        }
        toast({
          title: "Vote Recorded",
          description: "Your vote has been recorded successfully.",
        })
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to record vote.",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (featureId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/feature-requests/${featureId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        // Refresh features
        const updatedResponse = await fetch("/api/feature-requests")
        if (updatedResponse.ok) {
          const data = await updatedResponse.json()
          setFeatures(data)
        }
        if (selectedFeature?.id === featureId) {
          setSelectedFeature({ ...selectedFeature, status: newStatus as any })
        }
        toast({
          title: "Status Updated",
          description: "Feature status has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async (featureId: string) => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/feature-requests/${featureId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })
      if (response.ok) {
        setNewComment("")
        loadComments(featureId)
        // Refresh features to update comment count
        const updatedResponse = await fetch("/api/feature-requests")
        if (updatedResponse.ok) {
          const data = await updatedResponse.json()
          setFeatures(data)
        }
        toast({
          title: "Comment Added",
          description: "Your comment has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      })
    }
  }

  const handleCreateFeature = async () => {
    if (!newFeature.title.trim() || !newFeature.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and description.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFeature),
      })
      if (response.ok) {
        setNewFeature({ title: "", description: "", category: "", priority: "medium" })
        setShowNewFeatureForm(false)
        // Refresh features
        const updatedResponse = await fetch("/api/feature-requests")
        if (updatedResponse.ok) {
          const data = await updatedResponse.json()
          setFeatures(data)
        }
        toast({
          title: "Feature Created",
          description: "New feature request has been created successfully.",
        })
      }
    } catch (error) {
      console.error("Error creating feature:", error)
      toast({
        title: "Error",
        description: "Failed to create feature request.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
      case "in_progress":
        return "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
      case "rejected":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-gradient-to-r from-red-600 to-red-800 text-white"
      case "high":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white"
      case "medium":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "low":
        return "bg-gradient-to-r from-green-500 to-blue-500 text-white"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
    }
  }

  const filteredFeatures = features.filter((feature) => {
    const matchesStatus = filterStatus === "all" || feature.status === filterStatus
    const matchesSearch =
      feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: features.length,
    pending: features.filter((f) => f.status === "pending").length,
    inProgress: features.filter((f) => f.status === "in_progress").length,
    completed: features.filter((f) => f.status === "completed").length,
    totalVotes: features.reduce((sum, f) => sum + f.votes, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-500 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview - 3D Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Features</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <ThumbsUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Votes</p>
                <p className="text-3xl font-bold">{stats.totalVotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-100 border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setShowNewFeatureForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Feature
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Feature Form */}
      {showNewFeatureForm && (
        <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Feature Request
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Input
              placeholder="Feature title..."
              value={newFeature.title}
              onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
            <Textarea
              placeholder="Feature description..."
              value={newFeature.description}
              onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
              rows={4}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Category (optional)"
                value={newFeature.category}
                onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value })}
                className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
              <Select
                value={newFeature.priority}
                onValueChange={(value: any) => setNewFeature({ ...newFeature, priority: value })}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCreateFeature}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Create Feature
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewFeatureForm(false)}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Feature Requests
            </h3>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">{filteredFeatures.length}</Badge>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredFeatures.length === 0 ? (
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Features Found</h3>
                    <p className="text-gray-500">Try adjusting your search or create a new feature request.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredFeatures.map((feature) => (
                  <Card
                    key={feature.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg ${
                      selectedFeature?.id === feature.id ? "ring-4 ring-purple-500 shadow-purple-200" : ""
                    }`}
                    onClick={() => {
                      setSelectedFeature(feature)
                      loadComments(feature.id)
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold text-lg text-gray-800 line-clamp-2">{feature.title}</h4>
                        <div className="flex gap-2 ml-4">
                          <Badge className={`${getStatusColor(feature.status)} shadow-lg`}>
                            {feature.status.replace("_", " ")}
                          </Badge>
                          <Badge className={`${getPriorityColor(feature.priority)} shadow-lg`}>
                            {feature.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-3">{feature.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVote(feature.id)
                            }}
                            className="flex items-center gap-2 hover:text-purple-600 transition-colors duration-200 p-2 rounded-lg hover:bg-purple-50"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="font-medium">{feature.votes}</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            <span>{feature.comments_count || 0}</span>
                          </div>
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {new Date(feature.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {feature.category && (
                        <Badge variant="outline" className="mt-3 border-purple-200 text-purple-700">
                          {feature.category}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Feature Details */}
        <div className="sticky top-4">
          {selectedFeature ? (
            <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{selectedFeature.title}</CardTitle>
                    <CardDescription className="text-purple-100">
                      Created {new Date(selectedFeature.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Badge className={`${getStatusColor(selectedFeature.status)} shadow-lg`}>
                      {selectedFeature.status.replace("_", " ")}
                    </Badge>
                    <Badge className={`${getPriorityColor(selectedFeature.priority)} shadow-lg`}>
                      {selectedFeature.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{selectedFeature.description}</p>
                </div>

                {/* Admin Controls */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3 text-gray-800">Admin Controls</h4>
                  <Select
                    value={selectedFeature.status}
                    onValueChange={(value) => handleStatusChange(selectedFeature.id, value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Comments */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comments ({comments.length})
                  </h4>
                  <ScrollArea className="max-h-48 mb-4">
                    <div className="space-y-3">
                      {comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                            <p className="text-gray-700 mb-2">{comment.content}</p>
                            <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddComment(selectedFeature.id)}
                      className="flex-1 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <Button
                      onClick={() => handleAddComment(selectedFeature.id)}
                      disabled={!newComment.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Feature Request</h3>
                <p className="text-gray-500">Choose a feature from the list to view details and manage comments</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeatureManagementDashboard
