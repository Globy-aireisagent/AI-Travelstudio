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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronUp, ChevronDown, MessageCircle, Plus, Search, Filter, Calendar, User, TrendingUp } from "lucide-react"
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

const priorityColors = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
}

const statusColors = {
  open: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  on_hold: "bg-gray-100 text-gray-800 border-gray-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  planned: "bg-indigo-100 text-indigo-800 border-indigo-200",
}

const categoryColors = {
  feature: "bg-blue-100 text-blue-800 border-blue-200",
  enhancement: "bg-green-100 text-green-800 border-green-200",
  bug: "bg-red-100 text-red-800 border-red-200",
  improvement: "bg-purple-100 text-purple-800 border-purple-200",
  integration: "bg-orange-100 text-orange-800 border-orange-200",
}

export default function FeatureRoadmapInteractive() {
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
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/feature-requests?${params}`)
      const result = await response.json()

      if (result.success) {
        setFeatures(result.data)
        // Initialize vote data for each feature
        const votePromises = result.data.map((feature: FeatureRequest) => fetchVoteData(feature.id))
        const voteResults = await Promise.all(votePromises)
        const voteMap: Record<string, VoteData> = {}
        result.data.forEach((feature: FeatureRequest, index: number) => {
          voteMap[feature.id] = voteResults[index]
        })
        setUserVotes(voteMap)
      }
    } catch (error) {
      console.error("Error fetching features:", error)
      toast({
        title: "Error",
        description: "Failed to load feature requests. Using demo data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchVoteData = async (featureId: string): Promise<VoteData> => {
    try {
      const response = await fetch(`/api/feature-requests/${featureId}/vote?user_id=${currentUserId}`)
      const result = await response.json()
      if (result.success) {
        return {
          votes: result.votes,
          upVotes: result.upVotes,
          downVotes: result.downVotes,
          userVote: result.userVote,
        }
      }
    } catch (error) {
      console.error("Error fetching vote data:", error)
    }
    return { votes: 0, upVotes: 0, downVotes: 0, userVote: null }
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
        aValue = userVotes[a.id]?.votes || a.votes
        bValue = userVotes[b.id]?.votes || b.votes
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
      if (result.success) {
        // Update local vote data
        setUserVotes((prev) => ({
          ...prev,
          [featureId]: {
            votes: result.votes,
            upVotes: prev[featureId]?.upVotes || 0,
            downVotes: prev[featureId]?.downVotes || 0,
            userVote: result.user_vote,
          },
        }))

        // Update feature votes in the list
        setFeatures((prev) =>
          prev.map((feature) => (feature.id === featureId ? { ...feature, votes: result.votes } : feature)),
        )

        toast({
          title: "Vote recorded",
          description: `Your ${voteType}vote has been recorded.`,
        })
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchComments = async (featureId: string) => {
    try {
      const response = await fetch(`/api/feature-requests/${featureId}/comments`)
      const result = await response.json()
      if (result.success) {
        setComments(result.data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedFeature) return

    try {
      const response = await fetch(`/api/feature-requests/${selectedFeature.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: newComment,
          user_id: currentUserId,
          user_name: "Demo User",
        }),
      })

      const result = await response.json()
      if (result.success) {
        setComments((prev) => [...prev, result.data])
        setNewComment("")
        toast({
          title: "Comment added",
          description: "Your comment has been added successfully.",
        })
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateFeature = async () => {
    if (!newFeature.title.trim() || !newFeature.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/feature-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newFeature,
          user_id: currentUserId,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setFeatures((prev) => [result.data, ...prev])
        setNewFeature({
          title: "",
          description: "",
          category: "feature",
          priority: "medium",
        })
        setShowNewFeatureDialog(false)
        toast({
          title: "Feature request created",
          description: "Your feature request has been submitted successfully.",
        })
      }
    } catch (error) {
      console.error("Error creating feature:", error)
      toast({
        title: "Error",
        description: "Failed to create feature request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openFeatureDetails = (feature: FeatureRequest) => {
    setSelectedFeature(feature)
    fetchComments(feature.id)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading feature requests...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Roadmap</h1>
            <p className="text-gray-600">
              Help shape the future of our travel platform by voting on features and sharing your ideas.
            </p>
          </div>
          <Dialog open={showNewFeatureDialog} onOpenChange={setShowNewFeatureDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Request Feature
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request New Feature</DialogTitle>
                <DialogDescription>Describe the feature you'd like to see added to our platform.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newFeature.title}
                    onChange={(e) => setNewFeature((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief title for your feature request"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newFeature.description}
                    onChange={(e) => setNewFeature((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the feature and why it would be valuable"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newFeature.category}
                      onValueChange={(value) => setNewFeature((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feature">New Feature</SelectItem>
                        <SelectItem value="enhancement">Enhancement</SelectItem>
                        <SelectItem value="improvement">Improvement</SelectItem>
                        <SelectItem value="integration">Integration</SelectItem>
                        <SelectItem value="bug">Bug Fix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newFeature.priority}
                      onValueChange={(value) => setNewFeature((prev) => ({ ...prev, priority: value }))}
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
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowNewFeatureDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFeature} className="bg-blue-600 hover:bg-blue-700">
                    Submit Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="feature">Features</SelectItem>
                <SelectItem value="enhancement">Enhancements</SelectItem>
                <SelectItem value="improvement">Improvements</SelectItem>
                <SelectItem value="integration">Integrations</SelectItem>
                <SelectItem value="bug">Bug Fixes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="votes-desc">Most Votes</SelectItem>
                <SelectItem value="votes-asc">Least Votes</SelectItem>
                <SelectItem value="created_at-desc">Newest</SelectItem>
                <SelectItem value="created_at-asc">Oldest</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredFeatures.length} of {features.length} feature requests
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Total votes: {features.reduce((sum, f) => sum + (userVotes[f.id]?.votes || f.votes), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="grid gap-6">
        {filteredFeatures.map((feature) => {
          const voteData = userVotes[feature.id] || { votes: feature.votes, upVotes: 0, downVotes: 0, userVote: null }

          return (
            <Card key={feature.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        className={
                          categoryColors[feature.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"
                        }
                      >
                        {feature.category}
                      </Badge>
                      <Badge
                        className={
                          priorityColors[feature.priority as keyof typeof priorityColors] || "bg-gray-100 text-gray-800"
                        }
                      >
                        {feature.priority}
                      </Badge>
                      <Badge
                        className={
                          statusColors[feature.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                        }
                      >
                        {feature.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardTitle
                      className="text-xl mb-2 cursor-pointer hover:text-blue-600"
                      onClick={() => openFeatureDetails(feature)}
                    >
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                  </div>
                  <div className="flex flex-col items-center space-y-1 ml-4">
                    <Button
                      variant={voteData.userVote === "up" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote(feature.id, "up")}
                      className={voteData.userVote === "up" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <span className="font-semibold text-lg">{voteData.votes}</span>
                    <Button
                      variant={voteData.userVote === "down" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote(feature.id, "down")}
                      className={voteData.userVote === "down" ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {feature.user_id}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(feature.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openFeatureDetails(feature)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No features found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
          <Button
            onClick={() => {
              setSearchTerm("")
              setCategoryFilter("all")
              setStatusFilter("all")
              setPriorityFilter("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Feature Details Dialog */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedFeature && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={categoryColors[selectedFeature.category as keyof typeof categoryColors]}>
                    {selectedFeature.category}
                  </Badge>
                  <Badge className={priorityColors[selectedFeature.priority as keyof typeof priorityColors]}>
                    {selectedFeature.priority}
                  </Badge>
                  <Badge className={statusColors[selectedFeature.status as keyof typeof statusColors]}>
                    {selectedFeature.status.replace("_", " ")}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{selectedFeature.title}</DialogTitle>
                <DialogDescription className="text-base">{selectedFeature.description}</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Submitted by:</span>
                      <p className="text-gray-600">{selectedFeature.user_id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <p className="text-gray-600">{new Date(selectedFeature.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Last Updated:</span>
                      <p className="text-gray-600">{new Date(selectedFeature.updated_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Current Votes:</span>
                      <p className="text-gray-600">{userVotes[selectedFeature.id]?.votes || selectedFeature.votes}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4 py-4 border-t border-b">
                    <Button
                      variant={userVotes[selectedFeature.id]?.userVote === "up" ? "default" : "outline"}
                      onClick={() => handleVote(selectedFeature.id, "up")}
                      className={
                        userVotes[selectedFeature.id]?.userVote === "up" ? "bg-green-600 hover:bg-green-700" : ""
                      }
                    >
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Upvote
                    </Button>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {userVotes[selectedFeature.id]?.votes || selectedFeature.votes}
                      </div>
                      <div className="text-sm text-gray-500">votes</div>
                    </div>
                    <Button
                      variant={userVotes[selectedFeature.id]?.userVote === "down" ? "default" : "outline"}
                      onClick={() => handleVote(selectedFeature.id, "down")}
                      className={
                        userVotes[selectedFeature.id]?.userVote === "down" ? "bg-red-600 hover:bg-red-700" : ""
                      }
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Downvote
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-4">
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-gray-700">{comment.user_name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{comment.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <Label htmlFor="new-comment">Add a comment</Label>
                    <Textarea
                      id="new-comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts on this feature request..."
                      rows={3}
                      className="mt-2"
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="mt-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
