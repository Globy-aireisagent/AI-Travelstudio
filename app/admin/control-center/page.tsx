"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Activity,
  Users,
  FileText,
  Settings,
  BarChart3,
  Shield,
  Database,
  Server,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Globe,
} from "lucide-react"
import FeatureManagementDashboard from "@/components/feature-management-dashboard"

interface SystemStats {
  totalUsers: number
  activeBookings: number
  totalFeatureRequests: number
  systemHealth: "healthy" | "warning" | "critical"
  uptime: string
  responseTime: number
}

interface SystemMetric {
  name: string
  value: number
  unit: string
  status: "good" | "warning" | "critical"
  trend: "up" | "down" | "stable"
}

export default function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState("overview")
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeBookings: 0,
    totalFeatureRequests: 0,
    systemHealth: "healthy",
    uptime: "0h 0m",
    responseTime: 0,
  })
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    loadSystemData()
    const interval = setInterval(loadSystemData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadSystemData = async () => {
    try {
      // Simulate loading system data
      setSystemStats({
        totalUsers: 1247,
        activeBookings: 89,
        totalFeatureRequests: 23,
        systemHealth: "healthy",
        uptime: "7d 14h 32m",
        responseTime: 245,
      })

      setSystemMetrics([
        { name: "CPU Usage", value: 23, unit: "%", status: "good", trend: "stable" },
        { name: "Memory Usage", value: 67, unit: "%", status: "warning", trend: "up" },
        { name: "Disk Usage", value: 45, unit: "%", status: "good", trend: "stable" },
        { name: "API Response Time", value: 245, unit: "ms", status: "good", trend: "down" },
        { name: "Database Connections", value: 12, unit: "", status: "good", trend: "stable" },
        { name: "Active Sessions", value: 34, unit: "", status: "good", trend: "up" },
      ])

      setLastUpdate(new Date())
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to load system data:", error)
      setIsLoading(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600 bg-green-100"
      case "warning":
        return "text-yellow-600 bg-yellow-100"
      case "critical":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "critical":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-600" />
      case "down":
        return <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />
      default:
        return <Activity className="w-3 h-3 text-gray-600" />
    }
  }

  const performSystemAction = async (action: string) => {
    console.log(`Performing system action: ${action}`)
    // Simulate system action
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert(`${action} completed successfully!`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            Admin Control Center
          </h1>
          <p className="text-gray-600">Complete system management and monitoring dashboard</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <Badge className={getHealthColor(systemStats.systemHealth)}>{systemStats.systemHealth.toUpperCase()}</Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.activeBookings}</p>
                    </div>
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Feature Requests</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.totalFeatureRequests}</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Uptime</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.uptime}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(metric.status)}
                        <div>
                          <p className="font-medium">{metric.name}</p>
                          <p className="text-sm text-gray-600">
                            {metric.value}
                            {metric.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend)}
                        <Badge variant={metric.status === "good" ? "default" : "destructive"}>{metric.status}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => performSystemAction("Database Backup")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Create Database Backup
                  </Button>
                  <Button
                    onClick={() => performSystemAction("Clear Cache")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Clear System Cache
                  </Button>
                  <Button
                    onClick={() => performSystemAction("Security Scan")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Run Security Scan
                  </Button>
                  <Button
                    onClick={() => performSystemAction("System Optimization")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Optimize System
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "New user registration", user: "john@example.com", time: "2 minutes ago", type: "user" },
                    { action: "Booking created", user: "RRP-9571", time: "5 minutes ago", type: "booking" },
                    {
                      action: "Feature request submitted",
                      user: "AI Chat Integration",
                      time: "12 minutes ago",
                      type: "feature",
                    },
                    { action: "System backup completed", user: "System", time: "1 hour ago", type: "system" },
                    { action: "Database optimization", user: "System", time: "3 hours ago", type: "system" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {activity.type === "user" && <Users className="w-4 h-4 text-blue-600" />}
                        {activity.type === "booking" && <FileText className="w-4 h-4 text-green-600" />}
                        {activity.type === "feature" && <Zap className="w-4 h-4 text-purple-600" />}
                        {activity.type === "system" && <Settings className="w-4 h-4 text-orange-600" />}
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.user}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <FeatureManagementDashboard />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    User management interface coming soon. For now, users can be managed through the database directly.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Active Bookings</h3>
                  <p className="text-3xl font-bold text-green-600">89</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Pending</h3>
                  <p className="text-3xl font-bold text-yellow-600">12</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Completed</h3>
                  <p className="text-3xl font-bold text-blue-600">1,247</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Environment</label>
                    <Badge>Production</Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Version</label>
                    <p className="text-sm">v2.1.0</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Deployment</label>
                    <p className="text-sm">2024-01-15 14:30:00 UTC</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Connection Status</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Connections</span>
                    <span>12/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database Size</span>
                    <span>2.4 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Backup</span>
                    <span>2 hours ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Page Views</h3>
                  <p className="text-3xl font-bold text-blue-600">24,891</p>
                  <p className="text-sm text-gray-600">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Active Users</h3>
                  <p className="text-3xl font-bold text-green-600">1,247</p>
                  <p className="text-sm text-gray-600">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
                  <p className="text-3xl font-bold text-purple-600">3.2%</p>
                  <p className="text-sm text-gray-600">+0.5% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Revenue</h3>
                  <p className="text-3xl font-bold text-orange-600">€89,234</p>
                  <p className="text-sm text-gray-600">+15% from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
