"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, RefreshCw, Users, MapPin, Calendar, Play, Eye } from "lucide-react"

interface UserBooking {
  id: string
  bookingReference: string
  title: string
  destinations: string[]
  status: string
  createdAt: string
  type: "booking" | "idea"
}

interface TravelUser {
  id: string
  email: string
  name: string
  micrositeId: string
  lastLogin: string
  bookings: UserBooking[]
  ideas: UserBooking[]
}

export default function UserDashboardPage() {
  const [users, setUsers] = useState<TravelUser[]>([])
  const [selectedUser, setSelectedUser] = useState<TravelUser | null>(null)
  const [searchEmail, setSearchEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalIdeas: 0,
  })

  // Load all users on mount
  useEffect(() => {
    loadAllUsers()
  }, [])

  const loadAllUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user-dashboard")
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
        setStats({
          totalUsers: data.totalUsers,
          totalBookings: data.totalBookings,
          totalIdeas: data.totalIdeas,
        })
      }
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchUser = async () => {
    if (!searchEmail.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user-dashboard?email=${encodeURIComponent(searchEmail)}`)
      const data = await response.json()

      if (data.success) {
        setSelectedUser(data.user)
      } else {
        alert("Gebruiker niet gevonden")
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const startSync = async () => {
    setIsSyncing(true)
    try {
      await fetch("/api/user-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start-sync" }),
      })
      alert("Real-time sync gestart!")
    } catch (error) {
      console.error("Failed to start sync:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const manualSync = async () => {
    setIsSyncing(true)
    try {
      await fetch("/api/user-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "manual-sync" }),
      })
      await loadAllUsers() // Reload data
      alert("Handmatige sync voltooid!")
    } catch (error) {
      console.error("Manual sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const downloadRoadbook = async (booking: UserBooking) => {
    const url =
      booking.type === "booking" ? `/roadbook/universal/${booking.bookingReference}` : `/offerte/${booking.id}`

    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 User Dashboard - Auto Sync</h1>
          <p className="text-gray-600">Real-time synchronisatie van alle gebruikers en bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-gray-600">Gebruikers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <div className="text-gray-600">Bookings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalIdeas}</div>
              <div className="text-gray-600">Travel Ideas</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sync Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={startSync} disabled={isSyncing}>
                <Play className="w-4 h-4 mr-2" />
                Start Real-time Sync
              </Button>
              <Button onClick={manualSync} disabled={isSyncing} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Handmatige Sync
              </Button>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Zoek gebruiker op email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchUser()}
                />
                <Button onClick={searchUser} disabled={isLoading}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Details */}
        {selectedUser && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {selectedUser.name} ({selectedUser.email})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bookings">
                <TabsList>
                  <TabsTrigger value="bookings">Bookings ({selectedUser.bookings.length})</TabsTrigger>
                  <TabsTrigger value="ideas">Travel Ideas ({selectedUser.ideas.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="bookings">
                  <div className="space-y-4">
                    {selectedUser.bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{booking.title}</h3>
                              <p className="text-sm text-gray-600">{booking.bookingReference}</p>
                              <div className="flex gap-2 mt-2">
                                {booking.destinations.map((dest, i) => (
                                  <Badge key={i} variant="secondary">
                                    {dest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => downloadRoadbook(booking)}>
                                <Download className="w-4 h-4 mr-1" />
                                Roadbook
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="ideas">
                  <div className="space-y-4">
                    {selectedUser.ideas.map((idea) => (
                      <Card key={idea.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{idea.title}</h3>
                              <p className="text-sm text-gray-600">ID: {idea.id}</p>
                              <div className="flex gap-2 mt-2">
                                {idea.destinations.map((dest, i) => (
                                  <Badge key={i} variant="secondary">
                                    {dest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => downloadRoadbook(idea)}>
                                <Eye className="w-4 h-4 mr-1" />
                                Offerte
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* All Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Gebruikers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedUser(user)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span>{user.bookings.length} bookings</span>
                        <span>{user.ideas.length} ideas</span>
                        <Badge>Microsite {user.micrositeId}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
