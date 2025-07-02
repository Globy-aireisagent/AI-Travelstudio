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
import { Users, Heart, Baby, MapPin } from "lucide-react"

interface IntakeFormProps {
  onComplete: (data: any) => void
  uploadedDocuments: any[]
}

export default function IntakeForm({ onComplete, uploadedDocuments }: IntakeFormProps) {
  const [formData, setFormData] = useState({
    // Basis informatie
    naam: "",
    reisgenoten: "",

    // Kinderen
    kinderenMee: "",
    kinderenAantallen: "",
    kinderenLeeftijden: "",
    kinderenHobbys: "",

    // Interesses
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

      {/* Kinderen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Baby className="w-5 h-5" />
            <span>Kinderen</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Gaan er kinderen mee op reis?</Label>
            <RadioGroup
              value={formData.kinderenMee}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, kinderenMee: value }))}
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
            <>
              <div>
                <Label htmlFor="kinderenAantallen">Hoeveel kinderen?</Label>
                <Input
                  id="kinderenAantallen"
                  value={formData.kinderenAantallen}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kinderenAantallen: e.target.value }))}
                  placeholder="Aantal kinderen"
                />
              </div>

              <div>
                <Label htmlFor="kinderenLeeftijden">Leeftijden van de kinderen</Label>
                <Input
                  id="kinderenLeeftijden"
                  value={formData.kinderenLeeftijden}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kinderenLeeftijden: e.target.value }))}
                  placeholder="Bijv. 8, 12, 15 jaar"
                />
              </div>

              <div>
                <Label htmlFor="kinderenHobbys">Hobby's en interesses van de kinderen</Label>
                <Textarea
                  id="kinderenHobbys"
                  value={formData.kinderenHobbys}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kinderenHobbys: e.target.value }))}
                  placeholder="Wat vinden de kinderen leuk? Sport, games, dieren, etc."
                  rows={3}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Interesses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Wat vind je interessant?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Selecteer je interesses (meerdere mogelijk)</Label>
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
            <Label>Welke activiteiten doe je graag?</Label>
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
            <Label>Wat is je reisbudget per persoon?</Label>
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
            <Label>Wat is je reisStijl?</Label>
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
              placeholder="Alles wat je nog wilt delen over je reis..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full">
        Voorkeuren Opslaan & Doorgaan naar Chat
      </Button>
    </form>
  )
}
