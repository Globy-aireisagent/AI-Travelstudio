// Travel terminology and patterns to help AI understand journey structures

export const TRAVEL_TERMINOLOGY = {
  // Journey Structure Terms
  journeyStructure: {
    phases: [
      "outbound flight",
      "heenvlucht",
      "departure",
      "arrival",
      "aankomst",
      "cruise phase",
      "cruise gedeelte",
      "sailing",
      "land portion",
      "land gedeelte",
      "roadtrip phase",
      "self-drive",
      "zelf rijden",
      "rental car phase",
      "return flight",
      "terugvlucht",
      "homeward journey",
    ],
    transitions: [
      "after the cruise",
      "na de cruise",
      "post-cruise",
      "then",
      "daarna",
      "vervolgens",
      "subsequently",
      "next",
      "volgende",
      "following",
      "from there",
      "vandaar",
      "from that point",
    ],
    continuations: [
      "continues with",
      "gaat verder met",
      "followed by",
      "then pick up",
      "dan ophalen",
      "collect the car",
      "drive to",
      "rijden naar",
      "road trip to",
    ],
  },

  // Accommodation Terms (all variations)
  accommodations: {
    types: [
      "hotel",
      "resort",
      "lodge",
      "inn",
      "motel",
      "B&B",
      "bed and breakfast",
      "guesthouse",
      "pension",
      "apartment",
      "villa",
      "chalet",
      "cabin",
      "cottage",
      "hostel",
      "boutique hotel",
      "luxury hotel",
      "beach resort",
      "ski lodge",
      "mountain lodge",
      "safari lodge",
      "ryokan",
      "riad",
      "hacienda",
      "estancia",
    ],
    patterns: [
      "overnight in",
      "overnachten in",
      "stay at",
      "verblijf in",
      "accommodation in",
      "accommodatie in",
      "hotel in",
      "night at",
      "nacht in",
      "nights at",
      "nachten in",
      "based in",
      "gevestigd in",
      "located in",
    ],
    duration: [
      "1 night",
      "1 nacht",
      "one night",
      "één nacht",
      "2 nights",
      "2 nachten",
      "two nights",
      "twee nachten",
      "3 nights",
      "3 nachten",
      "three nights",
      "drie nachten",
      "several nights",
      "meerdere nachten",
      "multiple nights",
    ],
  },

  // Transport Terms
  transport: {
    cars: [
      "rental car",
      "huurauto",
      "hire car",
      "car rental",
      "self-drive",
      "zelf rijden",
      "own transport",
      "pick up car",
      "auto ophalen",
      "collect car",
      "drop off car",
      "auto inleveren",
      "return car",
      "roadtrip",
      "road trip",
      "driving tour",
      "auto rondreis",
    ],
    flights: [
      "outbound flight",
      "heenvlucht",
      "departure flight",
      "return flight",
      "terugvlucht",
      "homeward flight",
      "internal flight",
      "binnenlandse vlucht",
      "domestic flight",
      "connecting flight",
      "overstapvlucht",
      "transfer flight",
    ],
    cruises: [
      "cruise",
      "cruise ship",
      "sailing",
      "zeilen",
      "embark",
      "inschepen",
      "disembark",
      "ontschepen",
      "port",
      "haven",
      "cruise terminal",
      "cruise haven",
    ],
  },

  // Journey Patterns
  patterns: {
    // Common multi-phase journey structures
    landAndCruise: [
      "land and cruise",
      "land & cruise",
      "cruise and land",
      "combined land cruise",
      "cruise plus land",
      "cruise with land extension",
      "cruise en land combinatie",
    ],

    // Sequential indicators
    sequential: [
      "day 1",
      "dag 1",
      "first day",
      "eerste dag",
      "day 2",
      "dag 2",
      "second day",
      "tweede dag",
      "day 3",
      "dag 3",
      "third day",
      "derde dag",
      "day 4",
      "dag 4",
      "fourth day",
      "vierde dag",
      "day 5",
      "dag 5",
      "fifth day",
      "vijfde dag",
      "day 6",
      "dag 6",
      "sixth day",
      "zesde dag",
      "day 7",
      "dag 7",
      "seventh day",
      "zevende dag",
      "final day",
      "laatste dag",
      "departure day",
      "vertrekdag",
    ],

    // Location transitions
    locationTransitions: [
      "from Miami to",
      "van Miami naar",
      "Miami to",
      "from the port",
      "vanaf de haven",
      "leaving the port",
      "drive to",
      "rijden naar",
      "travel to",
      "reizen naar",
      "continue to",
      "verder naar",
      "proceed to",
      "doorgaan naar",
    ],
  },

  // Context Clues for Continuation
  continuationClues: [
    "after",
    "na",
    "following",
    "volgend op",
    "then",
    "dan",
    "daarna",
    "vervolgens",
    "subsequently",
    "daaropvolgend",
    "next",
    "volgende",
    "from there",
    "vandaar",
    "continuing",
    "voortgaand",
    "the journey continues",
    "de reis gaat verder",
    "post-cruise",
    "na de cruise",
    "after disembarking",
  ],

  // Duration and Timing
  timing: {
    cruise: ["7-day cruise", "7-daagse cruise", "week-long cruise", "cruise duration", "cruise duur", "sailing time"],
    land: ["land portion", "land gedeelte", "driving days", "road trip duration", "rondreis duur", "self-drive days"],
    total: ["total trip", "totale reis", "entire journey", "complete itinerary", "volledige reisroute"],
  },
}

