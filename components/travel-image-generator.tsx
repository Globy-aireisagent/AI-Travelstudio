"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Download, Copy, Sparkles } from "lucide-react"

interface GeneratedImage {
  url: string
  prompt: string
  style: string
  timestamp: number
}

export default function TravelImageGenerator() {
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("fotorealistisch")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [error, setError] = useState("")

  const imageStyles = [
    { id: "fotorealistisch", name: "Fotorealistisch", description: "Professionele travel fotografie" },
    { id: "artistiek", name: "Artistiek", description: "Creatieve interpretatie" },
    { id: "vintage", name: "Vintage", description: "Retro travel poster stijl" },
    { id: "modern", name: "Modern", description: "Strak en minimalistisch" },
    { id: "cartoon", name: "Cartoon", description: "Speelse illustratie stijl" },
    { id: "minimalistisch", name: "Minimalistisch", description: "Clean en zen" },
    { id: "dramatisch", name: "Dramatisch", description: "Cinematic met sterke contrasten" },
    { id: "drone", name: "Drone View", description: "Luchtfoto perspectief" },
  ]

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Voer eerst een beschrijving in!")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const response = await fetch("/api/travel-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Er ging iets mis bij het genereren")
      }

      const newImage: GeneratedImage = {
        url: data.imageUrl,
        prompt: data.prompt || prompt,
        style: selectedStyle,
        timestamp: Date.now(),
      }

      setGeneratedImages((prev) => [newImage, ...prev])
      setPrompt("")
    } catch (error: any) {
      console.error("Image generation error:", error)
      setError(error.message || "Er is een fout opgetreden")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `travel-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      // Toast notification could be added here
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            DALL-E 3 Travel Image Generator
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium Quality
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Stijl:</label>
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {imageStyles.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    <div>
                      <div className="font-medium">{style.name}</div>
                      <div className="text-xs text-gray-500">{style.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Beschrijving:</label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Bijv. Zonsondergang over de Eiffeltoren in Parijs..."
              onKeyDown={(e) => e.key === "Enter" && !isGenerating && generateImage()}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Genereren met DALL-E 3...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Genereer Premium Afbeelding
              </div>
            )}
          </Button>

          {/* Error Display */}
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        </CardContent>
      </Card>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Gegenereerde Afbeeldingen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((image, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyImageUrl(image.url)}
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      title="Kopieer URL"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadImage(image.url, image.prompt)}
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      title="Download"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{image.prompt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <Badge variant="outline">{imageStyles.find((s) => s.id === image.style)?.name}</Badge>
                    <Badge variant="outline">DALL-E 3</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
