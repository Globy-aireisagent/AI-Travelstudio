"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Database, Users, Calendar, Lightbulb, MessageSquare } from "lucide-react"

interface DatabaseTestResult {
  success: boolean
  configured: boolean
  connected: boolean
  error?: string
  database_info?: {
    current_time: string
    db_version: string
  }
  table_counts?: {
    users: number
    bookings: number
    travel_ideas: number
    feature_requests: number
  }
  sample_data?: {
    users: any[]
    bookings: any[]
  }
  errors?: {
    users?: string
    bookings?: string
    ideas?: string
    features?: string
  }
}

export default function TestNeonPage() {
  const [testResult, setTestResult] = useState<DatabaseTestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-neon")
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        configured: false,
        connected: false,
        error: "Failed to connect to test endpoint",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (success: boolean, label: string) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className="ml-2">
        {success ? "✓" : "✗"} {label}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Neon Database Test
          </h1>
          <p className="text-muted-foreground mt-2">Test your Neon database connection and verify table setup</p>
        </div>
        <Button onClick={runTest} disabled={loading}>
          {loading ? "Testing..." : "Run Test"}
        </Button>
      </div>

      {testResult && (
        <div className="grid gap-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResult.success)}
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span>Database Configured:</span>
                {getStatusBadge(testResult.configured, testResult.configured ? "Yes" : "No")}
              </div>
              <div className="flex items-center gap-2">
                <span>Database Connected:</span>
                {getStatusBadge(testResult.connected, testResult.connected ? "Yes" : "No")}
              </div>
              {testResult.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Error:</span>
                  </div>
                  <p className="text-red-600 mt-1">{testResult.error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Database Info */}
          {testResult.database_info && (
            <Card>
              <CardHeader>
                <CardTitle>Database Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Current Time:</span>
                  <span className="ml-2">{new Date(testResult.database_info.current_time).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Database Version:</span>
                  <span className="ml-2 text-sm">{testResult.database_info.db_version}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table Counts */}
          {testResult.table_counts && (
            <Card>
              <CardHeader>
                <CardTitle>Table Statistics</CardTitle>
                <CardDescription>Number of records in each table</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{testResult.table_counts.users}</div>
                    <div className="text-sm text-muted-foreground">Users</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{testResult.table_counts.bookings}</div>
                    <div className="text-sm text-muted-foreground">Bookings</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold">{testResult.table_counts.travel_ideas}</div>
                    <div className="text-sm text-muted-foreground">Travel Ideas</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">{testResult.table_counts.feature_requests}</div>
                    <div className="text-sm text-muted-foreground">Feature Requests</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sample Data */}
          {testResult.sample_data && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sample Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {testResult.sample_data.users.length > 0 ? (
                    <div className="space-y-2">
                      {testResult.sample_data.users.map((user: any) => (
                        <div key={user.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">{user.name || user.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.role} • {user.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No users found</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sample Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {testResult.sample_data.bookings.length > 0 ? (
                    <div className="space-y-2">
                      {testResult.sample_data.bookings.map((booking: any) => (
                        <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">{booking.booking_reference}</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.destination} • €{booking.total_price} • {booking.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No bookings found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Setup Instructions */}
          {!testResult.configured && (
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Setup Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium mb-2">To set up your Neon database:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>
                      Go to{" "}
                      <a
                        href="https://neon.tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        neon.tech
                      </a>{" "}
                      and create a database
                    </li>
                    <li>Copy your connection string</li>
                    <li>
                      Add <code className="bg-gray-100 px-1 rounded">DATABASE_URL</code> to your Vercel environment
                      variables
                    </li>
                    <li>Run the SQL scripts in your Neon dashboard</li>
                    <li>Test the connection again</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
