"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  LayoutDashboard,
  MessageCircle,
  Route,
  Settings,
  Shield,
  BarChart3,
  Globe,
  Zap,
  BookOpen,
  TestTube,
  Database,
  Code,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react"
import TravelContentGenerator from "@/components/travel-content-generator"

export default function MasterDashboard() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeSection, setActiveSection] = useState("overview")

  const dashboards = [
    {
      id: "landing",
      title: "Landing Page",
      description: "Hoofdpagina met pricing en features",
      url: "/",
      icon: Globe,
      category: "public",
      status: "live",
      features: ["Pricing tiers", "Feature showcase", "Contact forms"],
    },
    {
      id: "agent-dashboard",
      title: "Agent Dashboard",
      description: "Reisagent werkplek - roadbooks, media, AI buddies",
      url: "/agent-dashboard",
      icon: Route,
      category: "agent",
      status: "live",
      features: ["Roadbook Generator", "Media Generator", "AI Reisbuddies", "Analytics"],
    },
    {
      id: "admin",
      title: "Admin Dashboard",
      description: "Beheerder configuratie - GPT builder, intake setup",
      url: "/admin",
      icon: Settings,
      category: "admin",
      status: "live",
      features: ["Document Upload", "AI Configuratie", "Intake Setup", "API Testing"],
    },
    {
      id: "super-admin",
      title: "Super Admin Dashboard",
      description: "Platform beheer - abonnees, text styling, analytics",
      url: "/super-admin",
      icon: Shield,
      category: "admin",
      status: "live",
      features: ["Abonnee Beheer", "Text Styling", "Revenue Analytics", "System Settings"],
    },
  ]

  const tools = [
    {
      id: "travel-compositor-test",
      title: "Travel Compositor API Test",
      description: "Test alle API endpoints en booking data",
      url: "/test-travel-compositor",
      icon: TestTube,
      category: "development",
      status: "development",
    },
    {
      id: "debug-travel",
      title: "Travel Compositor Debug",
      description: "Debug API verbindingen en responses",
      url: "/debug-travel-compositor",
      icon: Code,
      category: "development",
      status: "development",
    },
    {
      id: "booking-analysis",
      title: "Booking Data Analysis",
      description: "Analyseer booking structuur en velden",
      url: "/analyze-booking-data",
      icon: BarChart3,
      category: "development",
      status: "development",
    },
    {
      id: "endpoint-discovery",
      title: "Endpoint Discovery",
      description: "Ontdek werkende API endpoints",
      url: "/discover-endpoints",
      icon: Database,
      category: "development",
      status: "development",
    },
  ]

  const chatInterfaces = [
    {
      id: "chat-demo",
      title: "AI Reisbuddy Chat",
      description: "Demo van AI chat interface voor reizigers",
      url: "/chat/demo-toscane-2024",
      icon: MessageCircle,
      category: "demo",
      status: "demo",
    },
    {
      id: "roadbook-demo",
      title: "Roadbook Viewer",
      description: "Interactieve roadbook met chat integratie",
      url: "/roadbook/demo-toscane",
      icon: BookOpen,
      category: "demo",
      status: "demo",
    },
  ]

  const allItems = [...dashboards, ...tools, ...chatInterfaces]

  const filteredItems =
    activeCategory === "all" ? allItems : allItems.filter((item) => item.category === activeCategory)

  const categories = [
    { id: "all", label: "Alles", count: allItems.length },
    { id: "public", label: "Publiek", count: allItems.filter((i) => i.category === "public").length },
    { id: "agent", label: "Agent Tools", count: allItems.filter((i) => i.category === "agent").length },
    { id: "admin", label: "Admin Tools", count: allItems.filter((i) => i.category === "admin").length },
    { id: "demo", label: "Demo's", count: allItems.filter((i) => i.category === "demo").length },
    { id: "development", label: "Development", count: allItems.filter((i) => i.category === "development").length },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-100 text-green-800"
      case "demo":
        return "bg-blue-100 text-blue-800"
      case "development":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live":
        return <CheckCircle className="w-3 h-3" />
      case "demo":
        return <Star className="w-3 h-3" />
      case "development":
        return <Clock className="w-3 h-3" />
      default:
        return null
    }
  }

  const navigationItems = [
    { id: "overview", title: "Overview", icon: LayoutDashboard },
    { id: "content-generator", title: "Content Generator", icon: FileText },
    { id: "analytics", title: "Analytics", icon: BarChart3 },
    { id: "settings", title: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Roadbooks Pro - Master Dashboard</h1>
                <p className="text-gray-600">Overzicht van alle functies en tools</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-white">
                {allItems.length} Componenten
              </Badge>
              <Badge variant="default" className="bg-green-600">
                Platform Actief
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex space-x-2 mb-8">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "outline"}
                onClick={() => setActiveSection(item.id)}
                className="flex items-center space-x-2"
              >
                <IconComponent className="w-4 h-4" />
                <span>{item.title}</span>
              </Button>
            )
          })}
        </div>

        {/* Content based on active section */}
        {activeSection === "content-generator" ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">🤖 Travel Content Generator</h2>
                  <p className="text-gray-600">AI-powered content creation voor travel professionals</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                AI Powered
              </Badge>
            </div>

            <TravelContentGenerator />
          </div>
        ) : activeSection === "overview" ? (
          <>
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Live Dashboards</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allItems.filter((i) => i.status === "live").length}</div>
                  <p className="text-xs text-muted-foreground">Productie klaar</p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Demo Interfaces</CardTitle>
                  <Star className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allItems.filter((i) => i.status === "demo").length}</div>
                  <p className="text-xs text-muted-foreground">Voor presentaties</p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Development Tools</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allItems.filter((i) => i.status === "development").length}</div>
                  <p className="text-xs text-muted-foreground">Debug & testing</p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Integraties</CardTitle>
                  <Zap className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">Travel Compositor</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="bg-white/60 backdrop-blur-sm"
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Card
                    key={item.id}
                    className="bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-200"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{item.title}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1 capitalize">{item.status}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      {item.features && (
                        <div className="space-y-2 mb-4">
                          <h4 className="text-sm font-medium text-gray-700">Features:</h4>
                          <div className="space-y-1">
                            {item.features.slice(0, 3).map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                                <ChevronRight className="w-3 h-3" />
                                <span>{feature}</span>
                              </div>
                            ))}
                            {item.features.length > 3 && (
                              <div className="text-xs text-gray-500">+{item.features.length - 3} meer...</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Link href={item.url} className="flex-1">
                          <Button className="w-full" size="sm">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Open
                          </Button>
                        </Link>
                        {item.status === "live" && (
                          <Button variant="outline" size="sm">
                            <Star className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">🚀 Quick Actions</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/agent-dashboard">
                  <Button variant="outline" className="w-full justify-start bg-white/60">
                    <Route className="w-4 h-4 mr-2" />
                    Nieuwe Roadbook
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" className="w-full justify-start bg-white/60">
                    <Settings className="w-4 h-4 mr-2" />
                    AI Configureren
                  </Button>
                </Link>
                <Link href="/super-admin">
                  <Button variant="outline" className="w-full justify-start bg-white/60">
                    <Shield className="w-4 h-4 mr-2" />
                    Text Styling
                  </Button>
                </Link>
                <Link href="/test-travel-compositor">
                  <Button variant="outline" className="w-full justify-start bg-white/60">
                    <TestTube className="w-4 h-4 mr-2" />
                    API Testen
                  </Button>
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">📊 System Status</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Travel Compositor API</span>
                  <Badge className="bg-green-600">✅ Online</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">OpenAI Integration</span>
                  <Badge className="bg-green-600">✅ Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Database</span>
                  <Badge className="bg-blue-600">📋 Ready</Badge>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">{activeSection}</h2>
            <p className="text-gray-600">Content voor {activeSection} sectie komt hier...</p>
          </div>
        )}
      </div>
    </div>
  )
}
