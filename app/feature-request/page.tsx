"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Lightbulb, CheckCircle, AlertCircle } from "lucide-react"

export default function FeatureRequestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    submitterName: "",
    submitterEmail: "",
  })

  const categories = [
    {
      value: "ai",
      label: "🤖 AI & Machine Learning",
      description: "AI-powered features en intelligente automatisering",
    },
    { value: "mobile", label: "📱 Mobile", description: "Mobile app features en responsive design" },
    { value: "feature", label: "✨ Nieuwe Features", description: "Algemene nieuwe functionaliteiten" },
    { value: "ui", label: "🎨 User Interface", description: "Design verbeteringen en UX optimalisaties" },
    { value: "analytics", label: "📊 Analytics", description: "Rapportage en data analyse tools" },
    { value: "technical", label: "⚙️ Technical", description: "Performance, security en technische verbeteringen" },
    { value: "integration", label: "🔗 Integraties", description: "Third-party integraties en API's" },
    { value: "general", label: "💡 Algemeen", description: "Overige suggesties en ideeën" },
  ]

  const priorities = [
    { value: "low", label: "🟢 Laag", description: "Nice to have, geen haast" },
    { value: "medium", label: "🟡 Gemiddeld", description: "Belangrijk voor toekomstige releases" },
    { value: "high", label: "🔴 Hoog", description: "Kritiek voor business operaties" },
    { value: "urgent", label: "🚨 Urgent", description: "Moet zo snel mogelijk opgelost worden" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/feature-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit feature request")
      }

      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting feature request:", error)
      setError(error instanceof Error ? error.message : "Er is een fout opgetreden")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-0">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Feature Request Ingediend! 🎉
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Bedankt voor je suggestie! We hebben je feature request ontvangen en zullen deze beoordelen. Je kunt nu
              stemmen op andere features of terug naar het dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/agent-dashboard">
                <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 px-8 py-3">
                  Terug naar Dashboard
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({
                    title: "",
                    description: "",
                    category: "",
                    priority: "",
                    submitterName: "",
                    submitterEmail: "",
                  })
                }}
                variant="outline"
                className="rounded-2xl px-8 py-3"
              >
                Nog een Request Indienen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/agent-dashboard">
                <Button variant="ghost" size="sm" className="rounded-2xl">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug
                </Button>
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Feature Request Indienen
                </h1>
                <p className="text-sm text-gray-600">Deel je ideeën voor nieuwe functionaliteiten</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-4xl">
        <Card className="bg-white rounded-3xl shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-3xl">
            <CardTitle className="text-2xl">Nieuw Feature Request</CardTitle>
            <CardDescription className="text-purple-100">
              Help ons AI Travel Studio te verbeteren door je ideeën te delen
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="submitterName">Je Naam</Label>
                    <Input
                      id="submitterName"
                      value={formData.submitterName}
                      onChange={(e) => handleInputChange("submitterName", e.target.value)}
                      placeholder="Bijv. Jan de Vries"
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="submitterEmail">Email Adres</Label>
                    <Input
                      id="submitterEmail"
                      type="email"
                      value={formData.submitterEmail}
                      onChange={(e) => handleInputChange("submitterEmail", e.target.value)}
                      placeholder="jan@reisbureau.nl"
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Feature Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Bijv. AI Hotel Aanbevelingen op basis van klantvoorkeuren"
                    required
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Beschrijf je feature idee in detail. Wat moet het doen? Hoe zou het werken? Welk probleem lost het op?"
                    required
                    rows={6}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-4">
                <Label>Categorie *</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {categories.map((category) => (
                    <div
                      key={category.value}
                      onClick={() => handleInputChange("category", category.value)}
                      className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        formData.category === category.value
                          ? "border-purple-500 bg-purple-50 shadow-lg"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="font-medium text-sm">{category.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{category.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Selection */}
              <div className="space-y-4">
                <Label>Prioriteit *</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {priorities.map((priority) => (
                    <div
                      key={priority.value}
                      onClick={() => handleInputChange("priority", priority.value)}
                      className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        formData.priority === priority.value
                          ? "border-purple-500 bg-purple-50 shadow-lg"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="font-medium text-sm">{priority.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{priority.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || !formData.title || !formData.description || !formData.category || !formData.priority
                  }
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Indienen...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Feature Request Indienen
                    </>
                  )}
                </Button>
                <Link href="/agent-dashboard">
                  <Button variant="outline" className="rounded-2xl px-8 py-3 bg-transparent">
                    Annuleren
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
