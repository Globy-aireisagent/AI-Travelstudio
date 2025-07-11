"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Mic, MicOff, Send, Volume2 } from "lucide-react"
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
  const router = useRouter()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "globy",
      text: "👋 Hallo! Ik ben Globy, jullie persoonlijke reisbuddy! Ik ken alle details van jullie reis en kan al jullie vragen beantwoorden. Wat wil je weten? 🌍",
      timestamp: new Date(),
    },
  ])
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Auto scroll naar laatste bericht
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Speech recognition setup
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

    try {
      const res = await fetch("/api/ask-globy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, vraag }),
      })

      if (!res.ok) {
        throw new Error("Network response was not ok")
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ""

      const globyMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "globy",
        text: "",
        timestamp: new Date(),
        isStreaming: true,
      }

      setMessages((prev) => [...prev, globyMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("0:")) {
              const content = line.slice(2)
              accumulatedText += content

              setMessages((prev) =>
                prev.map((msg) => (msg.id === globyMessage.id ? { ...msg, text: accumulatedText } : msg)),
              )
            }
          }
        }
      }

      // Finalize message
      setMessages((prev) => prev.map((msg) => (msg.id === globyMessage.id ? { ...msg, isStreaming: false } : msg)))

      // Speak the response
      if (accumulatedText) {
        speakText(accumulatedText)
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "globy",
        text: "Oeps! Er ging iets mis. Probeer het nog eens! 😅",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setLoading(false)
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      // Stop any current speech
      window.speechSynthesis.cancel()

      setSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "nl-NL"
      utterance.rate = 0.9
      utterance.pitch = 1.1

      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Spraakherkenning wordt niet ondersteund in deze browser.")
      return
    }

    setListening(true)

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setListening(false)
      sendVraag(transcript)
    }

    recognitionRef.current.onerror = (event) => {
      setListening(false)
      console.error("Speech recognition error:", event.error)
      alert("Kon je stem niet begrijpen. Probeer opnieuw.")
    }

    recognitionRef.current.onend = () => {
      setListening(false)
    }

    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setListening(false)
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/travelbuddy/${bookingId}`)} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            G
          </div>
          <div>
            <h1 className="font-bold text-lg">Globy</h1>
            <p className="text-xs text-gray-500">Je persoonlijke reisbuddy</p>
          </div>
        </div>
        {speaking && (
          <Button variant="outline" size="sm" onClick={stopSpeaking} className="ml-auto bg-transparent">
            <Volume2 className="h-4 w-4 mr-1" />
            Stop
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <Card
              className={`max-w-[80%] ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-white shadow-md"}`}
            >
              <CardContent className="p-3">
                <div className={`text-sm ${message.sender === "user" ? "text-white" : "text-gray-800"}`}>
                  {message.text}
                  {message.isStreaming && <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />}
                </div>
                <div className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-400"}`}>
                  {message.timestamp.toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <Card className="bg-white shadow-md">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-sm">Globy denkt na...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendVraag(input)}
            placeholder="Typ je vraag aan Globy..."
            className="flex-1"
            disabled={loading || listening}
          />

          <Button
            onClick={() => sendVraag(input)}
            disabled={loading || !input.trim() || listening}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>

          <Button
            onClick={listening ? stopListening : startVoiceInput}
            disabled={loading}
            variant={listening ? "destructive" : "outline"}
            className={listening ? "animate-pulse" : ""}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>

        {listening && (
          <div className="mt-2 text-center">
            <p className="text-sm text-orange-600 animate-pulse">🎤 Luisteren... Spreek nu je vraag uit!</p>
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-2">
          {[
            "Wat doen we morgen?",
            "Waar kunnen we lekker eten?",
            "Hoe laat vertrekken we?",
            "Wat kost dit ongeveer?",
            "Tips voor de kinderen?",
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => sendVraag(suggestion)}
              disabled={loading || listening}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
