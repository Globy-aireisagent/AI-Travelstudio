"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Save, X, Plus } from "lucide-react"

interface TextStyleConfig {
  id: string
  name: string
  emoji: string
  description: string
  targetAudience: string
  features: string[]
  example: string
  color: string
}

interface EditableTextStyleProps {
  config: TextStyleConfig
  onUpdate: (config: TextStyleConfig) => void
  onDelete: (id: string) => void
}

export function EditableTextStyle({ config, onUpdate, onDelete }: EditableTextStyleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editConfig, setEditConfig] = useState(config)

  const handleSave = () => {
    onUpdate(editConfig)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditConfig(config)
    setIsEditing(false)
  }

  const addFeature = () => {
    setEditConfig((prev) => ({
      ...prev,
      features: [...prev.features, "Nieuwe feature"],
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setEditConfig((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }))
  }

  const removeFeature = (index: number) => {
    setEditConfig((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  if (isEditing) {
    return (
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Stijl Bewerken</CardTitle>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                Opslaan
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                Annuleren
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Naam:</label>
              <Input
                value={editConfig.name}
                onChange={(e) => setEditConfig((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Emoji:</label>
              <Input
                value={editConfig.emoji}
                onChange={(e) => setEditConfig((prev) => ({ ...prev, emoji: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Beschrijving:</label>
            <Textarea
              value={editConfig.description}
              onChange={(e) => setEditConfig((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Doelgroep:</label>
            <Input
              value={editConfig.targetAudience}
              onChange={(e) => setEditConfig((prev) => ({ ...prev, targetAudience: e.target.value }))}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Features:</label>
              <Button size="sm" variant="outline" onClick={addFeature}>
                <Plus className="w-3 h-3 mr-1" />
                Toevoegen
              </Button>
            </div>
            <div className="space-y-2">
              {editConfig.features.map((feature, index) => (
                <div key={index} className="flex space-x-2">
                  <Input value={feature} onChange={(e) => updateFeature(index, e.target.value)} className="flex-1" />
                  <Button size="sm" variant="outline" onClick={() => removeFeature(index)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Voorbeeld tekst:</label>
            <Textarea
              value={editConfig.example}
              onChange={(e) => setEditConfig((prev) => ({ ...prev, example: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border rounded-lg">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg flex items-center space-x-2">
            <span>{config.emoji}</span>
            <span>{config.name}</span>
          </h3>
          <div className="flex space-x-1">
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(config.id)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <Badge variant="secondary">{config.targetAudience}</Badge>
        <p className="text-sm text-gray-600">{config.description}</p>

        <div className="space-y-2">
          {config.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input type="checkbox" checked className="rounded" readOnly />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className={`p-3 rounded border-l-4 ${config.color}`}>
          <p className="text-sm">{config.example}</p>
        </div>
      </CardContent>
    </Card>
  )
}
