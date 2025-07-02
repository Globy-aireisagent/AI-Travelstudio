"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, Link, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DocumentUploadProps {
  onDocumentsUploaded: (documents: any[]) => void
}

export default function DocumentUpload({ onDocumentsUploaded }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [urls, setUrls] = useState<string[]>([""])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const addUrlField = () => {
    setUrls((prev) => [...prev, ""])
  }

  const updateUrl = (index: number, value: string) => {
    setUrls((prev) => prev.map((url, i) => (i === index ? value : url)))
  }

  const removeUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    setUploading(true)

    try {
      const documents = []

      // Process files
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          documents.push({
            type: "file",
            name: file.name,
            contentType: file.type,
            url: result.url,
            size: file.size,
          })
        }
      }

      // Process URLs
      const validUrls = urls.filter((url) => url.trim() !== "")
      for (const url of validUrls) {
        documents.push({
          type: "url",
          name: url,
          url: url,
        })
      }

      onDocumentsUploaded(documents)
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const totalDocuments = files.length + urls.filter((url) => url.trim() !== "").length

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div>
        <Label htmlFor="file-upload" className="text-base font-medium">
          Bevestiging PDF en andere documenten
        </Label>
        <div className="mt-2">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">Klik om bestanden te uploaden of sleep ze hierheen</p>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT (max 10MB per bestand)</p>
            </div>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div>
          <Label className="text-base font-medium">Geüploade bestanden</Label>
          <div className="mt-2 space-y-2">
            {files.map((file, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* URL Input */}
      <div>
        <Label className="text-base font-medium">Webpagina's toevoegen</Label>
        <div className="mt-2 space-y-3">
          {urls.map((url, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  className="pl-10"
                />
              </div>
              {urls.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeUrl(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addUrlField} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Nog een URL toevoegen
          </Button>
        </div>
      </div>

      {/* Upload Button */}
      {totalDocuments > 0 && (
        <div>
          <Alert>
            <AlertDescription>{totalDocuments} document(en) klaar om te uploaden</AlertDescription>
          </Alert>

          <Button onClick={handleUpload} disabled={uploading} className="w-full mt-4" size="lg">
            {uploading ? "Uploaden..." : `${totalDocuments} Document(en) Uploaden`}
          </Button>
        </div>
      )}
    </div>
  )
}
