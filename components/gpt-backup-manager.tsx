"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Download,
  Upload,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Database,
  Cloud,
  Shield,
} from "lucide-react"

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

interface GPTBackup {
  version: string
  timestamp: string
  gpts: GPTConfig[]
  metadata: {
    totalGPTs: number
    activeGPTs: number
    customizedGPTs: number
  }
}

export default function GPTBackupManager() {
  const [gpts, setGpts] = useState<GPTConfig[]>([])
  const [backupData, setBackupData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Load GPTs from localStorage
  useEffect(() => {
    const loadGPTs = () => {
      try {
        const savedGPTs = localStorage.getItem("generated-gpts")
        if (savedGPTs) {
          const parsed = JSON.parse(savedGPTs)
          setGpts(parsed)
        }
      } catch (error) {
        console.error("❌ Failed to load GPTs from localStorage:", error)
        console.error("❌ localStorage content:", localStorage.getItem("generated-gpts"))
        console.error("❌ localStorage keys:", Object.keys(localStorage))
        console.error("❌ window.location.href:", window.location.href)
      }
    }
    loadGPTs()
  }, [])

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        setBackupData(content)
        setMessage({ type: "success", text: "Backup bestand geladen!" })
      } catch (error) {
        setMessage({ type: "error", text: "Fout bij lezen bestand" })
      }
    }
    reader.readAsText(file)
  }

  // Create backup
  const createBackup = () => {
    try {
      const backup: GPTBackup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        gpts: gpts,
        metadata: {
          totalGPTs: gpts.length,
          activeGPTs: gpts.filter((g) => g.status === "active").length,
          customizedGPTs: gpts.filter((g) => g.status === "customized").length,
        },
      }

      const backupJson = JSON.stringify(backup, null, 2)
      setBackupData(backupJson)
      setMessage({ type: "success", text: "Backup succesvol aangemaakt!" })
    } catch (error) {
      setMessage({ type: "error", text: "Fout bij het maken van backup" })
      console.error("❌ Error creating backup:", error)
    }
  }

  // Download backup as file
  const downloadBackup = () => {
    if (!backupData) {
      createBackup()
      return
    }

    try {
      const blob = new Blob([backupData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `gpt-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setMessage({ type: "success", text: "Backup gedownload!" })
    } catch (error) {
      console.error("❌ Error downloading backup:", error)
      setMessage({ type: "error", text: "Fout bij downloaden" })
    }
  }

  // Restore from backup - FIXED VERSION
  const restoreBackup = async () => {
    if (!backupData.trim()) {
      setMessage({ type: "error", text: "Geen backup data ingevoerd" })
      return
    }

    setIsLoading(true)
    try {
      const backup: GPTBackup = JSON.parse(backupData)
      console.log("🔍 Parsed backup data:", backup)

      if (!backup.gpts || !Array.isArray(backup.gpts)) {
        throw new Error("Ongeldige backup format - geen gpts array gevonden")
      }

      // Validate and fix GPT structure
      const validGPTs = backup.gpts.map((gpt, index) => ({
        id: gpt.id || `restored-${index}`,
        name: gpt.name || `Restored GPT ${index + 1}`,
        contentType: gpt.contentType || "destination",
        writingStyle: gpt.writingStyle || "beleefd",
        prompt: gpt.prompt || "Default prompt",
        status: (gpt.status as "generated" | "customized" | "active") || "generated",
        lastModified: gpt.lastModified || new Date().toISOString(),
        usageCount: gpt.usageCount || 0,
      }))

      if (validGPTs.length === 0) {
        throw new Error("Geen geldige GPTs gevonden in backup")
      }

      // Save to localStorage and update state
      localStorage.setItem("generated-gpts", JSON.stringify(validGPTs))
      setGpts(validGPTs)

      // Clear backup data after successful restore
      setBackupData("")

      setMessage({
        type: "success",
        text: `✅ ${validGPTs.length} GPTs succesvol hersteld! Ga naar het Overzicht tab om ze te zien.`,
      })
    } catch (error: any) {
      setMessage({
        type: "error",
        text: `❌ Fout bij herstellen: ${error.message}`,
      })
    } finally {
      console.log("✅ Restore process completed")
      setIsLoading(false)
    }
  }

  // Auto-save to browser storage
  const autoSave = () => {
    try {
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        gpts: gpts,
      }
      localStorage.setItem("gpt-auto-backup", JSON.stringify(backup))
      setMessage({ type: "success", text: "Auto-backup opgeslagen!" })
    } catch (error) {
      setMessage({ type: "error", text: "Auto-backup mislukt" })
    }
  }

  // Load auto-backup
  const loadAutoBackup = () => {
    try {
      const autoBackup = localStorage.getItem("gpt-auto-backup")
      if (autoBackup) {
        const backup = JSON.parse(autoBackup)
        setBackupData(JSON.stringify(backup, null, 2))
        setMessage({ type: "success", text: "Auto-backup geladen!" })
      } else {
        setMessage({ type: "error", text: "Geen auto-backup gevonden" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Fout bij laden auto-backup" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">GPT Backup Manager</h2>
        <p className="text-gray-600">Backup en herstel je GPT configuraties om ze niet te verliezen bij updates</p>
      </div>

      {/* Message */}
      {message && (
        <Card className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={message.type === "success" ? "text-green-800" : "text-red-800"}>{message.text}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totaal GPTs</p>
                <p className="text-2xl font-bold">{gpts.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actief</p>
                <p className="text-2xl font-bold">{gpts.filter((g) => g.status === "active").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aangepast</p>
                <p className="text-2xl font-bold">{gpts.filter((g) => g.status === "customized").length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Backup Size</p>
                <p className="text-2xl font-bold">{Math.round(JSON.stringify(gpts).length / 1024)}KB</p>
              </div>
              <Cloud className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create & Download Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Backup Maken
            </CardTitle>
            <CardDescription>Maak een backup van al je GPT configuraties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={createBackup} className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Maak Backup
              </Button>
              <Button onClick={downloadBackup} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            <Button onClick={autoSave} variant="outline" className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Auto-Save (Browser)
            </Button>
          </CardContent>
        </Card>

        {/* Restore Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Backup Herstellen
            </CardTitle>
            <CardDescription>Herstel GPTs vanuit een backup bestand of JSON data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Upload Backup Bestand</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={loadAutoBackup} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Laad Auto-Backup
              </Button>
              <Button onClick={restoreBackup} disabled={isLoading || !backupData.trim()} className="flex-1">
                {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Herstel Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Data */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Data</CardTitle>
          <CardDescription>
            Kopieer deze data om je GPTs te bewaren, of plak backup data hier om te herstellen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={backupData}
            onChange={(e) => setBackupData(e.target.value)}
            rows={12}
            className="font-mono text-sm"
            placeholder="Backup JSON data verschijnt hier, of plak hier om te herstellen..."
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Instructies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ Backup maken:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>1. Klik "Maak Backup" om JSON te genereren</li>
                <li>2. Klik "Download" om bestand op te slaan</li>
                <li>3. Of kopieer de JSON tekst handmatig</li>
                <li>4. Bewaar dit veilig voor updates!</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">🔄 Backup herstellen:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>1. Plak backup JSON in het tekstveld</li>
                <li>2. Of gebruik "Laad Auto-Backup"</li>
                <li>3. Klik "Herstel" om GPTs te laden</li>
                <li>4. Je GPTs zijn weer beschikbaar!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
