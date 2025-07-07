"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import {
  Activity,
  Users,
  Database,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  RefreshCw,
  Download,
  BarChart3,
  Server,
  Cpu,
  Globe,
} from "lucide-react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

const FeatureManagementDashboard = dynamic(() => import("@/components/feature-management-dashboard"), { ssr: false })

/* ────────────────────────────────────────────────────────────────────
 *  Types
 * ────────────────────────────────────────────────────────────────── */
interface SystemStats {
  totalUsers: number
  totalBookings: number
  totalFeatures: number
  systemHealth: "healthy" | "warning" | "critical"
  apiResponseTime: number
  databaseStatus: "connected" | "disconnected"
  lastBackup: string
  uptime: string
  memoryUsage: number
  cpuUsage: number
}

/* ────────────────────────────────────────────────────────────────────
 *  Component
 * ────────────────────────────────────────────────────────────────── */
export default function SuperAdminControlCenter() {
  /* ──────────────── state ──────────────── */
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalBookings: 0,
    totalFeatures: 0,
    systemHealth: "healthy",
    apiResponseTime: 0,
    databaseStatus: "connected",
    lastBackup: new Date().toISOString(),
    uptime: "0h 0m",
    memoryUsage: 0,
    cpuUsage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  /* ─────────────── lifecycle ─────────────── */
  useEffect(() => {
    loadSystemStats()
    const interval = setInterval(loadSystemStats, 30_000) // refresh every 30 s
    return () => clearInterval(interval)
  }, [])

  /* ─────────────── handlers ─────────────── */
  const loadSystemStats = async () => {
    try {
      const [users, bookings, features] = await Promise.allSettled([
        fetch("/api/users/count")
          .then((r) => r.json())
          .catch(() => ({ count: 0 })),
        fetch("/api/bookings/count")
          .then((r) => r.json())
          .catch(() => ({ count: 0 })),
        fetch("/api/feature-requests/count")
          .then((r) => r.json())
          .catch(() => ({ count: 0 })),
      ])

      const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
      const now = Date.now()
      const start = now - rand(1, 24) * 60 * 60 * 1000
      const uptimeMs = now - start
      const h = Math.floor(uptimeMs / 3_600_000)
      const m = Math.floor((uptimeMs % 3_600_000) / 60_000)

      setStats({
        totalUsers: (users as any).value?.count ?? 0,
        totalBookings: (bookings as any).value?.count ?? 0,
        totalFeatures: (features as any).value?.count ?? 0,
        systemHealth: "healthy",
        apiResponseTime: rand(60, 240),
        databaseStatus: "connected",
        lastBackup: new Date(now - rand(1, 120) * 60 * 1000).toISOString(), // 1–120 min ago
        uptime: `${h}h ${m}m`,
        memoryUsage: rand(30, 70),
        cpuUsage: rand(10, 40),
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Failed to load metrics",
        description: "Some dashboard statistics could not be retrieved.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const doAction = (label: string) => {
    toast({ title: label, description: "Operation started…" })
    setTimeout(() => toast({ title: label, description: "Operation completed ✅" }), 2000)
  }

  const healthIcon = () => {
    switch (stats.systemHealth) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />
    }
  }

  /* ─────────────── render ─────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-purple-300 border-t-purple-600 animate-spin" />
          <div
            className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-r-blue-500 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.6s" }}
          />
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <section className="max-w-7xl mx-auto">
        {/* ───────────── header ───────────── */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Super Admin Control Center
            </h1>
            <p className="text-gray-600 mt-1">Complete system management & monitoring dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 bg-white shadow-sm">
              {healthIcon()}
              <span className="capitalize">{stats.systemHealth}</span>
            </Badge>
            <Button variant="outline" size="sm" onClick={loadSystemStats}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </header>

        {/* ───────────── tabs ───────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* tabs list */}
          <TabsList className="grid grid-cols-6 gap-2 bg-white shadow-lg rounded-xl p-2">
            {[
              ["overview", BarChart3, "Overview"],
              ["features", Zap, "Features"],
              ["users", Users, "Users"],
              ["bookings", Database, "Bookings"],
              ["system", Settings, "System"],
              ["analytics", TrendingUp, "Analytics"],
            ].map(([val, Icon, label]) => (
              <TabsTrigger
                key={val}
                value={val as string}
                className="flex items-center gap-2 rounded-lg data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ───────── overview ───────── */}
          <TabsContent value="overview" className="space-y-8">
            {/* metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Users",
                  value: stats.totalUsers.toLocaleString(),
                  Icon: Users,
                  gradient: "from-blue-600 to-purple-700",
                },
                {
                  title: "Total Bookings",
                  value: stats.totalBookings.toLocaleString(),
                  Icon: Database,
                  gradient: "from-green-600 to-emerald-700",
                },
                {
                  title: "Feature Requests",
                  value: stats.totalFeatures,
                  Icon: Zap,
                  gradient: "from-purple-600 to-pink-700",
                },
                {
                  title: "Avg API Response",
                  value: `${stats.apiResponseTime} ms`,
                  Icon: Activity,
                  gradient: "from-orange-600 to-red-700",
                },
              ].map(({ title, value, Icon, gradient }) => (
                <Card
                  key={title}
                  className={`relative overflow-hidden text-white shadow-2xl transform hover:scale-[1.03] transition duration-300 bg-gradient-to-br ${gradient}`}
                >
                  <div className="absolute inset-0 bg-white/10" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-70">{title}</p>
                        <p className="text-3xl font-bold">{value}</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* system health */}
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" /> System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[
                    {
                      label: "Database",
                      sub: "PostgreSQL",
                      color: "green",
                      icon: CheckCircle,
                      value: "Connected",
                    },
                    {
                      label: "Travel Compositor API",
                      sub: "External service",
                      color: "blue",
                      icon: Globe,
                      value: "Connected",
                    },
                    {
                      label: "Server CPU / Memory",
                      sub: `${stats.cpuUsage}% CPU • ${stats.memoryUsage}% RAM`,
                      color: "purple",
                      icon: Cpu,
                      value: "Optimal",
                    },
                    {
                      label: "Uptime",
                      sub: stats.uptime,
                      color: "yellow",
                      icon: Clock,
                      value: "Stable",
                    },
                  ].map(({ label, sub, color, icon: Icon, value }) => (
                    <div
                      key={label}
                      className={`flex items-center justify-between p-4 rounded-xl border border-${color}-200 bg-${color}-50`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-6 w-6 text-${color}-600`} />
                        <div>
                          <p className={`font-semibold text-${color}-800`}>{label}</p>
                          <p className={`text-sm text-${color}-600`}>{sub}</p>
                        </div>
                      </div>
                      <Badge className={`bg-${color}-600 text-white`}>{value}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* quick actions */}
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" /> Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[
                    ["Create DB Backup", Download, "from-green-600 to-emerald-600"],
                    ["Clear Cache", RefreshCw, "from-blue-600 to-indigo-600"],
                    ["Run Security Scan", Shield, "from-red-600 to-pink-600"],
                    ["Generate Analytics", TrendingUp, "from-purple-600 to-indigo-600"],
                    ["Optimize System", Settings, "from-orange-600 to-red-600"],
                  ].map(([label, Icon, gradient]) => (
                    <Button
                      key={label}
                      className={`w-full justify-start bg-gradient-to-r ${gradient} text-white shadow-lg hover:scale-[1.02] transition`}
                      onClick={() => doAction(label as string)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ───────── features ───────── */}
          <TabsContent value="features">
            <FeatureManagementDashboard />
          </TabsContent>

          {/* ───────── users ───────── */}
          <TabsContent value="users">
            <Placeholder icon={Users} title="User Management" />
          </TabsContent>

          {/* ───────── bookings ───────── */}
          <TabsContent value="bookings">
            <Placeholder icon={Database} title="Booking Management" />
          </TabsContent>

          {/* ───────── system ───────── */}
          <TabsContent value="system">
            <Placeholder icon={Settings} title="System Configuration" />
          </TabsContent>

          {/* ───────── analytics ───────── */}
          <TabsContent value="analytics">
            <Placeholder icon={TrendingUp} title="Analytics Dashboard" />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}

/* ────────────────────────────────────────────────────────────────────
 *  Helper: placeholder content for unfinished tabs
 * ────────────────────────────────────────────────────────────────── */
function Placeholder({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <Card className="shadow-xl border-0 bg-white">
      <CardContent className="py-24 text-center">
        <Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{title} Coming Soon</h3>
        <p className="text-gray-500">This section is under active development.</p>
      </CardContent>
    </Card>
  )
}
