import SelectiveImportInterface from "@/components/selective-import-interface"

export default function SelectiveImportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Selective Travel Import</h1>
          <p className="text-xl text-gray-600">Import specific bookings, ideas, and packages by ID</p>
        </div>

        <SelectiveImportInterface />
      </div>
    </div>
  )
}
