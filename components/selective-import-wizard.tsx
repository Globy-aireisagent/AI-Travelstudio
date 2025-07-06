"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Building2,
  Plane,
  Lightbulb,
  Filter,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Settings,
} from "lucide-react"

interface ImportFilter {
  agencies?: {
    includeInactive?: boolean
    minCreditBalance?: number
    specificAgencyIds?: string[]
    excludeAgencyIds?: string[]
  }
  users?: {
    includeInactive?: boolean
    roles?: ("agent" | "admin" | "client")[]
    lastLoginAfter?: Date
    hasBookings?: boolean
    hasIdeas?: boolean
    specificEmails?: string[]
  }
  bookings?: {
    dateFrom?: Date
    dateTo?: Date
    minValue?: number
    status?: string[]
    includeCompleted?: boolean
    includeCancelled?: boolean
  }
  ideas?: {
    dateFrom?: Date
    dateTo?: Date
    hasImages?: boolean
    isPublished?: boolean
  }
  microsites?: string[]
  maxRecords?: number
  includeTestData?: boolean
}

interface ImportPreview {
  agencies: { total: number; active: number; withCredit: number; selected: number }
  users: { total: number; active: number; agents: number; admins: number; clients: number; selected: number }
  bookings: { total: number; recent: number; completed: number; selected: number; totalValue: number }
  ideas: { total: number; published: number; withImages: number; selected: number }
}

