"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Loader2, Users, Building, Plane, Info } from "lucide-react"

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export default function TestNewreisplanImport() {
  const [authResult, setAuthResult] = useState<TestResult | null>(null)
  const [agenciesResult, setAgenciesResult] = useState<TestResult | null>(null)
  const [usersResult, setUsersResult] = useState<TestResult | null>(null)
  const [bookingResult, setBookingResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState("29966990")

  const testAuth = async () => {
    setIsLoading("auth")
    try {
      const response = await fetch("/api/test-newreisplan-auth")
      const result = await response.json()
      setAuthResult(result)
    } catch (error) {
      setAuthResult({
        success: false,
        message: "Network error",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const testAgencies = async () => {
    setIsLoading("agencies")
    try {
      const response = await fetch("/api/test-newreisplan-agencies")
      const result = await response.json()
      setAgenciesResult(result)
    } catch (error) {
      setAgenciesResult({
        success: false,
        message: "Network error",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const testUsers = async () => {
    setIsLoading("users")
    try {
      const response = await fetch("/api/test-newreisplan-users")
      const result = await response.json()
      setUsersResult(result)
    } catch (error) {
      setUsersResult({
        success: false,
        message: "Network error",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const testBooking = async () => {
    if (!bookingId.trim()) return

    setIsLoading("booking")
    try {
      const response = await fetch(`/api/test-newreisplan-booking?id=${encodeURIComponent(bookingId)}`)
      const result = await response.json()
      setBookingResult(result)
    } catch (error) {
      setBookingResult({
        success: false,
        message: "Network error",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const runFullTest = async () => {
    await testAuth()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await testAgencies()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await testUsers()
  }

  const ResultCard = ({
    title,
    result,
    icon,
    isLoading: loading,
  }: {
    title: string
    result: TestResult | null
    icon: React.ReactNode
    isLoading: boolean
  }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {result && (
            <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "Success" : "Failed"}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={result.success ? "text-green-700" : "text-red-700"}>{result.message}</p>
                {result.error && (
                  <p className="text-red-600 text-sm mt-1 font-mono bg-red-50 p-2 rounded">{result.error}</p>
                )}
              </div>
            </div>

            {result.data && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Results:</h4>
                {result.data.agencies && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Found Agencies ({result.data.agencies.length})</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.data.agencies.slice(0, 5).map((agency: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="font-medium">{agency.name || "Unnamed Agency"}</div>
                          <div className="text-sm text-gray-600">ID: {agency.id}</div>
                          <div className="text-sm text-gray-600">Email: {agency.email}</div>
                        </div>
                      ))}
                      {result.data.agencies.length > 5 && (
                        <div className="text-sm text-gray-500 text-center py-2">
                          ... and {result.data.agencies.length - 5} more agencies
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.data.users && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Found Users ({result.data.users.length})</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.data.users.slice(0, 5).map((user: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-gray-600">Agency: {user.agencyName}</div>
                          <div className="text-sm text-gray-600">
                            <span className="mr-4">{user.bookings || 0} bookings</span>
                            <span>{user.ideas || 0} ideas</span>
                          </div>
                        </div>
                      ))}
                      {result.data.users.length > 5 && (
                        <div className="text-sm text-gray-500 text-center py-2">
                          ... and {result.data.users.length - 5} more users
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.data.booking && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Booking Details</h5>
                    <div className="bg-white p-3 rounded border">
                      <div className="font-medium">Booking {result.data.booking.id}</div>
                      <div className="text-sm text-gray-600">
                        Client: {result.data.booking.clientName || result.data.booking.clientEmail}
                      </div>
                      <div className="text-sm text-gray-600">Status: {result.data.booking.status}</div>
                      {result.data.booking.totalPrice && (
                        <div className="text-sm text-gray-600">Price: €{result.data.booking.totalPrice}</div>
                      )}
                    </div>
                  </div>
                )}

                {result.data.summary && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-2">Summary</h5>
                    <div className="text-sm text-blue-700">
                      <div>Total Agencies: {result.data.summary.totalAgencies}</div>
                      <div>Total Users: {result.data.summary.totalUsers}</div>
                      <div>Total Items: {result.data.summary.totalItems}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Running test...
          </div>
        ) : (
          <p className="text-gray-500">Click the button above to run this test</p>
        )}
      </CardContent>
    </Card>
  )

  const allTestsSuccessful = authResult?.success && agenciesResult?.success && usersResult?.success

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Newreisplan Microsite Test</h1>
        <p className="text-gray-600">Test de connectie en data import van de Newreisplan microsite</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex gap-4 flex-wrap">
        <Button onClick={runFullTest} disabled={isLoading !== null} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Run Full Test
        </Button>
        <Button onClick={testAuth} disabled={isLoading !== null} variant="outline">
          Test Auth Only
        </Button>
        <Button onClick={testAgencies} disabled={isLoading !== null} variant="outline">
          Test Agencies Only
        </Button>
        <Button onClick={testUsers} disabled={isLoading !== null} variant="outline">
          Test Users Only
        </Button>
      </div>

      {/* Test Results */}
      <ResultCard
        title="Authentication Test"
        result={authResult}
        icon={<CheckCircle className="h-5 w-5" />}
        isLoading={isLoading === "auth"}
      />

      <ResultCard
        title="Agencies Import Test"
        result={agenciesResult}
        icon={<Building className="h-5 w-5" />}
        isLoading={isLoading === "agencies"}
      />

      <ResultCard
        title="Users Import Test"
        result={usersResult}
        icon={<Users className="h-5 w-5" />}
        isLoading={isLoading === "users"}
      />

      {/* Booking Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Test Booking Import
            {isLoading === "booking" && <Loader2 className="h-4 w-4 animate-spin" />}
            {bookingResult && (
              <Badge variant={bookingResult.success ? "default" : "destructive"}>
                {bookingResult.success ? "Success" : "Failed"}
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600">Test het importeren van een specifieke booking</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Booking ID (bijv. 29966990)"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testBooking} disabled={isLoading !== null || !bookingId.trim()}>
              Test Import
            </Button>
          </div>

          {bookingResult && (
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                {bookingResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={bookingResult.success ? "text-green-700" : "text-red-700"}>{bookingResult.message}</p>
                  {bookingResult.error && (
                    <p className="text-red-600 text-sm mt-1 font-mono bg-red-50 p-2 rounded">{bookingResult.error}</p>
                  )}
                </div>
              </div>

              {bookingResult.data?.booking && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Booking Found:</h4>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium">Booking {bookingResult.data.booking.id}</div>
                    <div className="text-sm text-gray-600">
                      Client: {bookingResult.data.booking.clientName || bookingResult.data.booking.clientEmail}
                    </div>
                    <div className="text-sm text-gray-600">Status: {bookingResult.data.booking.status}</div>
                    {bookingResult.data.booking.totalPrice && (
                      <div className="text-sm text-gray-600">Price: €{bookingResult.data.booking.totalPrice}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Summary */}
      {allTestsSuccessful && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Newreisplan Microsite Ready! 🎉</h3>
                <p className="text-green-700">Alle tests zijn succesvol - je kunt nu importeren</p>
              </div>
            </div>

            {(agenciesResult?.data?.summary || usersResult?.data?.summary) && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {agenciesResult?.data?.summary?.totalAgencies || agenciesResult?.data?.agencies?.length || 0}
                  </div>
                  <div className="text-sm text-green-700">Agencies</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {usersResult?.data?.summary?.totalUsers || usersResult?.data?.users?.length || 0}
                  </div>
                  <div className="text-sm text-green-700">Users</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{usersResult?.data?.summary?.totalItems || 0}</div>
                  <div className="text-sm text-green-700">Total Items</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200 mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Test Info</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Authentication test controleert of je credentials kloppen</li>
                <li>• Agencies test haalt alle agencies op (met paginering)</li>
                <li>• Users test haalt alle users op van alle agencies</li>
                <li>• Booking test probeert verschillende ID formaten en endpoints</li>
                <li>• Alle tests loggen gedetailleerde info naar de browser console</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
