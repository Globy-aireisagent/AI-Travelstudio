"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Lightbulb, Sparkles } from "lucide-react"
import Link from "next/link"

export default function FeatureRequestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    submitterEmail: "",
    submitterName: "",
  })

  const categories = [
    { value: "ai-tools", label: "AI Tools" },
    { value: "platform", label: "Platform" },
    { value: "analytics", label: "Analytics" },
    { value: "collaboration", label: "Samenwerking" },
    { value: "integration", label: "Integraties" },
    { value: "mobile", label: "Mobile" },
    { value: "general", label: "Algemeen" },
  ]

  const priorities = [
    { value: "low", label: "Laag", color: "bg-gray-100 text-gray-700" },
    { value: "medium", label: "Gemiddeld", color: "bg-yellow-100 text-yellow-700" },
    { value: "high", label: "Hoog", color: "bg-red-100 text-red-700" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feature-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        // Redirect back to dashboard with success message
        router.push("/agent-dashboard?message=feature-request-submitted")
      } else {
        alert("Er ging iets mis: " + result.error)
      }
    } catch (error) {
      console.error("Error submitting feature request:", error)
      alert("Er ging iets mis bij het versturen van je verzoek")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/agent-dashboard">
                <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug naar Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Nieuw Feature Verzoek
                </h1>
                <p className="text-sm text-gray-600">Deel je idee voor nieuwe functionaliteit</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg">
              <Lightbulb className="h-4 w-4 mr-2" />
              Innovatie
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Info Card */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Hoe werkt het?</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Beschrijf je idee zo duidelijk mogelijk</li>
                    <li>• Andere agents kunnen stemmen op je verzoek</li>
                    <li>• Populaire verzoeken krijgen prioriteit in ontwikkeling</li>
                    <li>• Je krijgt updates over de voortgang</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-3xl p-6">
              <CardTitle className="flex items-center">
                <Lightbulb className="h-6 w-6 mr-2" />
                Feature Verzoek Indienen
              </CardTitle>
              <CardDescription className="text-purple-100">
                Vertel ons over je idee voor nieuwe functionaliteit
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jouw Naam *</label>
                    <Input
                      value={formData.submitterName}
                      onChange={(e) => handleInputChange("submitterName", e.target.value)}
                      placeholder="Je volledige naam"
                      required
                      className="rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Adres *</label>
                    <Input
                      type="email"
                      value={formData.submitterEmail}
                      onChange={(e) => handleInputChange("submitterEmail", e.target.value)}
                      placeholder="je@email.com"
                      required
                      className="rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                    />
                  </div>
                </div>

                {/* Feature Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feature Titel *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Korte, duidelijke titel voor je feature"
                    required
                    className="rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beschrijving *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Beschrijf je idee in detail. Wat moet het doen? Hoe zou het werken? Waarom is het nuttig?"
                    required
                    rows={6}
                    className="rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categorie</label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="rounded-xl border-gray-200">
                        <SelectValue placeholder="Selecteer categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioriteit (jouw inschatting)
                    </label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                      <SelectTrigger className="rounded-xl border-gray-200">
                        <SelectValue placeholder="Selecteer prioriteit" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${priority.color} text-xs px-2 py-1`}>{priority.label}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.title || !formData.description || !formData.submitterEmail}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl py-6 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Versturen...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="h-5 w-5 mr-2" />
                        Verzoek Indienen
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-lg rounded-3xl">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-3">💡 Tips voor een goed verzoek:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>
                  • <strong>Wees specifiek:</strong> Beschrijf precies wat je wilt en waarom
                </li>
                <li>
                  • <strong>Denk aan de gebruiker:</strong> Hoe zou dit andere agents helpen?
                </li>
                <li>
                  • <strong>Geef voorbeelden:</strong> Concrete use cases maken je verzoek sterker
                </li>
                <li>
                  • <strong>Check duplicaten:</strong> Kijk eerst of iemand anders al een soortgelijk verzoek heeft
                  gedaan
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
