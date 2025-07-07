"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Bot,
  Upload,
  CreditCard,
  Users,
  Plus,
  Sparkles,
  ArrowRight,
  Settings,
  Vote,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react"
import RealAnalyticsDashboard from "@/components/real-analytics-dashboard"

export default function AgentDashboard() {
  const [analyticsData, setAnalyticsData] = useState(null)

  useEffect(() => {
    // Load analytics data
    const loadAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics")
        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error("Failed to load analytics:", error)
      }
    }
    loadAnalytics()
  }, [])

  const aiTools = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Travel Content Generator",
      description: "Genereer bestemmingsteksten, routes, dagplanningen en hotel aanbevelingen met AI",
      href: "/travel-generator",
      color: "from-blue-500 to-purple-600",
      badge: "🤖 AI Powered",
      features: ["Bestemmingsteksten", "Routebeschrijvingen", "Dagplanningen", "Hotel zoeker"],
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: "Travel Buddy Admin",
      description: "Beheer AI chatbots voor je klanten en configureer intake formulieren",
      href: "/travelbuddy",
      color: "from-green-500 to-green-600",
      badge: "💬 Chat AI",
      features: ["AI Chatbot Setup", "Intake Formulieren", "Document Upload", "Chat Interface"],
    },
    {
      icon: <Upload className="h-8 w-8" />,
      title: "Travel Import & Generator",
      description: "Importeer bookings en travel ideas uit Travel Compositor met alle content",
      href: "/import",
      color: "from-purple-500 to-pink-600",
      badge: "📥 Import",
      features: ["Booking Import", "Travel Ideas", "Content Extractie", "Foto's & Data"],
    },
  ]

  const extraTools = [
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Voucher Generator",
      description: "Genereer professionele vouchers en reisdocumenten voor je klanten",
      href: "/vouchers",
      color: "from-orange-500 to-red-600",
      badge: "🎫 Generator",
      features: ["PDF Vouchers", "Email Templates", "Branding", "Multi-taal"],
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Websites Admin",
      description: "Beheer je websites, domeinen en online aanwezigheid",
      href: "/websites",
      color: "from-gray-600 to-gray-700",
      badge: "🌐 Admin",
      features: ["Domain Management", "Website Builder", "SEO Tools", "Analytics"],
    },
  ]

  // Roadmap data
  const roadmapFeatures = [
    {
      id: 1,
      title: "AI Video Generator",
      description: "Automatisch reisvideos genereren uit foto's en tekst",
      status: "in-development",
      votes: 47,
      priority: "high",
      eta: "Q2 2025",
    },
    {
      id: 2,
      title: "Multi-language Support",
      description: "Volledige ondersteuning voor 15+ talen",
      status: "completed",
      votes: 32,
      priority: "medium",
      eta: "Completed",
    },
    {
      id: 3,
      title: "Mobile App",
      description: "Native iOS en Android app voor agents",
      status: "pipeline",
      votes: 89,
      priority: "high",
      eta: "Q3 2025",
    },
    {
      id: 4,
      title: "Advanced Analytics",
      description: "Uitgebreide rapportage en business intelligence",
      status: "in-development",
      votes: 23,
      priority: "medium",
      eta: "Q2 2025",
    },
    {
      id: 5,
      title: "API Marketplace",
      description: "Marketplace voor third-party integraties",
      status: "pipeline",
      votes: 15,
      priority: "low",
      eta: "Q4 2025",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "in-development":
        return "bg-blue-100 text-blue-700"
      case "pipeline":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in-development":
        return <Clock className="h-4 w-4" />
      case "pipeline":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Roadbooks Pro - Agent Dashboard
                </h1>
                <p className="text-sm text-gray-600">Professional Plan</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-700 px-3 py-1 rounded-full">Professional Plan</Badge>
              <Button
                variant="outline"
                className="rounded-xl shadow-sm hover:shadow-md transition-all"
                onClick={() => (window.location.href = "/")}
              >
                🏠 Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Analytics Dashboard */}
        <div className="mb-12">
          <RealAnalyticsDashboard />
        </div>

        {/* AI Tools Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">🤖 AI Tools voor Reisagenten</h2>
              <p className="text-gray-600 text-lg">Krachtige AI-tools om je werk te versnellen</p>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Powered
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {aiTools.map((tool, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-0 bg-white rounded-3xl shadow-xl overflow-hidden"
              >
                <CardHeader className="p-8 pb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-r ${tool.color} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      {tool.icon}
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full shadow-sm">
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors mb-3">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Features:</h4>
                    <ul className="space-y-2">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={tool.href}>
                    <Button
                      className={`w-full bg-gradient-to-r ${tool.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 rounded-2xl py-6 text-lg font-semibold shadow-lg`}
                    >
                      Open Tool <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Extra Tools Section */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Sparkles className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Extra Tools</h2>
              <p className="text-gray-600 text-lg">Aanvullende tools voor je reisbusiness</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {extraTools.map((tool, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-0 bg-white rounded-3xl shadow-xl overflow-hidden"
              >
                <CardHeader className="p-8 pb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-r ${tool.color} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      {tool.icon}
                    </div>
                    <Badge className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full shadow-sm">
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors mb-3">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Features:</h4>
                    <ul className="space-y-2">
                      {tool.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={tool.href}>
                    <Button
                      className={`w-full bg-gradient-to-r ${tool.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 rounded-2xl py-6 text-lg font-semibold shadow-lg`}
                    >
                      Open Tool <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Travel Management System */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Travel Management System</h2>
                <p className="text-gray-600 text-lg">Beheer ontwikkeling, features en klantverzoeken</p>
              </div>
            </div>
            <Link href="/feature-request">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 rounded-2xl px-6 py-3 shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Nieuw Verzoek
              </Button>
            </Link>
          </div>

          {/* Roadmap Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl p-6">
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Afgerond
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {roadmapFeatures.filter((f) => f.status === "completed").length}
                </div>
                <p className="text-gray-600">Features voltooid</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-3xl p-6">
                <CardTitle className="flex items-center">
                  <Clock className="h-6 w-6 mr-2" />
                  In Ontwikkeling
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {roadmapFeatures.filter((f) => f.status === "in-development").length}
                </div>
                <p className="text-gray-600">Features in uitvoering</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-t-3xl p-6">
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {roadmapFeatures.filter((f) => f.status === "pipeline").length}
                </div>
                <p className="text-gray-600">Features gepland</p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Roadmap */}
          <Card className="bg-white rounded-3xl shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-3xl p-6">
              <CardTitle className="flex items-center">
                <Lightbulb className="h-6 w-6 mr-2" />
                Feature Roadmap & Verzoeken
              </CardTitle>
              <CardDescription className="text-purple-100">
                Stem op features en dien nieuwe verzoeken in
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {roadmapFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(feature.status)}
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status === "completed"
                            ? "Afgerond"
                            : feature.status === "in-development"
                              ? "In Ontwikkeling"
                              : "Pipeline"}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800">{feature.eta}</div>
                        <div className="text-xs text-gray-500">ETA</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2 rounded-xl hover:shadow-md transition-all"
                        disabled={feature.status === "completed"}
                      >
                        <Vote className="h-4 w-4" />
                        <span>{feature.votes}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Mis je een feature?</h4>
                    <p className="text-sm text-gray-600">Dien een nieuw verzoek in en laat anderen stemmen</p>
                  </div>
                  <Link href="/feature-request">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 rounded-2xl px-6 py-3 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Nieuw Verzoek
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
