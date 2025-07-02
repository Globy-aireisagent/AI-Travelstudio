"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, AlertTriangle, Globe, Key, User, Lock } from "lucide-react"

interface MicrositeConfig {
  id: number
  username?: string
  password?: string
  micrositeId?: string
  status?: "testing" | "success" | "error" | "missing"
  error?: string
  lastTested?: string
}

export default function MicrositeCredentialsTester() {
  const [microsites, setMicrosites] = useState<MicrositeConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newMicrosite, setNewMicrosite] = useState({
    username: "",
    password: "",
    micrositeId: "",
  })

  // Check current environment variables
  const checkCurrentMicrosites = () => {
    const configs: MicrositeConfig[] = []

    for (let i = 1; i <= 10; i++) {
      const username = process.env[`NEXT_PUBLIC_TRAVEL_COMPOSITOR_USERNAME_${i === 1 ? "" : i}`]
      const password = process.env[`NEXT_PUBLIC_TRAVEL_COMPOSITOR_PASSWORD_${i === 1 ? "" : i}`]
      const micrositeId = process.env[`NEXT_PUBLIC_TRAVEL_COMPOSITOR_MICROSITE_ID_${i === 1 ? "" : i}`]

      if (username || password || micrositeId) {
        configs.push({
          id: i,
          username: username ? "✓ Set" : undefined,
          password: password ? "✓ Set" : undefined,
          micrositeId: micrositeId || undefined,
          status: username && password && micrositeId ? "success" : "missing",
        })
      }
    }

    setMicrosites(configs)
  }

  const testMicrosite = async (config: MicrositeConfig) => {
    setMicrosites((prev) => prev.map((m) => (m.id === config.id ? { ...m, status: "testing" } : m)))

    try {
      const response = await fetch("/api/test-microsite-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ micrositeId: config.id }),
      })

      const result = await response.json()

      setMicrosites((prev) =>
        prev.map((m) =>
          m.id === config.id
            ? {
                ...m,
                status: result.success ? "success" : "error",
                error: result.error,
                lastTested: new Date().toLocaleTimeString(),
              }
            : m,
        ),
      )
    } catch (error) {
      setMicrosites((prev) =>
        prev.map((m) =>
          m.id === config.id
            ? {
                ...m,
                status: "error",
                error: "Network error",
                lastTested: new Date().toLocaleTimeString(),
              }
            : m,
        ),
      )
    }
  }

  const testAllMicrosites = async () => {
    setIsLoading(true)
    for (const config of microsites) {
      if (config.status !== "missing") {
        await testMicrosite(config)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Rate limiting
      }
    }
    setIsLoading(false)
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "testing":
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      case "missing":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Globe className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "testing":
        return "bg-blue-100 text-blue-800"
      case "missing":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-600" />
            Microsite Credentials Setup
          </CardTitle>
          <CardDescription>Voor elke nieuwe microsite heb je deze 3 environment variables nodig:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
              <User className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Username</p>
                <code className="text-xs text-gray-600">TRAVEL_COMPOSITOR_USERNAME_X</code>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
              <Lock className="w-4 h-4 text-green-600" />
              <div>
                <p className="font-medium text-sm">Password</p>
                <code className="text-xs text-gray-600">TRAVEL_COMPOSITOR_PASSWORD_X</code>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border">
              <Key className="w-4 h-4 text-purple-600" />
              <div>
                <p className="font-medium text-sm">Microsite ID</p>
                <code className="text-xs text-gray-600">TRAVEL_COMPOSITOR_MICROSITE_ID_X</code>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            <strong>Waar X = 1, 2, 3, 4, 5, etc.</strong> Voor de eerste microsite laat je X weg.
          </p>
        </CardContent>
      </Card>

      {/* Current Microsites */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Configured Microsites</CardTitle>
              <CardDescription>Overzicht van alle geconfigureerde microsites</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={checkCurrentMicrosites} variant="outline" size="sm">
                🔄 Refresh
              </Button>
              <Button onClick={testAllMicrosites} disabled={isLoading || microsites.length === 0} size="sm">
                🧪 Test All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {microsites.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Geen microsites gevonden</p>
              <Button onClick={checkCurrentMicrosites} className="mt-2">
                Check Environment Variables
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {microsites.map((config) => (
                <div key={config.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(config.status)}
                    <div>
                      <p className="font-medium">Microsite {config.id}</p>
                      <div className="flex gap-2 text-xs text-gray-600">
                        <span>Username: {config.username || "❌ Missing"}</span>
                        <span>Password: {config.password || "❌ Missing"}</span>
                        <span>ID: {config.micrositeId || "❌ Missing"}</span>
                      </div>
                      {config.error && <p className="text-xs text-red-600 mt-1">{config.error}</p>}
                      {config.lastTested && <p className="text-xs text-gray-500">Last tested: {config.lastTested}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(config.status)}>{config.status || "unknown"}</Badge>
                    <Button
                      onClick={() => testMicrosite(config)}
                      disabled={config.status === "testing" || config.status === "missing"}
                      size="sm"
                      variant="outline"
                    >
                      Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Microsite Helper */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Microsite</CardTitle>
          <CardDescription>Helper voor het toevoegen van een nieuwe microsite</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newMicrosite.username}
                onChange={(e) => setNewMicrosite((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="agent@company.nl"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newMicrosite.password}
                onChange={(e) => setNewMicrosite((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label htmlFor="micrositeId">Microsite ID</Label>
              <Input
                id="micrositeId"
                value={newMicrosite.micrositeId}
                onChange={(e) => setNewMicrosite((prev) => ({ ...prev, micrositeId: e.target.value }))}
                placeholder="12345"
              />
            </div>
          </div>

          {(newMicrosite.username || newMicrosite.password || newMicrosite.micrositeId) && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="font-medium text-blue-800 mb-2">Environment Variables to Add:</p>
              <div className="space-y-1 font-mono text-sm">
                <p>
                  TRAVEL_COMPOSITOR_USERNAME_{microsites.length + 1}={newMicrosite.username}
                </p>
                <p>
                  TRAVEL_COMPOSITOR_PASSWORD_{microsites.length + 1}={newMicrosite.password}
                </p>
                <p>
                  TRAVEL_COMPOSITOR_MICROSITE_ID_{microsites.length + 1}={newMicrosite.micrositeId}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
