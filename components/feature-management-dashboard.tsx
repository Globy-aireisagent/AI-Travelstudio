"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
  Edit,
  Trash2,
  Users,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase-client"

interface FeatureRequest {
  id: string
  title: string
  description: string
  category: "feature" | "enhancement" | "bug" | "improvement"
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "submitted" | "in_progress" | "completed" | "rejected" | "on_hold"
  votes: number
  upvotes: number
  downvotes: number
  created_by?: string
  user_id?: string
  created_at: string
  updated_at: string
}

interface FeatureComment {
  id: string
  feature_id: string
  user_id: string
  comment: string
  created_at: string
}

interface FeatureVote {
  id: string
  feature_id: string
  user_id: string
  vote_type: "up" | "down"
  created_at: string
}

// Mock data for offline functionality
const mockFeatures: FeatureRequest[] = [
  {
    id: "1",
    title: "AI-Powered Itinerary Generator",
    description:
      "Automatically generate personalized travel itineraries based on user preferences, budget, and travel dates using AI.",
    category: "feature",
    priority: "high",
    status: "in_progress",
    votes: 15,
    upvotes: 18,
    downvotes: 3,
    created_by: "admin",
    user_id: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Real-time Flight Price Tracking",
    description: "Monitor flight prices in real-time and send notifications when prices drop for saved routes.",
    category: "feature",
    priority: "high",
    status: "pending",
    votes: 12,
    upvotes: 14,
    downvotes: 2,
    created_by: "admin",
    user_id: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Multi-language Support",
    description: "Add support for multiple languages including Dutch, German, French, and Spanish.",
    category: "enhancement",
    priority: "medium",
    status: "pending",
    votes: 8,
    upvotes: 10,
    downvotes: 2,
    created_by: "admin",
    user_id: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function FeatureManagementDashboard() {
  const [features, setFeatures] = useState<FeatureRequest[]>([])
  const [comments, setComments] = useState<FeatureComment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedFeature, setSelectedFeature] = useState<FeatureRequest | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [newComment, setNewComment] = useState("")

  // Form state for creating/editing features
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "feature" as const,
    priority: "medium" as const,
    status: "pending" as const,
  })

  const supabase = createClient()

  useEffect(() => {
    loadFeatures()
    loadComments()
  }, [])

  const loadFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from("feature_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        setFeatures(mockFeatures)
        toast({
          title: "Using Mock Data",
          description: "Could not connect to Supabase, using sample data.",
          variant: "default",
        })
      } else {
        setFeatures(data || [])
      }
    } catch (error) {
      console.error("Error loading features:", error)
      setFeatures(mockFeatures)
      toast({
        title: "Using Mock Data",
        description: "Could not connect to database, using sample data.",
        variant: "default",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("feature_comments")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading comments:", error)
        setComments([])
      } else {
        setComments(data || [])
      }
    } catch (error) {
      console.error("Error loading comments:", error)
      setComments([])
    }
  }

  const handleCreateFeature = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Title and description are required",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("feature_requests")
        .insert([
          {
            ...formData,
            created_by: "admin",
            user_id: "system",
            votes: 0,
            upvotes: 0,
            downvotes: 0,
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      setFeatures([data, ...features])
      setIsCreateDialogOpen(false)
      setFormData({
        title: "",
        description: "",
        category: "feature",
        priority: "medium",
        status: "pending",
      })
      toast({
        title: "Feature Created",
        description: "New feature request has been created successfully.",
      })
    } catch (error) {
      console.error("Error creating feature:", error)
      toast({
        title: "Error",
        description: "Failed to create feature request.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateFeature = async () => {
    if (!selectedFeature) return

    try {
      const { data, error } = await supabase
        .from("feature_requests")
        .update(formData)
        .eq("id", selectedFeature.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setFeatures(features.map((f) => (f.id === selectedFeature.id ? data : f)))
      setIsEditDialogOpen(false)
      setSelectedFeature(null)
      toast({
        title: "Feature Updated",
        description: "Feature request has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating feature:", error)
      toast({
        title: "Error",
        description: "Failed to update feature request.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFeature = async (featureId: string) => {
    try {
      const { error } = await supabase.from("feature_requests").delete().eq("id", featureId)

      if (error) {
        throw error
      }

      setFeatures(features.filter((f) => f.id !== featureId))
      toast({
        title: "Feature Deleted",
        description: "Feature request has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting feature:", error)
      toast({
        title: "Error",
        description: "Failed to delete feature request.",
        variant: "destructive",
      })
    }
  }

  const handleVote = async (featureId: string, voteType: "up" | "down") => {
    try {
      // First, check if user has already voted
      const { data: existingVote } = await supabase
        .from("feature_votes")
        .select("*")
        .eq("feature_id", featureId)
        .eq("user_id", "current_user")
        .single()

      if (existingVote) {
        // Update existing vote
        await supabase.from("feature_votes").update({ vote_type: voteType }).eq("id", existingVote.id)
      } else {
        // Create new vote
        await supabase.from("feature_votes").insert([
          {
            feature_id: featureId,
            user_id: "current_user",
            vote_type: voteType,
          },
        ])
      }

      // Reload features to get updated vote counts
      loadFeatures()
      toast({
        title: "Vote Recorded",
        description: `Your ${voteType}vote has been recorded.`,
      })
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to record your vote.",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async (featureId: string) => {
    if (!newComment.trim()) return

    try {
      const { data, error } = await supabase
        .from("feature_comments")
        .insert([
          {
            feature_id: featureId,
            user_id: "current_user",
            comment: newComment,
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      setComments([...comments, data])
      setNewComment("")
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add your comment.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "on_hold":
        return <Pause className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800"
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "feature":
        return "bg-blue-100 text-blue-800"
      case "enhancement":
        return "bg-purple-100 text-purple-800"
      case "bug":
        return "bg-red-100 text-red-800"
      case "improvement":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredFeatures = features.filter((feature) => {
    const matchesSearch =
      feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || feature.status === statusFilter
    const matchesCategory = categoryFilter === "all" || feature.category === categoryFilter
    const matchesPriority = priorityFilter === "all" || feature.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  const getFeatureComments = (featureId: string) => {
    return comments.filter((comment) => comment.feature_id === featureId)
  }

  const openEditDialog = (feature: FeatureRequest) => {
    setSelectedFeature(feature)
    setFormData({
      title: feature.title,
      description: feature.description,
      category: feature.category,
      priority: feature.priority,
      status: feature.status,
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (feature: FeatureRequest) => {
    setSelectedFeature(feature)
    setIsViewDialogOpen(true)
  }

  // Statistics
  const stats = {
    total: features.length,
    pending: features.filter((f) => f.status === "pending").length,
    inProgress: features.filter((f) => f.status === "in_progress").length,
    completed: features.filter((f) => f.status === "completed").length,
    totalVotes: features.reduce((sum, f) => sum + f.votes, 0),
    totalUpvotes: features.reduce((sum, f) => sum + (f.upvotes || 0), 0),
    totalDownvotes: features.reduce((sum, f) => sum + (f.downvotes || 0), 0),
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Feature Management</h2>
          <p className="text-muted-foreground">Manage feature requests and development roadmap</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Feature Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Feature Request</DialogTitle>
              <DialogDescription>Add a new feature request to the development roadmap.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter feature title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the feature request in detail"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="enhancement">Enhancement</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFeature} disabled={!formData.title || !formData.description}>
                Create Feature Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All feature requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">Being developed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">Successfully delivered</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upvotes</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUpvotes}</div>
                <p className="text-xs text-muted-foreground">Community support</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Votes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVotes}</div>
                <p className="text-xs text-muted-foreground">Overall sentiment</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Features */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feature Requests</CardTitle>
              <CardDescription>Latest requests from the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.slice(0, 5).map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(feature.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{feature.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className={getCategoryColor(feature.category)}>
                            {feature.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(feature.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-sm">
                        <ThumbsUp className="h-3 w-3 text-green-600" />
                        <span>{feature.upvotes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <ThumbsDown className="h-3 w-3 text-red-600" />
                        <span>{feature.downvotes || 0}</span>
                      </div>
                      <Badge className={getPriorityColor(feature.priority)}>{feature.priority}</Badge>
                      <Badge className={getStatusColor(feature.status)}>{feature.status.replace("_", " ")}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="enhancement">Enhancement</SelectItem>
                  <SelectItem value="bug">Bug Fix</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Features List */}
          <div className="grid gap-4">
            {filteredFeatures.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No features found matching your criteria</p>
                </CardContent>
              </Card>
            ) : (
              filteredFeatures.map((feature) => (
                <Card key={feature.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(feature.status)}
                          <h3 className="font-semibold text-lg">{feature.title}</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">{feature.description}</p>
                        <div className="flex items-center space-x-4 mb-4">
                          <Badge className={getPriorityColor(feature.priority)}>{feature.priority}</Badge>
                          <Badge variant="outline" className={getCategoryColor(feature.category)}>
                            {feature.category}
                          </Badge>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">{feature.upvotes || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsDown className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium">{feature.downvotes || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium text-blue-600">Net: {feature.votes}</span>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Created {new Date(feature.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(feature.id, "up")}
                            className="flex items-center space-x-1"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>Upvote</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(feature.id, "down")}
                            className="flex items-center space-x-1"
                          >
                            <ThumbsDown className="h-3 w-3" />
                            <span>Downvote</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewDialog(feature)}
                            className="flex items-center space-x-1"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>Comments</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(feature)}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteFeature(feature.id)}
                            className="flex items-center space-x-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getStatusColor(feature.status)}>{feature.status.replace("_", " ")}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Feature requests by current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["pending", "submitted", "in_progress", "completed", "rejected", "on_hold"].map((status) => {
                    const count = features.filter((f) => f.status === status).length
                    const percentage = features.length > 0 ? (count / features.length) * 100 : 0
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(status)}
                          <span className="capitalize">{status.replace("_", " ")}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>Feature requests by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["critical", "high", "medium", "low"].map((priority) => {
                    const count = features.filter((f) => f.priority === priority).length
                    const percentage = features.length > 0 ? (count / features.length) * 100 : 0
                    const color =
                      priority === "critical"
                        ? "bg-red-500"
                        : priority === "high"
                          ? "bg-orange-500"
                          : priority === "medium"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                    return (
                      <div key={priority} className="flex items-center justify-between">
                        <span className="capitalize">{priority}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`${color} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Feature requests by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["feature", "enhancement", "bug", "improvement"].map((category) => {
                    const count = features.filter((f) => f.category === category).length
                    const percentage = features.length > 0 ? (count / features.length) * 100 : 0
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="capitalize">{category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Voted Features</CardTitle>
                <CardDescription>Most popular feature requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features
                    .sort((a, b) => b.votes - a.votes)
                    .slice(0, 5)
                    .map((feature, index) => (
                      <div key={feature.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                          <span className="font-medium truncate max-w-48">{feature.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{feature.votes}</span>
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Feature Request</DialogTitle>
            <DialogDescription>Update the feature request details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter feature title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the feature request"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="enhancement">Enhancement</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFeature}>Update Feature Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedFeature?.title}</DialogTitle>
            <DialogDescription>Feature request details and comments</DialogDescription>
          </DialogHeader>
          {selectedFeature && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getCategoryColor(selectedFeature.category)}>{selectedFeature.category}</Badge>
                  <Badge className={getPriorityColor(selectedFeature.priority)}>{selectedFeature.priority}</Badge>
                  <Badge className={getStatusColor(selectedFeature.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedFeature.status)}
                      {selectedFeature.status.replace("_", " ")}
                    </div>
                  </Badge>
                </div>
                <p className="text-gray-700 mb-4">{selectedFeature.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>Created: {new Date(selectedFeature.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(selectedFeature.updated_at).toLocaleDateString()}</span>
                  <span>Votes: {selectedFeature.votes}</span>
                  <span>Upvotes: {selectedFeature.upvotes}</span>
                  <span>Downvotes: {selectedFeature.downvotes}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-semibold mb-4">
                  Comments ({getFeatureComments(selectedFeature.id).length})
                </h4>
                <ScrollArea className="h-64 mb-4">
                  <div className="space-y-4">
                    {getFeatureComments(selectedFeature.id).map((comment) => (
                      <div key={comment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{comment.user_id}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.comment}</p>
                      </div>
                    ))}
                    {getFeatureComments(selectedFeature.id).length === 0 && (
                      <p className="text-gray-500 text-center py-8">No comments yet.</p>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="flex-1"
                  />
                  <Button onClick={() => handleAddComment(selectedFeature.id)} disabled={!newComment.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
