"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Database,
  Cloud,
  Shield,
  MemoryStickIcon as Memory,
  Trash2,
  Activity,
} from "lucide-react"

interface HealthReport {
  timestamp: string
  status: "healthy" | "warning" | "critical" | "error"
  issues: string[]
  recommendations: string[]
  services: {
    database: string
    travelCompositor: string
    authentication: string
    memory: string
  }
  stats: {
    activeConnections: number
    cachedTokens: number
    pendingOperations: number
  }
}

export default function SystemStatusPage() {
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [lastCleanup, setLastCleanup] = useState<string | null>(null)

  const checkSystemHealth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/system-health-check")
      const data = await response.json()
      setHealthReport(data)
    } catch (error) {
      console.error("Health check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const performCleanup = async () => {
    setIsCleaningUp(true)
    try {
      const response = await fetch("/api/system-cleanup", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setLastCleanup(new Date().toISOString())
        // Refresh health check after cleanup
        setTimeout(checkSystemHealth, 1000)
      }
    } catch (error) {
      console.error("Cleanup failed:", error)
    } finally {
      setIsCleaningUp(false)
    }
  }

  useEffect(() => {
    checkSystemHealth()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "critical":
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">System Status Dashboard</h1>
          <p className="text-xl text-gray-600">Monitor en beheer je Travel Assistant systeem</p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4">
          <Button onClick={checkSystemHealth} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Checking..." : "Health Check"}
          </Button>

          <Button
            onClick={performCleanup}
            disabled={isCleaningUp}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <Trash2 className={`h-4 w-4 ${isCleaningUp ? "animate-pulse" : ""}`} />
            {isCleaningUp ? "Cleaning..." : "System Cleanup"}
          </Button>
        </div>

        {healthReport && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="issues">Issues & Fixes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Overall Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {getStatusIcon(healthReport.status)}
                    System Status
                    <Badge className={getStatusColor(healthReport.status)}>{healthReport.status.toUpperCase()}</Badge>
                  </CardTitle>
                  <CardDescription>Last checked: {new Date(healthReport.timestamp).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{healthReport.issues.length}</div>
                      <div className="text-sm text-blue-800">Active Issues</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(healthReport.services).filter((s) => s === "healthy").length}
                      </div>
                      <div className="text-sm text-green-800">Healthy Services</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{healthReport.recommendations.length}</div>
                      <div className="text-sm text-purple-800">Recommendations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cleanup Status */}
              {lastCleanup && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">System cleanup completed</span>
                      <span className="text-sm">({new Date(lastCleanup).toLocaleString()})</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Database */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Database
                      <Badge className={getStatusColor(healthReport.services.database)}>
                        {healthReport.services.database}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Supabase database connectivity and operations</p>
                  </CardContent>
                </Card>

                {/* Travel Compositor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="h-5 w-5" />
                      Travel Compositor
                      <Badge className={getStatusColor(healthReport.services.travelCompositor)}>
                        {healthReport.services.travelCompositor}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">External API connectivity and authentication</p>
                  </CardContent>
                </Card>

                {/* Authentication */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Authentication
                      <Badge className={getStatusColor(healthReport.services.authentication)}>
                        {healthReport.services.authentication}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">User authentication and session management</p>
                  </CardContent>
                </Card>

                {/* Memory */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Memory className="h-5 w-5" />
                      Memory
                      <Badge className={getStatusColor(healthReport.services.memory)}>
                        {healthReport.services.memory}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Application memory usage and performance</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              {/* Issues */}
              {healthReport.issues.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-800">Active Issues</CardTitle>
                    <CardDescription>Problems that need attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {healthReport.issues.map((issue, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-800">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {healthReport.recommendations.length > 0 && (
                <Card className="border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-yellow-800">Recommendations</CardTitle>
                    <CardDescription>Suggested actions to improve system health</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {healthReport.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-yellow-800">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* No Issues */}
              {healthReport.issues.length === 0 && healthReport.recommendations.length === 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">All Systems Operational</h3>
                    <p className="text-green-700">No issues detected. Your system is running smoothly!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Travel Compositor Impact Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Travel Compositor Import Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-blue-700">Het Travel Compositor import systeem kan het volgende beïnvloeden:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
              <li>
                <strong>Authentication tokens:</strong> Kunnen verlopen of corrupt raken
              </li>
              <li>
                <strong>Memory usage:</strong> Grote imports kunnen geheugen opbouwen
              </li>
              <li>
                <strong>Database connections:</strong> Veel gelijktijdige operaties
              </li>
              <li>
                <strong>API rate limits:</strong> Te veel requests naar Travel Compositor
              </li>
              <li>
                <strong>Cached data:</strong> Oude data kan conflicteren
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-100 rounded">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Voer regelmatig een "System Cleanup" uit na grote import operaties
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
