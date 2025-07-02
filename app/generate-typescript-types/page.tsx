"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Code, Loader2, Copy, Check } from "lucide-react"

export default function GenerateTypescriptTypesPage() {
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateTypes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/travel-compositor/generate-typescript-types?config=1`)

      if (response.ok) {
        // Download the file
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "travel-compositor-types.ts"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setGenerated(true)
        console.log("✅ TypeScript types downloaded!")
      } else {
        console.error("❌ Failed to generate types")
      }
    } catch (error) {
      console.error("❌ Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      const response = await fetch(`/api/travel-compositor/generate-typescript-types?config=1`)
      const content = await response.text()
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("❌ Copy failed:", error)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code className="w-8 h-8 text-blue-600" />
            Generate TypeScript Types
          </h1>
          <p className="text-gray-600 mt-2">Automatisch alle 473 schemas omzetten naar TypeScript interfaces</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Automatische Type Generatie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">473</div>
              <div className="text-sm text-gray-600">Schemas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Auto</div>
              <div className="text-sm text-gray-600">Conversie</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1 Click</div>
              <div className="text-sm text-gray-600">Download</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Wat wordt gegenereerd:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline" className="justify-start">
                ✅ Alle 473 interfaces
              </Badge>
              <Badge variant="outline" className="justify-start">
                ✅ Enum definities
              </Badge>
              <Badge variant="outline" className="justify-start">
                ✅ Type references
              </Badge>
              <Badge variant="outline" className="justify-start">
                ✅ Optional properties
              </Badge>
              <Badge variant="outline" className="justify-start">
                ✅ Array types
              </Badge>
              <Badge variant="outline" className="justify-start">
                ✅ Utility types
              </Badge>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={generateTypes} disabled={loading} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              {loading ? "Genereren..." : "Download TypeScript File"}
            </Button>

            <Button variant="outline" onClick={copyToClipboard}>
              {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Gekopieerd!" : "Copy to Clipboard"}
            </Button>
          </div>

          {generated && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Types succesvol gegenereerd!</span>
              </div>
              <p className="text-green-700 mt-1">
                Het bestand <code>travel-compositor-types.ts</code> is gedownload. Je kunt het nu gebruiken in je
                project!
              </p>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Hoe te gebruiken:</h4>
            <ol className="text-blue-700 space-y-1 text-sm">
              <li>1. Klik op "Download TypeScript File"</li>
              <li>
                2. Vervang je huidige <code>lib/travel-compositor-types.ts</code>
              </li>
              <li>3. Nu heb je alle 473 schemas als TypeScript types!</li>
              <li>4. Gebruik ze in je componenten met volledige type safety</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
