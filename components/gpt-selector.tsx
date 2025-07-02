"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  Route,
  Calendar,
  Hotel,
  ImageIcon,
  Search,
  Star,
  Zap,
  Users,
  Briefcase,
  Smile,
  Sparkles,
} from "lucide-react"
import { DEFAULT_GPTS, getAllCategories, getFeaturedGPTs, type GPTConfig } from "@/lib/default-gpts"

interface GPTSelectorProps {
  onSelectGPT: (gpt: GPTConfig) => void
  selectedGPTId?: string
  showPrompts?: boolean // Only for super-admin
}

export default function GPTSelector({ onSelectGPT, selectedGPTId, showPrompts = false }: GPTSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      MapPin,
      Route,
      Calendar,
      Hotel,
      ImageIcon,
      Briefcase,
      Users,
      Smile,
      Sparkles,
    }
    return icons[iconName] || MapPin
  }

  const getStyleIcon = (style: string) => {
    const styleIcons: { [key: string]: any } = {
      speels: Smile,
      enthousiast: Sparkles,
      zakelijk: Briefcase,
      beleefd: Users,
      creatief: ImageIcon,
    }
    return styleIcons[style] || Zap
  }

  const filteredGPTs = DEFAULT_GPTS.filter((gpt) => {
    const matchesSearch =
      gpt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gpt.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || gpt.category === selectedCategory
    const matchesFeatured = !showFeaturedOnly || gpt.status === "featured"

    return matchesSearch && matchesCategory && matchesFeatured
  })

  const categories = getAllCategories()
  const featuredGPTs = getFeaturedGPTs()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Kies je AI Reisassistent</h2>
        <p className="text-gray-600">Selecteer de perfecte GPT voor jouw reiscontent</p>
      </div>

      {/* Featured GPTs */}
      {!showFeaturedOnly && featuredGPTs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">Aanbevolen</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredGPTs.slice(0, 3).map((gpt) => {
              const Icon = getIcon(gpt.icon)
              const StyleIcon = getStyleIcon(gpt.writingStyle)
              const isSelected = selectedGPTId === gpt.id

              return (
                <Card
                  key={gpt.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => onSelectGPT(gpt)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 truncate">{gpt.name}</h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{gpt.description}</p>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            <StyleIcon className="w-3 h-3 mr-1" />
                            {gpt.writingStyle}
                          </Badge>
                          <Badge className="text-xs bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Zoek GPTs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle categorieën" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle categorieën</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showFeaturedOnly ? "default" : "outline"}
          onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
          size="sm"
        >
          <Star className="w-4 h-4 mr-2" />
          Alleen aanbevolen
        </Button>
      </div>

      {/* GPT Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGPTs.map((gpt) => {
          const Icon = getIcon(gpt.icon)
          const StyleIcon = getStyleIcon(gpt.writingStyle)
          const isSelected = selectedGPTId === gpt.id

          return (
            <Card
              key={gpt.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => onSelectGPT(gpt)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      gpt.status === "featured"
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                        : gpt.status === "premium"
                          ? "bg-gradient-to-br from-purple-500 to-blue-600"
                          : "bg-gradient-to-br from-gray-400 to-gray-600"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{gpt.name}</CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <StyleIcon className="w-3 h-3 mr-1" />
                        {gpt.writingStyle}
                      </Badge>
                      {gpt.status === "featured" && (
                        <Badge className="text-xs bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Top
                        </Badge>
                      )}
                      {gpt.status === "premium" && (
                        <Badge className="text-xs bg-purple-100 text-purple-800">Premium</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-3 line-clamp-2">{gpt.description}</CardDescription>

                {/* Only show prompt preview for super-admin */}
                {showPrompts && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <p className="font-medium text-gray-700 mb-1">Prompt preview:</p>
                    <p className="text-gray-600 line-clamp-3">{gpt.prompt.slice(0, 150)}...</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <Badge variant="secondary" className="text-xs">
                    {gpt.category}
                  </Badge>
                  {isSelected && <Badge className="text-xs bg-blue-100 text-blue-800">✓ Geselecteerd</Badge>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredGPTs.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Geen GPTs gevonden</h3>
          <p className="text-gray-600">Probeer een andere zoekterm of filter</p>
        </div>
      )}

      {/* Info voor klanten */}
      {!showPrompts && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Hoe werkt het?</h4>
              <p className="text-sm text-blue-700">
                Selecteer een GPT die past bij jouw content type en schrijfstijl. Elke GPT is gespecialiseerd in een
                specifiek onderdeel van reiscontent.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
