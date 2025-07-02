"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Brain,
  Wand2,
  MapPin,
  Route,
  Calendar,
  Hotel,
  ImageIcon,
  Settings,
  Play,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Smile,
  Sparkles,
  FileText,
  Save,
  Cloud,
  CloudIcon as CloudCheck,
} from "lucide-react"
import GPTBackupManager from "./gpt-backup-manager"

interface GPTConfig {
  id: string
  name: string
  contentType: string
  writingStyle: string
  prompt: string
  status: "generated" | "customized" | "active"
  lastModified: string
  usageCount: number
}

interface ContentType {
  id: string
  name: string
  icon: any
  description: string
}

interface WritingStyle {
  id: string
  name: string
  icon: any
  description: string
}

export default function GPTAutoGenerator() {
  const [generatedGPTs, setGeneratedGPTs] = useState<GPTConfig[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedGPT, setSelectedGPT] = useState<GPTConfig | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [editingName, setEditingName] = useState("")
  const [editingPrompt, setEditingPrompt] = useState("")

  const [userId, setUserId] = useState<string>("")
  const [isAutoSyncing, setIsAutoSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string>("Laden...")
  const [isCloudConnected, setIsCloudConnected] = useState(false)

  // Generate unique user ID
  useEffect(() => {
    let storedUserId = localStorage.getItem("gpt-user-id")
    if (!storedUserId) {
      storedUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("gpt-user-id", storedUserId)
    }
    setUserId(storedUserId)
  }, [])

  // Auto-load GPTs when component mounts
  useEffect(() => {
    if (userId) {
      autoLoadGPTs()
    }
  }, [userId])

  // Smart auto-load function
  const autoLoadGPTs = async () => {
    setIsAutoSyncing(true)
    setSyncStatus("Verbinden met cloud...")

    try {
      // Try to load from cloud first
      const cloudResponse = await fetch(`/api/gpt-cloud-storage?userId=${userId}`)
      const cloudResult = await cloudResponse.json()

      // Load local GPTs
      const localGPTs = getLocalGPTs()

      if (cloudResult.success && cloudResult.gpts.length > 0) {
        const cloudGPTs = cloudResult.gpts
        const cloudLastSync = new Date(cloudResult.lastSync || 0)

        if (localGPTs.length === 0) {
          // No local GPTs, use cloud
          setGeneratedGPTs(cloudGPTs)
          setSyncStatus(`✅ ${cloudGPTs.length} GPTs geladen uit cloud`)
          setIsCloudConnected(true)
        } else {
          // Compare timestamps to use most recent
          const localLastModified = Math.max(...localGPTs.map((gpt) => new Date(gpt.lastModified).getTime()))
          const localLastSync = new Date(localLastModified)

          if (cloudLastSync > localLastSync) {
            // Cloud is newer
            setGeneratedGPTs(cloudGPTs)
            setSyncStatus(`✅ Nieuwere versie geladen uit cloud (${cloudGPTs.length} GPTs)`)
          } else {
            // Local is newer or same
            setGeneratedGPTs(localGPTs)
            setSyncStatus(`✅ Lokale GPTs geladen (${localGPTs.length} GPTs)`)
            // Auto-save to cloud to sync
            setTimeout(() => saveToCloud(localGPTs), 1000)
          }
          setIsCloudConnected(true)
        }
      } else {
        // No cloud data, use local
        if (localGPTs.length > 0) {
          setGeneratedGPTs(localGPTs)
          setSyncStatus(`✅ Lokale GPTs geladen (${localGPTs.length} GPTs)`)
          // Auto-save to cloud
          setTimeout(() => saveToCloud(localGPTs), 1000)
        } else {
          setSyncStatus("ℹ️ Geen GPTs gevonden - genereer nieuwe GPTs")
        }
        setIsCloudConnected(false)
      }
    } catch (error) {
      // Fallback to local only
      const localGPTs = getLocalGPTs()
      if (localGPTs.length > 0) {
        setGeneratedGPTs(localGPTs)
        setSyncStatus(`⚠️ Cloud offline - lokale GPTs geladen (${localGPTs.length})`)
      } else {
        setSyncStatus("⚠️ Cloud offline - geen lokale GPTs gevonden")
      }
      setIsCloudConnected(false)
    } finally {
      setIsAutoSyncing(false)
      // Clear status message after 5 seconds
      setTimeout(() => setSyncStatus(""), 5000)
    }
  }

  // Helper function to get local GPTs
  const getLocalGPTs = (): GPTConfig[] => {
    try {
      const savedGPTs = localStorage.getItem("generated-gpts")
      if (savedGPTs) {
        const parsedGPTs = JSON.parse(savedGPTs)
        return migrateOldGPTs(parsedGPTs)
      }
    } catch (error) {
      console.error("Failed to load local GPTs:", error)
    }
    return []
  }

  // Auto-save to cloud (silent)
  const saveToCloud = async (gpts?: GPTConfig[]) => {
    if (!userId) return

    const gptsToSave = gpts || generatedGPTs
    if (gptsToSave.length === 0) return

    try {
      const response = await fetch("/api/gpt-cloud-storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, gpts: gptsToSave }),
      })

      const result = await response.json()
      if (result.success) {
        setIsCloudConnected(true)
      }
    } catch (error) {
      setIsCloudConnected(false)
    }
  }

  // Auto-save to cloud when GPTs change
  useEffect(() => {
    if (generatedGPTs.length > 0 && userId && !isAutoSyncing) {
      const autoSaveTimer = setTimeout(() => {
        saveToCloud()
      }, 2000) // Auto-save 2 seconds after changes

      return () => clearTimeout(autoSaveTimer)
    }
  }, [generatedGPTs, userId, isAutoSyncing])

  const contentTypes: ContentType[] = [
    {
      id: "destination",
      name: "Bestemmings tekst",
      icon: MapPin,
      description: "Uitgebreide informatie over reisbestemmingen",
    },
    {
      id: "route",
      name: "Routebeschrijving",
      icon: Route,
      description: "Gedetailleerde auto-routebeschrijvingen",
    },
    {
      id: "planning",
      name: "Dagplanning",
      icon: Calendar,
      description: "Gepersonaliseerde dagplanningen",
    },
    {
      id: "hotel",
      name: "Hotel zoeker",
      icon: Hotel,
      description: "Gepersonaliseerde hotel aanbevelingen",
    },
    {
      id: "image",
      name: "Afbeelding maker",
      icon: ImageIcon,
      description: "AI-gegenereerde reisafbeeldingen",
    },
  ]

  const writingStyles: WritingStyle[] = [
    {
      id: "speels",
      name: "Speels",
      icon: Smile,
      description: "Vrolijk en enthousiast met veel emoji's! Perfect voor families met kinderen.",
    },
    {
      id: "enthousiast",
      name: "Enthousiast",
      icon: Sparkles,
      description: "Energiek en opgewonden met veel uitroeptekens! Motiverend en inspirerend.",
    },
    {
      id: "zakelijk",
      name: "Zakelijk",
      icon: Briefcase,
      description: "Professioneel, kort en krachtig. Direct to the point zonder overbodige woorden.",
    },
    {
      id: "beleefd",
      name: "Beleefd",
      icon: FileText,
      description: "Hoffelijk en respectvol in de u-vorm. Professioneel maar vriendelijk.",
    },
  ]

  // Generate base prompts for each combination
  const generateBasePrompt = (contentType: ContentType, writingStyle: WritingStyle): string => {
    const styleInstructions = {
      speels:
        "Gebruik een vrolijke, speelse toon met veel emoji's 😊🎉✈️. Schrijf informeel (jij/je) en maak het leuk voor families met kinderen. Gebruik kleurrijke opmaak en enthousiaste taal.",
      enthousiast:
        "Schrijf energiek en motiverend! Gebruik uitroeptekens en woorden zoals 'fantastisch', 'geweldig', 'onvergetelijk'. Voeg oranje accent blokken toe voor tips en groene checkmarks voor voordelen.",
      zakelijk:
        "Houd het professioneel en formeel. Gebruik u/uw vorm, geen emoticons, en focus op feiten en praktische informatie. Kort en krachtig zonder overbodige woorden.",
      beleefd:
        "Houd het hoffelijk en respectvol. Gebruik de u-vorm (u/uw) en spreek de lezer formeel aan. Wees vriendelijk maar professioneel, zonder te informeel te worden. Gebruik geen emoticons maar wel beleefde bewoordingen.",
    }

    const contentInstructions = {
      destination:
        "U bent een expert reisgids die uitgebreide informatie geeft over reisbestemmingen. Beschrijf bezienswaardigheden, cultuur, eten, transport en praktische tips voor uw lezers.",
      route:
        "U bent een routeplanner die gedetailleerde auto-routebeschrijvingen maakt. Geef informatie over afstand, reistijd, tussenstops, tankstations en bezienswaardigheden onderweg voor uw reis.",
      planning:
        "U bent een dagplanning expert die gepersonaliseerde itineraries maakt. Houd rekening met uw interesses, budget, reistijd en logistiek tussen activiteiten.",
      hotel:
        "U bent een hotel specialist die gepersonaliseerde aanbevelingen doet. Filter op uw budget, voorkeuren, locatie en geef eerlijke reviews en praktische informatie.",
      image:
        "U bent een AI image prompt specialist die gedetailleerde beschrijvingen maakt voor DALL-E. Focus op compositie, stijl, belichting en sfeer voor reisafbeeldingen.",
    }

    return `${contentInstructions[contentType.id]}

${styleInstructions[writingStyle.id]}

Belangrijke richtlijnen:
- Geef altijd accurate en nuttige informatie
- Houd rekening met de doelgroep en hun behoeften
- Gebruik de juiste toon en stijl zoals hierboven beschreven
- Bij vragen over specifieke locaties, geef praktische tips en insider informatie`
  }

  // Migration function
  const migrateOldGPTs = (gpts: GPTConfig[]): GPTConfig[] => {
    return gpts.map((gpt) => {
      if (gpt.writingStyle === "beknopt") {
        return {
          ...gpt,
          writingStyle: "beleefd",
          name: gpt.name.replace("Beknopt", "Beleefd"),
          prompt: gpt.prompt
            .replace(/beknopt/gi, "beleefd")
            .replace(
              /Wees to the point\. Korte zinnen, bullet points waar mogelijk, en minimale uitleg\. Focus op de essentiële informatie zonder lange verhalen\./gi,
              "Houd het hoffelijk en respectvol. Gebruik de u-vorm (u/uw) en spreek de lezer formeel aan. Wees vriendelijk maar professioneel, zonder te informeel te worden. Gebruik geen emoticons maar wel beleefde bewoordingen.",
            )
            .replace(/jij\/je/gi, "u/uw")
            .replace(/Je bent/gi, "U bent"),
          lastModified: new Date().toISOString(),
        }
      }
      return gpt
    })
  }

  // Auto-generate all GPT combinations
  const generateAllGPTs = async () => {
    setIsGenerating(true)
    const newGPTs: GPTConfig[] = []

    contentTypes.forEach((contentType) => {
      writingStyles.forEach((writingStyle) => {
        const gpt: GPTConfig = {
          id: `${contentType.id}-${writingStyle.id}`,
          name: `${contentType.name} - ${writingStyle.name}`,
          contentType: contentType.id,
          writingStyle: writingStyle.id,
          prompt: generateBasePrompt(contentType, writingStyle),
          status: "generated",
          lastModified: new Date().toISOString(),
          usageCount: 0,
        }
        newGPTs.push(gpt)
      })
    })

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setGeneratedGPTs(newGPTs)
    setIsGenerating(false)
  }

  // Save GPTs to localStorage (keep as backup)
  useEffect(() => {
    if (generatedGPTs.length > 0) {
      localStorage.setItem("generated-gpts", JSON.stringify(generatedGPTs))
    }
  }, [generatedGPTs])

  // Handle editing a GPT
  const handleEditGPT = (gpt: GPTConfig) => {
    setSelectedGPT(gpt)
    setEditingName(gpt.name)
    setEditingPrompt(gpt.prompt)
    setActiveTab("editor")
  }

  // Save GPT changes
  const handleSaveGPT = () => {
    if (!selectedGPT) return

    setGeneratedGPTs((prev) =>
      prev.map((gpt) =>
        gpt.id === selectedGPT.id
          ? {
              ...gpt,
              name: editingName,
              prompt: editingPrompt,
              status: "customized" as const,
              lastModified: new Date().toISOString(),
            }
          : gpt,
      ),
    )

    alert("GPT succesvol opgeslagen! ✅")
  }

  const deleteGPT = (id: string) => {
    if (confirm("Weet je zeker dat je deze GPT wilt verwijderen?")) {
      setGeneratedGPTs((prev) => prev.filter((gpt) => gpt.id !== id))
      if (selectedGPT?.id === id) {
        setSelectedGPT(null)
        setActiveTab("overview")
      }
    }
  }

  const activateGPT = (id: string) => {
    setGeneratedGPTs((prev) =>
      prev.map((gpt) => ({
        ...gpt,
        status: gpt.id === id ? "active" : gpt.status,
      })),
    )
  }

  const getButtonStyle = (status: string) => {
    return status === "active"
      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "generated":
        return "bg-gray-100 text-gray-700"
      case "customized":
        return "bg-blue-100 text-blue-700"
      case "active":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generated":
        return <AlertCircle className="h-4 w-4" />
      case "customized":
        return <Settings className="h-4 w-4" />
      case "active":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GPT Auto-Generator</h2>
          <p className="text-gray-600">Automatisch GPTs genereren voor alle content types en schrijfstijlen</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={generateAllGPTs}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Genereren...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Genereer Alle GPTs
              </>
            )}
          </Button>
          <Button
            onClick={autoLoadGPTs}
            disabled={isAutoSyncing}
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100"
          >
            {isAutoSyncing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : isCloudConnected ? (
              <CloudCheck className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <Cloud className="h-4 w-4 mr-2" />
            )}
            Sync Nu
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totaal GPTs</p>
                <p className="text-2xl font-bold">{generatedGPTs.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aangepast</p>
                <p className="text-2xl font-bold">{generatedGPTs.filter((g) => g.status === "customized").length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actief</p>
                <p className="text-2xl font-bold">{generatedGPTs.filter((g) => g.status === "active").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cloud Status</p>
                <p className="text-sm font-bold">
                  {isCloudConnected ? (
                    <span className="text-green-600">✅ Verbonden</span>
                  ) : (
                    <span className="text-orange-600">⚠️ Offline</span>
                  )}
                </p>
              </div>
              {isCloudConnected ? (
                <CloudCheck className="h-8 w-8 text-green-600" />
              ) : (
                <Cloud className="h-8 w-8 text-orange-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Sync Status */}
      {(syncStatus || isAutoSyncing) && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {isAutoSyncing ? (
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
              ) : isCloudConnected ? (
                <CloudCheck className="h-5 w-5 text-green-600" />
              ) : (
                <Cloud className="h-5 w-5 text-blue-600" />
              )}
              <div>
                <p className="font-medium text-blue-800">Auto-Sync Status</p>
                <p className="text-sm text-blue-600">{syncStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GPT Overview */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">📋 Overzicht</TabsTrigger>
          <TabsTrigger value="matrix">🔢 Matrix View</TabsTrigger>
          <TabsTrigger value="editor">✏️ GPT Editor</TabsTrigger>
          <TabsTrigger value="backup">💾 Backup Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {generatedGPTs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nog geen GPTs gegenereerd</h3>
                <p className="text-gray-600 mb-4">
                  Klik op "Genereer Alle GPTs" om automatisch {contentTypes.length * writingStyles.length} GPTs te maken
                </p>
                <Button onClick={generateAllGPTs} disabled={isGenerating}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Start Genereren
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {generatedGPTs.map((gpt) => {
                const contentType = contentTypes.find((ct) => ct.id === gpt.contentType)
                const writingStyle = writingStyles.find((ws) => ws.id === gpt.writingStyle)
                const ContentIcon = contentType?.icon || Brain
                const StyleIcon = writingStyle?.icon || Brain

                return (
                  <Card key={gpt.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <ContentIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{gpt.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <StyleIcon className="w-3 h-3 mr-1" />
                                {writingStyle?.name}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(gpt.status)}`}>
                                {getStatusIcon(gpt.status)}
                                <span className="ml-1 capitalize">{gpt.status}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 line-clamp-2">{gpt.prompt.slice(0, 100)}...</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Gebruikt: {gpt.usageCount}x</span>
                          <span>Gewijzigd: {new Date(gpt.lastModified).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGPT(gpt)}
                            className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Bewerken
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => activateGPT(gpt.id)}
                            className={`flex-1 ${getButtonStyle(gpt.status)}`}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {gpt.status === "active" ? "Actief" : "Activeren"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteGPT(gpt.id)}
                            className="hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GPT Matrix - Alle Combinaties</CardTitle>
              <CardDescription>Overzicht van alle content types × schrijfstijlen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Content Type</th>
                      {writingStyles.map((style) => (
                        <th key={style.id} className="border p-2 text-center min-w-[120px]">
                          <div className="flex items-center justify-center gap-1">
                            <style.icon className="w-4 h-4" />
                            {style.name}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contentTypes.map((contentType) => (
                      <tr key={contentType.id}>
                        <td className="border p-2 font-medium">
                          <div className="flex items-center gap-2">
                            <contentType.icon className="w-4 h-4" />
                            {contentType.name}
                          </div>
                        </td>
                        {writingStyles.map((style) => {
                          const gpt = generatedGPTs.find(
                            (g) => g.contentType === contentType.id && g.writingStyle === style.id,
                          )
                          return (
                            <td key={`${contentType.id}-${style.id}`} className="border p-2 text-center">
                              {gpt ? (
                                <Badge className={`text-xs ${getStatusColor(gpt.status)}`}>
                                  {getStatusIcon(gpt.status)}
                                  <span className="ml-1 capitalize">{gpt.status}</span>
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-xs">Niet gegenereerd</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          {selectedGPT ? (
            <Card>
              <CardHeader>
                <CardTitle>GPT Editor - {selectedGPT.name}</CardTitle>
                <CardDescription>Pas de prompt en instellingen aan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">GPT Naam</label>
                  <Input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full"
                    placeholder="GPT naam..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">System Prompt</label>
                  <Textarea
                    value={editingPrompt}
                    onChange={(e) => setEditingPrompt(e.target.value)}
                    rows={15}
                    className="w-full font-mono text-sm resize-vertical"
                    placeholder="Voer hier je GPT prompt in..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveGPT}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Save className="w-4 w-4 mr-2" />
                    Opslaan
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("overview")}>
                    Terug naar Overzicht
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Edit className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Selecteer een GPT om te bewerken</h3>
                <p className="text-gray-600 mb-4">Klik op "Bewerken" bij een GPT in het overzicht</p>
                <Button onClick={() => setActiveTab("overview")} variant="outline">
                  Ga naar Overzicht
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="backup" className="space-y-4">
          <GPTBackupManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
