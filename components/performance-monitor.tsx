"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Zap, TrendingUp } from "lucide-react"

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  status: "excellent" | "good" | "fair" | "poor"
  trend: "up" | "down" | "stable"
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    { name: "Booking API", value: 1250, unit: "ms", status: "good", trend: "down" },
    { name: "Idea API", value: 340, unit: "ms", status: "excellent", trend: "stable" },
    { name: "Cache Hit Rate", value: 85, unit: "%", status: "good", trend: "up" },
    { name: "Memory Usage", value: 45, unit: "%", status: "excellent", trend: "stable" },
  ])

  const [realTimeData, setRealTimeData] = useState({
    activeRequests: 0,
    totalRequests: 1247,
    successRate: 98.5,
    avgResponseTime: 795,
  })

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value:
            metric.name === "Booking API"
              ? Math.max(200, metric.value + (Math.random() - 0.5) * 200)
              : metric.name === "Idea API"
                ? Math.max(100, metric.value + (Math.random() - 0.5) * 50)
                : metric.value + (Math.random() - 0.5) * 10,
        })),
      )

      setRealTimeData((prev) => ({
        ...prev,
        activeRequests: Math.floor(Math.random() * 5),
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 3),
        avgResponseTime: Math.max(200, prev.avgResponseTime + (Math.random() - 0.5) * 100),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-300"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "poor":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800"
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

  return (
    <div className="space-y-6">
      {/* Real-time Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Live Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{realTimeData.activeRequests}</div>
              <div className="text-sm text-gray-600">Active Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{realTimeData.totalRequests.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{realTimeData.successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(realTimeData.avgResponseTime)}ms</div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{metric.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">
                      {Math.round(metric.value)}
                      {metric.unit}
                    </span>
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
                <Badge className={`${getStatusColor(metric.status)} border`}>{metric.status.toUpperCase()}</Badge>
              </div>

              {/* Progress bar for percentage metrics */}
              {metric.unit === "%" && <Progress value={metric.value} className="h-2" />}

              {/* Response time visualization */}
              {metric.unit === "ms" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0ms</span>
                    <span>Target: &lt;1000ms</span>
                    <span>5000ms</span>
                  </div>
                  <Progress value={Math.min(100, (metric.value / 5000) * 100)} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-green-800">Idea API Optimized</div>
                <div className="text-sm text-green-700">Response times under 500ms - excellent performance!</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-yellow-800">Booking API Improvement</div>
                <div className="text-sm text-yellow-700">
                  Consider implementing ultra-fast endpoint for sub-second responses
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium text-blue-800">Cache Strategy</div>
                <div className="text-sm text-blue-700">
                  85% hit rate is good - consider increasing TTL for stable data
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
