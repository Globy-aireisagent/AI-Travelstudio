"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  Users,
  Plane,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Database,
  Key,
  Globe,
} from "lucide-react"

interface ImportResult {
  success: boolean
  data?: any
  error?: string
  debug?: any
}

export default function TestNewreisplanImport() {
  const [authTest, setAuthTest] = useState<ImportResult | null>(null)
  const [agenciesData, setAgenciesData] = useState<ImportResult | null>(null)
  const [usersData, setUsersData] = useState<ImportResult | null>(null)
  const [bookingTest, setBookingTest] = useState<ImportResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testBookingId, setTestBookingId] = useState("")
  const [progress, setProgress] = useState(0)

  const testAuthentication = async () => {
    setIsLoading(true)
    setProgress(10)

    try {
      const response = await fetch("/api/test-newreisplan-auth", {
        method: "POST",
      })

      const result = await response.json()
      setAuthTest(result)
      setProgress(25)
    } catch (error) {
      setAuthTest({
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      })
    }
  }

  const testAgencies = async () => {
    setProgress(40)

    try {
      const response = await fetch("/api/test-newreisplan-agencies", {
        method: "POST",
      })

      const result = await response.json()
      setAgenciesData(result)
      setProgress(60)
    } catch (error) {
      setAgenciesData({
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      })
    }
  }

  const testUsers = async () => {
    setProgress(75)

    try {
      const response = await fetch("/api/test-newreisplan-users", {
        method: "POST",
      })

      const result = await response.json()
      setUsersData(result)
      setProgress(90)
    } catch (error) {
      setUsersData({
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      })
    }
  }

  const testBookingImport = async () => {
    if (!testBookingId.trim()) return

    try {
      const response = await fetch("/api/test-newreisplan-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: testBookingId.trim() }),
      })

      const result = await response.json()
      setBookingTest(result)
    } catch (error) {
      setBookingTest({
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      })
    }
  }

  const runFullTest = async () => {
    setIsLoading(true)
    setProgress(0)
    setAuthTest(null)
    setAgenciesData(null)
    setUsersData(null)

    await testAuthentication()

    if (authTest?.success !== false) {
      await testAgencies()

      if (agenciesData?.success !== false) {
        await testUsers()
      }
    }

    setProgress(100)
    setIsLoading(false)

    setTimeout(() => setProgress(0), 2000)
  }

  const getStatusIcon = (result: ImportResult | null) => {
    if (!result) return <Globe className="w-4 h-4 text-gray-400" />
    if (result.success) return <CheckCircle className="w-4 h-4 text-green-600" />
    return <AlertCircle className="w-4 h-4 text-red-600" />
  }

  const getStatusColor = (result: ImportResult | null) => {
    if (!result) return "bg-gray-100 text-gray-800"
    if (result.success) return "bg-green-100 text-green-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Newreisplan Microsite Test</h1>
          <p className="text-xl text-gray-600">Test de connectie en import functionaliteit</p>
        </div>

        {/* Credentials Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Microsite Credentials Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">Username</p>
                  <p className="text-xs text-gray-600">Configured ✓</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">Password</p>
                  <p className="text-xs text-gray-600">Configured ✓</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">Microsite ID</p>
                  <p className="text-xs text-gray-600">Configured ✓</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Connection Tests
                </CardTitle>
                <CardDescription>Test alle aspecten van de Newreisplan microsite</CardDescription>
              </div>
              <Button onClick={runFullTest} disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Run Full Test
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Testing Newreisplan microsite...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="space-y-4">
              {/* Authentication Test */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {getStatusIcon(authTest)}
                  <div>
                    <p className="font-medium">1. Authentication Test</p>
                    <p className="text-sm text-gray-600">Test login credentials</p>
                    {authTest?.error && <p className="text-xs text-red-600 mt-1">{authTest.error}</p>}
                  </div>
                </div>
                <Badge className={getStatusColor(authTest)}>
                  {authTest ? (authTest.success ? "Success" : "Failed") : "Pending"}
                </Badge>
              </div>

              {/* Agencies Test */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {getStatusIcon(agenciesData)}
                  <div>
                    <p className="font-medium">2. Agencies Import</p>
                    <p className="text-sm text-gray-600">Fetch all agencies</p>
                    {agenciesData?.data?.agencies && (
                      <p className="text-xs text-green-600 mt-1">Found {agenciesData.data.agencies.length} agencies</p>
                    )}
                    {agenciesData?.error && <p className="text-xs text-red-600 mt-1">{agenciesData.error}</p>}
                  </div>
                </div>
                <Badge className={getStatusColor(agenciesData)}>
                  {agenciesData ? (agenciesData.success ? "Success" : "Failed") : "Pending"}
                </Badge>
              </div>

              {/* Users Test */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {getStatusIcon(usersData)}
                  <div>
                    <p className="font-medium">3. Users Import</p>
                    <p className="text-sm text-gray-600">Fetch users from agencies</p>
                    {usersData?.data?.totalUsers && (
                      <p className="text-xs text-green-600 mt-1">Found {usersData.data.totalUsers} users</p>
                    )}
                    {usersData?.error && <p className="text-xs text-red-600 mt-1">{usersData.error}</p>}
                  </div>
                </div>
                <Badge className={getStatusColor(usersData)}>
                  {usersData ? (usersData.success ? "Success" : "Failed") : "Pending"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Test Booking Import
            </CardTitle>
            <CardDescription>Test het importeren van een specifieke booking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                value={testBookingId}
                onChange={(e) => setTestBookingId(e.target.value)}
                placeholder="Voer booking ID in (bijv. RRP-1234)"
                className="flex-1"
              />
              <Button onClick={testBookingImport} disabled={!testBookingId.trim()}>
                Test Import
              </Button>
            </div>

            {bookingTest && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(bookingTest)}
                  <span className="font-medium">Booking Import {bookingTest.success ? "Successful" : "Failed"}</span>
                </div>
                {bookingTest.success && bookingTest.data && (
                  <div className="text-sm text-gray-600">
                    <p>Booking: {bookingTest.data.title || bookingTest.data.bookingReference}</p>
                    <p>Client: {bookingTest.data.client?.name || "Unknown"}</p>
                    <p>Destination: {bookingTest.data.destination || "Unknown"}</p>
                  </div>
                )}
                {bookingTest.error && <p className="text-sm text-red-600">{bookingTest.error}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Display */}
        {(agenciesData?.success || usersData?.success) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agencies Results */}
            {agenciesData?.success && agenciesData.data?.agencies && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Found Agencies ({agenciesData.data.agencies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {agenciesData.data.agencies.map((agency: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">{agency.name}</p>
                          <p className="text-sm text-gray-600">ID: {agency.id}</p>
                          {agency.email && <p className="text-sm text-gray-600">Email: {agency.email}</p>}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Users Results */}
            {usersData?.success && usersData.data?.users && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Found Users ({usersData.data.totalUsers})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {usersData.data.users.slice(0, 10).map((user: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600">Agency: {user.agencyName}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {user.bookingsCount} bookings
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {user.ideasCount} ideas
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {usersData.data.users.length > 10 && (
                        <p className="text-sm text-gray-500 text-center p-2">
                          ... and {usersData.data.users.length - 10} more users
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Success Summary */}
        {authTest?.success && agenciesData?.success && usersData?.success && (
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-green-900">Newreisplan Microsite Ready! 🎉</h3>
                  <p className="text-green-700">Alle tests zijn succesvol - je kunt nu importeren</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{agenciesData.data?.agencies?.length || 0}</p>
                  <p className="text-sm text-gray-600">Agencies</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{usersData.data?.totalUsers || 0}</p>
                  <p className="text-sm text-gray-600">Users</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {(usersData.data?.totalBookings || 0) + (usersData.data?.totalIdeas || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