export default function SelectiveImportWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [filter, setFilter] = useState<ImportFilter>({
    microsites: ["1"],
    agencies: { includeInactive: false, minCreditBalance: 0 },
    users: { includeInactive: false, roles: ["agent", "admin"] },
    bookings: { includeCompleted: true, includeCancelled: false },
    ideas: { isPublished: true },
  })
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  const generatePreview = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/selective-travel-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", filter }),
      })

      if (response.ok) {
        const result = await response.json()
        setPreview(result.preview)
        setCurrentStep(3)
      }
    } catch (error) {
      console.error("Preview failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const executeImport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/selective-travel-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", filter }),
      })

      if (response.ok) {
        const result = await response.json()
        setImportResult(result.result)
        setCurrentStep(4)
      }
    } catch (error) {
      console.error("Import failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFilter = (section: keyof ImportFilter, updates: any) => {
    setFilter((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Selectieve Travel Compositor Import</h1>
          <p className="text-xl text-gray-600">Kies precies wat je wilt importeren</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[
            { step: 1, title: "Microsites", icon: Settings },
            { step: 2, title: "Filters", icon: Filter },
            { step: 3, title: "Preview", icon: Eye },
            { step: 4, title: "Import", icon: Download },
          ].map(({ step, title, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > step ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`ml-2 ${currentStep >= step ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                {title}
              </span>
              {step < 4 && <div className="w-8 h-px bg-gray-300 ml-4" />}
            </div>
          ))}
        </div>

        {/* Step 1: Microsite Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Selecteer Microsites
              </CardTitle>
              <CardDescription>Kies welke Travel Compositor microsites je wilt importeren</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["1", "2", "3", "4"].map((micrositeId) => (
                  <div key={micrositeId} className="flex items-center space-x-2">
                    <Checkbox
                      id={`microsite-${micrositeId}`}
                      checked={filter.microsites?.includes(micrositeId)}
                      onCheckedChange={(checked) => {
                        const current = filter.microsites || []
                        if (checked) {
                          updateFilter("microsites", [...current, micrositeId])
                        } else {
                          updateFilter(
                            "microsites",
                            current.filter((id) => id !== micrositeId),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={`microsite-${micrositeId}`}>Microsite {micrositeId}</Label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)} disabled={!filter.microsites?.length}>
                  Volgende: Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Filters */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Import Filters
              </CardTitle>
              <CardDescription>Stel filters in om alleen relevante data te importeren</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="agencies" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="agencies">Agencies</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="ideas">Ideas</TabsTrigger>
                </TabsList>

                <TabsContent value="agencies" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-inactive-agencies"
                          checked={filter.agencies?.includeInactive}
                          onCheckedChange={(checked) => updateFilter("agencies", { includeInactive: checked })}
                        />
                        <Label htmlFor="include-inactive-agencies">Inclusief inactieve agencies</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min-credit">Minimum credit balance (€)</Label>
                      <Input
                        id="min-credit"
                        type="number"
                        value={filter.agencies?.minCreditBalance || 0}
                        onChange={(e) => updateFilter("agencies", { minCreditBalance: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-inactive-users"
                          checked={filter.users?.includeInactive}
                          onCheckedChange={(checked) => updateFilter("users", { includeInactive: checked })}
                        />
                        <Label htmlFor="include-inactive-users">Inclusief inactieve users</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>User rollen</Label>
                      <div className="flex gap-4">
                        {["agent", "admin", "client"].map((role) => (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              id={`role-${role}`}
                              checked={filter.users?.roles?.includes(role as any)}
                              onCheckedChange={(checked) => {
                                const current = filter.users?.roles || []
                                if (checked) {
                                  updateFilter("users", { roles: [...current, role] })
                                } else {
                                  updateFilter("users", { roles: current.filter((r) => r !== role) })
                                }
                              }}
                            />
                            <Label htmlFor={`role-${role}`} className="capitalize">
                              {role}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bookings" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-completed"
                          checked={filter.bookings?.includeCompleted}
                          onCheckedChange={(checked) => updateFilter("bookings", { includeCompleted: checked })}
                        />
                        <Label htmlFor="include-completed">Inclusief afgeronde bookings</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-cancelled"
                          checked={filter.bookings?.includeCancelled}
                          onCheckedChange={(checked) => updateFilter("bookings", { includeCancelled: checked })}
                        />
                        <Label htmlFor="include-cancelled">Inclusief geannuleerde bookings</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min-booking-value">Minimum booking waarde (€)</Label>
                      <Input
                        id="min-booking-value"
                        type="number"
                        value={filter.bookings?.minValue || 0}
                        onChange={(e) => updateFilter("bookings", { minValue: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ideas" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="published-ideas"
                          checked={filter.ideas?.isPublished}
                          onCheckedChange={(checked) => updateFilter("ideas", { isPublished: checked })}
                        />
                        <Label htmlFor="published-ideas">Alleen gepubliceerde ideas</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ideas-with-images"
                          checked={filter.ideas?.hasImages}
                          onCheckedChange={(checked) => updateFilter("ideas", { hasImages: checked })}
                        />
                        <Label htmlFor="ideas-with-images">Alleen ideas met afbeeldingen</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Vorige
                </Button>
                <Button onClick={generatePreview} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Genereren...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Genereren
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Preview */}
        {currentStep === 3 && preview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Import Preview
              </CardTitle>
              <CardDescription>Controleer wat er geïmporteerd gaat worden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Agencies</p>
                        <p className="text-2xl font-bold text-blue-900">{preview.agencies.selected}</p>
                        <p className="text-xs text-blue-600">van {preview.agencies.total} totaal</p>
                      </div>
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Users</p>
                        <p className="text-2xl font-bold text-green-900">{preview.users.selected}</p>
                        <p className="text-xs text-green-600">van {preview.users.total} totaal</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Bookings</p>
                        <p className="text-2xl font-bold text-purple-900">{preview.bookings.selected}</p>
                        <p className="text-xs text-purple-600">€{preview.bookings.totalValue.toLocaleString()}</p>
                      </div>
                      <Plane className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600">Ideas</p>
                        <p className="text-2xl font-bold text-yellow-900">{preview.ideas.selected}</p>
                        <p className="text-xs text-yellow-600">van {preview.ideas.total} totaal</p>
                      </div>
                      <Lightbulb className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Agency Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Actieve agencies:</span>
                      <Badge variant="secondary">{preview.agencies.active}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Met credit balance:</span>
                      <Badge variant="secondary">{preview.agencies.withCredit}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Agents:</span>
                      <Badge variant="secondary">{preview.users.agents}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Admins:</span>
                      <Badge variant="secondary">{preview.users.admins}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Clients:</span>
                      <Badge variant="secondary">{preview.users.clients}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Let op</h4>
                    <p className="text-sm text-yellow-700">
                      Deze import zal {preview.users.selected} users, {preview.bookings.selected} bookings en{" "}
                      {preview.ideas.selected} ideas importeren. Wachtwoorden worden niet geïmporteerd - users moeten
                      nieuwe wachtwoorden instellen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Filters Aanpassen
                </Button>
                <Button onClick={executeImport} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importeren...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Start Import
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Import Results */}
        {currentStep === 4 && importResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Import Voltooid
              </CardTitle>
              <CardDescription>Je selectieve import is succesvol uitgevoerd</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{importResult.imported.agencies}</p>
                  <p className="text-sm text-blue-600">Agencies</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">{importResult.imported.users}</p>
                  <p className="text-sm text-green-600">Users</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Plane className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">{importResult.imported.bookings}</p>
                  <p className="text-sm text-purple-600">Bookings</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Lightbulb className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-900">{importResult.imported.ideas}</p>
                  <p className="text-sm text-yellow-600">Ideas</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Import Succesvol</h4>
                    <p className="text-sm text-green-700">
                      Alle geselecteerde data is succesvol geïmporteerd. Users kunnen nu accounts aanmaken met hun
                      bestaande email adressen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setCurrentStep(1)
                    setPreview(null)
                    setImportResult(null)
                  }}
                >
                  Nieuwe Import Starten
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
