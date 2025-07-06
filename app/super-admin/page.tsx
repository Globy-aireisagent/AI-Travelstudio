"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Database, Settings, Activity, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react"

export default function SuperAdminPage() {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeBookings: 0,
    systemHealth: "good",
    lastSync: new Date().toISOString(),
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simuleer het laden van system stats
    setTimeout(() => {
      setSystemStats({
        totalUsers: 1247,
        activeBookings: 89,
        systemHealth: "good",
        lastSync: new Date().toISOString(),
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleSystemCleanup = async () => {
    try {
      const response = await fetch("/api/system-cleanup", {
        method: "POST",
      })
      const result = await response.json()
      alert("System cleanup completed successfully!")
    } catch (error) {
      alert("System cleanup failed")
    }
  }

  const handleHealthCheck = async () => {
    try {
      const response = await fetch("/api/system-health-check")
      const result = await response.json()
      alert(`System Health: ${result.status}`)
    } catch (error) {
      alert("Health check failed")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Super Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and management tools</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeBookings}</div>
              <p className="text-xs text-muted-foreground">+5% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={systemStats.systemHealth === "good" ? "default" : "destructive"}>
                  {systemStats.systemHealth === "good" ? "Good" : "Issues"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date(systemStats.lastSync).toLocaleTimeString()}</div>
              <p className="text-xs text-muted-foreground">Travel Compositor sync</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Tools</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system events and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">New user registration: john@example.com</span>
                      <span className="text-xs text-gray-500">2 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Booking imported: TC-2025-001</span>
                      <span className="text-xs text-gray-500">5 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">System maintenance completed</span>
                      <span className="text-xs text-gray-500">1 hour ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleHealthCheck} className="w-full bg-transparent" variant="outline">
                    <Activity className="mr-2 h-4 w-4" />
                    Run System Health Check
                  </Button>
                  <Button onClick={handleSystemCleanup} className="w-full bg-transparent" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    System Cleanup
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Backup Database
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Registered Users</span>
                    <Badge>{systemStats.totalUsers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Users (Last 30 days)</span>
                    <Badge variant="secondary">892</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Admin Users</span>
                    <Badge variant="outline">12</Badge>
                  </div>
                  <Button className="w-full mt-4">
                    <Users className="mr-2 h-4 w-4" />
                    View All Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Tools</CardTitle>
                <CardDescription>Advanced system management and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Database className="h-6 w-6 mb-2" />
                    Database Management
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Settings className="h-6 w-6 mb-2" />
                    System Configuration
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <Activity className="h-6 w-6 mb-2" />
                    Performance Monitor
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    Error Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Monitoring</CardTitle>
                <CardDescription>Real-time system performance and health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-gray-500">23%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "23%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-gray-500">67%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "67%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm text-gray-500">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
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
