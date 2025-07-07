"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeatureManagementDashboard } from "@/components/feature-management-dashboard"
import {
  Settings,
  Users,
  Database,
  Activity,
  Shield,
  FileText,
  BarChart3,
  Globe,
  Zap,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  CreditCard,
  Mail,
  Star,
  Eye,
  Download,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SystemStats {
  totalUsers: number
  activeBookings: number
  totalRevenue: number
  systemUptime: string
  apiCalls: number
  errorRate: number
}

interface RecentActivity {
  id: string
  type: "booking" | "user" | "system" | "error"
  message: string
  timestamp: string
  severity: "low" | "medium" | "high"
}

export default function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)

  // Mock data - in real app this would come from APIs
  const systemStats: SystemStats = {
    totalUsers: 12847,
    activeBookings: 1523,
    totalRevenue: 2847392,
    systemUptime: "99.9%",
    apiCalls: 847392,
    errorRate: 0.02,
  }

  const recentActivity: RecentActivity[] = [
    {
      id: "1",
      type: "booking",
      message: "New booking created: #BK-2024-001234",
      timestamp: "2 minutes ago",
      severity: "low",
    },
    {
      id: "2",
      type: "user",
      message: "New user registration: john.doe@example.com",
      timestamp: "5 minutes ago",
      severity: "low",
    },
    {
      id: "3",
      type: "system",
      message: "Database backup completed successfully",
      timestamp: "15 minutes ago",
      severity: "low",
    },
    {
      id: "4",
      type: "error",
      message: "Payment gateway timeout - 3 failed transactions",
      timestamp: "23 minutes ago",
      severity: "high",
    },
    {
      id: "5",
      type: "system",
      message: "Travel Compositor API sync completed",
      timestamp: "1 hour ago",
      severity: "medium",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "user":
        return <Users className="h-4 w-4 text-green-500" />
      case "system":
        return <Server className="h-4 w-4 text-purple-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSystemAction = async (action: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Action Completed",
        description: `${action} has been executed successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to execute ${action}.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
            <p className="text-gray-600">Comprehensive system management and monitoring</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => handleSystemAction("System Health Check")}>
              <Activity className="h-4 w-4 mr-2" />
              Health Check
            </Button>
            <Button onClick={() => handleSystemAction("Refresh Data")}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Status Banner */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">All Systems Operational</h3>
                  <p className="text-sm text-green-700">Last updated: {new Date().toLocaleString()}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Uptime: {systemStats.systemUptime}</Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.activeBookings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{systemStats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+23% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.apiCalls.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Error rate: {systemStats.errorRate}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system events and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                            <Badge variant="outline" className={getSeverityColor(activity.severity)}>
                              {activity.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent"
                      onClick={() => handleSystemAction("Database Backup")}
                      disabled={loading}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Create Database Backup
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent"
                      onClick={() => handleSystemAction("Cache Clear")}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear System Cache
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent"
                      onClick={() => handleSystemAction("Email Notifications")}
                      disabled={loading}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send System Notifications
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent"
                      onClick={() => handleSystemAction("Security Scan")}
                      disabled={loading}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Run Security Scan
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start bg-transparent"
                      onClick={() => handleSystemAction("Performance Report")}
                      disabled={loading}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Performance Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current status of all system components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Server className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Web Server</p>
                        <p className="text-sm text-gray-500">nginx/1.21.6</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Database</p>
                        <p className="text-sm text-gray-500">PostgreSQL 14.2</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Redis Cache</p>
                        <p className="text-sm text-gray-500">Redis 6.2.7</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Email Service</p>
                        <p className="text-sm text-gray-500">SendGrid API</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Payment Gateway</p>
                        <p className="text-sm text-gray-500">Stripe API</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Travel Compositor</p>
                        <p className="text-sm text-gray-500">External API</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <FeatureManagementDashboard />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>User management interface would be implemented here</p>
                  <p className="text-sm">Including user list, roles, permissions, and account management</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>Monitor and manage all travel bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Pending</p>
                          <p className="text-2xl font-bold">247</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Confirmed</p>
                          <p className="text-2xl font-bold">1,523</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Cancelled</p>
                          <p className="text-2xl font-bold">89</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="text-2xl font-bold">8,947</p>
                        </div>
                        <Star className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Booking management interface would be implemented here</p>
                  <p className="text-sm">Including booking list, status updates, and detailed booking management</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Manage system settings and configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">General Settings</p>
                          <p className="text-sm text-gray-500">Basic system configuration</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Security Settings</p>
                          <p className="text-sm text-gray-500">Authentication and authorization</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Email Configuration</p>
                          <p className="text-sm text-gray-500">SMTP and email templates</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Payment Settings</p>
                          <p className="text-sm text-gray-500">Payment gateways and currencies</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Maintenance</CardTitle>
                  <CardDescription>Maintenance tasks and system operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => handleSystemAction("Database Optimization")}
                      disabled={loading}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Optimize Database
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => handleSystemAction("Log Cleanup")}
                      disabled={loading}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Clean System Logs
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => handleSystemAction("Cache Rebuild")}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Rebuild Cache
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => handleSystemAction("Index Rebuild")}
                      disabled={loading}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Rebuild Search Index
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => handleSystemAction("System Update")}
                      disabled={loading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Check for Updates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Recent system events and error logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Database backup completed successfully</span>
                    </div>
                    <span className="text-xs text-gray-500">2024-01-15 14:30:22</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">High memory usage detected on server-01</span>
                    </div>
                    <span className="text-xs text-gray-500">2024-01-15 14:25:18</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Travel Compositor API sync completed</span>
                    </div>
                    <span className="text-xs text-gray-500">2024-01-15 14:20:45</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Payment gateway timeout - retry successful</span>
                    </div>
                    <span className="text-xs text-gray-500">2024-01-15 14:15:33</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>System performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm text-gray-500">245ms avg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-gray-500">42%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "42%" }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-gray-500">68%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "68%" }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm text-gray-500">34%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: "34%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Analytics</CardTitle>
                  <CardDescription>User engagement and activity metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Daily Active Users</p>
                        <p className="text-2xl font-bold">3,247</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Session Duration</p>
                        <p className="text-2xl font-bold">12m 34s</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Bounce Rate</p>
                        <p className="text-2xl font-bold">23.4%</p>
                      </div>
                      <Eye className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Financial performance and revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Today</p>
                    <p className="text-2xl font-bold">€12,847</p>
                    <p className="text-xs text-green-600">+8.2%</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-2xl font-bold">€89,234</p>
                    <p className="text-xs text-green-600">+12.4%</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold">€347,892</p>
                    <p className="text-xs text-green-600">+23.1%</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">This Year</p>
                    <p className="text-2xl font-bold">€2,847,392</p>
                    <p className="text-xs text-green-600">+18.7%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
