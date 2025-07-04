"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Users,
  Shield,
  Mail,
  Key,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Eye,
  Lock,
  UserCheck,
  Building2,
  Info,
  ExternalLink,
} from "lucide-react"

interface ImportableUser {
  id: string
  email: string
  firstName: string
  lastName: string
  agencyName: string
  agencyId: string
  micrositeId: string
  role: string
  status: string
  bookingsCount: number
  ideasCount: number
  lastLogin: string
  canImport: boolean
  importReason?: string
}

interface ImportResult {
  success: boolean
  user: ImportableUser
  actions: string[]
  error?: string
}

export default function SecureUserImportDashboard() {
  const [availableUsers, setAvailableUsers] = useState<ImportableUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importSettings, setImportSettings] = useState({
    sendWelcomeEmail: true,
    requireEmailVerification: true,
    forcePasswordReset: true,
    preserveRoles: true,
    importBookings: false, // Standaard uit voor privacy
    auditLog: true,
  })

  const scanForUsers = async () => {
    setIsScanning(true)
    setProgress(0)

    try {
      const response = await fetch("/api/scan-tc-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeInactive: false }),
      })

      const result = await response.json()

      if (result.success) {
        setAvailableUsers(result.users)
        console.log(`✅ Found ${result.users.length} importable users`)
      } else {
        console.error("❌ Scan failed:", result.error)
      }
    } catch (error) {
      console.error("❌ Scan error:", error)
    } finally {
      setIsScanning(false)
      setProgress(0)
    }
  }

  const startSecureImport = async () => {
    if (selectedUsers.size === 0) {
      alert("Selecteer eerst gebruikers om te importeren")
      return
    }

    setIsImporting(true)
    setProgress(0)
    setImportResults([])

    const usersToImport = availableUsers.filter((user) => selectedUsers.has(user.id))

    try {
      const response = await fetch("/api/secure-user-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users: usersToImport,
          settings: importSettings,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setImportResults(result.results)
        console.log(`✅ Import completed: ${result.results.length} users processed`)
      } else {
        console.error("❌ Import failed:", result.error)
      }
    } catch (error) {
      console.error("❌ Import error:", error)
    } finally {
      setIsImporting(false)
      setProgress(0)
    }
  }

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  const selectAllUsers = () => {
    const importableUsers = availableUsers.filter((user) => user.canImport)
    setSelectedUsers(new Set(importableUsers.map((user) => user.id)))
  }

  const clearSelection = () => {
    setSelectedUsers(new Set())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Shield className="h-10 w-10 text-blue-600" />
            Veilige Gebruiker Import
          </h1>
          <p className="text-xl text-gray-600">
            Importeer Travel Compositor gebruikers met volledige beveiliging en privacy controles
          </p>
        </div>

        {/* Password Explanation */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>🔐 Belangrijk over Wachtwoorden:</strong>
            <br />• Travel Assistant en Travel Compositor hebben <strong>APARTE wachtwoorden</strong>
            <br />• Je Travel Compositor wachtwoord blijft ongewijzigd en werkt daar nog steeds
            <br />• Voor Travel Assistant stel je een <strong>nieuw wachtwoord</strong> in via de reset link
            <br />• Dit is veiliger: elk systeem heeft zijn eigen beveiliging
            <br />
            <div className="mt-2 flex items-center gap-2 text-sm">
              <ExternalLink className="h-3 w-3" />
              <span>Je kunt beide systemen blijven gebruiken met verschillende wachtwoorden</span>
            </div>
          </AlertDescription>
        </Alert>

        {/* Security Info */}
        <Alert className="bg-green-50 border-green-200">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>🔒 Veiligheidsmaatregelen:</strong> TC Wachtwoorden worden NIET geïmporteerd • Email verificatie
            verplicht • Audit logging actief • Privacy-first approach • Aparte systeem beveiliging
          </AlertDescription>
        </Alert>

        {/* Scan & Import Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Stap 1: Scan Travel Compositor Gebruikers
            </CardTitle>
            <CardDescription>Zoek naar importeerbare gebruikers in alle microsites</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={scanForUsers} disabled={isScanning} size="lg" className="flex items-center gap-2">
                {isScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Scan Voor Gebruikers
                  </>
                )}
              </Button>

              {availableUsers.length > 0 && (
                <div className="text-sm text-gray-600">
                  Gevonden: <strong>{availableUsers.length}</strong> gebruikers (
                  {availableUsers.filter((u) => u.canImport).length} importeerbaar)
                </div>
              )}
            </div>

            {isScanning && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-blue-600">Scanning alle microsites voor gebruikers...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Settings */}
        {availableUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Stap 2: Import Instellingen
              </CardTitle>
              <CardDescription>Configureer hoe gebruikers veilig geïmporteerd worden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="welcomeEmail"
                      checked={importSettings.sendWelcomeEmail}
                      onCheckedChange={(checked) =>
                        setImportSettings({ ...importSettings, sendWelcomeEmail: !!checked })
                      }
                    />
                    <Label htmlFor="welcomeEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Welkom email versturen
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailVerification"
                      checked={importSettings.requireEmailVerification}
                      onCheckedChange={(checked) =>
                        setImportSettings({ ...importSettings, requireEmailVerification: !!checked })
                      }
                    />
                    <Label htmlFor="emailVerification" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Email verificatie verplicht
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="passwordReset"
                      checked={importSettings.forcePasswordReset}
                      onCheckedChange={(checked) =>
                        setImportSettings({ ...importSettings, forcePasswordReset: !!checked })
                      }
                    />
                    <Label htmlFor="passwordReset" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Nieuw wachtwoord instellen (apart van TC)
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="preserveRoles"
                      checked={importSettings.preserveRoles}
                      onCheckedChange={(checked) => setImportSettings({ ...importSettings, preserveRoles: !!checked })}
                    />
                    <Label htmlFor="preserveRoles">Behoud TC rollen</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="importBookings"
                      checked={importSettings.importBookings}
                      onCheckedChange={(checked) => setImportSettings({ ...importSettings, importBookings: !!checked })}
                    />
                    <Label htmlFor="importBookings">
                      Importeer booking geschiedenis <span className="text-orange-600 text-xs">(Privacy gevoelig)</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auditLog"
                      checked={importSettings.auditLog}
                      onCheckedChange={(checked) => setImportSettings({ ...importSettings, auditLog: !!checked })}
                    />
                    <Label htmlFor="auditLog">Audit logging</Label>
                  </div>
                </div>
              </div>

              {/* Password Explanation in Settings */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900">Wachtwoord Beleid</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>
                        • <strong>Travel Assistant:</strong> Nieuw wachtwoord via reset link
                      </p>
                      <p>
                        • <strong>Travel Compositor:</strong> Bestaand wachtwoord blijft werken
                      </p>
                      <p>
                        • <strong>Voordeel:</strong> Dubbele beveiliging, geen single point of failure
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Selection */}
        {availableUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Stap 3: Selecteer Gebruikers ({selectedUsers.size} geselecteerd)
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllUsers}>
                    Alles Selecteren
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Deselecteren
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`border rounded-lg p-4 ${
                        user.canImport ? "hover:bg-gray-50" : "bg-gray-100 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                            disabled={!user.canImport}
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-medium">
                                {user.firstName} {user.lastName}
                              </h4>
                              <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                              <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {user.agencyName}
                              </span>
                              <span>Microsite: {user.micrositeId}</span>
                              <span>{user.bookingsCount} bookings</span>
                              <span>{user.ideasCount} ideas</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {user.canImport ? (
                            <Badge className="bg-green-100 text-green-800">Importeerbaar</Badge>
                          ) : (
                            <div className="space-y-1">
                              <Badge className="bg-red-100 text-red-800">Niet Importeerbaar</Badge>
                              <p className="text-xs text-red-600">{user.importReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Import Button */}
        {selectedUsers.size > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Stap 4: Start Veilige Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={startSecureImport}
                  disabled={isImporting}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Start Veilige Import ({selectedUsers.size} gebruikers)
                    </>
                  )}
                </Button>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-blue-600">
                    Gebruikers worden veilig geïmporteerd met alle beveiligingsmaatregelen...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Import Results */}
        {importResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Import Resultaten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {importResults.map((result, index) => (
                    <div
                      key={index}
                      className={`border rounded p-3 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {result.user.firstName} {result.user.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{result.user.email}</p>
                          {result.success && (
                            <div className="text-sm text-green-700 mt-1">
                              <strong>Acties uitgevoerd:</strong>
                              <ul className="list-disc list-inside ml-2">
                                {result.actions.map((action, i) => (
                                  <li key={i}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result.error && <p className="text-sm text-red-600 mt-1">{result.error}</p>}
                        </div>
                        <div>
                          {result.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Final Security Notice */}
        <Alert className="bg-blue-50 border-blue-200">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>🔐 Wachtwoord Systemen:</strong>
            <br />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <strong>Travel Assistant (dit systeem):</strong>
                <br />• Nieuw wachtwoord via reset link
                <br />• Email verificatie verplicht
                <br />• Onafhankelijke beveiliging
              </div>
              <div>
                <strong>Travel Compositor:</strong>
                <br />• Bestaand wachtwoord blijft werken
                <br />• Geen wijzigingen nodig
                <br />• Blijft volledig functioneel
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded">
              <strong>💡 Tip:</strong> Gebruikers kunnen beide systemen blijven gebruiken. Ze hebben gewoon 2
              verschillende wachtwoorden - dit is veiliger!
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
