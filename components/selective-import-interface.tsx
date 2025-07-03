"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Download, Package, Calendar, Lightbulb } from "lucide-react"

export default function SelectiveImportInterface() {
  const [selectedType, setSelectedType] = useState<"booking" | "idea" | "package">("booking")
  const [itemId, setItemId] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [importedData, setImportedData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/selective-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "search",
          type: selectedType,
          searchTerm: searchTerm.trim(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSearchResults(result.results)
        setMessage(`Found ${result.results.length} ${selectedType}s`)
      } else {
        setMessage(`Search failed: ${result.error}`)
        setSearchResults([])
      }
    } catch (error) {
      setMessage("Search failed")
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async (id?: string) => {
    const targetId = id || itemId.trim()
    if (!targetId) return

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/selective-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          type: selectedType,
          id: targetId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setImportedData(result.data)
        setMessage(`✅ Successfully imported ${selectedType} ${targetId}`)
      } else {
        setMessage(`❌ Import failed: ${result.error}`)
        setImportedData(null)
      }
    } catch (error) {
      setMessage("❌ Import failed")
      setImportedData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4" />
      case "idea":
        return <Lightbulb className="h-4 w-4" />
      case "package":
        return <Package className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Import Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Selective Import
          </CardTitle>
          <CardDescription>Import specific items by ID instead of bulk importing everything</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Booking
                    </div>
                  </SelectItem>
                  <SelectItem value="idea">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Travel Idea
                    </div>
                  </SelectItem>
                  <SelectItem value="package">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Holiday Package
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Item ID</label>
              <Input
                placeholder={`Enter ${selectedType} ID (e.g. 2425367)`}
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={() => handleImport()} disabled={isLoading || !itemId.trim()} className="w-full">
                {isLoading ? "Importing..." : `Import ${selectedType}`}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="border-t pt-4">
            <label className="text-sm font-medium">Or Search First</label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder={`Search ${selectedType}s...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading || !searchTerm.trim()} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg ${message.includes("✅") ? "bg-green-50 text-green-800" : message.includes("❌") ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-800"}`}
            >
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>Click "Import" to import a specific item</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {searchResults.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getIcon(selectedType)}
                      <div>
                        <p className="font-medium">{item.id || item.reference || `Item ${index + 1}`}</p>
                        <p className="text-sm text-gray-600">
                          {item.name || item.title || item.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleImport(item.id || item.reference)} disabled={isLoading}>
                      Import
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Imported Data */}
      {importedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getIcon(selectedType)}
              Imported {selectedType}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(importedData, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
