"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Brain,
  Wand2,
  MessageSquare,
  FileText,
  ImageIcon,
  Mail,
  Route,
  Settings,
  Eye,
  Save,
  Play,
  Copy,
  Trash2,
} from "lucide-react"

export default function GPTBuilderInterface() {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("zakelijk")
  const [gptName, setGptName] = useState("")
  const [previewText, setPreviewText] = useState("")

  const gptTemplates = [
    {
      id: "roadbook-generator",
      name: "Roadbook Generator",
      description: "Genereer reisbeschrijvingen en itineraries",
      icon: Route,
      category: "travel",
      basePrompt: "Je bent een expert reisschrijver die boeiende roadbooks maakt...",
      useCases: ["Reisbeschrijvingen", "Dagprogramma's", "Bezienswaardigheden"],
    },
    {
      id: "chat-assistant",
      name: "AI Reisbuddy",
      description: "Persoonlijke reisassistent voor chat",
      icon: MessageSquare,
      category: "chat",
      basePrompt: "Je bent een vriendelijke reisassistent die reizigers helpt...",
      useCases: ["Klant support", "Reisadvies", "Booking hulp"],
    },
    {
      id: "content-writer",
      name: "Content Writer",
      description: "Marketing content en beschrijvingen",
      icon: FileText,
      category: "marketing",
      basePrompt: "Je bent een creatieve copywriter voor reisbureaus...",
      useCases: ["Website content", "Social media", "Nieuwsbrieven"],
    },
    {
      id: "image-prompter",
      name: "Image Prompt Generator",
      description: "Prompts voor AI image generation",
      icon: ImageIcon,
      category: "media",
      basePrompt: "Je maakt gedetailleerde prompts voor AI image generators...",
      useCases: ["Hero images", "Destination photos", "Marketing visuals"],
    },
    {
      id: "email-writer",
      name: "Email Generator",
      description: "Professionele email templates",
      icon: Mail,
      category: "communication",
      basePrompt: "Je schrijft professionele emails voor reisbureaus...",
      useCases: ["Booking confirmaties", "Follow-ups", "Marketing emails"],
    },
  ]

  const textStyles = [
    {
      id: "speels",
      name: "🎈 Speels",
      description: "Veel emoticons, informeel, leuk voor families",
      example: "Wat een geweldig avontuur wacht je! 🌟✈️ De kids gaan dit GEWELDIG vinden! 🎉",
    },
    {
      id: "enthousiast",
      name: "🚀 Enthousiast",
      description: "Energiek met gekleurde highlights",
      example: "🔥 TOP BESTEMMING! Deze plek is echt onvergetelijk en perfect voor jouw reis!",
    },
    {
      id: "zakelijk",
      name: "💼 Zakelijk",
      description: "Professioneel, formeel, geen emoticons",
      example: "Deze bestemming biedt uitstekende faciliteiten en is zeer geschikt voor zakelijke reizigers.",
    },
    {
      id: "beknopt",
      name: "⚡ Beknopt",
      description: "To the point, weinig uitleg",
      example: "Historisch centrum. 2 uur bezoek. Parkeren: €5/dag.",
    },
    {
      id: "beleefd",
      name: "🤝 Beleefd",
      description: "U-vorm, formeel, geen kleuren",
      example: "Wij adviseren u deze prachtige locatie te bezoeken tijdens uw verblijf.",
    },
  ]

  const savedGPTs = [
    { id: 1, name: "Toscane Roadbook GPT", style: "enthousiast", category: "travel", lastUsed: "2 uur geleden" },
    { id: 2, name: "Business Travel Assistant", style: "zakelijk", category: "chat", lastUsed: "1 dag geleden" },
    { id: 3, name: "Familie Reis Content", style: "speels", category: "marketing", lastUsed: "3 dagen geleden" },
  ]

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id)
    setCustomPrompt(template.basePrompt)
    setGptName(template.name)
  }

  const handlePreview = () => {
    const style = textStyles.find((s) => s.id === selectedStyle)
    setPreviewText(`Preview met ${style?.name} stijl:\n\n${style?.example}`)
  }

  const handleSaveGPT = () => {
    // Hier zou je de GPT opslaan
    alert(`GPT "${gptName}" opgeslagen met ${selectedStyle} stijl!`)
  }

  return (
    <Tabs defaultValue="builder" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="builder">🛠️ GPT Builder</TabsTrigger>
        <TabsTrigger value="templates">📋 Templates</TabsTrigger>
        <TabsTrigger value="saved">💾 Opgeslagen GPT's</TabsTrigger>
      </TabsList>

      <TabsContent value="builder" className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Builder */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="w-5 h-5" />
                  <span>GPT Configuratie</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">GPT Naam</label>
                  <Input
                    placeholder="Bijv. Toscane Roadbook Generator"
                    value={gptName}
                    onChange={(e) => setGptName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Text Stijl</label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {textStyles.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {textStyles.find((s) => s.id === selectedStyle)?.description}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Custom Prompt</label>
                  <Textarea
                    placeholder="Schrijf je eigen prompt of selecteer een template..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={8}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handlePreview} variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={handleSaveGPT} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Opslaan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview & Style */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Live Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewText ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{previewText}</pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Klik op Preview om een voorbeeld te zien</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stijl Voorbeeld</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">{textStyles.find((s) => s.id === selectedStyle)?.name}</p>
                  <p className="text-sm text-gray-700">{textStyles.find((s) => s.id === selectedStyle)?.example}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="templates" className="space-y-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gptTemplates.map((template) => {
            const IconComponent = template.icon
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Use Cases:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.useCases.map((useCase, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {useCase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" className="w-full" onClick={() => handleTemplateSelect(template)}>
                      <Copy className="w-3 h-3 mr-2" />
                      Gebruik Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="saved" className="space-y-4">
        <div className="space-y-3">
          {savedGPTs.map((gpt) => (
            <Card key={gpt.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <Brain className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium">{gpt.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Badge variant="outline" className="text-xs">
                        {gpt.style}
                      </Badge>
                      <span>•</span>
                      <span>{gpt.category}</span>
                      <span>•</span>
                      <span>{gpt.lastUsed}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Play className="w-3 h-3 mr-1" />
                    Gebruik
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
