"use client"

import ClientOnly from "@/components/client-only"
import SitemapContent from "@/components/sitemap-content"

export default function SitemapPage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Sitemap laden...</p>
          </div>
        </div>
      }
    >
      <SitemapContent />
    </ClientOnly>
  )
}
