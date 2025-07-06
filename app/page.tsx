import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, FileText, Bot, Globe, ArrowRight, Sparkles, CreditCard, MousePointer } from "lucide-react"

export default function Home() {
  const coreFeatures = [
    {
      icon: <FileText className="h-10 w-10" />,
      title: "Roadbooks",
      description: "Professionele roadbooks in 30 seconden. Upload booking → Klaar!",
      href: "/roadbook/universal/demo",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      badge: "🚀 Super Snel",
      highlight: true,
    },
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: "Offertes",
      description: "Mooie offertes maken was nog nooit zo makkelijk",
      href: "/offerte/demo",
      color: "bg-gradient-to-r from-green-500 to-green-600",
      badge: "💰 Meer Sales",
      highlight: true,
    },
    {
      icon: <Sparkles className="h-10 w-10" />,
      title: "Voucher Systeem",
      description: "Digitale vouchers en betalingen - alles geautomatiseerd",
      href: "/vouchers",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      badge: "🎫 Digitaal",
      highlight: true,
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: "Websites",
      description: "Je eigen reiswebsite in 5 minuten online",
      href: "/websites",
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      badge: "🌐 Instant",
      highlight: true,
    },
  ]

  const aiFeatures = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI Reisbuddy",
      description: "24/7 chatbot die al je klantenvragen beantwoordt",
      href: "/travelbuddy",
      color: "bg-gradient-to-r from-pink-500 to-pink-600",
      badge: "🤖 AI Powered",
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Tekst Generator",
      description: "Perfecte reisteksten in elke stijl - automatisch",
      href: "/travel-generator",
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      badge: "✍️ Auto Content",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Travel Studio
                </h1>
                <p className="text-sm text-gray-600">Kip simpel. Kip snel. Kip goed.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/agent-dashboard">
                <Button
                  variant="outline"
                  className="rounded-xl shadow-sm hover:shadow-md transition-all bg-transparent"
                >
                  Inloggen
                </Button>
              </Link>
              <Link href="/super-admin">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Gratis Proberen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 text-lg rounded-full shadow-lg">
              <MousePointer className="h-5 w-5 mr-2" />
              Kip Simpel Te Gebruiken!
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Roadbooks, Offertes & Websites
            </h1>

            <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-semibold">🚀 In 30 seconden klaar!</p>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Upload je booking → AI maakt automatisch je roadbook, offerte en website.
              <br />
              <strong>Geen gedoe, geen technische kennis nodig!</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/roadbook/universal/demo">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xl px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  🚀 Probeer Nu Gratis <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl px-10 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-transparent"
                >
                  📺 Bekijk Demo (2 min)
                </Button>
              </Link>
            </div>

            {/* Beautiful Modern Benefits Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <MousePointer className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">Kip Simpel</h3>
                    <p className="text-gray-600">Geen technische kennis nodig</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-green-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">Altijd Bereikbaar</h3>
                    <p className="text-gray-600">24/7 in je browser</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">Direct Resultaat</h3>
                    <p className="text-gray-600">Meteen zichtbaar</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-orange-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ArrowRight className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">Geen Installatie</h3>
                    <p className="text-gray-600">Direct aan de slag</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-pink-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">Auto Updates</h3>
                    <p className="text-gray-600">Altijd de nieuwste versie</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-indigo-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Plane className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">Alles Inbegrepen</h3>
                    <p className="text-gray-600">Complete oplossing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features - HOOFDFOCUS */}
      <section className="py-20 px-4 bg-white/70">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              🎯 Dit krijg je allemaal
            </h2>
            <p className="text-2xl text-gray-600 font-semibold">Alles wat je nodig hebt voor je reisbureau</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {coreFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-0 bg-white rounded-3xl shadow-xl h-full overflow-hidden">
                  <CardHeader className="pb-6 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`p-5 rounded-3xl ${feature.color} text-white group-hover:scale-110 transition-transform duration-300 shadow-xl`}
                      >
                        {feature.icon}
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-sm px-4 py-2 rounded-full shadow-sm">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors mb-3">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <CardDescription className="text-gray-700 text-lg leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features - Secundair */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">🤖 Plus: AI Assistenten</h2>
            <p className="text-xl text-gray-600">Automatische hulp die nooit slaapt</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {aiFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white rounded-3xl shadow-xl overflow-hidden">
                  <CardHeader className="pb-4 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-4 rounded-2xl ${feature.color} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      >
                        {feature.icon}
                      </div>
                      <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full shadow-sm">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <CardDescription className="text-gray-600 text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Simplicity Focus */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">🐣 Zo Simpel Als Een Eitje!</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center bg-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">1️⃣</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Upload Booking</h3>
                <p className="text-blue-100 text-lg">Sleep je PDF erin</p>
              </div>

              <div className="text-center bg-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">2️⃣</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">AI Doet De Rest</h3>
                <p className="text-blue-100 text-lg">30 seconden wachten</p>
              </div>

              <div className="text-center bg-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">3️⃣</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Klaar!</h3>
                <p className="text-blue-100 text-lg">Roadbook, offerte & website</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-4xl font-bold mb-2 text-blue-600">500+</div>
              <div className="text-gray-600">Roadbooks Gemaakt</div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-4xl font-bold mb-2 text-green-600">30 sec</div>
              <div className="text-gray-600">Gemiddelde Tijd</div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-4xl font-bold mb-2 text-purple-600">50+</div>
              <div className="text-gray-600">Tevreden Bureaus</div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-4xl font-bold mb-2 text-orange-600">24/7</div>
              <div className="text-gray-600">Beschikbaar</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🚀 Klaar om te beginnen?
            </h2>
            <p className="text-xl text-gray-600 mb-8">Probeer het 14 dagen gratis. Geen creditcard nodig!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/roadbook/universal/demo">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xl px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  🎉 Start Gratis Trial <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl px-10 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-transparent"
                >
                  📞 Bel Ons (Gratis)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Plane className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">AI-Travel Studio</span>
              </div>
              <p className="text-gray-400">Kip simpel. Kip snel. Kip goed.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Hoofdfuncties</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/roadbook/universal/demo" className="hover:text-white">
                    🚀 Roadbooks
                  </Link>
                </li>
                <li>
                  <Link href="/offertes" className="hover:text-white">
                    💰 Offertes
                  </Link>
                </li>
                <li>
                  <Link href="/vouchers" className="hover:text-white">
                    🎫 Vouchers
                  </Link>
                </li>
                <li>
                  <Link href="/websites" className="hover:text-white">
                    🌐 Websites
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">AI Assistenten</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/travelbuddy" className="hover:text-white">
                    🤖 Reisbuddy
                  </Link>
                </li>
                <li>
                  <Link href="/travel-generator" className="hover:text-white">
                    ✍️ Tekst Generator
                  </Link>
                </li>
                <li>
                  <Link href="/agent-dashboard" className="hover:text-white">
                    📊 Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    📚 Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    📞 Contact
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-white">
                    📺 Demo
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI-Travel Studio. Kip simpel voor reisbureaus.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
