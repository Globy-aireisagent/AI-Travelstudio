"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, MicOff, Send, Bot, User, FileText } from "lucide-react"
import Image from "next/image"

interface ChatInterfaceProps {
  uploadedDocuments: any[]
  intakeData: any
  bookingData?: any // Add this new prop
}

export default function ChatInterface({ uploadedDocuments, intakeData, bookingData }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: bookingData
          ? `Hallo ${intakeData?.naam || "daar"}! 🌟 Ik ben je persoonlijke TravelBuddy voor je ${bookingData.destination} reis (${bookingData.id?.toUpperCase()}). Ik ken alle details van je booking - van je hotels tot je activiteiten. Waar kan ik je mee helpen?`
          : `Hallo ${intakeData?.naam || "daar"}! Ik ben je persoonlijke reis-assistent. Ik heb je reisdocumenten en voorkeuren bekeken. Je kunt me alles vragen over je reis - typ je vraag of gebruik de microfoon om in te spreken. Waar kan ik je mee helpen?`,
      },
    ],
    body: {
      uploadedDocuments,
      intakeData,
      bookingData, // Add this line
    },
  })

  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Kon microfoon niet activeren. Controleer je browser instellingen.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { text } = await response.json()
        // Set the transcribed text in the input field
        const event = { target: { value: text } } as React.ChangeEvent<HTMLInputElement>
        handleInputChange(event)
        // Focus the input so user can edit if needed
        inputRef.current?.focus()
      }
    } catch (error) {
      console.error("Transcription error:", error)
      alert("Kon spraak niet omzetten naar tekst. Probeer het opnieuw.")
    }
  }

  const formatMessage = (content: string) => {
    // Simple formatting for better readability
    return content.split("\n").map((line, index) => (
      <p key={index} className={line.trim() === "" ? "mb-2" : "mb-1"}>
        {line}
      </p>
    ))
  }

  return (
    <div className="h-[600px] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span>Reis Assistent Chat</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FileText className="w-4 h-4" />
              <span>{uploadedDocuments.length} documenten geladen</span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="text-sm">{formatMessage(message.content)}</div>
                    </div>

                    {/* Show attachments if any */}
                    {message.experimental_attachments && (
                      <div className="mt-2 space-y-2">
                        {message.experimental_attachments
                          .filter(
                            (attachment) =>
                              attachment?.contentType?.startsWith("image/") ||
                              attachment?.contentType?.startsWith("application/pdf"),
                          )
                          .map((attachment, index) =>
                            attachment.contentType?.startsWith("image/") ? (
                              <Image
                                key={`${message.id}-${index}`}
                                src={attachment.url || "/placeholder.svg"}
                                width={300}
                                height={200}
                                alt={attachment.name ?? `attachment-${index}`}
                                className="rounded-lg"
                              />
                            ) : attachment.contentType?.startsWith("application/pdf") ? (
                              <div key={`${message.id}-${index}`} className="text-xs text-gray-500">
                                📄 {attachment.name}
                              </div>
                            ) : null,
                          )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
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

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Stel een vraag over je reis..."
                  disabled={isLoading}
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`absolute right-1 top-1/2 transform -translate-y-1/2 ${
                    isRecording ? "text-red-600" : "text-gray-400"
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>

              <Button type="submit" disabled={isLoading || !input.trim()} size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </form>

            {isRecording && (
              <div className="mt-2 text-center">
                <span className="text-sm text-red-600 animate-pulse">
                  🔴 Aan het opnemen... Klik op de microfoon om te stoppen
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