export const JOURNEY_PATTERNS = {
  // Pattern: Land & Cruise Miami (typical structure)
  landAndCruiseMiami: {
    description: "Land & Cruise combination starting/ending in Miami",
    phases: [
      {
        name: "Arrival",
        keywords: ["arrive in Miami", "aankomst Miami", "land in Miami"],
        accommodations: ["Miami hotel", "airport hotel", "Miami Beach hotel"],
        duration: "1-2 nights",
      },
      {
        name: "Cruise Phase",
        keywords: ["embark", "cruise", "sailing", "at sea"],
        accommodations: ["cruise ship", "onboard accommodation"],
        duration: "7 days typical",
        destinations: ["Bahamas", "Caribbean", "Key West"],
      },
      {
        name: "Post-Cruise Land",
        keywords: ["after cruise", "disembark", "pick up car", "rental car"],
        accommodations: ["Miami hotel", "Florida hotels", "roadtrip hotels"],
        duration: "3-7 days",
        activities: ["Florida roadtrip", "Key West drive", "Everglades"],
      },
      {
        name: "Departure",
        keywords: ["return flight", "departure", "fly home"],
        accommodations: ["airport hotel if needed"],
        duration: "final day",
      },
    ],
  },

  // Pattern: European Roadtrip
  europeanRoadtrip: {
    description: "Multi-country European driving tour",
    phases: [
      {
        name: "Arrival",
        accommodations: ["arrival city hotel"],
        duration: "1-2 nights",
      },
      {
        name: "Roadtrip Phase",
        accommodations: ["multiple hotels per country", "city center hotels", "countryside hotels"],
        duration: "7-14 days",
        pattern: "new hotel every 1-3 nights",
      },
    ],
  },
}

export function analyzeJourneyStructure(content: string): {
  detectedPattern: string | null
  phases: Array<{
    name: string
    indicators: string[]
    estimatedAccommodations: number
  }>
  continuationClues: string[]
} {
  const lowerContent = content.toLowerCase()

  // Detect Land & Cruise pattern
  const landCruiseIndicators = TRAVEL_TERMINOLOGY.patterns.landAndCruise
  const hasLandCruise = landCruiseIndicators.some((pattern) => lowerContent.includes(pattern.toLowerCase()))

  // Find continuation clues
  const foundContinuationClues = TRAVEL_TERMINOLOGY.continuationClues.filter((clue) =>
    lowerContent.includes(clue.toLowerCase()),
  )

  // Detect sequential day patterns
  const dayPattern = /day\s*(\d+)|dag\s*(\d+)/gi
  const dayMatches = [...content.matchAll(dayPattern)]
  const maxDay = Math.max(...dayMatches.map((m) => Number.parseInt(m[1] || m[2] || "0")))

  if (hasLandCruise) {
    return {
      detectedPattern: "Land & Cruise Miami",
      phases: [
        {
          name: "Pre-Cruise Miami",
          indicators: ["arrive", "Miami hotel", "before cruise"],
          estimatedAccommodations: 1,
        },
        {
          name: "Cruise Phase",
          indicators: ["cruise", "ship", "sailing"],
          estimatedAccommodations: 1, // Ship accommodation
        },
        {
          name: "Post-Cruise Florida",
          indicators: ["after cruise", "rental car", "Florida", "roadtrip"],
          estimatedAccommodations: Math.max(3, Math.floor(maxDay / 2)), // Estimate based on days
        },
      ],
      continuationClues: foundContinuationClues,
    }
  }

  return {
    detectedPattern: null,
    phases: [],
    continuationClues: foundContinuationClues,
  }
}
