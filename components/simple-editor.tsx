"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bold, Italic, Underline, List, Palette, Save, X } from "lucide-react"

interface SimpleEditorProps {
  title?: string
  content?: string
  onSave?: (data: { title: string; content: string }) => void
  onCancel?: () => void
}

export default function SimpleEditor({ title = "", content = "", onSave, onCancel }: SimpleEditorProps) {
  const [editorTitle, setEditorTitle] = useState(title)
  const [editorContent, setEditorContent] = useState(content)
  const [selectedColor, setSelectedColor] = useState("#000000")

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
  ]

  const handleSave = () => {
    if (onSave) {
      onSave({
        title: editorTitle,
        content: editorContent,
      })
    }
  }

  const insertText = (before: string, after = "") => {
    const textarea = document.getElementById("editor-content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editorContent.substring(start, end)

    const newText = editorContent.substring(0, start) + before + selectedText + after + editorContent.substring(end)

    setEditorContent(newText)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">✏️ Tekst Bewerken</CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
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

      <CardContent className="space-y-4">
        {/* Title Input */}
        <div>
          <Label htmlFor="editor-title" className="text-base font-medium">
            📝 Titel
          </Label>
          <Input
            id="editor-title"
            value={editorTitle}
            onChange={(e) => setEditorTitle(e.target.value)}
            placeholder="Voer een titel in..."
            className="text-lg font-medium mt-2"
          />
        </div>

        {/* Toolbar */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex flex-wrap items-center gap-2">
            {/* Text Formatting */}
            <div className="flex items-center space-x-1 border-r pr-2">
              <Button size="sm" variant="ghost" onClick={() => insertText("**", "**")} title="Vetgedrukt">
                <Bold className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => insertText("*", "*")} title="Cursief">
                <Italic className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => insertText("__", "__")} title="Onderstreept">
                <Underline className="w-4 h-4" />
              </Button>
            </div>

            {/* Lists */}
            <div className="flex items-center space-x-1 border-r pr-2">
              <Button size="sm" variant="ghost" onClick={() => insertText("• ")} title="Lijst">
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Colors */}
            <div className="flex items-center space-x-2 border-r pr-2">
              <Palette className="w-4 h-4 text-gray-600" />
              <div className="flex space-x-1">
                {colors.slice(0, 5).map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color)
                      insertText(`<span style="color: ${color}">`, "</span>")
                    }}
                    title={`Kleur: ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Quick Inserts */}
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="ghost" onClick={() => insertText("🏨 ")} title="Hotel icoon">
                🏨
              </Button>
              <Button size="sm" variant="ghost" onClick={() => insertText("🍽️ ")} title="Restaurant icoon">
                🍽️
              </Button>
              <Button size="sm" variant="ghost" onClick={() => insertText("📍 ")} title="Locatie icoon">
                📍
              </Button>
              <Button size="sm" variant="ghost" onClick={() => insertText("⭐ ")} title="Ster icoon">
                ⭐
              </Button>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <Label htmlFor="editor-content" className="text-base font-medium">
            📄 Inhoud
          </Label>
          <Textarea
            id="editor-content"
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="Schrijf hier je tekst... 

Gebruik de knoppen hierboven om tekst op te maken:
• **vetgedrukt** voor belangrijke tekst
• *cursief* voor nadruk
• 🏨 🍽️ 📍 voor leuke icoontjes

Voorbeeld:
**Hotel Villa San Martino** ⭐⭐⭐⭐
📍 Via Roma 123, Siena
🍽️ Uitstekend restaurant met lokale specialiteiten"
            rows={12}
            className="mt-2 font-mono text-sm"
          />
        </div>

        {/* Preview */}
        <div>
          <Label className="text-base font-medium">👁️ Voorbeeld</Label>
          <div className="mt-2 p-4 border rounded-lg bg-white min-h-[100px]">
            {editorTitle && <h3 className="text-xl font-bold mb-3">{editorTitle}</h3>}
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: editorContent
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\*(.*?)\*/g, "<em>$1</em>")
                  .replace(/__(.*?)__/g, "<u>$1</u>")
                  .replace(/\n/g, "<br>"),
              }}
            />
            {!editorContent && <p className="text-gray-400 italic">Hier verschijnt je tekst...</p>}
          </div>
        </div>

        {/* Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Handige Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Gebruik **tekst** voor vetgedrukte tekst</li>
            <li>• Gebruik *tekst* voor cursieve tekst</li>
            <li>• Klik op de kleur bolletjes om gekleurde tekst toe te voegen</li>
            <li>• Gebruik de emoji knoppen voor leuke icoontjes</li>
            <li>• Het voorbeeld laat zien hoe het eruit komt te zien</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
