"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Download,
  Eye,
  MapPin,
  Calendar,
  Euro,
  Loader2,
  CheckCircle,
  Shield,
  User,
  AlertTriangle,
} from "lucide-react"

interface RemoteTravelIdea {
  id: string
  title: string
  shortDescription: string
  destination: string
  priceFrom: number
  currency: string
  departureDate: string
  themes: string[]
  imageUrl?: string
  isImported?: boolean
  ownerEmail?: string
  agencyName?: string
  canImport?: boolean
}

interface ImportedIdea extends RemoteTravelIdea {
  fullDescription: string
  itinerary: any[]
  accommodations: any[]
  activities: any[]
  images: string[]
  importedAt: string
}

interface UserSession {
  email: string
  role: "agent" | "admin" | "super_admin"
  agencyId?: string
  agencyName?: string
  micrositeAccess: string[]
}

export function RemoteTravelIdeaBrowser() {
  const [searchTerm, setSearchTerm] = useState("")
  const [remoteIdeas, setRemoteIdeas] = useState<RemoteTravelIdea[]>([])
  const [importedIdeas, setImportedIdeas] = useState<ImportedIdea[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [selectedMicrosite, setSelectedMicrosite] = useState("1")
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  // Check user session and permissions
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const session = await response.json()
          setUserSession(session)
        }
      } catch (error) {
        console.error("Failed to check session:", error)
      } finally {
        setIsLoadingSession(false)
      }
    }

    checkSession()
  }, [])

  // Haal remote ideas op met role-based filtering
  const fetchRemoteIdeas = async () => {
    if (!userSession) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        limit: "20",
        userRole: userSession.role,
        userEmail: userSession.email,
      })

      if (userSession.agencyId) {
        params.append("agencyId", userSession.agencyId)
      }

      const response = await fetch(`/api/travel-compositor/ideas/${selectedMicrosite}?${params}`)
      const data = await response.json()

      if (data.success) {
        // Filter ideas based on user permissions
        const filteredIdeas = data.ideas.map((idea: any) => ({
          id: idea.id,
          title: idea.title || idea.largeTitle,
          shortDescription: idea.shortDescription || idea.description?.substring(0, 150) + "...",
          destination: idea.destinations?.[0]?.name || "Onbekend",
          priceFrom: idea.pricePerPerson?.amount || 0,
          currency: idea.pricePerPerson?.currency || "EUR",
          departureDate: idea.departureDate,
          themes: idea.themes || [],
          imageUrl: idea.imageUrl,
          isImported: false,
          ownerEmail: idea.customer?.email || idea.clientEmail,
          agencyName: idea.agencyName,
          canImport: canUserImportIdea(idea, userSession),
        }))

        setRemoteIdeas(filteredIdeas)
      }
    } catch (error) {
      console.error("Failed to fetch remote ideas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user can import this specific idea
  const canUserImportIdea = (idea: any, session: UserSession): boolean => {
    // Super admins can import everything
    if (session.role === "super_admin") return true

    // Admins can import everything from their microsites
    if (session.role === "admin") return true

    // Agents can only import their own ideas
    if (session.role === "agent") {
      const ideaOwnerEmail = idea.customer?.email || idea.clientEmail
      return ideaOwnerEmail === session.email
    }

    return false
  }

  // Import specifieke idea met permission check
  const importIdea = async (ideaId: string) => {
    if (!userSession) return

    const idea = remoteIdeas.find((i) => i.id === ideaId)
    if (!idea?.canImport) {
      alert("❌ Je hebt geen toestemming om deze travel idea te importeren")
      return
    }

    setImportingId(ideaId)
    try {
      const response = await fetch("/api/universal-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "idea",
          id: ideaId,
          micrositeId: selectedMicrosite,
          userEmail: userSession.email,
          userRole: userSession.role,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const importedIdea: ImportedIdea = {
          ...result.data,
          isImported: true,
          importedAt: new Date().toISOString(),
        }

        setImportedIdeas((prev) => [...prev, importedIdea])
        setRemoteIdeas((prev) => prev.map((idea) => (idea.id === ideaId ? { ...idea, isImported: true } : idea)))

        alert(`✅ Travel Idea "${result.data.title}" succesvol geïmporteerd!`)
      } else {
        alert(`❌ Import mislukt: ${result.error}`)
      }
    } catch (error) {
      alert("❌ Import mislukt")
    } finally {
      setImportingId(null)
    }
  }

  useEffect(() => {
    if (userSession) {
      fetchRemoteIdeas()
    }
  }, [selectedMicrosite, userSession])

  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Laden...</span>
      </div>
    )
  }

  if (!userSession) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Je moet ingelogd zijn om travel ideas te kunnen browsen en importeren.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Info & Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {userSession.role === "super_admin" ? (
              <Shield className="h-5 w-5 text-red-500" />
            ) : userSession.role === "admin" ? (
              <Shield className="h-5 w-5 text-blue-500" />
            ) : (
              <User className="h-5 w-5 text-green-500" />
            )}
            Ingelogd als: {userSession.email}
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  userSession.role === "super_admin"
                    ? "destructive"
                    : userSession.role === "admin"
                      ? "default"
                      : "secondary"
                }
              >
                {userSession.role === "super_admin"
                  ? "Super Admin"
                  : userSession.role === "admin"
                    ? "Admin"
                    : "Reisagent"}
              </Badge>
              {userSession.agencyName && <span className="text-sm">Agency: {userSession.agencyName}</span>}
            </div>
            <div className="mt-2 text-sm">
              {userSession.role === "super_admin" && "Je kunt alle travel ideas van alle agents importeren"}
              {userSession.role === "admin" && "Je kunt alle travel ideas van je microsite importeren"}
              {userSession.role === "agent" && "Je kunt alleen je eigen travel ideas importeren"}
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Remote Travel Ideas Browser
          </CardTitle>
          <CardDescription>
            {userSession.role === "agent"
              ? "Blader door je eigen travel ideas en importeer wat je nodig hebt"
              : "Blader door travel ideas en importeer wat je nodig hebt"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={userSession.role === "agent" ? "Zoek je eigen travel ideas..." : "Zoek travel ideas..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchRemoteIdeas()}
              />
            </div>
            {(userSession.role === "admin" || userSession.role === "super_admin") && (
              <select
                value={selectedMicrosite}
                onChange={(e) => setSelectedMicrosite(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="1">Rondreis Planner</option>
                <option value="2">Microsite 2</option>
                <option value="3">Microsite 3</option>
                <option value="4">Microsite 4</option>
              </select>
            )}
            <Button onClick={fetchRemoteIdeas} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Zoeken
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Remote Ideas */}
      <Card>
        <CardHeader>
          <CardTitle>
            {userSession.role === "agent" ? "Je Travel Ideas" : "Beschikbare Travel Ideas"} ({remoteIdeas.length})
          </CardTitle>
          <CardDescription>
            {userSession.role === "agent"
              ? "Je eigen travel ideas uit Travel Compositor"
              : 'Klik op "Import" om een idea volledig te importeren'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="grid gap-4">
              {remoteIdeas.map((idea) => (
                <div key={idea.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{idea.title}</h3>
                        {!idea.canImport && (
                          <Badge variant="outline" className="text-xs">
                            Niet toegankelijk
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mt-1">{idea.shortDescription}</p>

                      {/* Owner info for admins */}
                      {(userSession.role === "admin" || userSession.role === "super_admin") && idea.ownerEmail && (
                        <div className="text-xs text-gray-500 mt-1">
                          Eigenaar: {idea.ownerEmail} {idea.agencyName && `(${idea.agencyName})`}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {idea.destination}
                        </div>
                        {idea.departureDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(idea.departureDate).toLocaleDateString("nl-NL")}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />€{idea.priceFrom} p.p.
                        </div>
                      </div>

                      {idea.themes.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {idea.themes.slice(0, 3).map((theme, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {idea.isImported ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Geïmporteerd
                        </Badge>
                      ) : idea.canImport ? (
                        <Button size="sm" onClick={() => importIdea(idea.id)} disabled={importingId === idea.id}>
                          {importingId === idea.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              Importeren...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-1" />
                              Import
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button size="sm" disabled variant="outline">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Geen toegang
                        </Button>
                      )}

                      <Button size="sm" variant="outline" disabled={!idea.canImport}>
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {remoteIdeas.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  {userSession.role === "agent" ? "Geen eigen travel ideas gevonden" : "Geen travel ideas gevonden"}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Imported Ideas */}
      {importedIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Geïmporteerde Ideas ({importedIdeas.length})
            </CardTitle>
            <CardDescription>Volledig geïmporteerde travel ideas met alle details</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {importedIdeas.map((idea) => (
                  <div key={idea.id} className="border rounded-lg p-3 bg-green-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{idea.title}</h4>
                        <p className="text-sm text-gray-600">
                          Geïmporteerd: {new Date(idea.importedAt).toLocaleString("nl-NL")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Bewerken
                        </Button>
                        <Button size="sm">Gebruiken</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
