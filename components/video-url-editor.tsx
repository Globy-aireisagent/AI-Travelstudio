"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Save, X, ExternalLink, AlertCircle } from "lucide-react"

interface VideoUrlEditorProps {
  currentUrl?: string
  onSave?: (url: string) => void
  onCancel?: () => void
}

export default function VideoUrlEditor({ currentUrl = "", onSave, onCancel }: VideoUrlEditorProps) {
  const [videoUrl, setVideoUrl] = useState(currentUrl)
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  const validateUrl = (url: string) => {
    if (!url) return true // Empty is valid

    try {
      const urlObj = new URL(url)
      const isVideo =
        url.match(/\.(mp4|mov|avi|webm|mkv)$/i) ||
        url.includes("youtube.com") ||
        url.includes("vimeo.com") ||
        url.includes("dropbox.com") ||
        url.includes("drive.google.com")
      return isVideo
    } catch {
      return false
    }
  }

  const handleUrlChange = (url: string) => {
    setVideoUrl(url)
    setIsValidUrl(validateUrl(url))
  }

  const handleSave = () => {
    if (isValidUrl && onSave) {
      onSave(videoUrl)
    }
  }

  const handlePreview = () => {
    if (isValidUrl && videoUrl) {
      setShowPreview(true)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">🎥 Video Toevoegen</CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSave} disabled={!isValidUrl} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Opslaan
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Annuleren
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* URL Input */}
        <div>
          <Label htmlFor="video-url" className="text-base font-medium mb-3 block">
            🔗 Video URL
          </Label>
          <div className="space-y-2">
            <Input
              id="video-url"
              type="url"
              value={videoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.dropbox.com/s/abc123/mijn-video.mp4"
              className={`text-sm ${!isValidUrl ? "border-red-500" : ""}`}
            />

            {!isValidUrl && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Dit lijkt geen geldige video URL te zijn. Controleer of het een directe link naar een video bestand
                  is.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Preview Button */}
        {videoUrl && isValidUrl && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePreview} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Video Bekijken
            </Button>
            <Button variant="outline" onClick={() => window.open(videoUrl, "_blank")}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Video Preview */}
        {showPreview && videoUrl && (
          <div className="space-y-2">
            <Label className="text-base font-medium">👁️ Voorbeeld</Label>
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                src={videoUrl}
                className="w-full h-48 object-cover"
                controls
                preload="metadata"
                onError={() => setIsValidUrl(false)}
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">📋 Hoe voeg ik een video toe?</h4>

          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <h5 className="font-medium mb-1">1️⃣ Dropbox (Aanbevolen)</h5>
              <ul className="space-y-1 ml-4">
                <li>• Upload je video naar Dropbox</li>
                <li>• Klik op "Delen" → "Link kopiëren"</li>
                <li>
                  • Verander <code>dl=0</code> naar <code>dl=1</code> aan het einde
                </li>
                <li>• Plak de link hierboven</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium mb-1">2️⃣ Google Drive</h5>
              <ul className="space-y-1 ml-4">
                <li>• Upload naar Google Drive</li>
                <li>• Rechtsklik → "Delen" → "Iedereen met link"</li>
                <li>• Kopieer de link en plak hierboven</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium mb-1">3️⃣ YouTube/Vimeo</h5>
              <ul className="space-y-1 ml-4">
                <li>• Upload naar YouTube of Vimeo</li>
                <li>• Kopieer de video URL</li>
                <li>• Plak de link hierboven</li>
              </ul>
            </div>
          </div>

          <Alert className="mt-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Let op:</strong> Zorg dat je video openbaar toegankelijk is, anders kunnen je klanten hem niet
              zien.
            </AlertDescription>
          </Alert>
        </div>

        {/* Current Video */}
        {currentUrl && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🎬 Huidige Video</h4>
            <p className="text-sm text-gray-600 break-all">{currentUrl}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
