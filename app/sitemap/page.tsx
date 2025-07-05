"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Home,
  Shield,
  Route,
  Bot,
  Upload,
  FileText,
  TestTube,
  MessageCircle,
  Globe,
  Users,
  Brain,
  Hotel,
  MapPin,
  Search,
  BarChart3,
  Crown,
  BookOpen,
  Camera,
  HelpCircle,
  Lock,
  Eye,
  Code,
  Layers,
  Activity,
  PieChart,
  TrendingUp,
  Compass,
  Navigation,
} from "lucide-react"

export default function SitemapPage() {
  const siteStructure = [
    {
      category: "🏠 Hoofdpagina's",
      description: "Primaire gebruikerspagina's",
      pages: [
        {
          title: "Landing Page",
          path: "/",
          description: "Hoofdpagina met AI Travel Studio introductie",
          icon: Home,
          status: "live",
          access: "public",
        },
        {
          title: "Agent Dashboard",
          path: "/agent-dashboard",
          description: "Hoofddashboard voor travel agents",
          icon: Route,
          status: "live",
          access: "agent",
        },
        {
          title: "Master Dashboard",
          path: "/master-dashboard",
          description: "Overzichtsdashboard met alle functionaliteiten",
          icon: Crown,
          status: "live",
          access: "admin",
        },
      ],
    },
    {
      category: "🤖 AI & Content Generatie",
      description: "AI-powered content en travel tools",
      pages: [
        {
          title: "Travel Generator",
          path: "/travel-generator",
          description: "AI content generator voor reisbeschrijvingen",
          icon: FileText,
          status: "live",
          access: "agent",
        },
        {
          title: "Travel Buddy",
          path: "/travelbuddy",
          description: "AI travel assistant voor klanten",
          icon: Bot,
          status: "live",
          access: "public",
        },
        {
          title: "Travel Buddy per Booking",
          path: "/travelbuddy/[bookingId]",
          description: "Persoonlijke AI assistant per boeking",
          icon: Bot,
          status: "live",
          access: "client",
        },
        {
          title: "GPT Builder",
          path: "/gpt-builder",
          description: "Custom GPT configuratie tool",
          icon: Brain,
          status: "live",
          access: "admin",
        },
      ],
    },
    {
      category: "📊 Import & Data Management",
      description: "Data import en synchronisatie tools",
      pages: [
        {
          title: "Reis Import & Generator",
          path: "/agent-booking-import",
          description: "Import bookings van Travel Compositor",
          icon: Upload,
          status: "live",
          access: "agent",
        },
        {
          title: "Import V2",
          path: "/import-v2",
          description: "Verbeterde import functionaliteit",
          icon: Upload,
          status: "live",
          access: "agent",
        },
        {
          title: "Universal Import",
          path: "/universal-import",
          description: "Universele import wizard",
          icon: Upload,
          status: "beta",
          access: "admin",
        },
        {
          title: "Secure User Import",
          path: "/secure-user-import",
          description: "Veilige gebruiker import systeem",
          icon: Shield,
          status: "live",
          access: "admin",
        },
      ],
    },
    {
      category: "📋 Roadbooks & Documenten",
      description: "Reisdocumenten en roadbook generatie",
      pages: [
        {
          title: "Roadbook Universal",
          path: "/roadbook/universal/[id]",
          description: "Universele roadbook template",
          icon: BookOpen,
          status: "live",
          access: "client",
        },
        {
          title: "Roadbook per ID",
          path: "/roadbook/[id]",
          description: "Specifieke roadbook pagina",
          icon: BookOpen,
          status: "live",
          access: "client",
        },
        {
          title: "Offerte Pagina",
          path: "/offerte/[id]",
          description: "Offerte presentatie voor klanten",
          icon: FileText,
          status: "live",
          access: "client",
        },
        {
          title: "Package Offerte",
          path: "/offerte/package-[id]",
          description: "Package offerte pagina",
          icon: FileText,
          status: "live",
          access: "client",
        },
      ],
    },
    {
      category: "💬 Chat & Communicatie",
      description: "Chat interfaces en communicatie tools",
      pages: [
        {
          title: "Chat Demo",
          path: "/chat/demo-toscane-2024",
          description: "Demo chat interface",
          icon: MessageCircle,
          status: "demo",
          access: "public",
        },
        {
          title: "Chat per Slug",
          path: "/chat/[slug]",
          description: "Dynamische chat pagina's",
          icon: MessageCircle,
          status: "live",
          access: "client",
        },
      ],
    },
    {
      category: "🔧 Development & Testing",
      description: "Development tools en test pagina's",
      pages: [
        {
          title: "API Test",
          path: "/test-travel-compositor",
          description: "Travel Compositor API testing",
          icon: TestTube,
          status: "dev",
          access: "dev",
        },
        {
          title: "Debug Travel Compositor",
          path: "/debug-travel-compositor",
          description: "API debugging interface",
          icon: TestTube,
          status: "dev",
          access: "dev",
        },
        {
          title: "Test Booking Search",
          path: "/test-booking-search",
          description: "Booking search testing",
          icon: Search,
          status: "dev",
          access: "dev",
        },
        {
          title: "Analyze Booking Data",
          path: "/analyze-booking-data",
          description: "Booking data analysis tool",
          icon: BarChart3,
          status: "dev",
          access: "dev",
        },
        {
          title: "Debug Endpoints",
          path: "/discover-endpoints",
          description: "API endpoint discovery",
          icon: Compass,
          status: "dev",
          access: "dev",
        },
      ],
    },
    {
      category: "🏨 Travel Services",
      description: "Hotel, transport en activity management",
      pages: [
        {
          title: "Test Rich Hotel Data",
          path: "/test-rich-hotel-data",
          description: "Hotel data testing interface",
          icon: Hotel,
          status: "dev",
          access: "dev",
        },
        {
          title: "Test Rich Destination Data",
          path: "/test-rich-destination-data",
          description: "Destination data testing",
          icon: MapPin,
          status: "dev",
          access: "dev",
        },
        {
          title: "Find Activity Images",
          path: "/find-activity-images",
          description: "Activity image discovery",
          icon: Camera,
          status: "dev",
          access: "dev",
        },
      ],
    },
    {
      category: "👥 User Management",
      description: "Gebruikersbeheer en profielen",
      pages: [
        {
          title: "User Dashboard",
          path: "/user-dashboard",
          description: "Gebruiker dashboard",
          icon: Users,
          status: "live",
          access: "user",
        },
        {
          title: "Agent Profile",
          path: "/agent-profile/[id]",
          description: "Agent profiel pagina",
          icon: Users,
          status: "beta",
          access: "agent",
        },
        {
          title: "Agent Onboarding",
          path: "/agent-onboarding",
          description: "Agent onboarding wizard",
          icon: Users,
          status: "beta",
          access: "new-agent",
        },
      ],
    },
    {
      category: "📈 Analytics & Monitoring",
      description: "Analytics en performance monitoring",
      pages: [
        {
          title: "Demo Dashboard",
          path: "/demo-dashboard",
          description: "Demo analytics dashboard",
          icon: PieChart,
          status: "demo",
          access: "admin",
        },
        {
          title: "Webhook Dashboard",
          path: "/webhook-dashboard",
          description: "Webhook monitoring dashboard",
          icon: Activity,
          status: "live",
          access: "admin",
        },
      ],
    },
    {
      category: "ℹ️ Informatie & Support",
      description: "Help, privacy en algemene informatie",
      pages: [
        {
          title: "Help & Support",
          path: "/help",
          description: "Help documentatie en support",
          icon: HelpCircle,
          status: "live",
          access: "public",
        },
        {
          title: "Privacy Policy",
          path: "/privacy",
          description: "Privacy beleid en GDPR informatie",
          icon: Lock,
          status: "live",
          access: "public",
        },
        {
          title: "Over Ons",
          path: "/about",
          description: "Over AI Travel Studio",
          icon: Eye,
          status: "live",
          access: "public",
        },
        {
          title: "Algemene Voorwaarden",
          path: "/terms",
          description: "Terms of service",
          icon: FileText,
          status: "live",
          access: "public",
        },
      ],
    },
    {
      category: "⚙️ Admin & Control",
      description: "Administratie en controle panelen",
      pages: [
        {
          title: "Control Center",
          path: "/admin/control-center",
          description: "Hoofdcontrole paneel voor super admins",
          icon: Shield,
          status: "live",
          access: "super-admin",
        },
        {
          title: "Admin Login",
          path: "/admin-login",
          description: "Admin authenticatie pagina",
          icon: Lock,
          status: "live",
          access: "public",
        },
      ],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-100 text-green-800"
      case "beta":
        return "bg-blue-100 text-blue-800"
      case "dev":
        return "bg-yellow-100 text-yellow-800"
      case "demo":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAccessColor = (access: string) => {
    switch (access) {
      case "public":
        return "bg-green-100 text-green-800"
      case "client":
        return "bg-blue-100 text-blue-800"
      case "agent":
        return "bg-orange-100 text-orange-800"
      case "admin":
        return "bg-red-100 text-red-800"
      case "super-admin":
        return "bg-purple-100 text-purple-800"
      case "dev":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalPages = siteStructure.reduce((total, category) => total + category.pages.length, 0)
  const livePages = siteStructure.reduce(
    (total, category) => total + category.pages.filter((page) => page.status === "live").length,
    0,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Navigation className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Travel Studio - Sitemap
                </h1>
                <p className="text-sm text-gray-600">Overzicht van alle pagina's en functionaliteiten</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                {livePages} van {totalPages} pagina's live
              </Badge>
              <Link href="/agent-dashboard">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 px-6 py-3">
                  <Home className="w-4 h-4 mr-2" />🏠 Agent HQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white rounded-3xl shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 flex justify-between">
              <div>
                <p className="text-sm text-gray-600">Totaal Pagina's</p>
                <p className="text-2xl font-bold">{totalPages}</p>
                <p className="text-sm text-green-600">Volledig functioneel</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-3xl shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 flex justify-between">
              <div>
                <p className="text-sm text-gray-600">Live Pagina's</p>
                <p className="text-2xl font-bold">{livePages}</p>
                <p className="text-sm text-green-600">Productie ready</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-3xl shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 flex justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorieën</p>
                <p className="text-2xl font-bold">{siteStructure.length}</p>
                <p className="text-sm text-blue-600">Georganiseerd</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-3xl shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 flex justify-between">
              <div>
                <p className="text-sm text-gray-600">API Endpoints</p>
                <p className="text-2xl font-bold">150+</p>
                <p className="text-sm text-orange-600">Travel Compositor</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Site Structure */}
        <div className="space-y-8">
          {siteStructure.map((category) => (
            <Card key={category.category} className="bg-white rounded-3xl shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-3xl">
                <CardTitle className="text-xl">{category.category}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.pages.map((page) => {
                    const IconComponent = page.icon
                    return (
                      <div
                        key={page.path}
                        className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:shadow-lg group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(page.status)}>{page.status}</Badge>
                            <Badge className={getAccessColor(page.access)}>{page.access}</Badge>
                          </div>
                        </div>

                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {page.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-3">{page.description}</p>

                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-white px-2 py-1 rounded border text-gray-700">{page.path}</code>

                          {page.status === "live" && !page.path.includes("[") && (
                            <Link href={page.path}>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105"
                              >
                                Bezoeken
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Navigation */}
        <Card className="bg-white rounded-3xl shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-3xl">
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5" />
              Snelle Navigatie
            </CardTitle>
            <CardDescription className="text-blue-100">Direct naar de belangrijkste pagina's</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "🏠 Agent HQ", path: "/agent-dashboard", color: "from-blue-500 to-purple-600" },
                { title: "🤖 Travel Generator", path: "/travel-generator", color: "from-green-500 to-blue-600" },
                { title: "📊 Import Tool", path: "/import-v2", color: "from-orange-500 to-red-600" },
                { title: "⚙️ Control Center", path: "/admin/control-center", color: "from-purple-500 to-pink-600" },
              ].map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    className={`w-full bg-gradient-to-r ${item.color} hover:shadow-2xl text-white rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 p-4 h-auto`}
                  >
                    {item.title}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
