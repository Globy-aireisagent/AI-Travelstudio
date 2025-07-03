"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Building2,
  Plane,
  Lightbulb,
  CreditCard,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  Database,
} from "lucide-react"

interface ImportedUser {
  id: string
  email: string
  name: string
  role: string
  status: string
  bookingsCount: number
  ideasCount: number
  lastLogin: string
  bookings: any[]
  ideas: any[]
}

interface ImportedAgency {
  id: string
  name: string
  micrositeId: string
  usersCount: number
  creditBalance: number
  users: ImportedUser[]
}

interface ImportData {
  totalAgencies: number
  totalUsers: number
  totalBookings: number
  totalIdeas: number
  agencies: ImportedAgency[]
}

export default function TravelCompositorImportDashboard() {
  const [importData, setImportData] = useState<ImportData | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedAgency, setSelectedAgency] = useState<ImportedAgency | null>(null)
  const [selectedUser, setSelectedUser] = useState<ImportedUser | null>(null)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)

  const startImport = async () => {
    setIsImporting(true)
    setImportStatus("idle")
    setProgress(0)

    // Simuleer progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90))
    }, 1000)

    try {
      const response = await fetch("/api/import-travel-compositor-users", {
        method: "POST",
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const result = await response.json()
        setImportData(result.data)
        setImportStatus("success")
        console.log("✅ Import successful:", result)
      } else {
        setImportStatus("error")
        console.error("❌ Import failed")
      }
    } catch (error) {
      clearInterval(progressInterval)
      setImportStatus("error")
      console.error("❌ Import error:", error)
    } finally {
      setIsImporting(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "agent":
        return "bg-blue-100 text-blue-800"
      case "client":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Travel Compositor Complete Import</h1>
          <p className="text-xl text-gray-600">Importeer alle users, agencies, bookings en travel ideas in één keer</p>
        </div>

        {/* Import Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Complete Data Import
            </CardTitle>
            <CardDescription>
              Importeer alle data van alle Travel Compositor microsites inclusief users, bookings en ideas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={startImport} disabled={isImporting} size="lg" className="flex items-center gap-2">
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Start Complete Import
                  </>
                )}
              </Button>

              {importStatus === "success" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Import successful!
                </div>
              )}

              {importStatus === "error" && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Import failed
                </div>
              )}
            </div>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing from all microsites...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-blue-600">
                  Dit kan enkele minuten duren - we importeren alle agencies, users, bookings en ideas...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Results */}
        {importData && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Agencies</p>
                      <p className="text-3xl font-bold text-gray-900">{importData.totalAgencies}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Users</p>
                      <p className="text-3xl font-bold text-gray-900">{importData.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bookings</p>
                      <p className="text-3xl font-bold text-gray-900">{importData.totalBookings}</p>
                    </div>
                    <Plane className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Travel Ideas</p>
                      <p className="text-3xl font-bold text-gray-900">{importData.totalIdeas}</p>
                    </div>
                    <Lightbulb className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Data */}
            <Tabs defaultValue="agencies" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="agencies">Agencies</TabsTrigger>
                <TabsTrigger value="users">All Users</TabsTrigger>
                <TabsTrigger value="data">User Data</TabsTrigger>
              </TabsList>

              <TabsContent value="agencies" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Imported Agencies</CardTitle>
                    <CardDescription>Alle geïmporteerde agencies met hun users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {importData.agencies.map((agency) => (
                          <div
                            key={agency.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedAgency(agency)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h3 className="font-semibold text-lg">{agency.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>Microsite: {agency.micrositeId}</span>
                                  <span>{agency.usersCount} users</span>
                                  <div className="flex items-center gap-1">
                                    <CreditCard className="h-4 w-4" />€{agency.creditBalance}
                                  </div>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Alle geïmporteerde users met hun data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {importData.agencies.flatMap((agency) =>
                          agency.users.map((user) => (
                            <div
                              key={`${agency.id}-${user.id}`}
                              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedUser(user)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-medium">{user.name}</h4>
                                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{user.email}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>Agency: {agency.name}</span>
                                    <span>{user.bookingsCount} bookings</span>
                                    <span>{user.ideasCount} ideas</span>
                                    {user.lastLogin && (
                                      <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Data
                                </Button>
                              </div>
                            </div>
                          )),
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                {selectedUser ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{selectedUser.name} - Complete Data</span>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>
                          Close
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="bookings" className="space-y-4">
                        <TabsList>
                          <TabsTrigger value="bookings">Bookings ({selectedUser.bookingsCount})</TabsTrigger>
                          <TabsTrigger value="ideas">Ideas ({selectedUser.ideasCount})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bookings">
                          <ScrollArea className="h-64">
                            <div className="space-y-3">
                              {selectedUser.bookings.map((booking, index) => (
                                <div key={index} className="border rounded p-3">
                                  <h4 className="font-medium">
                                    {booking.title || booking.bookingReference || `Booking ${index + 1}`}
                                  </h4>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <p>Reference: {booking.bookingReference}</p>
                                    <p>Status: {booking.status}</p>
                                    {booking.totalPrice && <p>Price: €{booking.totalPrice}</p>}
                                    {booking.departureDate && <p>Departure: {booking.departureDate}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="ideas">
                          <ScrollArea className="h-64">
                            <div className="space-y-3">
                              {selectedUser.ideas.map((idea, index) => (
                                <div key={index} className="border rounded p-3">
                                  <h4 className="font-medium">{idea.title || idea.name || `Idea ${index + 1}`}</h4>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <p>ID: {idea.id}</p>
                                    {idea.destination && <p>Destination: {idea.destination}</p>}
                                    {idea.creationDate && <p>Created: {idea.creationDate}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">Selecteer een user om hun complete data te bekijken</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Info Box */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-green-900 mb-2">✅ Complete Import - Wat krijg je?</h3>
            <div className="space-y-2 text-green-800">
              <p>
                🏢 <strong>Alle agencies</strong> met complete profiel en credit balance
              </p>
              <p>
                👥 <strong>Alle users</strong> met hun volledige account informatie
              </p>
              <p>
                ✈️ <strong>Alle bookings</strong> automatisch gekoppeld aan de juiste user
              </p>
              <p>
                💡 <strong>Alle travel ideas</strong> automatisch gekoppeld aan de juiste user
              </p>
              <p>
                🔄 <strong>Real-time data</strong> direct uit Travel Compositor
              </p>
              <p>
                📊 <strong>Complete statistieken</strong> per user en agency
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
