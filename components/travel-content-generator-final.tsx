"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface TravelContentGeneratorProps {
  destination?: string
  duration?: number
  interests?: string[]
}

const TravelContentGenerator: React.FC<TravelContentGeneratorProps> = ({
  destination = "",
  duration = 0,
  interests = [],
}) => {
  const [content, setContent] = useState("")
  const [contentType, setContentType] = useState("itinerary")
  const [writingStyle, setWritingStyle] = useState("persuasive")
  const [routeType, setRouteType] = useState("road_trip")
  const [additionalDetails, setAdditionalDetails] = useState("")
  const [chatHistory, setChatHistory] = useState<string[]>([])
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const generateContent = async () => {
    // Placeholder logic for content generation
    const interestsStr = interests.length ? interests.join(", ") : "various interests"
    let generatedContent = `Trip to ${destination} for ${duration} days.\n`
    generatedContent += `Interests: ${interestsStr}.\n`
    generatedContent += "Here's a sample itinerary:\n"
    generatedContent += "- Day 1: Arrival and exploration\n"
    generatedContent += "- Day 2: Activities based on interests\n"
    generatedContent += "- Day 3: Relaxation and departure"

    setContent(generatedContent)
    setChatHistory((prev) => [...prev, `You: Generate content for ${destination}`])
    setChatHistory((prev) => [...prev, `AI: ${generatedContent}`])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "additionalDetails") {
      setAdditionalDetails(value)
    }
  }

  const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setContentType(e.target.value)
  }

  const handleWritingStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWritingStyle(e.target.value)
  }

  const handleRouteTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRouteType(e.target.value)
  }

  const sendMessage = () => {
    if (additionalDetails.trim() !== "") {
      setChatHistory((prev) => [...prev, `You: ${additionalDetails}`])
      setAdditionalDetails("")
    }
  }

  const generateImage = async () => {
    try {
      // Replace with your actual image generation API endpoint
      const response = await fetch("/api/image-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: `A beautiful landscape of ${destination}` }),
      })

      if (!response.ok) {
        throw new Error("Image generation failed")
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl) // Assuming the API returns an object with imageUrl
      setChatHistory((prev) => [...prev, `AI: Generated image for ${destination}`])
    } catch (error: any) {
      console.error("Error generating image:", error.message)
      setChatHistory((prev) => [...prev, `AI: Error generating image: ${error.message}`])
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory])

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-200 p-4">
        <h2>Conversations</h2>
        <div className="mt-4">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${message.startsWith("You:") ? "bg-blue-100" : "bg-green-100"}`}
            >
              {message}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2>Travel Content Generator</h2>
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isPanelOpen ? "Close Options" : "Open Options"}
          </button>
        </div>

        {/* Sliding Panel */}
        <div
          className={`bg-white shadow-md rounded p-4 mb-4 transition-transform duration-300 ${isPanelOpen ? "translate-x-0" : "-translate-x-full"} overflow-hidden`}
        >
          <h3>Options</h3>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contentType">
              Content Type:
            </label>
            <select
              id="contentType"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={contentType}
              onChange={handleContentTypeChange}
            >
              <option value="itinerary">Itinerary</option>
              <option value="blog_post">Blog Post</option>
              <option value="social_media">Social Media</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="writingStyle">
              Writing Style:
            </label>
            <select
              id="writingStyle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={writingStyle}
              onChange={handleWritingStyleChange}
            >
              <option value="persuasive">Persuasive</option>
              <option value="informative">Informative</option>
              <option value="descriptive">Descriptive</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="routeType">
              Route Type:
            </label>
            <select
              id="routeType"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={routeType}
              onChange={handleRouteTypeChange}
            >
              <option value="road_trip">Road Trip</option>
              <option value="walking_tour">Walking Tour</option>
              <option value="bike_tour">Bike Tour</option>
            </select>
          </div>
        </div>

        <p>Destination: {destination}</p>
        <p>Duration: {duration} days</p>
        <p>Interests: {interests.length ? interests.join(", ") : "None specified"}</p>
        <button
          onClick={generateContent}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Generate Content
        </button>
        <button
          onClick={generateImage}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2"
        >
          Generate Image
        </button>

        {generatedImage && (
          <div className="mt-4">
            <h3>Generated Image:</h3>
            <img src={generatedImage || "/placeholder.svg"} alt="Generated" className="max-w-md" />
          </div>
        )}

        {content && (
          <div className="mt-4">
            <h3>Generated Content:</h3>
            <p>{content}</p>
          </div>
        )}

        {/* Chat Functionality */}
        <div className="mt-4">
          <h3>Chat</h3>
          <div ref={chatContainerRef} className="border rounded p-2 h-48 overflow-y-auto mb-2">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded ${message.startsWith("You:") ? "bg-blue-100" : "bg-green-100"}`}
              >
                {message}
              </div>
            ))}
          </div>
          <div className="flex">
            <textarea
              name="additionalDetails"
              value={additionalDetails}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter additional details..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TravelContentGenerator
