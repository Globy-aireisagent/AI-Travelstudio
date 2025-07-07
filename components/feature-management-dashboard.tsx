"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  Settings,
  TrendingUp,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Mail,
  Bell,
  Archive,
  Star,
  Flag,
  Calendar,
  Activity,
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
  comments_count?: number
}

interface FeatureStats {
  total: number
  open: number
  in_progress: number
  completed: number
  rejected: number
  on_hold: number
  planned: number
  total_votes: number
  avg_votes: number
  top_category: string
}

const statusColors = {
  open: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  on_hold: "bg-gray-100 text-gray-800 border-gray-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  planned: "bg-indigo-100 text-indigo-800 border-indigo-200",
}

const priorityColors = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
}

const categoryColors = {
  feature: "bg-blue-100 text-blue-800 border-blue-200",
  enhancement: "bg-green-100 text-green-800 border-green-200",
  bug: "bg-red-100 text-red-800 border-red-200",
  improvement: "bg-purple-100 text-purple-800 border-purple-200",
  integration: "bg-orange-100 text-orange-800 border-orange-200",
}

export default function FeatureManagementDashboard() {
  const [features, setFeatures] = useState<FeatureRequest[]>([])
  const [stats, setStats] = useState<FeatureStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<FeatureRequest | null>(null)
  const [editingFeature, setEditingFeature] = useState<FeatureRequest | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchFeatures()
  }, [])

  useEffect(() => {
    if (features.length > 0) {
      calculateStats()
    }
  }, [features])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/feature-requests")
      const result = await response.json()

      if (result.success) {
        setFeatures(result.data)
      } else {
        // Use demo data as fallback
        setFeatures(getDemoFeatures())
      }
    } catch (error) {
      console.error("Error fetching features:", error)
      setFeatures(getDemoFeatures())
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const total = features.length
    const statusCounts = features.reduce(
      (acc, feature) => {
        acc[feature.status] = (acc[feature.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const totalVotes = features.reduce((sum, feature) => sum + feature.votes, 0)
    const avgVotes = total > 0 ? Math.round(totalVotes / total) : 0

    const categoryCounts = features.reduce(
      (acc, feature) => {
        acc[feature.category] = (acc[feature.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "feature"

    setStats({
      total,
      open: statusCounts.open || 0,
      in_progress: statusCounts.in_progress || 0,
      completed: statusCounts.completed || 0,
      rejected: statusCounts.rejected || 0,
      on_hold: statusCounts.on_hold || 0,
      planned: statusCounts.planned || 0,
      total_votes: totalVotes,
      avg_votes: avgVotes,
      top_category: topCategory,
    })
  }

  const updateFeatureStatus = async (featureId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/feature-requests/${featureId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setFeatures((prev) =>
          prev.map((feature) => (feature.id === featureId ? { ...feature, status: newStatus } : feature)),
        )
        toast({
          title: "Status Updated",
          description: `Feature status changed to ${newStatus.replace("_", " ")}`,
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update feature status",
        variant: "destructive",
      })
    }
  }

  const deleteFeature = async (featureId: string) => {
    if (!confirm("Are you sure you want to delete this feature request?")) return

    try {
      const response = await fetch(`/api/feature-requests/${featureId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFeatures((prev) => prev.filter((feature) => feature.id !== featureId))
        toast({
          title: "Feature Deleted",
          description: "Feature request has been deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting feature:", error)
      toast({
        title: "Error",
        description: "Failed to delete feature request",
        variant: "destructive",
      })
    }
  }

  const getFilteredFeatures = () => {
    return features.filter((feature) => {
      const matchesStatus = filterStatus === "all" || feature.status === filterStatus
      const matchesPriority = filterPriority === "all" || feature.priority === filterPriority
      const matchesCategory = filterCategory === "all" || feature.category === filterCategory
      const matchesSearch =
        searchTerm === "" ||
        feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesStatus && matchesPriority && matchesCategory && matchesSearch
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "on_hold":
        return <Archive className="h-4 w-4" />
      case "planned":
        return <Calendar className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getChartData = () => {
    if (!stats) return []

    return [
      { name: "Open", value: stats.open, color: "#3B82F6" },
      { name: "In Progress", value: stats.in_progress, color: "#8B5CF6" },
      { name: "Completed", value: stats.completed, color: "#10B981" },
      { name: "Planned", value: stats.planned, color: "#6366F1" },
      { name: "On Hold", value: stats.on_hold, color: "#6B7280" },
      { name: "Rejected", value: stats.rejected, color: "#EF4444" },
    ].filter((item) => item.value > 0)
  }

  const getVotesChartData = () => {
    return features
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10)
      .map((feature) => ({
        name: feature.title.length > 20 ? feature.title.substring(0, 20) + "..." : feature.title,
        votes: feature.votes,
      }))
  }

  const getTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split("T")[0]
    })

    return last7Days.map((date) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      created: features.filter((f) => f.created_at.startsWith(date)).length,
      completed: features.filter((f) => f.status === "completed" && f.updated_at.startsWith(date)).length,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feature management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feature Request Management</h2>
          <p className="text-gray-600">Manage and track all feature requests from users</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Mail className="h-4 w-4" />
            Notify Users
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full bg-white rounded-2xl shadow-lg p-2">
          <TabsTrigger
            value="overview"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
          >
            📊 Overview
          </TabsTrigger>
          <TabsTrigger
            value="features"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
          >
            🎯 Features
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
          >
            📈 Analytics
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
          >
            ⚙️ Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total Features</p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                      </div>
                      <Activity className="h-12 w-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-3xl shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Completed</p>
                        <p className="text-3xl font-bold">{stats.completed}</p>
                      </div>
                      <CheckCircle className="h-12 w-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-3xl shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">In Progress</p>
                        <p className="text-3xl font-bold">{stats.in_progress}</p>
                      </div>
                      <Clock className="h-12 w-12 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Total Votes</p>
                        <p className="text-3xl font-bold">{stats.total_votes}</p>
                      </div>
                      <TrendingUp className="h-12 w-12 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white rounded-3xl shadow-xl border-0">
                  <CardHeader>
                    <CardTitle>Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getChartData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {getChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-3xl shadow-xl border-0">
                  <CardHeader>
                    <CardTitle>Top Voted Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getVotesChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="votes" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white rounded-3xl shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {features
                      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                      .slice(0, 5)
                      .map((feature) => (
                        <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(feature.status)}
                            <div>
                              <p className="font-medium">{feature.title}</p>
                              <p className="text-sm text-gray-500">
                                Updated {new Date(feature.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={statusColors[feature.status as keyof typeof statusColors]}>
                            {feature.status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white rounded-3xl shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Search</Label>
                  <Input
                    placeholder="Search features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
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
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue />
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature List */}
          <div className="space-y-4">
            {getFilteredFeatures().map((feature) => (
              <Card key={feature.id} className="bg-white rounded-3xl shadow-lg border-0 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={categoryColors[feature.category as keyof typeof categoryColors]}>
                          {feature.category}
                        </Badge>
                        <Badge className={priorityColors[feature.priority as keyof typeof priorityColors]}>
                          {feature.priority}
                        </Badge>
                        <Badge className={statusColors[feature.status as keyof typeof statusColors]}>
                          {getStatusIcon(feature.status)}
                          <span className="ml-1">{feature.status.replace("_", " ")}</span>
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-3">{feature.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {feature.user_id}
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {feature.votes} votes
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {feature.comments_count || 0} comments
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(feature.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Select value={feature.status} onValueChange={(value) => updateFeatureStatus(feature.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => setSelectedFeature(feature)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingFeature(feature)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteFeature(feature.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-white rounded-3xl shadow-xl border-0">
            <CardHeader>
              <CardTitle>Feature Request Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="created" stroke="#8B5CF6" strokeWidth={2} name="Created" />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white rounded-3xl shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Request Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Notification Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Email notifications for new features</span>
                      <Button variant="outline" size="sm">
                        <Bell className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Weekly digest reports</span>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Automation Rules</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Auto-archive old rejected features</span>
                      <Button variant="outline" size="sm">
                        <Archive className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Priority escalation rules</span>
                      <Button variant="outline" size="sm">
                        <Flag className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Details Dialog */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedFeature && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedFeature.title}</DialogTitle>
                <DialogDescription>{selectedFeature.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Badge className={statusColors[selectedFeature.status as keyof typeof statusColors]}>
                      {selectedFeature.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge className={priorityColors[selectedFeature.priority as keyof typeof priorityColors]}>
                      {selectedFeature.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Badge className={categoryColors[selectedFeature.category as keyof typeof categoryColors]}>
                      {selectedFeature.category}
                    </Badge>
                  </div>
                  <div>
                    <Label>Votes</Label>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {selectedFeature.votes}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Submitted by</Label>
                    <p className="text-sm text-gray-600">{selectedFeature.user_id}</p>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="text-sm text-gray-600">{new Date(selectedFeature.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getDemoFeatures(): FeatureRequest[] {
  return [
    {
      id: "1",
      title: "Advanced Booking Search",
      description:
        "Add more sophisticated search filters for bookings including date ranges, destinations, and price ranges.",
      user_id: "agent@demo.com",
      category: "enhancement",
      priority: "high",
      status: "in_progress",
      votes: 15,
      created_at: "2025-01-01T10:00:00Z",
      updated_at: "2025-01-15T14:30:00Z",
      comments_count: 3,
    },
    {
      id: "2",
      title: "Mobile App Integration",
      description: "Develop a mobile application that syncs with the web platform for on-the-go access.",
      user_id: "admin@demo.com",
      category: "feature",
      priority: "medium",
      status: "open",
      votes: 8,
      created_at: "2025-01-02T09:15:00Z",
      updated_at: "2025-01-10T16:45:00Z",
      comments_count: 1,
    },
    {
      id: "3",
      title: "Real-time Notifications",
      description: "Implement push notifications for booking updates, payment confirmations, and travel alerts.",
      user_id: "client@demo.com",
      category: "enhancement",
      priority: "medium",
      status: "open",
      votes: 12,
      created_at: "2025-01-03T11:20:00Z",
      updated_at: "2025-01-12T13:10:00Z",
      comments_count: 2,
    },
    {
      id: "4",
      title: "Multi-language Support",
      description: "Add support for multiple languages including Dutch, German, French, and Spanish.",
      user_id: "agent@demo.com",
      category: "feature",
      priority: "low",
      status: "planned",
      votes: 6,
      created_at: "2025-01-04T08:30:00Z",
      updated_at: "2025-01-08T12:00:00Z",
      comments_count: 1,
    },
    {
      id: "5",
      title: "Automated Reporting",
      description: "Generate automated monthly reports for agencies with booking statistics and revenue data.",
      user_id: "admin@demo.com",
      category: "enhancement",
      priority: "high",
      status: "completed",
      votes: 20,
      created_at: "2024-12-15T14:00:00Z",
      updated_at: "2025-01-20T10:30:00Z",
      comments_count: 4,
    },
  ]
}
