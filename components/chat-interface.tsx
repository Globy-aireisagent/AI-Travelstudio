"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Send, RotateCcw, Volume2, Clock, MessageSquare } from "lucide-react"
import type SpeechRecognition from "speech-recognition"

interface ChatMessage {
  id: string
  sender: "user" | "globy" | "assistant"
  text: string
  timestamp: Date
  cached?: boolean
  responseTime?: number
}

interface ChatInterfaceProps {
  uploadedDocuments?: any[]
  intakeData?: any
  bookingData?: any
  bookingId?: string
  className?: string
}

export default function ChatInterface({
  uploadedDocuments = [],
  intakeData,
  bookingData,
  bookingId,
  className = "",
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [conversationStats, setConversationStats] = useState({ total: 0, cached: 0, avgResponseTime: 0 })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "nl-NL"

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  // Load conversation history for Globy mode
  useEffect(() => {
    if (bookingId) {
      loadConversationHistory()
    }
  }, [bookingId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadConversationHistory = async () => {
    try {
      const response = await fetch(`/api/conversation-history?bookingId=${bookingId}`)
      const data = await response.json()

      if (data.conversations) {
        const historyMessages: ChatMessage[] = data.conversations.flatMap((conv: any) => [
          {
            id: `user-${conv.id}`,
            sender: "user" as const,
            text: conv.user_message,
            timestamp: new Date(conv.created_at),
          },
          {
            id: `globy-${conv.id}`,
            sender: "globy" as const,
            text: conv.globy_response,
            timestamp: new Date(conv.created_at),
            cached: conv.cached,
            responseTime: conv.response_time_ms,
          },
        ])
        setMessages(historyMessages)
        setConversationStats(data.stats)
      }
    } catch (error) {
      console.error("Error loading conversation history:", error)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Choose API endpoint based on whether we have a bookingId (Globy mode)
      const apiEndpoint = bookingId ? "/api/ask-globy" : "/api/chat"
      const requestBody = bookingId
        ? { bookingId, vraag: input.trim() }
        : {
            messages: messages.concat(userMessage).map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            uploadedDocuments,
            intakeData,
          }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: bookingId ? "globy" : "assistant",
          text: data.antwoord || data.response || "Sorry, ik kon geen antwoord genereren.",
          timestamp: new Date(),
          cached: data.cached,
          responseTime: data.responseTime,
        }

        setMessages((prev) => [...prev, assistantMessage])

        // Text-to-speech for Globy responses
        if (bookingId && data.antwoord) {
          speakText(data.antwoord)
        }

        // Update stats
        if (bookingId) {
          setConversationStats((prev) => ({
            total: prev.total + 1,
            cached: prev.cached + (data.cached ? 1 : 0),
            avgResponseTime: Math.round(
              (prev.avgResponseTime * prev.total + (data.responseTime || 0)) / (prev.total + 1),
            ),
          }))
        }
      } else {
        throw new Error(data.error || "Er ging iets mis")
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: bookingId ? "globy" : "assistant",
        text: "Sorry, er ging iets mis. Probeer het opnieuw.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = async (messageText: string) => {
    setInput(messageText)
    await handleSubmit()
  }

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "nl-NL"
      utterance.rate = 0.9
      utterance.pitch = 1.1
      window.speechSynthesis.speak(utterance)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{bookingId ? "🌍 Globy - Je TravelBuddy" : "🤖 Reis Assistent Chat"}</h2>
            {bookingId && (
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {conversationStats.total} gesprekken
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />~{conversationStats.avgResponseTime}ms
                </Badge>
                {conversationStats.cached > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {conversationStats.cached} cached
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>{bookingId ? "👋 Hoi! Ik ben Globy, je persoonlijke reisbuddy!" : "💬 Start een gesprek..."}</p>
              <p className="text-sm mt-2">
                {bookingId ? "Stel me vragen over je reis!" : "Upload documenten en stel vragen over je reis."}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%]">
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : message.sender === "globy"
                        ? "bg-orange-100 text-orange-900 border border-orange-200"
                        : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>

                {/* Message metadata */}
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{formatTime(message.timestamp)}</span>
                  {message.cached && (
                    <Badge variant="secondary" className="text-xs">
                      Cached
                    </Badge>
                  )}
                  {message.responseTime && <span className="text-xs">({message.responseTime}ms)</span>}

                  {/* Action buttons for assistant/globy messages */}
                  {message.sender !== "user" && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => speakText(message.text)}
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          const userMessage = messages[messages.indexOf(message) - 1]
                          if (userMessage) handleRetry(userMessage.text)
                        }}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-900 p-3 rounded-lg max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span>{bookingId ? "Globy denkt na..." : "Aan het typen..."}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={bookingId ? "Stel Globy een vraag over je reis..." : "Stel een vraag over je reis..."}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              disabled={isLoading}
            />

            {/* Voice input button */}
            {recognitionRef.current && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                  isListening ? "text-red-500 animate-pulse" : "text-gray-400"
                }`}
                onClick={toggleListening}
                disabled={isLoading}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>

          <Button type="submit" disabled={isLoading || !input.trim()} className="px-6">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Voice input feedback */}
        {isListening && (
          <div className="mt-2 text-center">
            <Badge variant="destructive" className="animate-pulse">
              🎤 Luisteren... Spreek nu!
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
