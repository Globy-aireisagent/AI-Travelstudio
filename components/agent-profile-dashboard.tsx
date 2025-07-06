"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  User,
  MapPin,
  Award,
  TrendingUp,
  Calendar,
  Users,
  Plane,
  DollarSign,
  Star,
  RefreshCw,
  Settings,
  Bell,
} from "lucide-react"

interface AgentProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  avatar?: string
  phone?: string
  specializations: string[]
  languages: string[]
  certifications: string[]
  experience: number
  agencyName?: string
  territory?: string[]
  stats: {
    totalBookings: number
    totalRevenue: number
    clientCount: number
    averageRating: number
    completedTrips: number
  }
  status: string
  role: string
  isImportedFromTC: boolean
  needsPasswordReset: boolean
}

interface AgentDashboardProps {
  agentId: string
}

export default function AgentProfileDashboard({ agentId }: AgentDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [agentId])

  const loadDashboard = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/agent-profile?action=dashboard&id=${agentId}`)
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data.dashboard)
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncWithTC = async () => {
    if (!dashboardData?.profile?.isImportedFromTC) return

    setIsSyncing(true)
    try {
      const response = await fetch("/api/agent-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-tc", agentId }),
      })

      if (response.ok) {
        await loadDashboard() // Reload data
      }
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent niet gevonden</h1>
          <Button onClick={loadDashboard}>Opnieuw proberen</Button>
        </div>
      </div>
    )
  }

  const { profile, recentBookings, upcomingTrips, pendingTasks, performance } = dashboardData

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {profile.firstName?.[0]}
                {profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.displayName}</h1>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={profile.status === "active" ? "default" : "secondary"}>{profile.status}</Badge>
                <Badge variant="outline">{profile.role}</Badge>
                {profile.isImportedFromTC && <Badge variant="secondary">Travel Compositor</Badge>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {profile.isImportedFromTC && (
              <Button onClick={syncWithTC} disabled={isSyncing} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                Sync TC
              </Button>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Instellingen
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Totaal Bookings</p>
                  <p className="text-2xl font-bold">{profile.stats.totalBookings}</p>
                </div>
                <Plane className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Totaal Omzet</p>
                  <p className="text-2xl font-bold">€{profile.stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Klanten</p>
                  <p className="text-2xl font-bold">{profile.stats.clientCount}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gemiddelde Rating</p>
                  <p className="text-2xl font-bold">{profile.stats.averageRating}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ervaring</p>
                  <p className="text-2xl font-bold">{profile.experience} jaar</p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="bookings" className="space-y-4">
              <TabsList>
                <TabsTrigger value="bookings">Recente Bookings</TabsTrigger>
                <TabsTrigger value="upcoming">Aankomende Reizen</TabsTrigger>
                <TabsTrigger value="tasks">Taken</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>Recente Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentBookings?.length > 0 ? (
                        recentBookings.slice(0, 5).map((booking: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{booking.title || `Booking ${booking.bookingReference}`}</h4>
                              <p className="text-sm text-gray-600">{booking.clientName || booking.clientEmail}</p>
                              <p className="text-xs text-gray-500">{booking.departureDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">€{booking.totalPrice?.toLocaleString()}</p>
                              <Badge variant="outline">{booking.status}</Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">Geen recente bookings</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upcoming">
                <Card>
                  <CardHeader>
                    <CardTitle>Aankomende Reizen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingTrips?.length > 0 ? (
                        upcomingTrips.map((trip: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{trip.title}</h4>
                              <p className="text-sm text-gray-600">{trip.destination}</p>
                              <p className="text-xs text-gray-500">Vertrek: {trip.departureDate}</p>
                            </div>
                            <Badge variant="default">Bevestigd</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">Geen aankomende reizen</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks">
                <Card>
                  <CardHeader>
                    <CardTitle>Openstaande Taken</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingTasks?.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-gray-600">Deadline: {task.dueDate}</p>
                          </div>
                          <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profiel Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Specialisaties</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations.map((spec: string) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Talen</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang: string) => (
                      <Badge key={lang} variant="outline">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {profile.territory && (
                  <div>
                    <h4 className="font-medium mb-2">Werkgebied</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.territory.map((area: string) => (
                        <Badge key={area} variant="outline">
                          <MapPin className="h-3 w-3 mr-1" />
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.agencyName && (
                  <div>
                    <h4 className="font-medium mb-2">Agency</h4>
                    <p className="text-sm text-gray-600">{profile.agencyName}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Deze maand</span>
                    <span>{performance?.thisMonth?.bookings || 0} bookings</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Omzet doel</span>
                    <span>€{performance?.thisMonth?.revenue?.toLocaleString() || 0}</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Trend vs vorige maand:</span>
                    <Badge variant={performance?.trend === "up" ? "default" : "secondary"}>
                      {performance?.trend === "up" ? "↗️ Stijgend" : "→ Stabiel"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Snelle Acties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-transparent" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Nieuwe Booking
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Klant Toevoegen
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaties
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
