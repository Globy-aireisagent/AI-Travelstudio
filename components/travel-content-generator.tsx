"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { useChat } from "ai/react"
import {
  Bot,
  Plus,
  MessageSquare,
  Trash2,
  MapPin,
  Route,
  Calendar,
  Hotel,
  X,
  Briefcase,
  Smile,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  Copy,
  Mic,
  MicOff,
  Send,
  Zap,
  Building,
  AlertCircle,
  Brain,
  Camera,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Conversation {
  id: string
  title: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
    imageUrl?: string
    isClean?: boolean
    fullPrompt?: string
  }>
  contentType: string
}

interface ContentType {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  prompt: string
  inputLabel: string
  inputPlaceholder: string
  buttonText: string
  premium: boolean
  credits: number
}

interface WritingStyle {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

interface GPTConfig {
  id: string
  name: string
  contentType: string
  writingStyle: string
  prompt: string
  status: "generated" | "customized" | "active"
  lastModified: string
  usageCount: number
}

export default function TravelContentGenerator() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [showNewChatPanel, setShowNewChatPanel] = useState(false)
  const [selectedContentType, setSelectedContentType] = useState<string>("destination")
  const [selectedWritingStyle, setSelectedWritingStyle] = useState<string>("beleefd")
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [panelInput, setPanelInput] = useState("")
  const [panelRouteFrom, setPanelRouteFrom] = useState("")
  const [panelRouteTo, setPanelRouteTo] = useState("")
  const [routeFrom, setRouteFrom] = useState("")
  const [routeTo, setRouteTo] = useState("")
  const [selectedRouteType, setSelectedRouteType] = useState("gemengd")
  const [selectedDays, setSelectedDays] = useState("2")
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [selectedBudgetLevel, setSelectedBudgetLevel] = useState("middel")
  const [selectedVacationType, setSelectedVacationType] = useState("algemeen")

  // Image generation state
  const [selectedImageStyle, setSelectedImageStyle] = useState("photorealistic")
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<
    Array<{ id: string; url: string; prompt: string; timestamp: string }>
  >([])

  // GPT State - Fixed
  const [availableGPTs, setAvailableGPTs] = useState<GPTConfig[]>([])
  const [currentGPT, setCurrentGPT] = useState<GPTConfig | null>(null)
  const [gptLoaded, setGptLoaded] = useState(false)

