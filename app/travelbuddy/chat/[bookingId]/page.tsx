"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Send, ArrowLeft, Volume2, VolumeX } from "lucide-react"
import type { SpeechRecognition, SpeechRecognitionEvent } from "web-speech-api"

interface Message {
  id: string
  sender: "user" | "globy"
  text: string
  timestamp: Date
  isStreaming?: boolean
}

export default function TravelBuddyChatPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "globy",
      text: `Hoi! Ik ben Globy, jullie persoonlijke reisassistent! 🌍 Ik ken alle details van jullie reis (booking ${bookingId}). Vraag me alles over jullie planning, restaurants, activiteiten, of gewoon een gezellig praatje! 😊`,
      timestamp: new Date(),
    },
  ])
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Quick suggestion buttons
  const quickSuggestions = [
    "Wat zijn de beste restaurants?",
    "Hoe is het weer morgen?",
    "Wat moet ik zeker niet missen?",
    "Geef me een geheime tip!",
    "Hoe kom ik ergens?",
  ]

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = "nl-NL"
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
    }
  }, [])

  const sendVraag = async (vraag: string) => {
    if (!vraag.trim()) return

    setLoading(true)
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: vraag,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Add streaming message placeholder
    const streamingMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: "globy",
      text: "",
      timestamp: new Date(),
      isStreaming: true,
    }
    setMessages((prev) => [...prev, streamingMessage])

    try {
      const response = await fetch("/api/ask-globy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, vraag }),
      })

      if (!response.ok) throw new Error("Network response was not ok")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.content) {
                  accumulatedText += data.content
                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === streamingMessage.id ? { ...msg, text: accumulatedText } : msg)),
                  )
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }

      // Finalize the message
      setMessages((prev) => prev.map((msg) => (msg.id === streamingMessage.id ? { ...msg, isStreaming: false } : msg)))

      // Speak the response if enabled
      if (speechEnabled && accumulatedText) {
        speek(accumulatedText)
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = "Sorry, er ging iets mis. Probeer het nog eens! 😅"
      setMessages((prev) =>
        prev.map((msg) => (msg.id === streamingMessage.id ? { ...msg, text: errorMessage, isStreaming: false } : msg)),
      )
    }

    setLoading(false)
  }

  const speek = (text: string) => {
    if (!speechEnabled) return

    const synth = window.speechSynthesis
    synth.cancel() // Stop any current speech

    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "nl-NL"
    utter.rate = 0.9
    utter.pitch = 1.1
    synth.speak(utter)
  }

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Spraakherkenning wordt niet ondersteund in deze browser.")
      return
    }

    setListening(true)
    recognitionRef.current.start()

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const vraag = event.results[0][0].transcript
      setListening(false)
      sendVraag(vraag)
    }

    recognitionRef.current.onerror = () => {
      setListening(false)
      alert("Kon je stem niet begrijpen. Probeer opnieuw! 🎤")
    }

    recognitionRef.current.onend = () => {
      setListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setListening(false)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/travelbuddy/${bookingId}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Terug naar planning</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="text-2xl">🤖</div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Globy Chat</h1>
              <p className="text-sm text-gray-600">Je persoonlijke reisassistent</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className="flex items-center gap-1"
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>

        {/* Chat Messages */}
        <Card className="h-[60vh] overflow-y-auto p-4 mb-4 bg-white/80 backdrop-blur-sm">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-orange-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">
                    {msg.text}
                    {msg.isStreaming && <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse">|</span>}
                  </p>
                  <p className={`text-xs mt-1 opacity-70 ${msg.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">💡 Probeer eens:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => sendVraag(suggestion)}
                  className="text-xs bg-white/80 hover:bg-orange-50"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendVraag(input)}
            placeholder="Typ je vraag aan Globy..."
            className="flex-1 bg-white/80 backdrop-blur-sm"
            disabled={loading}
          />

          <Button
            onClick={() => sendVraag(input)}
            disabled={loading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>

          <Button
            onClick={listening ? stopListening : startVoiceInput}
            disabled={loading}
            className={`${
              listening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        </div>

        {/* Status */}
        {listening && (
          <p className="text-center text-sm text-orange-600 mt-2 animate-pulse">🎤 Luisteren... spreek nu!</p>
        )}

        {loading && <p className="text-center text-sm text-blue-600 mt-2">🤖 Globy denkt na...</p>}
      </div>
    </div>
  )
}
