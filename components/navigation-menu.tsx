"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Route,
  Shield,
  MessageCircle,
  TestTube,
  Globe,
  FileText,
  Bot,
  Upload,
  Home,
} from "lucide-react"

export default function NavigationMenu() {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "🏠 Agent HQ",
      href: "/agent-dashboard",
      icon: Home,
      badge: "Home",
      className: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700",
    },
    {
      title: "Master Dashboard",
      href: "/master-dashboard",
      icon: LayoutDashboard,
      badge: "Overzicht",
    },
    {
      title: "Landing Page",
      href: "/",
      icon: Globe,
      badge: "Public",
    },
    {
      title: "Agent Dashboard",
      href: "/agent-dashboard",
      icon: Route,
      badge: "Agent",
    },
    {
      title: "Travel Generator",
      href: "/travel-generator",
      icon: FileText,
      badge: "Content",
    },
    {
      title: "Travel Buddy",
      href: "/travelbuddy",
      icon: Bot,
      badge: "Buddy",
    },
    {
      title: "Reis Import & Generator",
      href: "/agent-booking-import",
      icon: Upload,
      badge: "Import",
    },
    {
      title: "Super Admin",
      href: "/super-admin",
      icon: Shield,
      badge: "Super",
    },
    {
      title: "Chat Demo",
      href: "/chat/demo-toscane-2024",
      icon: MessageCircle,
      badge: "Demo",
    },
    {
      title: "API Test",
      href: "/test-travel-compositor",
      icon: TestTube,
      badge: "Dev",
    },
  ]

  return (
    <nav className="fixed top-4 left-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-2 space-y-1">
        <div className="text-xs font-medium text-gray-500 px-3 py-1">Navigation</div>
        {menuItems.map((item) => {
          const IconComponent = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start text-left ${item.className || ""}`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                <span className="truncate">{item.title}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