  const isSendingRef = useRef(false)

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem("travel-conversations")
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations)
        setConversations(parsed)
      } catch (error) {
        console.error("Failed to load conversations:", error)
      }
    }

    // Load generated images
    const savedImages = localStorage.getItem("travel-generated-images")
    if (savedImages) {
      try {
        const parsed = JSON.parse(savedImages)
        setGeneratedImages(parsed)
      } catch (error) {
        console.error("Failed to load images:", error)
      }
    }
  }, [])

  // Save conversations to localStorage whenever conversations change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("travel-conversations", JSON.stringify(conversations))
    }
  }, [conversations])

  // Save images to localStorage
  useEffect(() => {
    if (generatedImages.length > 0) {
      localStorage.setItem("travel-generated-images", JSON.stringify(generatedImages))
    }
  }, [generatedImages])

  // Load generated GPTs from localStorage - Fixed
  useEffect(() => {
    const loadGPTs = () => {
      try {
        const savedGPTs = localStorage.getItem("generated-gpts")
        console.log("🔍 Loading GPTs from localStorage:", savedGPTs ? "Found" : "Not found")

        if (savedGPTs) {
          const gpts = JSON.parse(savedGPTs)
          console.log("📋 Loaded GPTs:", gpts.length, "total")
          setAvailableGPTs(gpts)
        } else {
          console.log("📋 No GPTs found in localStorage")
          setAvailableGPTs([])
        }
        setGptLoaded(true)
      } catch (error) {
        console.error("❌ Failed to load GPTs:", error)
        setAvailableGPTs([])
        setGptLoaded(true)
      }
    }

    loadGPTs()

    // Listen for storage changes (when GPTs are updated in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "generated-gpts") {
        console.log("🔄 GPTs updated in another tab, reloading...")
        loadGPTs()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Update current GPT when content type or writing style changes - Fixed
  useEffect(() => {
    if (!gptLoaded || availableGPTs.length === 0) {
      console.log("⏳ GPTs not loaded yet or no GPTs available")
      setCurrentGPT(null)
      return
    }

    const matchingGPT = availableGPTs.find(
      (gpt) =>
        gpt.contentType === selectedContentType && gpt.writingStyle === selectedWritingStyle && gpt.status === "active",
    )

    console.log("🎯 Looking for GPT:", {
      contentType: selectedContentType,
      writingStyle: selectedWritingStyle,
      found: matchingGPT ? matchingGPT.name : "None",
    })

    setCurrentGPT(matchingGPT || null)
  }, [selectedContentType, selectedWritingStyle, availableGPTs, gptLoaded])

  // Setup voice recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "nl-NL"

      recognitionInstance.onstart = () => setIsListening(true)
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setPanelInput(transcript)
      }
      recognitionInstance.onend = () => setIsListening(false)
      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  const generateImage = useCallback(async () => {
    if (!panelInput.trim() || isGeneratingImage) return

    setIsGeneratingImage(true)
    try {
      console.log("🎨 Starting image generation with:", {
        prompt: panelInput,
        style: selectedImageStyle,
      })

      const response = await fetch("/api/travel-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: panelInput,
          style: selectedImageStyle,
        }),
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ API Error:", errorData)
        throw new Error(`API Error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      console.log("✅ Image generated successfully:", data)

      if (!data.imageUrl) {
        throw new Error("Geen afbeelding URL ontvangen")
      }

      const newImage = {
        id: Date.now().toString(),
        url: data.imageUrl,
        prompt: panelInput,
        timestamp: new Date().toLocaleString(),
      }

      setGeneratedImages((prev) => [newImage, ...prev])
      setPanelInput("")

      // Show success message
      console.log("🎉 Image added to gallery")
    } catch (error: any) {
      console.error("❌ Image generation error:", error)

      // More specific error messages
      let errorMessage = "Er is een fout opgetreden bij het genereren van de afbeelding."

      if (error.message.includes("API Error: 429")) {
        errorMessage = "Te veel verzoeken. Wacht even en probeer opnieuw."
      } else if (error.message.includes("API Error: 401")) {
        errorMessage = "API sleutel probleem. Controleer de configuratie."
      } else if (error.message.includes("API Error: 500")) {
        errorMessage = "Server probleem. Probeer het later opnieuw."
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Netwerkfout. Controleer je internetverbinding."
      }

      alert(`${errorMessage}

Technische details: ${error.message}`)
    } finally {
      setIsGeneratingImage(false)
    }
  }, [panelInput, selectedImageStyle])

  // Fixed useChat configuration
  const { messages, input, handleInputChange, isLoading, setMessages, append, setInput } = useChat({
    api: "/api/travel-content-chat",
    body: {
      contentType: selectedContentType,
      writingStyle: selectedWritingStyle,
      routeType: selectedRouteType,
      days: selectedDays,
      budgetLevel: selectedBudgetLevel,
      vacationType: selectedVacationType,
      customGPTPrompt: currentGPT?.prompt || null,
    },
    onFinish: (message) => {
      console.log("✅ Message finished, saving to conversation history")

      if (currentConversationId) {
        setConversations((prev) => {
          const updated = prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [
                    ...(conv.messages || []),
                    {
                      role: message.role as "user" | "assistant",
                      content: message.content,
                      isClean: true,
                    },
                  ],
                }
              : conv,
          )

          // Save to localStorage immediately
          localStorage.setItem("travel-conversations", JSON.stringify(updated))
          console.log("💾 Conversation saved to localStorage")

          return updated
        })
      }
      isSendingRef.current = false
    },
    onError: (error) => {
      console.error("❌ Chat error details:", error)
      alert(
        `Er is een fout opgetreden bij het genereren van content. Probeer het opnieuw.

Technische details: ${error.message}`,
      )
      isSendingRef.current = false
    },
  })

  const startListening = () => {
    if (recognition) {
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
    }
  }

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log("Text copied to clipboard")
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }, [])

  const downloadImage = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `travel-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  const writingStyles: WritingStyle[] = [
    {
      id: "zakelijk",
      name: "Zakelijk",
      description: "Professioneel, kort en krachtig. Direct to the point zonder overbodige woorden.",
      icon: <Briefcase className="h-4 w-4" />,
      color: "bg-gray-100 text-gray-700",
    },
    {
      id: "speels",
      name: "Speels",
      description: "Vrolijk en enthousiast met veel emoji's! Perfect voor families met kinderen.",
      icon: <Smile className="h-4 w-4" />,
      color: "bg-orange-100 text-orange-700",
    },
    {
      id: "enthousiast",
      name: "Enthousiast",
      description: "Energiek en opgewonden met veel uitroeptekens! Motiverend en inspirerend.",
      icon: <Sparkles className="h-4 w-4" />,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      id: "beleefd",
      name: "Beleefd",
      description: "Hoffelijk en respectvol in de u-vorm. Professioneel maar vriendelijk.",
      icon: <FileText className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-700",
    },
  ]

  const routeTypes = [
    {
      id: "snelle",
      name: "Snelle Route",
      description: "Kortste tijd",
      icon: <Zap className="h-5 w-5" />,
      color: "text-red-500",
    },
    {
      id: "toeristische",
      name: "Toeristische Route",
      description: "Mooiste bezienswaardigheden",
      icon: <Building className="h-5 w-5" />,
      color: "text-blue-500",
    },
    {
      id: "gemengd",
      name: "Gemengd",
      description: "Balans tussen tijd en bezienswaardigheden",
      icon: <Route className="h-5 w-5" />,
      color: "text-green-500",
    },
  ]

  const dayOptions = [
    {
      id: "1",
      name: "1 Dag",
      description: "Dagtrip",
      icon: "☀️",
    },
    {
      id: "2",
      name: "2 Dagen",
      description: "Weekend",
      icon: "🌅",
    },
    {
      id: "3",
      name: "3 Dagen",
      description: "Lang weekend",
      icon: "🗓️",
    },
  ]

  const budgetLevels = [
    {
      id: "budget",
      name: "Budget",
      description: "Betaalbare opties",
      icon: "💰",
    },
    {
      id: "middel",
      name: "Middel",
      description: "Goede prijs-kwaliteit",
      icon: "⭐",
    },
    {
      id: "luxe",
      name: "Luxe",
      description: "Premium ervaring",
      icon: "💎",
    },
  ]

  const vacationTypes = [
    {
      id: "algemeen",
      name: "Algemeen",
      description: "Standaard hotels",
      icon: "🏨",
    },
    {
      id: "kindvriendelijk",
      name: "Kindvriendelijk",
      description: "Hotels met glijbanen, speeltuintjes etc",
      icon: "🎠",
    },
    {
      id: "adults_only",
      name: "Adults Only",
      description: "Luxere hotels met swim up kamers",
      icon: "🍸",
    },
    {
      id: "all_inclusive",
      name: "All Inclusive",
      description: "Alles inbegrepen",
      icon: "🍽️",
    },
  ]

  const imageStyles = [
    {
      id: "photorealistic",
      name: "Fotorealistisch",
      description: "Natuurlijke travel foto's",
      icon: "📸",
      color: "text-blue-500",
    },
    {
      id: "artistic",
      name: "Artistiek",
      description: "Schilderachtige stijl",
      icon: "🎨",
      color: "text-purple-500",
    },
    {
      id: "vintage",
      name: "Vintage",
      description: "Retro travel poster stijl",
      icon: "📻",
      color: "text-amber-500",
    },
    {
      id: "modern",
      name: "Modern",
      description: "Strak en minimalistisch",
      icon: "🏢",
      color: "text-gray-500",
    },
    {
      id: "dramatic",
      name: "Dramatisch",
      description: "Krachtige contrasten",
      icon: "⚡",
      color: "text-red-500",
    },
    {
      id: "drone",
      name: "Drone View",
      description: "Luchtfoto perspectief",
      icon: "🚁",
      color: "text-green-500",
    },
  ]

  const contentTypes: ContentType[] = [
    {
      id: "destination",
      title: "Bestemmings tekst",
      description: "Krijg uitgebreide informatie over reisbestemmingen",
      icon: <MapPin className="h-6 w-6" />,
      credits: 1,
      inputLabel: "Bestemming:",
      inputPlaceholder: "Bijv. Amsterdam, Parijs, Rome...",
      buttonText: "Genereer Bestemmings Tekst",
      prompt: "Schrijf een uitgebreide reisgids voor {destination}",
      premium: false,
    },
    {
      id: "route",
      title: "Routebeschrijving",
      description: "Krijg gedetailleerde auto-routebeschrijvingen",
      icon: <Route className="h-6 w-6" />,
      credits: 2,
      inputLabel: "Route:",
      inputPlaceholder: "Van Amsterdam naar Parijs",
      buttonText: "Genereer Route Beschrijving",
      prompt: "Maak een gedetailleerde routebeschrijving van {route}",
      premium: false,
    },
    {
      id: "planning",
      title: "Dagplanning",
      description: "Krijg gepersonaliseerde dagplanningen",
      icon: <Calendar className="h-6 w-6" />,
      credits: 2,
      inputLabel: "Stad/Bestemming:",
      inputPlaceholder: "Bijv. Barcelona, Amsterdam, Parijs...",
      buttonText: "Genereer Dag Planning",
      prompt: "Maak een dagplanning voor {planning}",
      premium: false,
    },
    {
      id: "hotel",
      title: "Hotel zoeker",
      description: "Krijg gepersonaliseerde hotel aanbevelingen",
      icon: <Hotel className="h-6 w-6" />,
      credits: 1,
      inputLabel: "Hotel zoekopdracht:",
      inputPlaceholder: "Hotels in Amsterdam met zwembad...",
      buttonText: "Zoek Hotels",
      prompt: "Zoek hotels voor: {hotel}",
      premium: false,
    },
    {
      id: "image",
      title: "Afbeelding Generator",
      description: "Genereer premium travel afbeeldingen met DALL-E 3",
      icon: <Camera className="h-6 w-6" />,
      credits: 3,
      inputLabel: "Afbeelding beschrijving:",
      inputPlaceholder: "Bijv. Zonsondergang over Amsterdam grachten...",
      buttonText: "Genereer Premium Afbeelding",
      prompt: "Genereer een afbeelding van {image}",
      premium: true,
    },
  ]

  // Function to open panel with specific content type
  const openPanelWithContentType = (contentTypeId: string) => {
    setSelectedContentType(contentTypeId)
    setShowNewChatPanel(true)
    setShowAdvancedOptions(false)
  }

  const createNewConversationFromPanel = useCallback(async () => {
    if (isSendingRef.current || isLoading) return

    // Handle image generation
    if (selectedContentType === "image") {
      if (!panelInput.trim() || isGeneratingImage) return

      setIsGeneratingImage(true)
      try {
        console.log("🎨 Starting image generation with:", {
          prompt: panelInput,
          style: selectedImageStyle,
        })

        const response = await fetch("/api/travel-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: panelInput,
            style: selectedImageStyle,
          }),
        })

        console.log("📡 Response status:", response.status)

        if (!response.ok) {
          const errorData = await response.text()
          console.error("❌ API Error:", errorData)
          throw new Error(`API Error: ${response.status} - ${errorData}`)
        }

        const data = await response.json()
        console.log("✅ Image generated successfully:", data)

        if (!data.imageUrl) {
          throw new Error("Geen afbeelding URL ontvangen")
        }

        const newImage = {
          id: Date.now().toString(),
          url: data.imageUrl,
          prompt: panelInput,
          timestamp: new Date().toLocaleString(),
        }

        // Add to generated images gallery
        setGeneratedImages((prev) => [newImage, ...prev])

        // Create a new conversation with the image
        const newConv: Conversation = {
          id: Date.now().toString(),
          title: `Afbeelding - ${panelInput.slice(0, 30)}...`,
          messages: [
            {
              role: "user",
              content: panelInput,
              isClean: true,
            },
            {
              role: "assistant",
              content: `Ik heb een mooie ${selectedImageStyle} afbeelding gegenereerd van "${panelInput}". Je kunt de afbeelding downloaden of kopiëren via de knoppen die verschijnen als je eroverheen hovert.`,
              imageUrl: data.imageUrl,
              isClean: true,
            },
          ],
        }

        setConversations((prev) => [newConv, ...prev])
        setCurrentConversationId(newConv.id)

        // Set the messages in the chat
        setMessages([
          {
            id: `${newConv.id}-0`,
            role: "user",
            content: panelInput,
          },
          {
            id: `${newConv.id}-1`,
            role: "assistant",
            content: `Ik heb een mooie ${selectedImageStyle} afbeelding gegenereerd van "${panelInput}". Je kunt de afbeelding downloaden of kopiëren via de knoppen die verschijnen als je eroverheen hovert.`,
            imageUrl: data.imageUrl,
          },
        ])

        setShowNewChatPanel(false)
        setPanelInput("")

        console.log("🎉 Image conversation created successfully")
      } catch (error: any) {
        console.error("❌ Image generation error:", error)

        let errorMessage = "Er is een fout opgetreden bij het genereren van de afbeelding."

        if (error.message.includes("API Error: 429")) {
          errorMessage = "Te veel verzoeken. Wacht even en probeer opnieuw."
        } else if (error.message.includes("API Error: 401")) {
          errorMessage = "API sleutel probleem. Controleer de configuratie."
        } else if (error.message.includes("API Error: 500")) {
          errorMessage = "Server probleem. Probeer het later opnieuw."
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Netwerkfout. Controleer je internetverbinding."
        }

        alert(`${errorMessage}

Technische details: ${error.message}`)
      } finally {
        setIsGeneratingImage(false)
      }
      return
    }

    let inputValue = panelInput.trim()

    if (selectedContentType === "route" && !showAdvancedOptions) {
      if (!panelRouteFrom.trim() || !panelRouteTo.trim()) {
        alert("Vul zowel startlocatie als eindlocatie in!")
        return
      }
      inputValue = `van ${panelRouteFrom.trim()} naar ${panelRouteTo.trim()}`
    } else if (!inputValue) {
      alert("Vul eerst je input in!")
      return
    }

    const contentType = contentTypes.find((ct) => ct.id === selectedContentType)
    if (!contentType) return

    const newConv: Conversation = {
      id: Date.now().toString(),
      title: `${contentType.title} - ${inputValue.slice(0, 30)}...`,
      messages: [],
      contentType: contentType.id,
    }

    setConversations((prev) => [newConv, ...prev])
    setCurrentConversationId(newConv.id)
    setMessages([])
    setShowNewChatPanel(false)
    setPanelInput("")
    setPanelRouteFrom("")
    setPanelRouteTo("")

    append({
      role: "user",
      content: inputValue,
    })

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === newConv.id
          ? {
              ...conv,
              messages: [
                {
                  role: "user",
                  content: inputValue,
                  isClean: true,
                },
              ],
            }
          : conv,
      ),
    )
  }, [
    panelInput,
    panelRouteFrom,
    panelRouteTo,
    selectedContentType,
    contentTypes,
    selectedWritingStyle,
    selectedRouteType,
    selectedDays,
    append,
    setMessages,
    setConversations,
    setCurrentConversationId,
    isLoading,
    showAdvancedOptions,
    generateImage,
    selectedImageStyle,
    setGeneratedImages,
  ])

  const selectConversation = useCallback(
    (conv: Conversation) => {
      console.log("🔄 Selecting conversation:", conv.id, conv.title)
      setCurrentConversationId(conv.id)
      setSelectedContentType(conv.contentType)

      if (conv.messages && conv.messages.length > 0) {
        console.log("📝 Loading", conv.messages.length, "messages from conversation")

        // Convert conversation messages to chat messages format
        const messagesFromConv = conv.messages.map((msg, index) => ({
          id: `${conv.id}-${index}`,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          imageUrl: msg.imageUrl,
        }))

        setMessages(messagesFromConv)
        console.log("✅ Messages loaded successfully")
      } else {
        console.log("📝 No messages in conversation, clearing chat")
        setMessages([])
      }
    },
    [setMessages],
  )

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const updated = prev.filter((conv) => conv.id !== id)
        localStorage.setItem("travel-conversations", JSON.stringify(updated))
        return updated
      })
      if (currentConversationId === id) {
        setCurrentConversationId(null)
        setMessages([])
        setSelectedContentType("destination")
      }
    },
    [currentConversationId, setMessages],
  )

  const handleMainSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (isSendingRef.current || isLoading || !input.trim()) return

      let inputValue = input.trim()

      if (currentConversationId && messages.length > 0) {
        setInput("")
        append({
          role: "user",
          content: inputValue,
        })

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [
                    ...(conv.messages || []),
                    {
                      role: "user",
                      content: inputValue,
                      isClean: true,
                    },
                  ],
                }
              : conv,
          ),
        )
        return
      }

      if (selectedContentType === "route") {
        if (!routeFrom.trim() || !routeTo.trim()) {
          alert("Vul zowel startlocatie als eindlocatie in!")
          return
        }
        inputValue = `van ${routeFrom.trim()} naar ${routeTo.trim()}`
        setRouteFrom("")
        setRouteTo("")
      }

      const contentType = contentTypes.find((ct) => ct.id === selectedContentType)

      if (!currentConversationId) {
        const newConv: Conversation = {
          id: Date.now().toString(),
          title: `${contentType?.title || "Chat"} - ${inputValue.slice(0, 30)}...`,
          messages: [],
          contentType: selectedContentType || "destination",
        }
        setConversations((prev) => [newConv, ...prev])
        setCurrentConversationId(newConv.id)
      }

      setInput("")
      append({
        role: "user",
        content: inputValue,
      })

      if (currentConversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [
                    ...(conv.messages || []),
                    {
                      role: "user",
                      content: inputValue,
                      isClean: true,
                    },
                  ],
                }
              : conv,
          ),
        )
      }
    },
    [
      input,
      selectedContentType,
      routeFrom,
      routeTo,
      currentConversationId,
      append,
      setConversations,
      setCurrentConversationId,
      isLoading,
      setInput,
      messages,
      contentTypes,
    ],
  )

  const currentContentType = contentTypes.find((ct) => ct.id === selectedContentType)

  return (
    <div className="flex h-[calc(100vh-200px)] bg-gray-50 rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={() => setShowNewChatPanel(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-5 w-5" />✨ Nieuwe Chat
          </Button>
        </div>

        <div className="px-4 pb-2">
          <Button
            onClick={() => {
              if (confirm("Weet je zeker dat je alle geschiedenis wilt wissen?")) {
                setConversations([])
                setCurrentConversationId(null)
                setMessages([])
                localStorage.removeItem("travel-conversations")
                console.log("🗑️ All conversation history cleared")
              }
            }}
            variant="outline"
            size="sm"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Wis Geschiedenis
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {conversations.map((conv) => {
              const contentType = contentTypes.find((ct) => ct.id === conv.contentType)
              return (
                <div
                  key={conv.id}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentConversationId === conv.id
                      ? "bg-blue-100 border-2 border-blue-300 shadow-sm"
                      : "hover:bg-gray-100 border-2 border-transparent"
                  }`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`${currentConversationId === conv.id ? "text-blue-600" : "text-gray-500"}`}>
                      {contentType?.icon || <MessageSquare className="h-4 w-4 flex-shrink-0" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm truncate block ${currentConversationId === conv.id ? "font-medium text-blue-900" : "text-gray-700"}`}
                      >
                        {conv.title}
                      </span>
                      <span className="text-xs text-gray-500">{conv.messages?.length || 0} berichten</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("Weet je zeker dat je dit gesprek wilt verwijderen?")) {
                        deleteConversation(conv.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* New Chat Panel */}
      {showNewChatPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-[600px] bg-white h-full overflow-y-auto shadow-xl animate-slide-in-right">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Nieuwe Chat Maken</h2>
                <Button variant="ghost" onClick={() => setShowNewChatPanel(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Content Type Selection */}
              {!showAdvancedOptions && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Kies Content Type:</h3>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {contentTypes.slice(0, 3).map((contentType) => {
                      const isSelected = selectedContentType === contentType.id
                      return (
                        <button
                          key={contentType.id}
                          className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            isSelected
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedContentType(contentType.id)}
                        >
                          <div
                            className={`flex justify-center mb-2 transition-colors ${
                              isSelected ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"
                            }`}
                          >
                            {contentType.icon}
                          </div>
                          <h4
                            className={`font-medium text-sm transition-colors ${
                              isSelected ? "text-blue-900" : "text-gray-900"
                            }`}
                          >
                            {contentType.title}
                          </h4>
                          {contentType.premium && (
                            <Badge className="mt-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              Premium
                            </Badge>
                          )}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {contentTypes.slice(3).map((contentType) => {
                      const isSelected = selectedContentType === contentType.id
                      return (
                        <Card
                          key={contentType.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? "border-blue-400 bg-blue-50 shadow-md" : "hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedContentType(contentType.id)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="flex justify-center mb-2 text-orange-500">{contentType.icon}</div>
                            <h4 className="font-medium text-sm text-gray-900">{contentType.title}</h4>
                            {contentType.premium && <Badge className="mt-1 text-xs">Premium</Badge>}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Advanced Options Toggle */}
              <div className="border-t border-gray-200 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="w-full justify-between"
                >
                  <span>Geavanceerde opties</span>
                  {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {showAdvancedOptions && (
                  <Card className="mt-4">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stel je vraag:</label>
                        <Textarea
                          value={panelInput}
                          onChange={(e) => setPanelInput(e.target.value)}
                          rows={5}
                          placeholder="Stel hier je eigen vraag zonder beperkingen..."
                        />
                      </div>

                      <Button
                        onClick={createNewConversationFromPanel}
                        disabled={!panelInput.trim() || isLoading}
                        className="w-full bg-blue-400 hover:bg-blue-500"
                      >
                        Verzenden
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Writing Style Selection (not for images) */}
              {!showAdvancedOptions && selectedContentType !== "image" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Kies Schrijfstijl:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {writingStyles.map((style) => {
                      const isSelected = selectedWritingStyle === style.id
                      return (
                        <button
                          key={style.id}
                          className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            isSelected
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedWritingStyle(style.id)}
                        >
                          <div
                            className={`flex justify-center mb-2 transition-colors ${
                              isSelected ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"
                            }`}
                          >
                            {style.icon}
                          </div>
                          <div
                            className={`text-sm font-medium transition-colors ${
                              isSelected ? "text-blue-900" : "text-gray-900"
                            }`}
                          >
                            {style.name}
                          </div>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Image Style Selection (only for images) */}
              {!showAdvancedOptions && selectedContentType === "image" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Kies Afbeelding Stijl:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {imageStyles.map((style) => {
                      const isSelected = selectedImageStyle === style.id
                      return (
                        <button
                          key={style.id}
                          className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            isSelected
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedImageStyle(style.id)}
                        >
                          <div
                            className={`text-2xl mb-2 transition-colors ${
                              isSelected ? style.color : `${style.color} group-hover:scale-110`
                            }`}
                          >
                            {style.icon}
                          </div>
                          <h4
                            className={`font-medium text-sm mb-1 transition-colors ${
                              isSelected ? "text-blue-900" : "text-gray-900"
                            }`}
                          >
                            {style.name}
                          </h4>
                          <p className="text-xs text-gray-600">{style.description}</p>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Route Type Selection (only for route content type) */}
              {!showAdvancedOptions && selectedContentType === "route" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Route Type:</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {routeTypes.map((routeType) => {
                      const isSelected = selectedRouteType === routeType.id
                      return (
                        <button
                          key={routeType.id}
                          className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            isSelected
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedRouteType(routeType.id)}
                        >
                          <div
                            className={`flex justify-center mb-2 transition-all duration-300 ${
                              isSelected ? routeType.color : `${routeType.color} group-hover:scale-110`
                            }`}
                          >
                            {routeType.icon}
                          </div>
                          <h4
                            className={`font-medium text-sm transition-colors ${
                              isSelected ? "text-blue-900" : "text-gray-900"
                            }`}
                          >
                            {routeType.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">{routeType.description}</p>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Days Selection (only for planning content type) */}
              {!showAdvancedOptions && selectedContentType === "planning" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Aantal Dagen:</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {dayOptions.map((dayOption) => {
                      const isSelected = selectedDays === dayOption.id
                      return (
                        <button
                          key={dayOption.id}
                          className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            isSelected
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedDays(dayOption.id)}
                        >
                          <div className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110">
                            {dayOption.icon}
                          </div>
                          <h4
                            className={`font-medium text-sm transition-colors ${
                              isSelected ? "text-blue-900" : "text-gray-900"
                            }`}
                          >
                            {dayOption.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">{dayOption.description}</p>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Budget Level Selection (only for hotel content type) */}
              {!showAdvancedOptions && selectedContentType === "hotel" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Budget Niveau:</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {budgetLevels.map((budget) => {
                      const isSelected = selectedBudgetLevel === budget.id
                      return (
                        <button
                          key={budget.id}
                          className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            isSelected
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedBudgetLevel(budget.id)}
                        >
                          <div className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110">
                            {budget.icon}
                          </div>
                          <h4
                            className={`font-medium text-sm transition-colors ${
                              isSelected ? "text-blue-900" : "text-gray-900"
                            }`}
                          >
                            {budget.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">{budget.description}</p>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Vacation Type Selection (only for hotel content type) */}
              {!showAdvancedOptions && selectedContentType === "hotel" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Soort Vakantie:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {vacationTypes.map((vacation) => {
                      const isSelected = selectedVacationType === vacation.id
                      return (
                        <button
                          key={vacation.id}
                          className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            isSelected
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedVacationType(vacation.id)}
                        >
                          <div className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110">
                            {vacation.icon}
                          </div>
                          <h4
                            className={`font-medium text-sm transition-colors ${
                              isSelected ? "text-blue-900" : "text-gray-900"
                            }`}
                          >
                            {vacation.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">{vacation.description}</p>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Input Section */}
              {!showAdvancedOptions && selectedContentType === "image" && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <label className="block text-sm font-medium">{currentContentType?.inputLabel}</label>
                      <div className="relative">
                        <Input
                          value={panelInput}
                          onChange={(e) => setPanelInput(e.target.value)}
                          placeholder={currentContentType?.inputPlaceholder}
                          className="pr-12"
                        />
                        {selectedContentType !== "image" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={isListening ? stopListening : startListening}
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                              isListening ? "text-red-500" : "text-gray-600"
                            }`}
                            title={isListening ? "Stop opname" : "Start spraakherkenning"}
                          >
                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                      <Button
                        onClick={createNewConversationFromPanel}
                        disabled={!panelInput.trim() || isLoading || isGeneratingImage}
                        className="w-full bg-blue-400 hover:bg-blue-500"
                      >
                        {selectedContentType === "image" && isGeneratingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Genereren...
                          </>
                        ) : (
                          currentContentType?.buttonText
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generated Images Display (only for image content type) */}
              {!showAdvancedOptions && selectedContentType === "image" && generatedImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Gegenereerde Afbeeldingen:</h3>
                  <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {generatedImages
                      .filter((image) => image.url && image.url !== "/placeholder.svg")
                      .slice(0, 6)
                      .map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.prompt}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => downloadImage(image.url, image.prompt)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => copyToClipboard(image.url)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{image.prompt}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Input Section */}
              {!showAdvancedOptions && selectedContentType !== "image" && (
                <Card>
                  <CardContent className="p-4">
                    {selectedContentType === "route" ? (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Route Details:</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Van:</label>
                            <Input
                              value={panelRouteFrom}
                              onChange={(e) => setPanelRouteFrom(e.target.value)}
                              placeholder="Startlocatie"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Naar:</label>
                            <Input
                              value={panelRouteTo}
                              onChange={(e) => setPanelRouteTo(e.target.value)}
                              placeholder="Eindlocatie"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={createNewConversationFromPanel}
                          disabled={!panelRouteFrom.trim() || !panelRouteTo.trim() || isLoading}
                          className="w-full bg-blue-400 hover:bg-blue-500"
                        >
                          Genereer Route Beschrijving
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium">{currentContentType?.inputLabel}</label>
                        <div className="relative">
                          <Input
                            value={panelInput}
                            onChange={(e) => setPanelInput(e.target.value)}
                            placeholder={currentContentType?.inputPlaceholder}
                            className="pr-12"
                          />
                          {selectedContentType !== "image" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={isListening ? stopListening : startListening}
                              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                                isListening ? "text-red-500" : "text-gray-600"
                              }`}
                              title={isListening ? "Stop opname" : "Start spraakherkenning"}
                            >
                              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                        <Button
                          onClick={createNewConversationFromPanel}
                          disabled={!panelInput.trim() || isLoading || isGeneratingImage}
                          className="w-full bg-blue-400 hover:bg-blue-500"
                        >
                          {selectedContentType === "image" && isGeneratingImage ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Genereren...
                            </>
                          ) : (
                            currentContentType?.buttonText
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Let's Go! ✈️ 🌍</h1>
              <p className="text-sm text-gray-600">
                {selectedContentType
                  ? `${contentTypes.find((ct) => ct.id === selectedContentType)?.title} - Jouw AI reisassistent staat klaar! 🚀`
                  : "Jouw AI reisassistent staat klaar! 🚀"}
              </p>
              {currentGPT && <Badge className="bg-green-100 text-green-700 text-xs mt-1">🤖 {currentGPT.name}</Badge>}
            </div>
            {gptLoaded && (
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {availableGPTs.filter((g) => g.status === "active").length} actieve GPTs
                </div>
                <div className="text-xs text-gray-500">{availableGPTs.length} totaal beschikbaar</div>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Welkom bij Travel Content Generator</h2>
                <p className="text-gray-600 mb-4">
                  Selecteer een content type en begin met typen in het invoerveld hieronder.
                </p>
                {gptLoaded && availableGPTs.length === 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Geen custom GPTs gevonden</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Ga naar Super Admin → GPT Generator om gepersonaliseerde GPTs te maken voor betere resultaten.
                    </p>
                  </div>
                )}

                {gptLoaded && availableGPTs.length > 0 && !currentGPT && selectedContentType !== "image" && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Brain className="h-5 w-5" />
                      <span className="font-medium">Geen actieve GPT voor deze combinatie</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Activeer een GPT voor {contentTypes.find((ct) => ct.id === selectedContentType)?.title} +{" "}
                      {writingStyles.find((ws) => ws.id === selectedWritingStyle)?.name} in de GPT Generator.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-2xl mx-auto">
                  {contentTypes.map((contentType) => {
                    const isSelected = selectedContentType === contentType.id
                    return (
                      <Button
                        key={contentType.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => openPanelWithContentType(contentType.id)}
                        className={`h-auto p-4 flex-col hover:shadow-lg transition-all duration-300 rounded-2xl hover:scale-105 ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                            : "hover:border-gray-300 bg-white border-2 border-gray-200"
                        }`}
                      >
                        <div className="flex justify-center mb-1 text-blue-500">{contentType.icon}</div>
                        <div className="text-xs font-medium">{contentType.title}</div>
                        {contentType.premium && <Badge className="mt-1 text-xs">Premium</Badge>}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`${message.imageUrl ? "max-w-[95%]" : "max-w-[80%]"} p-4 rounded-lg relative group ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>

                    {/* Display image if present */}
                    {message.imageUrl && (
                      <div className="mt-3 relative group">
                        <img
                          src={message.imageUrl || "/placeholder.svg"}
                          alt="Generated travel image"
                          className="w-full rounded-lg shadow-lg cursor-pointer"
                          onClick={() => window.open(message.imageUrl, "_blank")}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex gap-3">
                            <Button
                              size="lg"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadImage(message.imageUrl!, message.content)
                              }}
                              className="bg-white/95 hover:bg-white shadow-lg"
                            >
                              <Download className="h-5 w-5 mr-2" />
                              Download
                            </Button>
                            <Button
                              size="lg"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(message.imageUrl!)
                              }}
                              className="bg-white/95 hover:bg-white shadow-lg"
                            >
                              <Copy className="h-5 w-5 mr-2" />
                              Kopieer URL
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {message.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Kopieer tekst"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-lg">
                  <div className="flex items-center gap-2">
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
                    <span className="text-sm text-gray-600">
                      AI genereert content{currentGPT ? ` met ${currentGPT.name}` : ""}...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleMainSubmit}>
              <div className="space-y-3">
                {selectedContentType === "route" ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Route Details:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Van:</label>
                        <Input
                          value={routeFrom}
                          onChange={(e) => setRouteFrom(e.target.value)}
                          placeholder="Startlocatie"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Naar:</label>
                        <Input
                          value={routeTo}
                          onChange={(e) => setRouteTo(e.target.value)}
                          placeholder="Eindlocatie"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading || !routeFrom.trim() || !routeTo.trim()}>
                        Genereer Route
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {currentContentType?.inputLabel || "Vraag:"}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder={
                          currentConversationId && messages.length > 0
                            ? "Stel een vervolgvraag..."
                            : currentContentType?.inputPlaceholder || "Typ je vraag hier..."
                        }
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={isListening ? stopListening : startListening}
                        disabled={isLoading}
                        className={isListening ? "text-red-500" : "text-gray-600"}
                        title={isListening ? "Stop opname" : "Start spraakherkenning"}
                      >
                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                      <Button type="submit" disabled={isLoading || !input.trim()}>
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
