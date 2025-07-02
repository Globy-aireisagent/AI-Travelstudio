"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, Upload, X, Settings, Eye, EyeOff } from "lucide-react"

interface VideoHeaderProps {
  isAdminMode?: boolean
  videoUrl?: string
  onVideoUpdate?: (videoData: any) => void
}

export default function VideoHeader({ isAdminMode = false, videoUrl = "", onVideoUpdate }: VideoHeaderProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showVideo, setShowVideo] = useState(!!videoUrl)
  const [uploadedVideo, setUploadedVideo] = useState(videoUrl)
  const [isUploading, setIsUploading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleVideoUpload = async (file: File) => {
    setIsUploading(true)

    try {
      // Create object URL for preview
      const videoUrl = URL.createObjectURL(file)
      setUploadedVideo(videoUrl)
      setShowVideo(true)

      // In real app, upload to storage service
      const formData = new FormData()
      formData.append("video", file)

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (onVideoUpdate) {
        onVideoUpdate({
          url: videoUrl,
          name: file.name,
          size: file.size,
          type: file.type,
        })
      }
    } catch (error) {
      console.error("Video upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      handleVideoUpload(file)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const removeVideo = () => {
    setUploadedVideo("")
    setShowVideo(false)
    setIsPlaying(false)
    if (onVideoUpdate) {
      onVideoUpdate(null)
    }
  }

  if (isAdminMode) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Header Video</h3>
              <p className="text-sm text-gray-600">Voeg een persoonlijke video toe aan je reisbuddy</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowVideo(!showVideo)}>
                {showVideo ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showVideo ? "Verberg" : "Toon"} Video
              </Button>
            </div>
          </div>

          {!uploadedVideo ? (
            <div>
              <Label className="text-base font-medium mb-3 block">🎥 Video Uploaden</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div>
                  <p className="text-lg font-medium mb-2">Sleep je video hierheen</p>
                  <p className="text-sm text-gray-500 mb-1">of klik om te uploaden</p>
                  <p className="text-xs text-gray-400">MP4, MOV, AVI (max 100MB)</p>
                </div>
                {isUploading && (
                  <div className="mt-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-blue-600 mt-2">Video uploaden...</p>
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Tips voor je video:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Houd het kort (30-60 seconden)</li>
                  <li>• Stel jezelf voor als reisagent</li>
                  <li>• Vertel kort over de reis</li>
                  <li>• Zorg voor goede audio kwaliteit</li>
                  <li>• Gebruik een professionele achtergrond</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {showVideo && (
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    src={uploadedVideo}
                    className="w-full h-64 object-cover"
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    poster="/placeholder.svg?height=256&width=800&text=Video+Preview"
                  />

                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                      <Button size="sm" variant="secondary" onClick={togglePlay} className="bg-white/90 hover:bg-white">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>

                      <Button size="sm" variant="secondary" onClick={toggleMute} className="bg-white/90 hover:bg-white">
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Remove Video Button */}
                  <Button size="sm" variant="destructive" onClick={removeVideo} className="absolute top-2 right-2">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">Video succesvol geüpload!</p>
                    <p className="text-sm text-green-700">Je klanten zien deze video in de header</p>
                  </div>
                </div>
                <Badge className="bg-green-600">Actief</Badge>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Andere Video
                </Button>
                <Button variant="outline" onClick={() => setShowVideo(!showVideo)} className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  {showVideo ? "Verberg" : "Toon"} Preview
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Client view
  if (!showVideo || !uploadedVideo) {
    return null
  }

  return (
    <div className="relative mb-6 rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={uploadedVideo}
        className="w-full h-48 md:h-64 object-cover"
        muted={isMuted}
        autoPlay
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        poster="/placeholder.svg?height=256&width=800&text=Welkom+Video"
      />

      {/* Video Overlay with Welcome Message */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Welkom bij je persoonlijke reisbuddy! 👋</h2>
          <p className="text-sm md:text-base opacity-90">Je reisagent heeft een speciale boodschap voor je...</p>
        </div>
      </div>

      {/* Minimal Controls */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={toggleMute}
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}
