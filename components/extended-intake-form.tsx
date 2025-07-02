"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Heart,
  Baby,
  MapPin,
  Plus,
  Trash2,
  Camera,
  Gamepad2,
  Music,
  Palette,
  BookOpen,
  Zap,
  TreePine,
  Waves,
  Bike,
  Plane,
  Car,
  Building,
  Utensils,
  Star,
} from "lucide-react"

interface Child {
  id: string
  name: string
  age: string
  hobbies: string[]
}

interface ExtendedIntakeFormProps {
  onComplete: (data: any) => void
  uploadedDocuments: any[]
}

export default function ExtendedIntakeForm({ onComplete, uploadedDocuments }: ExtendedIntakeFormProps) {
  const [formData, setFormData] = useState({
    // Basis informatie
    naam: "",
    reisgenoten: "",

    // Kinderen
    kinderenMee: "",
    kinderen: [] as Child[],

    // Interesses volwassenen
    interesses: [] as string[],
    activiteiten: [] as string[],

    // Voorkeuren
    budget: "",
    reisStijl: "",
    eten: "",

    // Speciale wensen
    toegankelijkheid: "",
    allergieën: "",
    andereBijzonderheden: "",
  })

  const kinderHobbies = [
    { id: "gaming", name: "Gaming", icon: <Gamepad2 className="w-6 h-6" />, color: "bg-purple-100 text-purple-700" },
    { id: "muziek", name: "Muziek", icon: <Music className="w-6 h-6" />, color: "bg-pink-100 text-pink-700" },
    {
      id: "tekenen",
      name: "Tekenen/Kunst",
      icon: <Palette className="w-6 h-6" />,
      color: "bg-orange-100 text-orange-700",
    },
    { id: "lezen", name: "Lezen", icon: <BookOpen className="w-6 h-6" />, color: "bg-blue-100 text-blue-700" },
    { id: "sport", name: "Sport", icon: <Zap className="w-6 h-6" />, color: "bg-green-100 text-green-700" },
    { id: "natuur", name: "Natuur", icon: <TreePine className="w-6 h-6" />, color: "bg-emerald-100 text-emerald-700" },
    { id: "zwemmen", name: "Zwemmen", icon: <Waves className="w-6 h-6" />, color: "bg-cyan-100 text-cyan-700" },
    { id: "fietsen", name: "Fietsen", icon: <Bike className="w-6 h-6" />, color: "bg-yellow-100 text-yellow-700" },
    { id: "vliegtuigen", name: "Vliegtuigen", icon: <Plane className="w-6 h-6" />, color: "bg-sky-100 text-sky-700" },
    { id: "auto", name: "Auto's", icon: <Car className="w-6 h-6" />, color: "bg-red-100 text-red-700" },
    {
      id: "architectuur",
      name: "Gebouwen",
      icon: <Building className="w-6 h-6" />,
      color: "bg-gray-100 text-gray-700",
    },
    { id: "eten", name: "Lekker Eten", icon: <Utensils className="w-6 h-6" />, color: "bg-amber-100 text-amber-700" },
    {
      id: "fotografie",
      name: "Foto's maken",
      icon: <Camera className="w-6 h-6" />,
      color: "bg-indigo-100 text-indigo-700",
    },
  ]

  const interesseOpties = [
    "Cultuur & Geschiedenis",
    "Natuur & Landschappen",
    "Avontuur & Sport",
    "Eten & Drinken",
    "Winkelen",
    "Nachtleven",
    "Musea & Kunst",
    "Architectuur",
    "Lokale tradities",
    "Fotografie",
  ]

  const activiteitOpties = [
    "Wandelen/Hiking",
    "Fietsen",
    "Zwemmen",
    "Duiken/Snorkelen",
    "Skiën",
    "Stadswandelingen",
    "Boottochten",
    "Koken/Food tours",
    "Spa & Wellness",
    "Wildlife spotten",
  ]

  const addChild = () => {
    const newChild: Child = {
      id: Date.now().toString(),
      name: "",
      age: "",
      hobbies: [],
    }
    setFormData((prev) => ({
      ...prev,
      kinderen: [...prev.kinderen, newChild],
    }))
  }

  const removeChild = (childId: string) => {
    setFormData((prev) => ({
      ...prev,
      kinderen: prev.kinderen.filter((child) => child.id !== childId),
    }))
  }

  const updateChild = (childId: string, field: keyof Child, value: any) => {
    setFormData((prev) => ({
      ...prev,
      kinderen: prev.kinderen.map((child) => (child.id === childId ? { ...child, [field]: value } : child)),
    }))
  }

  const toggleChildHobby = (childId: string, hobbyId: string) => {
    setFormData((prev) => ({
      ...prev,
      kinderen: prev.kinderen.map((child) => {
        if (child.id === childId) {
          const hobbies = child.hobbies.includes(hobbyId)
            ? child.hobbies.filter((h) => h !== hobbyId)
            : [...child.hobbies, hobbyId]
          return { ...child, hobbies }
        }
        return child
      }),
    }))
  }

  const handleInteresseChange = (interesse: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      interesses: checked ? [...prev.interesses, interesse] : prev.interesses.filter((i) => i !== interesse),
    }))
  }

  const handleActiviteitChange = (activiteit: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      activiteiten: checked ? [...prev.activiteiten, activiteit] : prev.activiteiten.filter((a) => a !== activiteit),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basis Informatie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Basis Informatie</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="naam">Naam</Label>
            <Input
              id="naam"
              value={formData.naam}
              onChange={(e) => setFormData((prev) => ({ ...prev, naam: e.target.value }))}
              placeholder="Je naam"
              required
            />
          </div>

          <div>
            <Label htmlFor="reisgenoten">Met wie ga je op reis?</Label>
            <Input
              id="reisgenoten"
              value={formData.reisgenoten}
              onChange={(e) => setFormData((prev) => ({ ...prev, reisgenoten: e.target.value }))}
              placeholder="Bijv. partner, vrienden, familie"
            />
          </div>
        </CardContent>
      </Card>

      {/* Kinderen Sectie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Baby className="w-5 h-5" />
            <span>Kinderen</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Gaan er kinderen mee op reis?</Label>
            <RadioGroup
              value={formData.kinderenMee}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, kinderenMee: value }))
                if (value === "nee") {
                  setFormData((prev) => ({ ...prev, kinderen: [] }))
                }
              }}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ja" id="kinderen-ja" />
                <Label htmlFor="kinderen-ja">Ja</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nee" id="kinderen-nee" />
                <Label htmlFor="kinderen-nee">Nee</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.kinderenMee === "ja" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Kinderen Profielen</h3>
                <Button type="button" onClick={addChild} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Kind Toevoegen
                </Button>
              </div>

              {formData.kinderen.map((child, index) => (
                <Card key={child.id} className="border-2 border-dashed border-blue-200 bg-blue-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Baby className="w-4 h-4" />
                        <span>Kind {index + 1}</span>
                      </CardTitle>
                      {formData.kinderen.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeChild(child.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`child-name-${child.id}`}>Naam</Label>
                        <Input
                          id={`child-name-${child.id}`}
                          value={child.name}
                          onChange={(e) => updateChild(child.id, "name", e.target.value)}
                          placeholder="Bijv. Nova"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`child-age-${child.id}`}>Leeftijd</Label>
                        <Input
                          id={`child-age-${child.id}`}
                          value={child.age}
                          onChange={(e) => updateChild(child.id, "age", e.target.value)}
                          placeholder="Bijv. 13"
                          type="number"
                          min="0"
                          max="18"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Wat vindt {child.name || "dit kind"} leuk? (meerdere mogelijk)
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {kinderHobbies.map((hobby) => {
                          const isSelected = child.hobbies.includes(hobby.id)
                          return (
                            <div
                              key={hobby.id}
                              onClick={() => toggleChildHobby(child.id, hobby.id)}
                              className={`cursor-pointer p-3 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                                isSelected
                                  ? `border-blue-400 ${hobby.color} shadow-md`
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <div className="flex justify-center mb-2">{hobby.icon}</div>
                              <div className="text-xs font-medium">{hobby.name}</div>
                              {isSelected && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  ✓
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {child.hobbies.length > 0 && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>{child.name || "Dit kind"}</strong> houdt van:{" "}
                            {child.hobbies
                              .map((hobbyId) => {
                                const hobby = kinderHobbies.find((h) => h.id === hobbyId)
                                return hobby?.name
                              })
                              .join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {formData.kinderen.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Baby className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Nog geen kinderen toegevoegd</p>
                  <Button type="button" onClick={addChild} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Eerste Kind Toevoegen
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interesses Volwassenen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Wat vinden jullie interessant?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Selecteer jullie interesses (meerdere mogelijk)</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {interesseOpties.map((interesse) => (
                <div key={interesse} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interesse-${interesse}`}
                    checked={formData.interesses.includes(interesse)}
                    onCheckedChange={(checked) => handleInteresseChange(interesse, checked as boolean)}
                  />
                  <Label htmlFor={`interesse-${interesse}`} className="text-sm">
                    {interesse}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Welke activiteiten doen jullie graag?</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {activiteitOpties.map((activiteit) => (
                <div key={activiteit} className="flex items-center space-x-2">
                  <Checkbox
                    id={`activiteit-${activiteit}`}
                    checked={formData.activiteiten.includes(activiteit)}
                    onCheckedChange={(checked) => handleActiviteitChange(activiteit, checked as boolean)}
                  />
                  <Label htmlFor={`activiteit-${activiteit}`} className="text-sm">
                    {activiteit}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voorkeuren */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Reis Voorkeuren</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Wat is jullie reisbudget per persoon?</Label>
            <RadioGroup
              value={formData.budget}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, budget: value }))}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="budget" id="budget-budget" />
                <Label htmlFor="budget-budget">Budget (€50-100 per dag)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="midrange" id="budget-midrange" />
                <Label htmlFor="budget-midrange">Middenklasse (€100-200 per dag)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="luxury" id="budget-luxury" />
                <Label htmlFor="budget-luxury">Luxe (€200+ per dag)</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Wat is jullie reisStijl?</Label>
            <RadioGroup
              value={formData.reisStijl}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, reisStijl: value }))}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="avontuurlijk" id="stijl-avontuurlijk" />
                <Label htmlFor="stijl-avontuurlijk">Avontuurlijk en actief</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ontspannen" id="stijl-ontspannen" />
                <Label htmlFor="stijl-ontspannen">Ontspannen en rustig</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cultureel" id="stijl-cultureel" />
                <Label htmlFor="stijl-cultureel">Cultureel en educatief</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mix" id="stijl-mix" />
                <Label htmlFor="stijl-mix">Mix van alles</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="eten">Eetvoorkeuren</Label>
            <Input
              id="eten"
              value={formData.eten}
              onChange={(e) => setFormData((prev) => ({ ...prev, eten: e.target.value }))}
              placeholder="Bijv. vegetarisch, halal, geen noten, lokaal eten proberen"
            />
          </div>
        </CardContent>
      </Card>

      {/* Speciale Wensen */}
      <Card>
        <CardHeader>
          <CardTitle>Speciale Wensen & Bijzonderheden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="toegankelijkheid">Toegankelijkheid behoeften</Label>
            <Input
              id="toegankelijkheid"
              value={formData.toegankelijkheid}
              onChange={(e) => setFormData((prev) => ({ ...prev, toegankelijkheid: e.target.value }))}
              placeholder="Bijv. rolstoel toegankelijk, mobiliteitshulpmiddelen"
            />
          </div>

          <div>
            <Label htmlFor="allergieën">Allergieën of medische aandachtspunten</Label>
            <Input
              id="allergieën"
              value={formData.allergieën}
              onChange={(e) => setFormData((prev) => ({ ...prev, allergieën: e.target.value }))}
              placeholder="Bijv. noten allergie, medicijnen, etc."
            />
          </div>

          <div>
            <Label htmlFor="andereBijzonderheden">Andere bijzonderheden</Label>
            <Textarea
              id="andereBijzonderheden"
              value={formData.andereBijzonderheden}
              onChange={(e) => setFormData((prev) => ({ ...prev, andereBijzonderheden: e.target.value }))}
              placeholder="Alles wat je nog wilt delen over jullie reis..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        <Star className="w-5 h-5 mr-2" />
        Voorkeuren Opslaan & Doorgaan
      </Button>
    </form>
  )
}

export { ExtendedIntakeForm }
