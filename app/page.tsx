import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, FileText, Upload, Users, Sparkles, ArrowRight, Plane, MapPin, Calendar, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Travel Studio
                </h1>
                <p className="text-sm text-gray-600">Professional Travel Planning</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/agent-dashboard">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Users className="h-4 w-4 mr-2" />
                  Agent Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6 text-lg">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Travel Solutions
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              De Toekomst van{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reisplanning
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Professionele AI-tools voor reisagenten. Genereer content, beheer klanten, en creëer onvergetelijke
              reiservaringen met de kracht van kunstmatige intelligentie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/agent-dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Start als Agent
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/sitemap">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl px-8 py-4 text-lg font-semibold border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 bg-transparent"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Verken Platform
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Krachtige AI-Tools voor Professionals</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Alles wat je nodig hebt om je reisbusiness naar het volgende niveau te tillen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Content Generator */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-0 bg-white rounded-3xl shadow-xl overflow-hidden">
              <CardHeader className="p-8 pb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FileText className="h-8 w-8" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full shadow-sm">
                    🤖 AI Powered
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors mb-3">
                  Travel Content Generator
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Genereer bestemmingsteksten, routes, dagplanningen en hotel aanbevelingen met AI
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <Link href="/travel-generator">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 rounded-2xl py-6 text-lg font-semibold shadow-lg">
                    Open Tool <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Travel Buddy */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-0 bg-white rounded-3xl shadow-xl overflow-hidden">
              <CardHeader className="p-8 pb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Bot className="h-8 w-8" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full shadow-sm">
                    💬 Chat AI
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors mb-3">
                  Travel Buddy Admin
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Beheer AI chatbots voor je klanten en configureer intake formulieren
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <Link href="/travelbuddy">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 rounded-2xl py-6 text-lg font-semibold shadow-lg">
                    Open Tool <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Import Center */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-0 bg-white rounded-3xl shadow-xl overflow-hidden">
              <CardHeader className="p-8 pb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Upload className="h-8 w-8" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full shadow-sm">
                    📥 Import
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors mb-3">
                  Travel Import & Generator
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Importeer bookings en travel ideas uit Travel Compositor met alle content
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <Link href="/import">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 rounded-2xl py-6 text-lg font-semibold shadow-lg">
                    Open Tool <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">500+</div>
              <div className="text-gray-600">Actieve Agenten</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">10K+</div>
              <div className="text-gray-600">Gegenereerde Roadbooks</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">2K+</div>
              <div className="text-gray-600">AI Travel Buddies</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">4.9/5</div>
              <div className="text-gray-600">Gebruiker Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Klaar om je Reisbusiness te Transformeren?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Sluit je aan bij honderden professionals die al gebruik maken van AI Travel Studio
            </p>
            <Link href="/agent-dashboard">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 rounded-2xl px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Start Nu Gratis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Plane className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold">AI Travel Studio</span>
              </div>
              <p className="text-gray-400">De toekomst van professionele reisplanning met AI</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/agent-dashboard" className="hover:text-white transition-colors">
                    Agent Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/travel-generator" className="hover:text-white transition-colors">
                    Content Generator
                  </Link>
                </li>
                <li>
                  <Link href="/travelbuddy" className="hover:text-white transition-colors">
                    Travel Buddy
                  </Link>
                </li>
                <li>
                  <Link href="/import" className="hover:text-white transition-colors">
                    Import Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Over Ons
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap" className="hover:text-white transition-colors">
                    Sitemap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Voorwaarden
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AI Travel Studio. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
