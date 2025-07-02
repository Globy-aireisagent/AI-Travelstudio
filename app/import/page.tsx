"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ImportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [importType, setImportType] = useState("product") // Default to 'product'
  const router = useRouter()

  const handleImport = async () => {
    try {
      if (importType === "product") {
        const response = await fetch("/api/import-product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: searchQuery,
          }),
        })

        const result = await response.json()

        if (result.success) {
          alert("Product imported successfully!")
        } else {
          throw new Error(result.error || "Failed to import product")
        }
      } else if (importType === "holiday-package") {
        const response = await fetch("/api/import-holiday-package", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            packageId: searchQuery,
          }),
        })

        const result = await response.json()

        if (result.success && result.data) {
          // Store the holiday package data in localStorage
          localStorage.setItem("importedHolidayPackage", JSON.stringify(result.data))

          // Redirect to package werkblad
          router.push("/package-werkblad")
          return
        } else {
          throw new Error(result.error || "Failed to import holiday package")
        }
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div>
      <h1>Import</h1>
      <div>
        <label htmlFor="importType">Import Type:</label>
        <select id="importType" value={importType} onChange={(e) => setImportType(e.target.value)}>
          <option value="product">Product</option>
          <option value="holiday-package">Holiday Package</option>
        </select>
      </div>
      <input type="text" placeholder="Enter ID" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <button onClick={handleImport}>Import</button>
    </div>
  )
}
