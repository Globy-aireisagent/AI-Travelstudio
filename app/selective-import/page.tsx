import SelectiveImportInterface from "@/components/selective-import-interface"

export default function SelectiveImportPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Selective Travel Import</h1>
          <p className="text-gray-600 mt-2">
            Import specific bookings, travel ideas, and holiday packages by ID instead of bulk importing everything
          </p>
        </div>

        <SelectiveImportInterface />
      </div>
    </div>
  )
}
