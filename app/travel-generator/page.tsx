"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Home, Sparkles } from "lucide-react"
import TravelContentGenerator from "@/components/travel-content-generator"

/** -----------------------------------------------------------------
 *  Travel-Generator landing page
 * ----------------------------------------------------------------- */
export default function TravelGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo + title */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transition-transform hover:scale-105">
              <span className="text-sm font-bold text-white">TG</span>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                Travel Content Generator
              </h1>
              <p className="text-sm text-gray-600">AI-Powered Content Creation</p>
            </div>
          </div>

          {/* Badges / nav */}
          <div className="flex items-center space-x-4">
            <Badge className="flex items-center rounded-full bg-gradient-to-r from-green-500 to-blue-600 px-4 py-2 text-white shadow-lg">
              <Sparkles className="mr-1 h-4 w-4" /> AI Powered
            </Badge>
            <Link href="/agent-dashboard">
              <Button className="flex items-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:-translate-y-[2px] hover:from-blue-600 hover:scale-105 hover:to-purple-700 hover:shadow-2xl">
                <Home className="mr-2 h-4 w-4" /> 🏠 Agent HQ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Core generator (handles slide-panel etc.) ───────────── */}
      <div className="container mx-auto px-6 pb-12">
        <TravelContentGenerator />
      </div>
    </div>
  )
}
