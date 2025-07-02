"use client"

import type React from "react"

import { useParams } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, MicOff, Send, Bot, User, Upload, Route, Menu, X } from "lucide-react"
import VideoHeader from "@/components/video-header"
import ExtendedIntakeForm from "@/components/extended-intake-form"

export default function MobileChatbot() {
  const params = useParams()
  const slug = params.slug as string

  const [showIntake, setShowIntake] = useState(true)
  const [intakeData, setIntakeData] = useState<any>({})
  const [isRecording, setIsRecording] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Extract customer info from slug
  const customerInfo = {
    name: slug
      .split("-")
      .slice(0, 2)
      .join(" ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    destination: slug.split("-")[2]?.replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown",
    year: slug.split("-")[3] || "2024",
  }

  // Simulate video data from reisagent
  const headerVideoUrl = "/placeholder.svg?height=256&width=800&text=Welkom+Video"

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hoi ${customerInfo.name}! 👋

Ik ben jouw persoonlijke reisbuddy voor je ${customerInfo.destination} avontuur! Je reisagent heeft me speciaal voor jullie ingesteld met alle details van jullie reis.

Ik ga met jullie mee op reis en kan helpen met:
🗺️ Route tips en shortcuts onderweg  
🍽️ Restaurant tips waar jullie nu zijn
⛽ Tankstops en rustplaatsen in de buurt
🎯 Leuke dingen om te doen vandaag
📱 Praktische info en noodcontacten
🚗 Verkeer en wegomstandigheden

Vraag me alles - ik ben er voor jullie! 🌟`,
      },
    ],
    body: {
      customerSlug: slug,
      customerInfo: customerInfo,
      intakeData: intakeData,
    },
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowIntake(false)
    // Here you would save intake data to your backend
  }

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, index) => (
      <p key={index} className={line.trim() === "" ? "mb-2" : "mb-1"}>
        {line}
      </p>
    ))
  }

  if (showIntake) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Route className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold truncate">Reis Voorbereiding</h1>
                <p className="text-sm text-gray-600 truncate">
                  {customerInfo.destination} • {customerInfo.year}
                </p>
              </div>
            </div>
          </div>
        </header>

        <VideoHeader videoUrl={headerVideoUrl} isAdminMode={false} />

        <div className="px-4 py-6">
          <ExtendedIntakeForm
            onComplete={(data) => {
              setIntakeData(data)
              setShowIntake(false)
            }}
            uploadedDocuments={[]}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Route className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold truncate">Jouw Persoonlijke Reisbuddy</h1>
                <p className="text-sm text-gray-600 truncate">
                  {customerInfo.destination} • {customerInfo.year}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowMenu(!showMenu)}>
              {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {showMenu && (
          <div className="border-t bg-white px-4 py-3 space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setShowIntake(true)}>
              <User className="w-4 h-4 mr-2" />
              Bewerk Voorkeuren
            </Button>
          </div>
        )}
      </header>

      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 px-4 py-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`flex-1 max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-900 border"
                    }`}
                  >
                    <div className="text-sm leading-relaxed">{formatMessage(message.content)}</div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder={`Vraag iets over je ${customerInfo.destination} reis...`}
                disabled={isLoading}
                className="pr-12 py-3 rounded-full"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full ${
                  isRecording ? "text-red-600" : "text-gray-400"
                }`}
                disabled={isLoading}
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="sm"
              className="rounded-full w-10 h-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {isRecording && (
            <div className="mt-2 text-center">
              <p className="text-xs text-red-600 animate-pulse">🔴 Aan het opnemen... Tik nogmaals om te stoppen</p>
            </div>
          )}

          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">Powered by Roadbooks Pro • Gemaakt door je reisagent</p>
          </div>
        </div>
      </div>
    </div>
  )
}
