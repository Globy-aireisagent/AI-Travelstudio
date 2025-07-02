"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Smartphone,
  Globe,
  Camera,
  FileText,
  TrendingUp,
  Target,
  Sparkles,
  Rocket,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

interface Opportunity {
  id: string
  title: string
  category: string
  description: string
  impact: "LOW" | "MEDIUM" | "HIGH" | "GAME_CHANGER"
  effort: "LOW" | "MEDIUM" | "HIGH"
  revenue: string
  timeToMarket: string
  icon: any
  features: string[]
  techStack: string[]
  dataUsed: string[]
  marketSize: string
  competition: string
  uniqueValue: string
}

export default function OpportunityMatrix() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("impact")

  const opportunities: Opportunity[] = [
    // AI-POWERED SOLUTIONS
    {
      id: "ai-travel-concierge",
      title: "🤖 Complete AI Travel Concierge",
      category: "AI Solutions",
      description: "AI assistant die complete reizen plant, boekt en beheert via natuurlijke taal conversatie",
      impact: "GAME_CHANGER",
      effort: "HIGH",
      revenue: "€50-200/booking + subscription",
      timeToMarket: "6-8 maanden",
      icon: Brain,
      features: [
        "Natuurlijke taal planning",
        "Automatisch boeken via API",
        "Real-time updates en wijzigingen",
        "24/7 multilingual support",
        "Persoonlijke voorkeuren leren",
        "Budget optimalisatie",
      ],
      techStack: ["OpenAI GPT-4o", "Function Calling", "Travel Compositor API", "Vector Database", "WebSockets"],
      dataUsed: [
        "Alle booking data",
        "Hotel details",
        "Transport opties",
        "Bestemmingen",
        "Prijzen",
        "Beschikbaarheid",
      ],
      marketSize: "€2.3B (AI travel market)",
      competition: "Laag - geen complete oplossing",
      uniqueValue: "Eerste volledig geïntegreerde AI travel agent",
    },
    {
      id: "smart-recommendations",
      title: "🧠 Hyper-Personalized Recommendations",
      category: "AI Solutions",
      description: "ML-powered aanbevelingen op basis van reisgeschiedenis, voorkeuren en real-time data",
      impact: "HIGH",
      effort: "MEDIUM",
      revenue: "Commission boost 15-30%",
      timeToMarket: "3-4 maanden",
      icon: Target,
      features: [
        "Behavioral pattern analysis",
        "Seasonal preference learning",
        "Budget-aware suggestions",
        "Group travel optimization",
        "Real-time price alerts",
        "Alternative suggestions",
      ],
      techStack: ["Machine Learning", "Vector Embeddings", "Real-time Analytics", "A/B Testing"],
      dataUsed: ["Booking history", "User preferences", "Seasonal data", "Price trends", "Hotel ratings"],
      marketSize: "€890M (personalization market)",
      competition: "Medium - Booking.com, Expedia",
      uniqueValue: "Travel agent specific data + AI",
    },

    // BUSINESS INTELLIGENCE
    {
      id: "travel-analytics-suite",
      title: "📊 Complete Travel Analytics Suite",
      category: "Business Intelligence",
      description: "Uitgebreide BI dashboard voor travel agencies met predictive analytics en performance insights",
      impact: "HIGH",
      effort: "MEDIUM",
      revenue: "€99-499/maand SaaS",
      timeToMarket: "2-3 maanden",
      icon: BarChart3,
      features: [
        "Revenue forecasting",
        "Client lifetime value",
        "Booking trend analysis",
        "Profit margin optimization",
        "Seasonal demand patterns",
        "Competitor benchmarking",
      ],
      techStack: ["Chart.js", "Data Pipeline", "ML Forecasting", "Real-time Dashboards"],
      dataUsed: ["Alle booking data", "Financial data", "Client data", "Market trends", "Seasonal patterns"],
      marketSize: "€1.2B (travel analytics)",
      competition: "Low - fragmented market",
      uniqueValue: "Travel-specific metrics + predictive AI",
    },
    {
      id: "dynamic-pricing-engine",
      title: "💰 AI Dynamic Pricing Engine",
      category: "Business Intelligence",
      description: "Machine learning model voor optimale prijsstelling op basis van vraag, concurrentie en seizoen",
      impact: "GAME_CHANGER",
      effort: "HIGH",
      revenue: "Revenue share 5-15%",
      timeToMarket: "4-6 maanden",
      icon: TrendingUp,
      features: [
        "Demand forecasting",
        "Competitor price monitoring",
        "Seasonal adjustments",
        "Profit optimization",
        "A/B price testing",
        "Market elasticity analysis",
      ],
      techStack: ["ML Models", "Real-time Data", "Price Optimization", "Market Intelligence"],
      dataUsed: ["Historical bookings", "Market prices", "Demand patterns", "Competitor data", "Economic indicators"],
      marketSize: "€2.8B (pricing software)",
      competition: "Medium - Airlines use it",
      uniqueValue: "Travel agency focused + real booking data",
    },

    // CUSTOMER EXPERIENCE
    {
      id: "smart-travel-app",
      title: "📱 Smart Travel Companion App",
      category: "Customer Experience",
      description: "AI-powered mobile app die reizigers begeleidt van planning tot thuiskomst",
      impact: "HIGH",
      effort: "HIGH",
      revenue: "€2-5/user/month + commissions",
      timeToMarket: "6-8 maanden",
      icon: Smartphone,
      features: [
        "Trip planning assistant",
        "Real-time travel updates",
        "Local recommendations",
        "Expense tracking",
        "Document storage",
        "Emergency assistance",
      ],
      techStack: ["React Native", "Push Notifications", "Offline Storage", "GPS Integration"],
      dataUsed: ["Booking details", "Destination info", "Transport schedules", "Local attractions", "Weather"],
      marketSize: "€4.1B (travel apps)",
      competition: "High - TripIt, Google Travel",
      uniqueValue: "Agent-branded + booking integration",
    },
    {
      id: "instant-support-bot",
      title: "💬 24/7 Intelligent Support Bot",
      category: "Customer Experience",
      description: "AI chatbot die 90% van klantvragen automatisch afhandelt met booking data toegang",
      impact: "HIGH",
      effort: "MEDIUM",
      revenue: "Cost savings €20-50/query",
      timeToMarket: "2-3 maanden",
      icon: MessageSquare,
      features: [
        "Booking status updates",
        "Change requests handling",
        "FAQ automation",
        "Multilingual support",
        "Escalation to humans",
        "Proactive notifications",
      ],
      techStack: ["OpenAI GPT-4", "Function Calling", "WebSocket", "Multi-language NLP"],
      dataUsed: ["Booking data", "Client history", "FAQ database", "Policy information"],
      marketSize: "€1.6B (chatbot market)",
      competition: "Medium - generic chatbots",
      uniqueValue: "Travel-specific + real booking access",
    },

    // AUTOMATION & EFFICIENCY
    {
      id: "auto-itinerary-generator",
      title: "🗓️ AI Itinerary Generator",
      category: "Automation",
      description: "Automatische dagplanning generator op basis van bestemming, interesses en budget",
      impact: "MEDIUM",
      effort: "MEDIUM",
      revenue: "€5-15/itinerary",
      timeToMarket: "2-3 maanden",
      icon: Calendar,
      features: [
        "Personalized day plans",
        "Budget optimization",
        "Transport integration",
        "Restaurant reservations",
        "Activity booking",
        "Weather adaptation",
      ],
      techStack: ["OpenAI GPT-4", "Maps API", "Activity APIs", "Weather API"],
      dataUsed: ["Destination data", "Activities", "Restaurants", "Transport", "Weather", "User preferences"],
      marketSize: "€680M (itinerary planning)",
      competition: "Medium - TripHobo, Sygic",
      uniqueValue: "Agent integration + real booking data",
    },
    {
      id: "smart-document-processor",
      title: "📄 Smart Document Processor",
      category: "Automation",
      description: "AI die automatisch booking confirmations, vouchers en documenten verwerkt en organiseert",
      impact: "MEDIUM",
      effort: "LOW",
      revenue: "€1-3/document processed",
      timeToMarket: "1-2 maanden",
      icon: FileText,
      features: [
        "PDF text extraction",
        "Booking data parsing",
        "Document classification",
        "Data validation",
        "Auto-filing system",
        "Error detection",
      ],
      techStack: ["OCR", "NLP", "Document AI", "File Management"],
      dataUsed: ["PDF documents", "Booking schemas", "Validation rules"],
      marketSize: "€420M (document processing)",
      competition: "Low - generic solutions",
      uniqueValue: "Travel document specific + schema validation",
    },

    // MARKETPLACE & PLATFORM
    {
      id: "agent-marketplace",
      title: "🏪 Travel Agent Marketplace",
      category: "Marketplace",
      description: "Platform waar travel agents hun diensten aanbieden en klanten direct kunnen boeken",
      impact: "GAME_CHANGER",
      effort: "HIGH",
      revenue: "Transaction fee 3-8%",
      timeToMarket: "8-12 maanden",
      icon: Globe,
      features: [
        "Agent profiles & ratings",
        "Direct booking system",
        "Commission management",
        "Client matching",
        "Review system",
        "Payment processing",
      ],
      techStack: ["Marketplace Platform", "Payment Gateway", "Rating System", "Matching Algorithm"],
      dataUsed: ["Agent data", "Client preferences", "Booking history", "Performance metrics"],
      marketSize: "€12B (online travel market)",
      competition: "High - Expedia, Booking.com",
      uniqueValue: "Agent-focused + personal service",
    },
    {
      id: "white-label-platform",
      title: "🏷️ White-Label Booking Platform",
      category: "Marketplace",
      description: "Complete white-label oplossing voor travel agencies om hun eigen booking platform te lanceren",
      impact: "HIGH",
      effort: "HIGH",
      revenue: "€199-999/maand + revenue share",
      timeToMarket: "6-8 maanden",
      icon: Rocket,
      features: [
        "Custom branding",
        "Full booking engine",
        "Payment integration",
        "Client management",
        "Reporting dashboard",
        "Mobile responsive",
      ],
      techStack: ["Multi-tenant Architecture", "Custom Theming", "API Integration", "Payment Systems"],
      dataUsed: ["All Travel Compositor data", "Branding assets", "Client data"],
      marketSize: "€2.1B (white-label software)",
      competition: "Medium - generic platforms",
      uniqueValue: "Travel-specific + proven booking engine",
    },

    // NICHE SOLUTIONS
    {
      id: "group-travel-optimizer",
      title: "👥 Group Travel Optimizer",
      category: "Niche Solutions",
      description: "Gespecialiseerde tool voor groepsreizen met budget splitting, voorkeuren matching en planning",
      impact: "MEDIUM",
      effort: "MEDIUM",
      revenue: "€10-50/group booking",
      timeToMarket: "3-4 maanden",
      icon: Users,
      features: [
        "Group preference matching",
        "Budget splitting tools",
        "Voting on activities",
        "Shared itineraries",
        "Group discounts finder",
        "Communication tools",
      ],
      techStack: ["Group Management", "Voting System", "Budget Calculator", "Communication Tools"],
      dataUsed: ["Group bookings", "Activity data", "Pricing", "Availability"],
      marketSize: "€890M (group travel)",
      competition: "Low - underserved market",
      uniqueValue: "First comprehensive group travel tool",
    },
    {
      id: "luxury-concierge-ai",
      title: "💎 Luxury Travel Concierge AI",
      category: "Niche Solutions",
      description: "Premium AI concierge voor luxury travel met exclusieve toegang en persoonlijke service",
      impact: "MEDIUM",
      effort: "MEDIUM",
      revenue: "€100-500/booking premium",
      timeToMarket: "4-5 maanden",
      icon: Star,
      features: [
        "Exclusive venue access",
        "Personal shopper service",
        "VIP treatment coordination",
        "Luxury transport booking",
        "Fine dining reservations",
        "Cultural experience curation",
      ],
      techStack: ["Premium APIs", "Concierge Network", "Luxury Partnerships", "Personal AI"],
      dataUsed: ["Luxury accommodations", "Premium activities", "VIP services", "Client profiles"],
      marketSize: "€180B (luxury travel)",
      competition: "Low - high barrier to entry",
      uniqueValue: "AI + human luxury service combination",
    },

    // EMERGING TECH
    {
      id: "ar-travel-guide",
      title: "🥽 AR Travel Guide",
      category: "Emerging Tech",
      description: "Augmented Reality app die real-time informatie toont over bezienswaardigheden en locaties",
      impact: "MEDIUM",
      effort: "HIGH",
      revenue: "€2-8/user/month",
      timeToMarket: "8-10 maanden",
      icon: Camera,
      features: [
        "AR landmark recognition",
        "Historical overlays",
        "Navigation assistance",
        "Language translation",
        "Photo enhancement",
        "Social sharing",
      ],
      techStack: ["ARKit/ARCore", "Computer Vision", "3D Modeling", "Real-time Rendering"],
      dataUsed: ["Destination data", "Historical info", "Maps", "Points of interest"],
      marketSize: "€2.4B (AR market)",
      competition: "Low - early stage",
      uniqueValue: "Travel-specific AR with booking integration",
    },
    {
      id: "voice-travel-assistant",
      title: "🎤 Voice Travel Assistant",
      category: "Emerging Tech",
      description: "Voice-activated travel assistant voor hands-free booking en trip management",
      impact: "MEDIUM",
      effort: "MEDIUM",
      revenue: "€3-10/user/month",
      timeToMarket: "4-6 maanden",
      icon: MessageSquare,
      features: [
        "Voice booking commands",
        "Hands-free itinerary",
        "Real-time updates",
        "Multi-language support",
        "Smart home integration",
        "Car integration",
      ],
      techStack: ["Speech Recognition", "NLP", "Voice Synthesis", "Smart Device APIs"],
      dataUsed: ["Booking data", "Voice commands", "User preferences", "Real-time info"],
      marketSize: "€1.1B (voice assistant market)",
      competition: "Medium - Alexa, Google",
      uniqueValue: "Travel-specific voice commands + booking access",
    },
  ]

  const categories = ["all", ...Array.from(new Set(opportunities.map((o) => o.category)))]

  const filteredOpportunities = opportunities.filter(
    (opp) => selectedCategory === "all" || opp.category === selectedCategory,
  )

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    if (sortBy === "impact") {
      const impactOrder = { GAME_CHANGER: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact]
    }
    if (sortBy === "effort") {
      const effortOrder = { LOW: 3, MEDIUM: 2, HIGH: 1 }
      return effortOrder[b.effort] - effortOrder[a.effort]
    }
    return 0
  })

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "GAME_CHANGER":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-300"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "LOW":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "HIGH":
        return "bg-red-100 text-red-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "LOW":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "GAME_CHANGER":
        return <Sparkles className="w-4 h-4" />
      case "HIGH":
        return <TrendingUp className="w-4 h-4" />
      case "MEDIUM":
        return <BarChart3 className="w-4 h-4" />
      case "LOW":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold">🚀 Opportunity Matrix</h2>
          <p className="text-gray-600">Alle mogelijkheden met Travel Compositor API data - van AI tot Marketplace</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2">
            <span className="text-sm font-medium">Categorie:</span>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "Alle" : cat}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="text-sm font-medium">Sorteer:</span>
            <Button size="sm" variant={sortBy === "impact" ? "default" : "outline"} onClick={() => setSortBy("impact")}>
              Impact
            </Button>
            <Button size="sm" variant={sortBy === "effort" ? "default" : "outline"} onClick={() => setSortBy("effort")}>
              Effort
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {opportunities.filter((o) => o.impact === "GAME_CHANGER").length}
            </div>
            <div className="text-sm text-gray-600">Game Changers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {opportunities.filter((o) => o.effort === "LOW").length}
            </div>
            <div className="text-sm text-gray-600">Quick Wins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              €
              {opportunities
                .reduce((sum, o) => {
                  const revenue = o.marketSize.match(/€([\d.]+)([BM])/)
                  if (revenue) {
                    const value = Number.parseFloat(revenue[1])
                    const multiplier = revenue[2] === "B" ? 1000 : 1
                    return sum + value * multiplier
                  }
                  return sum
                }, 0)
                .toFixed(0)}
              M
            </div>
            <div className="text-sm text-gray-600">Total Market</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{categories.length - 1}</div>
            <div className="text-sm text-gray-600">Categorieën</div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities Grid */}
      <div className="grid gap-6">
        {sortedOpportunities.map((opportunity) => {
          const Icon = opportunity.icon
          return (
            <Card key={opportunity.id} className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">{opportunity.category}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${getImpactColor(opportunity.impact)} border`}>
                      {getImpactIcon(opportunity.impact)}
                      <span className="ml-1">{opportunity.impact.replace("_", " ")}</span>
                    </Badge>
                    <Badge className={getEffortColor(opportunity.effort)}>
                      <Clock className="w-3 h-3 mr-1" />
                      {opportunity.effort}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700">{opportunity.description}</p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Revenue Model</div>
                    <div className="font-semibold text-green-600">{opportunity.revenue}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Time to Market</div>
                    <div className="font-semibold">{opportunity.timeToMarket}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Market Size</div>
                    <div className="font-semibold text-blue-600">{opportunity.marketSize}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Competition</div>
                    <div className="font-semibold">{opportunity.competition}</div>
                  </div>
                </div>

                {/* Unique Value */}
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="text-sm font-medium text-blue-800">Unique Value Proposition</div>
                  <div className="text-sm text-blue-700">{opportunity.uniqueValue}</div>
                </div>

                <Tabs defaultValue="features" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="tech">Tech Stack</TabsTrigger>
                    <TabsTrigger value="data">Data Used</TabsTrigger>
                    <TabsTrigger value="market">Market</TabsTrigger>
                  </TabsList>

                  <TabsContent value="features" className="mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      {opportunity.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="tech" className="mt-4">
                    <div className="flex gap-2 flex-wrap">
                      {opportunity.techStack.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="data" className="mt-4">
                    <div className="flex gap-2 flex-wrap">
                      {opportunity.dataUsed.map((data) => (
                        <Badge key={data} variant="secondary" className="text-xs">
                          {data}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="market" className="mt-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Market Size:</strong> {opportunity.marketSize}
                      </div>
                      <div>
                        <strong>Competition Level:</strong> {opportunity.competition}
                      </div>
                      <div>
                        <strong>Time to Market:</strong> {opportunity.timeToMarket}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
