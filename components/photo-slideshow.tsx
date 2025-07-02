"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

interface Photo {
  id: string
  url: string
  alt: string
  source: string
}

interface PhotoSlideshowProps {
  location: string
  photos?: Photo[]
  isEditing?: boolean
  onPhotosChange?: (photos: Photo[]) => void
}

export default function PhotoSlideshow({
  location,
  photos = [],
  isEditing = false,
  onPhotosChange,
}: PhotoSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos)
  const [isLoading, setIsLoading] = useState(false)

  // Auto-fetch photos when location changes
  useEffect(() => {
    if (location && localPhotos.length === 0) {
      fetchPhotosForLocation(location)
    }
  }, [location])

  const fetchPhotosForLocation = async (locationName: string) => {
    setIsLoading(true)
    try {
      // Simulate API call to Unsplash/Pixabay
      const mockPhotos: Photo[] = [
        {
          id: "1",
          url: `/placeholder.svg?height=300&width=500&text=${encodeURIComponent(locationName + " - Historic Center")}`,
          alt: `${locationName} Historic Center`,
          source: "Unsplash",
        },
        {
          id: "2",
          url: `/placeholder.svg?height=300&width=500&text=${encodeURIComponent(locationName + " - Architecture")}`,
          alt: `${locationName} Architecture`,
          source: "Pixabay",
        },
        {
          id: "3",
          url: `/placeholder.svg?height=300&width=500&text=${encodeURIComponent(locationName + " - Street View")}`,
          alt: `${locationName} Street View`,
          source: "Google Maps",
        },
      ]

      setLocalPhotos(mockPhotos)
      onPhotosChange?.(mockPhotos)
    } catch (error) {
      console.error("Error fetching photos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % localPhotos.length)
  }

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + localPhotos.length) % localPhotos.length)
  }

  const removePhoto = (index: number) => {
    const newPhotos = localPhotos.filter((_, i) => i !== index)
    setLocalPhotos(newPhotos)
    onPhotosChange?.(newPhotos)
    if (currentIndex >= newPhotos.length) {
      setCurrentIndex(Math.max(0, newPhotos.length - 1))
    }
  }

  const addCustomPhoto = () => {
    const url = prompt("Voer foto URL in:")
    if (url) {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url,
        alt: `${location} - Custom`,
        source: "Custom",
      }
      const newPhotos = [...localPhotos, newPhoto]
      setLocalPhotos(newPhotos)
      onPhotosChange?.(newPhotos)
    }
  }

  if (isLoading) {
    return (
      <div className="relative h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Foto's laden voor {location}...</p>
        </div>
      </div>
    )
  }

  if (localPhotos.length === 0) {
    return (
      <div className="relative h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Geen foto's beschikbaar</p>
          {isEditing && (
            <Button size="sm" onClick={addCustomPhoto}>
              <Plus className="w-4 h-4 mr-2" />
              Foto Toevoegen
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Main Photo */}
      <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={localPhotos[currentIndex]?.url || "/placeholder.svg"}
          alt={localPhotos[currentIndex]?.alt}
          fill
          className="object-cover"
        />

        {/* Navigation Arrows */}
        {localPhotos.length > 1 && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevPhoto}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextPhoto}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Photo Counter */}
        {localPhotos.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {localPhotos.length}
          </div>
        )}

        {/* Source Badge */}
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          📸 {localPhotos[currentIndex]?.source}
        </div>

        {/* Edit Controls */}
        {isEditing && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={addCustomPhoto}
            >
              <Plus className="w-4 h-4" />
            </Button>
            {localPhotos.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => removePhoto(currentIndex)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {localPhotos.length > 1 && (
        <div className="flex space-x-2 mt-2 overflow-x-auto pb-2">
          {localPhotos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors ${
                index === currentIndex ? "border-blue-500" : "border-gray-200"
              }`}
            >
              <Image
                src={photo.url || "/placeholder.svg"}
                alt={photo.alt}
                width={64}
                height={48}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Photo Info */}
      <p className="text-xs text-gray-500 mt-1">{localPhotos[currentIndex]?.alt}</p>
    </div>
  )
}
