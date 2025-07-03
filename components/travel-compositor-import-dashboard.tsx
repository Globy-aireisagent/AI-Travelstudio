"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")

  const startImport = async () => {
    setIsImporting(true)
    setImportStatus("idle")

    try {
      const response = await fetch("/api/import-travel-compositor-users", {
        method: "POST",
      })

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
      setImportStatus("error")
      console.error("❌ Import error:", error)
    } finally {
      setIsImporting(false)
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
          <h1 className="text-4xl font-bold text-gray-900">Travel Compositor Import Dashboard</h1>
          <p className="text-xl text-gray-600">Importeer users, agencies en hun reizen vanuit Travel Compositor</p>
        </div>

        {/* Import Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Import
            </CardTitle>
            <CardDescription>
              Importeer alle users, agencies, bookings en travel ideas vanuit Travel Compositor
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
                    Start Import
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  🔄 Importing data from all Travel Compositor microsites...
                  <br />
                  Dit kan enkele minuten duren.
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="agencies">Agencies Overview</TabsTrigger>
                <TabsTrigger value="users">Users Detail</TabsTrigger>
              </TabsList>

              <TabsContent value="agencies" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Imported Agencies</CardTitle>
                    <CardDescription>Overzicht van alle geïmporteerde agencies en hun users</CardDescription>
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
                    <CardDescription>Alle geïmporteerde users met hun bookings en ideas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {importData.agencies.flatMap((agency) =>
                          agency.users.map((user) => (
                            <div key={`${agency.id}-${user.id}`} className="border rounded-lg p-4">
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
                              </div>
                            </div>
                          )),
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Agency Detail Modal */}
        {selectedAgency && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedAgency.name} - Details</span>
                <Button variant="outline" onClick={() => setSelectedAgency(null)}>
                  Close
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Agency Info</h4>
                  <p className="text-sm text-gray-600">ID: {selectedAgency.id}</p>
                  <p className="text-sm text-gray-600">Microsite: {selectedAgency.micrositeId}</p>
                  <p className="text-sm text-gray-600">Credit: €{selectedAgency.creditBalance}</p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-semibold mb-3">Users ({selectedAgency.usersCount})</h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {selectedAgency.users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getRoleColor(user.role)} variant="secondary">
                              {user.role}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {user.bookingsCount}B / {user.ideasCount}I
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Wat betekent deze import?</h3>
            <div className="space-y-2 text-blue-800">
              <p>
                ✅ <strong>Alle users en agencies</strong> worden geïmporteerd met hun volledige profiel
              </p>
              <p>
                ✅ <strong>Hun reizen komen automatisch mee</strong> - alle bookings en travel ideas
              </p>
              <p>
                ⚠️ <strong>Wachtwoorden worden NIET geïmporteerd</strong> - users moeten nieuwe wachtwoorden instellen
              </p>
              <p>
                ✅ <strong>Ze kunnen wel dezelfde email gebruiken</strong> om in te loggen in ons systeem
              </p>
              <p>
                ✅ <strong>Alle reisdata blijft gekoppeld</strong> aan hun account
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
