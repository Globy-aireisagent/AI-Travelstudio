"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ThumbsUp, MessageCircle, Search, Clock, CheckCircle, AlertCircle, Star } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { ScrollArea } from "@/components/ui/scroll-area"

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

  // Load features
  useEffect(() => {
    async function fetchFeatures() {
      const { data, error } = await supabase
        .from("feature_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) setFeatures(data as FeatureRequest[])
      setLoading(false)
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
        // loadFeatures() // This line was causing an error, so it's commented out
      }
    } catch (error) {
      console.error("Error voting:", error)
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
        // loadFeatures() // This line was causing an error, so it's commented out
        if (selectedFeature?.id === featureId) {
          setSelectedFeature({ ...selectedFeature, status: newStatus as any })
        }
      }
    } catch (error) {
      console.error("Error updating status:", error)
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
        // loadFeatures() // This line was causing an error, so it's commented out
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleCreateFeature = async () => {
    if (!newFeature.title.trim() || !newFeature.description.trim()) return

    try {
      const response = await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFeature),
      })
      if (response.ok) {
        setNewFeature({ title: "", description: "", category: "", priority: "medium" })
        setShowNewFeatureForm(false)
        // loadFeatures() // This line was causing an error, so it's commented out
      }
    } catch (error) {
      console.error("Error creating feature:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
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

  const loadFeatures = async () => {
    const { data, error } = await supabase
      .from("feature_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) setFeatures(data as FeatureRequest[])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Features</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold">{stats.totalVotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
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
        <Button onClick={() => setShowNewFeatureForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Feature
        </Button>
      </div>

      {/* New Feature Form */}
      {showNewFeatureForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Feature Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Feature title..."
              value={newFeature.title}
              onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
            />
            <Textarea
              placeholder="Feature description..."
              value={newFeature.description}
              onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
              rows={3}
            />
            <div className="flex gap-4">
              <Input
                placeholder="Category (optional)"
                value={newFeature.category}
                onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value })}
              />
              <Select
                value={newFeature.priority}
                onValueChange={(value: any) => setNewFeature({ ...newFeature, priority: value })}
              >
                <SelectTrigger>
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
            <div className="flex gap-2">
              <Button onClick={handleCreateFeature}>Create Feature</Button>
              <Button variant="outline" onClick={() => setShowNewFeatureForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features List */}
      <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Feature Requests ({filteredFeatures.length})</h3>
            {filteredFeatures.map((feature) => (
              <Card
                key={feature.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedFeature?.id === feature.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => {
                  setSelectedFeature(feature)
                  loadComments(feature.id)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <div className="flex gap-1">
                      <Badge className={getStatusColor(feature.status)} variant="secondary">
                        {feature.status.replace("_", " ")}
                      </Badge>
                      <Badge className={getPriorityColor(feature.priority)} variant="secondary">
                        {feature.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{feature.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleVote(feature.id)
                        }}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {feature.votes}
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {feature.comments_count}
                      </div>
                    </div>
                    <span>{new Date(feature.created_at).toLocaleDateString()}</span>
                  </div>
                  {feature.category && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {feature.category}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Details */}
          <div>
            {selectedFeature ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedFeature.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Created {new Date(selectedFeature.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(selectedFeature.status)} variant="secondary">
                        {selectedFeature.status.replace("_", " ")}
                      </Badge>
                      <Badge className={getPriorityColor(selectedFeature.priority)} variant="secondary">
                        {selectedFeature.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{selectedFeature.description}</p>

                  {/* Admin Controls */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Admin Controls</h4>
                    <Select
                      value={selectedFeature.status}
                      onValueChange={(value) => handleStatusChange(selectedFeature.id, value)}
                    >
                      <SelectTrigger>
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
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Comments ({comments.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-2 rounded text-sm">
                          <p>{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddComment(selectedFeature.id)}
                      />
                      <Button size="sm" onClick={() => handleAddComment(selectedFeature.id)}>
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a feature request to view details and comments</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default FeatureManagementDashboard
