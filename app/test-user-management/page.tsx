"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TestUserManagement() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [micrositeId, setMicrositeId] = useState("microsite1")
  const [agencyId, setAgencyId] = useState("agency123")
  const [username, setUsername] = useState("testuser")
  const [dataSheetId, setDataSheetId] = useState("datasheet123")
  const [language, setLanguage] = useState("nl")
  const [config, setConfig] = useState("1")

  const testGetUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/travel-compositor/user/${micrositeId}?config=${config}&first=0&limit=10`)
      const data = await response.json()
      setResults({ type: "users", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testGetAgencyUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/travel-compositor/user/${micrositeId}/${agencyId}?config=${config}&first=0&limit=10`,
      )
      const data = await response.json()
      setResults({ type: "agency-users", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testGetUserDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/travel-compositor/user/${micrositeId}/${agencyId}/${username}?config=${config}`,
      )
      const data = await response.json()
      setResults({ type: "user-details", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testCreateUser = async () => {
    setLoading(true)
    try {
      const userData = {
        username: `${username}_new`,
        password: "testpassword123",
        name: "Test",
        surname: "User",
        email: "test@example.com",
        telephone: "+31612345678",
        country: "NL",
        active: true,
        newsletter: false,
        b2c: false,
        profile: "AGENT",
      }

      const response = await fetch(`/api/travel-compositor/user/${micrositeId}/${agencyId}/create?config=${config}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      const data = await response.json()
      setResults({ type: "create-user", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testUpdateUser = async () => {
    setLoading(true)
    try {
      const userData = {
        username,
        name: "Updated",
        surname: "User",
        email: "updated@example.com",
        active: true,
      }

      const response = await fetch(`/api/travel-compositor/user/${micrositeId}/${agencyId}?config=${config}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      const data = await response.json()
      setResults({ type: "update-user", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testDeactivateUser = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/travel-compositor/user/${micrositeId}/${agencyId}/${username}/deactivate?config=${config}`,
        {
          method: "PUT",
        },
      )
      const data = await response.json()
      setResults({ type: "deactivate-user", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  const testDeleteCustomContent = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/travel-compositor/user/${micrositeId}/customercontent/${language}/${dataSheetId}?config=${config}`,
        {
          method: "DELETE",
        },
      )
      const data = await response.json()
      setResults({ type: "delete-content", data })
    } catch (error) {
      setResults({ type: "error", error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">👥 User Management API Tester</h1>
          <p className="text-gray-600">Test complete user management and content operations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Configuration</CardTitle>
              <CardDescription>Set up test parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="config">API Configuration</Label>
                <Select value={config} onValueChange={setConfig}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Config 1 (Primary)</SelectItem>
                    <SelectItem value="2">Config 2 (Secondary)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="micrositeId">Microsite ID</Label>
                <Input
                  id="micrositeId"
                  value={micrositeId}
                  onChange={(e) => setMicrositeId(e.target.value)}
                  placeholder="microsite1"
                />
              </div>

              <div>
                <Label htmlFor="agencyId">Agency ID</Label>
                <Input
                  id="agencyId"
                  value={agencyId}
                  onChange={(e) => setAgencyId(e.target.value)}
                  placeholder="agency123"
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="testuser"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nl">Dutch (nl)</SelectItem>
                      <SelectItem value="en">English (en)</SelectItem>
                      <SelectItem value="de">German (de)</SelectItem>
                      <SelectItem value="fr">French (fr)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dataSheetId">DataSheet ID</Label>
                  <Input
                    id="dataSheetId"
                    value={dataSheetId}
                    onChange={(e) => setDataSheetId(e.target.value)}
                    placeholder="datasheet123"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🧪 User Operations</CardTitle>
              <CardDescription>Test different user management endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={testGetUsers} disabled={loading} className="w-full">
                👥 Get All Users
              </Button>

              <Button onClick={testGetAgencyUsers} disabled={loading} className="w-full">
                🏢 Get Agency Users
              </Button>

              <Button onClick={testGetUserDetails} disabled={loading} className="w-full" variant="secondary">
                👤 Get User Details
              </Button>

              <Button onClick={testCreateUser} disabled={loading} className="w-full" variant="outline">
                ➕ Create User
              </Button>

              <Button onClick={testUpdateUser} disabled={loading} className="w-full" variant="outline">
                ✏️ Update User
              </Button>

              <Button onClick={testDeactivateUser} disabled={loading} className="w-full" variant="destructive">
                🚫 Deactivate User
              </Button>

              <Button onClick={testDeleteCustomContent} disabled={loading} className="w-full" variant="destructive">
                🗑️ Delete Content
              </Button>
            </CardContent>
          </Card>
        </div>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Test Results
                <Badge variant={results.data?.success ? "default" : "destructive"}>
                  {results.data?.success ? "Success" : "Error"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📚 API Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="agency">Agency</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="update">Update</TabsTrigger>
                <TabsTrigger value="deactivate">Deactivate</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-2">
                <h3 className="font-semibold">Get All Users</h3>
                <p className="text-sm text-gray-600">Retrieve list of users for a specific microsite with filtering.</p>
                <Badge variant="outline">GET /user/{encodeURIComponent(micrositeId)}</Badge>
              </TabsContent>

              <TabsContent value="agency" className="space-y-2">
                <h3 className="font-semibold">Get Agency Users</h3>
                <p className="text-sm text-gray-600">
                  Retrieve users belonging to a specific agency with date filtering and pagination.
                </p>
                <Badge variant="outline">
                  GET /user/{encodeURIComponent(micrositeId)}/{encodeURIComponent(agencyId)}
                </Badge>
              </TabsContent>

              <TabsContent value="details" className="space-y-2">
                <h3 className="font-semibold">User Details</h3>
                <p className="text-sm text-gray-600">
                  Get detailed information about a specific user including profile and settings.
                </p>
                <Badge variant="outline">
                  GET /user/{encodeURIComponent(micrositeId)}/{encodeURIComponent(agencyId)}/
                  {encodeURIComponent(username)}
                </Badge>
              </TabsContent>

              <TabsContent value="create" className="space-y-2">
                <h3 className="font-semibold">Create User</h3>
                <p className="text-sm text-gray-600">
                  Create a new user with comprehensive profile information and agency association.
                </p>
                <Badge variant="outline">
                  POST /user/{encodeURIComponent(micrositeId)}/{encodeURIComponent(agencyId)}/create
                </Badge>
              </TabsContent>

              <TabsContent value="update" className="space-y-2">
                <h3 className="font-semibold">Update User</h3>
                <p className="text-sm text-gray-600">Update existing user information and profile settings.</p>
                <Badge variant="outline">
                  PUT /user/{encodeURIComponent(micrositeId)}/{encodeURIComponent(agencyId)}/update
                </Badge>
              </TabsContent>

              <TabsContent value="deactivate" className="space-y-2">
                <h3 className="font-semibold">Deactivate User</h3>
                <p className="text-sm text-gray-600">Deactivate a user account while preserving data.</p>
                <Badge variant="outline">
                  PUT /user/{encodeURIComponent(micrositeId)}/{encodeURIComponent(agencyId)}/
                  {encodeURIComponent(username)}/deactivate
                </Badge>
              </TabsContent>

              <TabsContent value="content" className="space-y-2">
                <h3 className="font-semibold">Delete Custom Content</h3>
                <p className="text-sm text-gray-600">Remove custom content datasheets by language and ID.</p>
                <Badge variant="outline">
                  DELETE /user/{encodeURIComponent(micrositeId)}/customercontent/{encodeURIComponent(language)}/
                  {encodeURIComponent(dataSheetId)}
                </Badge>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
