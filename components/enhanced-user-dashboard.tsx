"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Download, RefreshCw, Database, Zap } from "lucide-react"

interface BulkImportStats {
  totalUsers: number
  totalBookings: number
  totalIdeas: number
  isRunning: boolean
  lastSync: string | null
}

export function EnhancedUserDashboard() {
  const [stats, setStats] = useState<BulkImportStats | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 10000) // Update elke 10 seconden
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/bulk-user-import")
      const data = await response.json()
      if (data.success) {
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const startBulkImport = async () => {
    setIsImporting(true)
    setProgress(0)

    try {
      // Simuleer progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 1000)

      const response = await fetch("/api/bulk-user-import", {
        method: "POST",
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (data.success) {
        setStats({
          totalUsers: data.totalUsers,
          totalBookings: data.totalBookings,
          totalIdeas: data.totalIdeas,
          isRunning: true,
          lastSync: new Date().toISOString(),
        })
        alert(
          `✅ Import succesvol! ${data.totalUsers} users geïmporteerd met ${data.totalBookings} bookings en ${data.totalIdeas} ideas`,
        )
      }
    } catch (error) {
      console.error("Import failed:", error)
      alert("❌ Import gefaald")
    } finally {
      setIsImporting(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Bulk User Import van Travel Compositor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Importeer automatisch alle users uit Travel Compositor inclusief hun bookings en travel ideas.
            </p>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importeren...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={startBulkImport} disabled={isImporting} className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {isImporting ? "Importeren..." : "Start Bulk Import"}
              </Button>

              <Button onClick={loadStats} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-gray-600">Users Geïmporteerd</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <div className="text-gray-600">Bookings Gekoppeld</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Download className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalIdeas}</div>
              <div className="text-gray-600">Ideas Gekoppeld</div>
            </CardContent>
          </Card>
        </div>
      )}

      {stats?.lastSync && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Laatste sync:</span>
              <Badge variant={stats.isRunning ? "default" : "secondary"}>
                {new Date(stats.lastSync).toLocaleString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
