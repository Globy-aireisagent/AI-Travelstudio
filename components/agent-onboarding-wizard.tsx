"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, Briefcase, Globe, Settings, CheckCircle } from "lucide-react"

interface OnboardingData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  professionalInfo: {
    experience: number
    specializations: string[]
    languages: string[]
    certifications: string[]
  }
  businessInfo: {
    agencyName?: string
    territory: string[]
  }
  preferences: {
    currency: string
    timezone: string
  }
}

const SPECIALIZATIONS = [
  "Europa",
  "Azië",
  "Amerika",
  "Afrika",
  "Oceanië",
  "Cruise",
  "Zakelijk",
  "Luxe",
  "Budget",
  "Familie",
  "Avontuur",
  "Cultuur",
]

const LANGUAGES = ["nl", "en", "de", "fr", "es", "it"]

const TERRITORIES = [
  "Nederland",
  "België",
  "Duitsland",
  "Frankrijk",
  "Spanje",
  "Italië",
  "Verenigd Koninkrijk",
  "Europa",
  "Wereldwijd",
]

export default function AgentOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    professionalInfo: {
      experience: 0,
      specializations: [],
      languages: ["nl"],
      certifications: [],
    },
    businessInfo: {
      territory: ["Nederland"],
    },
    preferences: {
      currency: "EUR",
      timezone: "Europe/Amsterdam",
    },
  })

  const updateData = (section: keyof OnboardingData, updates: any) => {
    setOnboardingData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }))
  }

  const toggleArrayItem = (section: keyof OnboardingData, field: string, item: string) => {
    setOnboardingData((prev) => {
      const currentArray = (prev[section] as any)[field] || []
      const newArray = currentArray.includes(item)
        ? currentArray.filter((i: string) => i !== item)
        : [...currentArray, item]

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray,
        },
      }
    })
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/agent-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          onboardingData,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to agent dashboard
        window.location.href = `/agent-profile/${result.profile.id}`
      }
    } catch (error) {
      console.error("Onboarding failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { step: 1, title: "Persoonlijke Info", icon: User },
    { step: 2, title: "Professioneel", icon: Briefcase },
    { step: 3, title: "Werkgebied", icon: Globe },
    { step: 4, title: "Voorkeuren", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Agent Onboarding</h1>
          <p className="text-xl text-gray-600">Welkom! Laten we je profiel instellen</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {steps.map(({ step, title, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > step ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`ml-2 ${currentStep >= step ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                {title}
              </span>
              {step < 4 && <div className="w-8 h-px bg-gray-300 ml-4" />}
            </div>
          ))}
        </div>

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Persoonlijke Informatie
              </CardTitle>
              <CardDescription>Vertel ons iets over jezelf</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Voornaam</Label>
                  <Input
                    id="firstName"
                    value={onboardingData.personalInfo.firstName}
                    onChange={(e) => updateData("personalInfo", { firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Achternaam</Label>
                  <Input
                    id="lastName"
                    value={onboardingData.personalInfo.lastName}
                    onChange={(e) => updateData("personalInfo", { lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={onboardingData.personalInfo.email}
                    onChange={(e) => updateData("personalInfo", { email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefoon</Label>
                  <Input
                    id="phone"
                    value={onboardingData.personalInfo.phone}
                    onChange={(e) => updateData("personalInfo", { phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={
                    !onboardingData.personalInfo.firstName ||
                    !onboardingData.personalInfo.lastName ||
                    !onboardingData.personalInfo.email
                  }
                >
                  Volgende
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Professional Info */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professionele Informatie
              </CardTitle>
              <CardDescription>Vertel ons over je ervaring en specialisaties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="experience">Jaren ervaring in de reisbranche</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={onboardingData.professionalInfo.experience}
                  onChange={(e) => updateData("professionalInfo", { experience: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Specialisaties</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SPECIALIZATIONS.map((spec) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-${spec}`}
                        checked={onboardingData.professionalInfo.specializations.includes(spec)}
                        onCheckedChange={() => toggleArrayItem("professionalInfo", "specializations", spec)}
                      />
                      <Label htmlFor={`spec-${spec}`} className="text-sm">
                        {spec}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Talen</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={onboardingData.professionalInfo.languages.includes(lang)}
                        onCheckedChange={() => toggleArrayItem("professionalInfo", "languages", lang)}
                      />
                      <Label htmlFor={`lang-${lang}`} className="text-sm">
                        {lang.toUpperCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Vorige
                </Button>
                <Button onClick={() => setCurrentStep(3)}>Volgende</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Business Info */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Werkgebied & Agency
              </CardTitle>
              <CardDescription>Waar ben je actief?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agencyName">Agency naam (optioneel)</Label>
                <Input
                  id="agencyName"
                  value={onboardingData.businessInfo.agencyName || ""}
                  onChange={(e) => updateData("businessInfo", { agencyName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Werkgebied</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TERRITORIES.map((territory) => (
                    <div key={territory} className="flex items-center space-x-2">
                      <Checkbox
                        id={`territory-${territory}`}
                        checked={onboardingData.businessInfo.territory.includes(territory)}
                        onCheckedChange={() => toggleArrayItem("businessInfo", "territory", territory)}
                      />
                      <Label htmlFor={`territory-${territory}`} className="text-sm">
                        {territory}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Vorige
                </Button>
                <Button onClick={() => setCurrentStep(4)}>Volgende</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Preferences */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Voorkeuren
              </CardTitle>
              <CardDescription>Stel je voorkeuren in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Valuta</Label>
                  <Select
                    value={onboardingData.preferences.currency}
                    onValueChange={(value) => updateData("preferences", { currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Tijdzone</Label>
                  <Select
                    value={onboardingData.preferences.timezone}
                    onValueChange={(value) => updateData("preferences", { timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Amsterdam">Amsterdam</SelectItem>
                      <SelectItem value="Europe/Brussels">Brussels</SelectItem>
                      <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Samenvatting</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>
                    <strong>Naam:</strong> {onboardingData.personalInfo.firstName}{" "}
                    {onboardingData.personalInfo.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {onboardingData.personalInfo.email}
                  </p>
                  <p>
                    <strong>Ervaring:</strong> {onboardingData.professionalInfo.experience} jaar
                  </p>
                  <div>
                    <strong>Specialisaties:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {onboardingData.professionalInfo.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Vorige
                </Button>
                <Button onClick={completeOnboarding} disabled={isLoading}>
                  {isLoading ? "Profiel aanmaken..." : "Profiel Voltooien"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
