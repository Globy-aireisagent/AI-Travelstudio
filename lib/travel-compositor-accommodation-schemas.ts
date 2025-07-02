// Complete Travel Compositor Accommodation API Schemas
// Based on the detailed ApiAccommodationCombinationVO structure

export interface ApiAccommodationCombinationVO {
  rooms: ApiAccommodationRoomVO[]
  mealPlan: MealPlanVO
  onRequest: boolean
  price: MoneyVO
  priceBreakdown: ApiAccommodationPriceBreakdownVO
  offer: ApiAccommodationOfferVO
  provider: string
  cancellationPolicies: CancellationPolicyVO[]
}

export interface ApiAccommodationRoomVO {
  description: string
  groupingRoomType: string
  // Additional room properties that might be present
  roomType?: string
  occupancy?: number
  bedType?: string
  amenities?: string[]
  size?: number
  view?: string
  smokingPolicy?: string
}

export interface MealPlanVO {
  id: string
  type: MealPlanType
  description: string
  providerDescription: string
}

export enum MealPlanType {
  // TODO: Add actual values from Array [6]
  // Common meal plan types in travel industry:
  ROOM_ONLY = "ROOM_ONLY",
  BREAKFAST = "BREAKFAST",
  HALF_BOARD = "HALF_BOARD",
  FULL_BOARD = "FULL_BOARD",
  ALL_INCLUSIVE = "ALL_INCLUSIVE",
  AMERICAN_PLAN = "AMERICAN_PLAN",
}

export interface MoneyVO {
  amount: number
  currency: Currency
}

export enum Currency {
  EUR = "EUR",
  USD = "USD",
  GBP = "GBP",
  BRL = "BRL",
  MAD = "MAD",
  MXN = "MXN",
  AED = "AED",
  EGP = "EGP",
  OMR = "OMR",
  SAR = "SAR",
  IRR = "IRR",
  QAR = "QAR",
  JOD = "JOD",
  BHD = "BHD",
  KWD = "KWD",
  DKK = "DKK",
  SEK = "SEK",
  NOK = "NOK",
  ISK = "ISK",
  CHF = "CHF",
  SGD = "SGD",
  COP = "COP",
  AUD = "AUD",
  RUB = "RUB",
  NIO = "NIO",
  CAD = "CAD",
  HUF = "HUF",
  PLN = "PLN",
  THB = "THB",
  MYR = "MYR",
  ZAR = "ZAR",
  NAD = "NAD",
  PYG = "PYG",
  CRC = "CRC",
  INR = "INR",
  KRW = "KRW",
  BGN = "BGN",
  JPY = "JPY",
  NZD = "NZD",
  FJD = "FJD",
  BWP = "BWP",
  WST = "WST",
  XPF = "XPF",
  TRY = "TRY",
  CNY = "CNY",
  ARS = "ARS",
  BDT = "BDT",
  CUP = "CUP",
  HKD = "HKD",
  IDR = "IDR",
  LKR = "LKR",
  MMK = "MMK",
  PHP = "PHP",
  PKR = "PKR",
  VND = "VND",
  TWD = "TWD",
  MZN = "MZN",
  CLP = "CLP",
  PEN = "PEN",
  UYU = "UYU",
  GTQ = "GTQ",
  BOB = "BOB",
  HNL = "HNL",
  SVC = "SVC",
  HRK = "HRK",
  CZK = "CZK",
  MKD = "MKD",
  RON = "RON",
  RSD = "RSD",
  ALL = "ALL",
  BYN = "BYN",
  MOP = "MOP",
  MDL = "MDL",
  UAH = "UAH",
  KES = "KES",
  DOP = "DOP",
  AZN = "AZN",
  TND = "TND",
  CDF = "CDF",
  SSP = "SSP",
  XAF = "XAF",
  AFN = "AFN",
  AMD = "AMD",
  ANG = "ANG",
  AOA = "AOA",
  AWG = "AWG",
  BAM = "BAM",
  BBD = "BBD",
  BIF = "BIF",
  BMD = "BMD",
  BND = "BND",
  BSD = "BSD",
  BTN = "BTN",
  BYR = "BYR",
  BZD = "BZD",
  CLF = "CLF",
  CUC = "CUC",
  CVE = "CVE",
  DJF = "DJF",
  DZD = "DZD",
  ERN = "ERN",
  ETB = "ETB",
  FKP = "FKP",
  GEL = "GEL",
  GHS = "GHS",
  GIP = "GIP",
  GMD = "GMD",
  GNF = "GNF",
  GYD = "GYD",
  HTG = "HTG",
  ILS = "ILS",
  IQD = "IQD",
  JMD = "JMD",
  KGS = "KGS",
  KHR = "KHR",
  KMF = "KMF",
  KPW = "KPW",
  KYD = "KYD",
  KZT = "KZT",
  LAK = "LAK",
  LBP = "LBP",
  LRD = "LRD",
  LSL = "LSL",
  LYD = "LYD",
  MGA = "MGA",
  MNT = "MNT",
  MUR = "MUR",
  MVR = "MVR",
  MWK = "MWK",
  NGN = "NGN",
  NPR = "NPR",
  PAB = "PAB",
  PGK = "PGK",
  RWF = "RWF",
  SBD = "SBD",
  MRO = "MRO",
  MRU = "MRU",
  SCR = "SCR",
  SDG = "SDG",
  SHP = "SHP",
  SLL = "SLL",
  SOS = "SOS",
  SRD = "SRD",
  STD = "STD",
  SYP = "SYP",
  SZL = "SZL",
  TJS = "TJS",
  TMT = "TMT",
  TOP = "TOP",
  TTD = "TTD",
  TZS = "TZS",
  UGX = "UGX",
  UZS = "UZS",
  VEF = "VEF",
  VUV = "VUV",
  XAG = "XAG",
  XAU = "XAU",
  XCD = "XCD",
  XDR = "XDR",
  XOF = "XOF",
  XPD = "XPD",
  XPT = "XPT",
  YER = "YER",
  ZMK = "ZMK",
  ZMW = "ZMW",
  ZWL = "ZWL",
  VES = "VES",
}

export interface ApiAccommodationPriceBreakdownVO {
  agencyFee: MoneyVO
  rsp: RspVO
  // Additional price breakdown fields
  basePrice?: MoneyVO
  taxes?: MoneyVO
  fees?: MoneyVO
  discounts?: MoneyVO
  totalPrice?: MoneyVO
  pricePerNight?: MoneyVO
  pricePerPerson?: MoneyVO
}

export interface RspVO {
  // RSP (Recommended Selling Price) details
  amount?: number
  currency?: Currency
  margin?: number
  marginPercentage?: number
  costPrice?: MoneyVO
  markup?: MoneyVO
}

export interface ApiAccommodationOfferVO {
  strikethroughPrice: MoneyVO
  // Additional offer fields
  discountPercentage?: number
  offerType?: string
  validUntil?: string
  description?: string
  conditions?: string[]
  promotionCode?: string
}

export interface CancellationPolicyVO {
  date: string // ISO date string
  netPrice: MoneyVO
  amount: MoneyVO
  policyAmount: MoneyAmountVO
  // Additional cancellation policy fields
  description?: string
  penaltyType?: CancellationPenaltyType
  refundable?: boolean
  conditions?: string[]
}

export interface MoneyAmountVO {
  amount: number
  currency: Currency
  // Additional amount details
  formatted?: string
  exchangeRate?: number
  originalAmount?: number
  originalCurrency?: Currency
}

export enum CancellationPenaltyType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  NIGHTS = "NIGHTS",
  NO_REFUND = "NO_REFUND",
  FREE_CANCELLATION = "FREE_CANCELLATION",
}

// Enhanced accommodation search and booking interfaces
export interface AccommodationSearchRequest {
  checkIn: string
  checkOut: string
  rooms: RoomOccupancyRequest[]
  destinationId?: string
  hotelIds?: string[]
  mealPlan?: MealPlanType
  minPrice?: number
  maxPrice?: number
  currency?: Currency
  amenities?: string[]
  starRating?: number[]
  provider?: string[]
  language?: string
  sourceMarket?: string
}

export interface RoomOccupancyRequest {
  adults: number
  children: number
  childAges?: number[]
  roomType?: string
}

export interface AccommodationSearchResponse {
  hotels: HotelSearchResult[]
  totalResults: number
  searchId: string
  currency: Currency
  filters: SearchFilters
}

export interface HotelSearchResult {
  hotelId: string
  name: string
  description: string
  starRating: number
  location: HotelLocation
  images: string[]
  amenities: string[]
  combinations: ApiAccommodationCombinationVO[]
  minPrice: MoneyVO
  maxPrice: MoneyVO
  provider: string
  reviewScore?: number
  reviewCount?: number
}

export interface HotelLocation {
  address: string
  city: string
  country: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  distanceToCenter?: number
  nearbyAttractions?: string[]
}

export interface SearchFilters {
  priceRange: {
    min: number
    max: number
    currency: Currency
  }
  starRatings: number[]
  amenities: string[]
  mealPlans: MealPlanType[]
  providers: string[]
  locations: string[]
}

// Booking interfaces
export interface AccommodationBookingRequest {
  hotelId: string
  combinationId: string
  checkIn: string
  checkOut: string
  rooms: BookingRoomRequest[]
  guests: GuestDetails[]
  specialRequests?: string[]
  externalReference?: string
}

export interface BookingRoomRequest {
  roomType: string
  adults: number
  children: number
  childAges?: number[]
  smokingPreference?: boolean
  bedPreference?: string
}

export interface GuestDetails {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth?: string
  nationality?: string
  documentType?: string
  documentNumber?: string
  isMainGuest?: boolean
}

export interface AccommodationBookingResponse {
  bookingReference: string
  status: BookingStatus
  hotel: HotelBookingDetails
  totalPrice: MoneyVO
  cancellationPolicies: CancellationPolicyVO[]
  confirmationNumber?: string
  voucherUrl?: string
  checkInInstructions?: string
  contactInfo?: HotelContactInfo
}

export interface HotelBookingDetails {
  hotelId: string
  name: string
  address: string
  checkIn: string
  checkOut: string
  nights: number
  rooms: BookedRoomDetails[]
  mealPlan: MealPlanVO
  amenities: string[]
}

export interface BookedRoomDetails {
  roomType: string
  description: string
  occupancy: number
  guests: string[]
  roomNumber?: string
  floor?: number
  view?: string
}

export interface HotelContactInfo {
  phone: string
  email: string
  website?: string
  checkInTime: string
  checkOutTime: string
  emergencyContact?: string
}

export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  ON_REQUEST = "ON_REQUEST",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

// Utility functions for working with accommodation data
export class AccommodationUtils {
  static formatPrice(money: MoneyVO): string {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return formatter.format(money.amount)
  }

  static calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  static getMealPlanDescription(mealPlan: MealPlanType): string {
    const descriptions = {
      [MealPlanType.ROOM_ONLY]: "Room Only",
      [MealPlanType.BREAKFAST]: "Breakfast Included",
      [MealPlanType.HALF_BOARD]: "Half Board (Breakfast + Dinner)",
      [MealPlanType.FULL_BOARD]: "Full Board (All Meals)",
      [MealPlanType.ALL_INCLUSIVE]: "All Inclusive",
      [MealPlanType.AMERICAN_PLAN]: "American Plan",
    }
    return descriptions[mealPlan] || mealPlan
  }

  static isCancellationFree(policy: CancellationPolicyVO, currentDate: Date = new Date()): boolean {
    const policyDate = new Date(policy.date)
    return currentDate <= policyDate && policy.amount.amount === 0
  }

  static calculateTotalOccupancy(rooms: RoomOccupancyRequest[]): { adults: number; children: number } {
    return rooms.reduce(
      (total, room) => ({
        adults: total.adults + room.adults,
        children: total.children + room.children,
      }),
      { adults: 0, children: 0 },
    )
  }

  static validateBookingDates(checkIn: string, checkOut: string): { valid: boolean; error?: string } {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const today = new Date()

    if (start >= end) {
      return { valid: false, error: "Check-out date must be after check-in date" }
    }

    if (start < today) {
      return { valid: false, error: "Check-in date cannot be in the past" }
    }

    return { valid: true }
  }

  static groupCombinationsByPrice(combinations: ApiAccommodationCombinationVO[]): {
    budget: ApiAccommodationCombinationVO[]
    standard: ApiAccommodationCombinationVO[]
    premium: ApiAccommodationCombinationVO[]
  } {
    const sorted = [...combinations].sort((a, b) => a.price.amount - b.price.amount)
    const third = Math.ceil(sorted.length / 3)

    return {
      budget: sorted.slice(0, third),
      standard: sorted.slice(third, third * 2),
      premium: sorted.slice(third * 2),
    }
  }

  static getServiceStatusDescription(status: ServiceStatus): string {
    const descriptions = {
      [ServiceStatus.NOT_QUOTED]: "Not Quoted - Initial state, no pricing available",
      [ServiceStatus.QUOTED]: "Quoted - Pricing available, ready for booking",
      [ServiceStatus.LOAD_CANCELLATION_POLICIES_ERROR]: "Error loading cancellation policies",
      [ServiceStatus.CONFIRMATION_ERROR]: "Error during confirmation process",
      [ServiceStatus.CONFIRMED]: "Confirmed - Booking confirmed by supplier",
      [ServiceStatus.PREBOOKED]: "Pre-booked - Temporarily reserved",
      [ServiceStatus.PAID]: "Paid - Payment processed successfully",
      [ServiceStatus.BOOKED]: "Booked - Final booking completed",
      [ServiceStatus.NEED_QUOTE]: "Need Quote - Requires new pricing",
      [ServiceStatus.BOOK_ERROR]: "Booking Error - Failed to complete booking",
      [ServiceStatus.RQ]: "On Request - Awaiting supplier confirmation",
      [ServiceStatus.NOT_BOOKED]: "Not Booked - Available but not reserved",
      [ServiceStatus.PENDING_BOOK]: "Pending Booking - Booking in progress",
      [ServiceStatus.CANCELED]: "Canceled - Booking has been cancelled",
      [ServiceStatus.LOCKED]: "Locked - Temporarily unavailable for changes",
      [ServiceStatus.PRICE_ERROR]: "Price Error - Pricing issue encountered",
      [ServiceStatus.PENDING_UPDATE]: "Pending Update - Changes being processed",
      [ServiceStatus.WITH_PROPOSALS]: "With Proposals - Alternative options available",
      [ServiceStatus.WAITING_SUPPLIER]: "Waiting Supplier - Awaiting supplier response",
    }
    return descriptions[status] || status
  }

  static getServiceStatusColor(status: ServiceStatus): string {
    const colors = {
      [ServiceStatus.NOT_QUOTED]: "gray",
      [ServiceStatus.QUOTED]: "blue",
      [ServiceStatus.LOAD_CANCELLATION_POLICIES_ERROR]: "red",
      [ServiceStatus.CONFIRMATION_ERROR]: "red",
      [ServiceStatus.CONFIRMED]: "green",
      [ServiceStatus.PREBOOKED]: "yellow",
      [ServiceStatus.PAID]: "green",
      [ServiceStatus.BOOKED]: "green",
      [ServiceStatus.NEED_QUOTE]: "orange",
      [ServiceStatus.BOOK_ERROR]: "red",
      [ServiceStatus.RQ]: "purple",
      [ServiceStatus.NOT_BOOKED]: "gray",
      [ServiceStatus.PENDING_BOOK]: "yellow",
      [ServiceStatus.CANCELED]: "red",
      [ServiceStatus.LOCKED]: "orange",
      [ServiceStatus.PRICE_ERROR]: "red",
      [ServiceStatus.PENDING_UPDATE]: "yellow",
      [ServiceStatus.WITH_PROPOSALS]: "blue",
      [ServiceStatus.WAITING_SUPPLIER]: "purple",
    }
    return colors[status] || "gray"
  }

  static isBookingComplete(status: ServiceStatus): boolean {
    return [ServiceStatus.CONFIRMED, ServiceStatus.PAID, ServiceStatus.BOOKED].includes(status)
  }

  static isBookingPending(status: ServiceStatus): boolean {
    return [
      ServiceStatus.PREBOOKED,
      ServiceStatus.PENDING_BOOK,
      ServiceStatus.PENDING_UPDATE,
      ServiceStatus.WAITING_SUPPLIER,
      ServiceStatus.RQ,
    ].includes(status)
  }

  static isBookingError(status: ServiceStatus): boolean {
    return [
      ServiceStatus.LOAD_CANCELLATION_POLICIES_ERROR,
      ServiceStatus.CONFIRMATION_ERROR,
      ServiceStatus.BOOK_ERROR,
      ServiceStatus.PRICE_ERROR,
    ].includes(status)
  }

  static calculateDistanceFromCoordinates(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in kilometers
  }

  static formatGiataId(giataId: number): string {
    return `GIATA-${giataId.toString().padStart(6, "0")}`
  }

  static getHotelTypeDescription(type: HotelType): string {
    const descriptions = {
      [HotelType.HOTEL]: "Traditional Hotel",
      [HotelType.RESORT]: "Resort with amenities",
      [HotelType.APARTMENT]: "Apartment/Serviced Apartment",
      [HotelType.VILLA]: "Private Villa",
      [HotelType.HOSTEL]: "Budget Hostel",
      [HotelType.BED_AND_BREAKFAST]: "Bed & Breakfast",
      [HotelType.GUESTHOUSE]: "Guesthouse",
      [HotelType.BOUTIQUE_HOTEL]: "Boutique Hotel",
      [HotelType.BUSINESS_HOTEL]: "Business Hotel",
      [HotelType.LUXURY_HOTEL]: "Luxury Hotel",
      [HotelType.BUDGET_HOTEL]: "Budget Hotel",
      [HotelType.MOTEL]: "Motel",
      [HotelType.INN]: "Inn",
      [HotelType.LODGE]: "Lodge",
      [HotelType.CHALET]: "Chalet",
      [HotelType.CABIN]: "Cabin",
      [HotelType.CAMPING]: "Camping",
      [HotelType.GLAMPING]: "Glamping",
      [HotelType.CRUISE_SHIP]: "Cruise Ship",
      [HotelType.TRAIN]: "Train Accommodation",
      [HotelType.OTHER]: "Other Accommodation",
    }
    return descriptions[type] || type
  }

  static getTripTypeDescription(tripType: TripType): string {
    const descriptions = {
      [TripType.MULTI]: "Multi-service trip (flights + hotels + activities)",
      [TripType.GROUPS]: "Group travel booking",
      [TripType.ONLY_HOTEL]: "Hotel only booking",
      [TripType.ONLY_HOUSE]: "House/vacation rental only",
      [TripType.ONLY_FLIGHT]: "Flight only booking",
      [TripType.ONLY_TRAIN]: "Train only booking",
      [TripType.FLIGHT_HOTEL]: "Flight + Hotel package",
      [TripType.FLIGHT_HOUSE]: "Flight + House package",
      [TripType.ONLY_TICKET]: "Activity/attraction ticket only",
      [TripType.EVENT_TICKET]: "Event ticket booking",
      [TripType.SPECIAL_TICKET]: "Special event/experience ticket",
      [TripType.ONLY_CAR]: "Car rental only",
      [TripType.ONLY_TRANSFER]: "Transfer service only",
      [TripType.HOLIDAYS]: "Holiday package",
      [TripType.GIFTCARD]: "Gift card purchase",
      [TripType.EXTERNAL_SEARCH_BOX]: "External search integration",
      [TripType.GIFT_BOX]: "Gift experience box",
      [TripType.ROUTING]: "Route planning service",
      [TripType.PRIVATE_TOUR]: "Private tour booking",
      [TripType.MAGIC_BOX]: "Surprise travel package",
      [TripType.CRUISES]: "Cruise booking",
      [TripType.ONLY_RIDE_HAILING]: "Ride hailing service",
      [TripType.AI_TRIP]: "AI-generated trip",
      [TripType.MEMBERSHIP]: "Membership/subscription",
      [TripType.ONLY_INSURANCE]: "Travel insurance only",
      [TripType.ONLY_ITEM]: "Travel item/product",
      [TripType.TRIP_PLANNER]: "Trip planning service",
    }
    return descriptions[tripType] || tripType
  }

  static getLanguageDisplayName(language: Language): string {
    const displayNames = {
      [Language.EN]: "English",
      [Language.EN_IE]: "English (Ireland)",
      [Language.EN_US]: "English (US)",
      [Language.ES]: "Español",
      [Language.IT]: "Italiano",
      [Language.FR]: "Français",
      [Language.PT]: "Português",
      [Language.PT_BR]: "Português (Brasil)",
      [Language.AR]: "العربية",
      [Language.RO]: "Română",
      [Language.EL]: "Ελληνικά",
      [Language.FI]: "Suomi",
      [Language.DE]: "Deutsch",
      [Language.NL]: "Nederlands",
      [Language.SV]: "Svenska",
      [Language.ZH]: "中文",
      [Language.ZH_TW]: "中文 (台灣)",
      [Language.RU]: "Русский",
      [Language.HU]: "Magyar",
      [Language.FA]: "فارسی",
      [Language.PL]: "Polski",
      [Language.CA]: "Català",
      [Language.BG]: "Български",
      [Language.JA]: "日本語",
      [Language.MS]: "Bahasa Melayu",
      [Language.NO]: "Norsk",
      [Language.TR]: "Türkçe",
      [Language.SK]: "Slovenčina",
      [Language.SL]: "Slovenščina",
      [Language.CS]: "Čeština",
      [Language.HR]: "Hrvatski",
      [Language.AZ]: "Azərbaycan",
      [Language.HE]: "עברית",
      [Language.DA]: "Dansk",
      [Language.TH]: "ไทย",
      [Language.SQ]: "Shqip",
    }
    return displayNames[language] || language
  }

  static getTripTypeIcon(tripType: TripType): string {
    const icons = {
      [TripType.MULTI]: "🌍",
      [TripType.GROUPS]: "👥",
      [TripType.ONLY_HOTEL]: "🏨",
      [TripType.ONLY_HOUSE]: "🏠",
      [TripType.ONLY_FLIGHT]: "✈️",
      [TripType.ONLY_TRAIN]: "🚂",
      [TripType.FLIGHT_HOTEL]: "✈️🏨",
      [TripType.FLIGHT_HOUSE]: "✈️🏠",
      [TripType.ONLY_TICKET]: "🎫",
      [TripType.EVENT_TICKET]: "🎭",
      [TripType.SPECIAL_TICKET]: "🎪",
      [TripType.ONLY_CAR]: "🚗",
      [TripType.ONLY_TRANSFER]: "🚐",
      [TripType.HOLIDAYS]: "🏖️",
      [TripType.GIFTCARD]: "🎁",
      [TripType.EXTERNAL_SEARCH_BOX]: "🔍",
      [TripType.GIFT_BOX]: "🎁",
      [TripType.ROUTING]: "🗺️",
      [TripType.PRIVATE_TOUR]: "👨‍🏫",
      [TripType.MAGIC_BOX]: "✨",
      [TripType.CRUISES]: "🚢",
      [TripType.ONLY_RIDE_HAILING]: "🚕",
      [TripType.AI_TRIP]: "🤖",
      [TripType.MEMBERSHIP]: "💳",
      [TripType.ONLY_INSURANCE]: "🛡️",
      [TripType.ONLY_ITEM]: "📦",
      [TripType.TRIP_PLANNER]: "📋",
    }
    return icons[tripType] || "🌍"
  }

  static isValidTripType(type: string): type is TripType {
    return Object.values(TripType).includes(type as TripType)
  }

  static isValidLanguage(lang: string): lang is Language {
    return Object.values(Language).includes(lang as Language)
  }

  static getLanguageFlag(language: Language): string {
    const flags = {
      [Language.EN]: "🇬🇧",
      [Language.EN_IE]: "🇮🇪",
      [Language.EN_US]: "🇺🇸",
      [Language.ES]: "🇪🇸",
      [Language.IT]: "🇮🇹",
      [Language.FR]: "🇫🇷",
      [Language.PT]: "🇵🇹",
      [Language.PT_BR]: "🇧🇷",
      [Language.AR]: "🇸🇦",
      [Language.RO]: "🇷🇴",
      [Language.EL]: "🇬🇷",
      [Language.FI]: "🇫🇮",
      [Language.DE]: "🇩🇪",
      [Language.NL]: "🇳🇱",
      [Language.SV]: "🇸🇪",
      [Language.ZH]: "🇨🇳",
      [Language.ZH_TW]: "🇹🇼",
      [Language.RU]: "🇷🇺",
      [Language.HU]: "🇭🇺",
      [Language.FA]: "🇮🇷",
      [Language.PL]: "🇵🇱",
      [Language.CA]: "🇪🇸",
      [Language.BG]: "🇧🇬",
      [Language.JA]: "🇯🇵",
      [Language.MS]: "🇲🇾",
      [Language.NO]: "🇳🇴",
      [Language.TR]: "🇹🇷",
      [Language.SK]: "🇸🇰",
      [Language.SL]: "🇸🇮",
      [Language.CS]: "🇨🇿",
      [Language.HR]: "🇭🇷",
      [Language.AZ]: "🇦🇿",
      [Language.HE]: "🇮🇱",
      [Language.DA]: "🇩🇰",
      [Language.TH]: "🇹🇭",
      [Language.SQ]: "🇦🇱",
    }
    return flags[language] || "🌍"
  }
}

// Hotel Data Sheet - Basic hotel information from GIATA database
export interface ApiAccommodationDataSheetVO {
  code: string
  giataId: number // GIATA is the global hotel database standard
  name: string
  category: ApiAccommodationCategoryVO
  geolocation: GeolocationVO
}

export interface ApiAccommodationCategoryVO {
  code: string
  name: string
  // Additional category properties
  starRating?: number
  description?: string
  amenities?: string[]
  hotelType?: HotelType
}

export interface GeolocationVO {
  latitude: number
  longitude: number
  // Additional geolocation properties
  accuracy?: number
  altitude?: number
  address?: string
  city?: string
  country?: string
  postalCode?: string
}

// Comprehensive service status enum covering entire booking lifecycle
export enum ServiceStatus {
  NOT_QUOTED = "NOT_QUOTED",
  QUOTED = "QUOTED",
  LOAD_CANCELLATION_POLICIES_ERROR = "LOAD_CANCELLATION_POLICIES_ERROR",
  CONFIRMATION_ERROR = "CONFIRMATION_ERROR",
  CONFIRMED = "CONFIRMED",
  PREBOOKED = "PREBOOKED",
  PAID = "PAID",
  BOOKED = "BOOKED",
  NEED_QUOTE = "NEED_QUOTE",
  BOOK_ERROR = "BOOK_ERROR",
  RQ = "RQ", // Request/Requirement status
  NOT_BOOKED = "NOT_BOOKED",
  PENDING_BOOK = "PENDING_BOOK",
  CANCELED = "CANCELED",
  LOCKED = "LOCKED",
  PRICE_ERROR = "PRICE_ERROR",
  PENDING_UPDATE = "PENDING_UPDATE",
  WITH_PROPOSALS = "WITH_PROPOSALS",
  WAITING_SUPPLIER = "WAITING_SUPPLIER",
}

// Hotel type classification
export enum HotelType {
  HOTEL = "HOTEL",
  RESORT = "RESORT",
  APARTMENT = "APARTMENT",
  VILLA = "VILLA",
  HOSTEL = "HOSTEL",
  BED_AND_BREAKFAST = "BED_AND_BREAKFAST",
  GUESTHOUSE = "GUESTHOUSE",
  BOUTIQUE_HOTEL = "BOUTIQUE_HOTEL",
  BUSINESS_HOTEL = "BUSINESS_HOTEL",
  LUXURY_HOTEL = "LUXURY_HOTEL",
  BUDGET_HOTEL = "BUDGET_HOTEL",
  MOTEL = "MOTEL",
  INN = "INN",
  LODGE = "LODGE",
  CHALET = "CHALET",
  CABIN = "CABIN",
  CAMPING = "CAMPING",
  GLAMPING = "GLAMPING",
  CRUISE_SHIP = "CRUISE_SHIP",
  TRAIN = "TRAIN",
  OTHER = "OTHER",
}

// Enhanced interfaces that use the new schemas
export interface EnhancedHotelSearchResult extends HotelSearchResult {
  dataSheet: ApiAccommodationDataSheetVO
  serviceStatus: ServiceStatus
  distanceFromCenter?: number
  nearbyAttractions?: Array<{
    name: string
    distance: number
    type: string
  }>
}

export interface EnhancedAccommodationBookingResponse extends AccommodationBookingResponse {
  serviceStatus: ServiceStatus
  giataId?: number
  geolocation?: GeolocationVO
  statusHistory?: Array<{
    status: ServiceStatus
    timestamp: string
    note?: string
  }>
}

// Type guards for runtime type checking
export const isValidCurrency = (currency: string): currency is Currency => {
  return Object.values(Currency).includes(currency as Currency)
}

export const isValidMealPlanType = (type: string): type is MealPlanType => {
  return Object.values(MealPlanType).includes(type as MealPlanType)
}

export const isValidBookingStatus = (status: string): status is BookingStatus => {
  return Object.values(BookingStatus).includes(status as BookingStatus)
}

// Type guards for the new types
export const isValidServiceStatus = (status: string): status is ServiceStatus => {
  return Object.values(ServiceStatus).includes(status as ServiceStatus)
}

export const isValidHotelType = (type: string): type is HotelType => {
  return Object.values(HotelType).includes(type as HotelType)
}

// Trip Type Classification - Complete travel service types
export enum TripType {
  MULTI = "MULTI",
  GROUPS = "GROUPS",
  ONLY_HOTEL = "ONLY_HOTEL",
  ONLY_HOUSE = "ONLY_HOUSE",
  ONLY_FLIGHT = "ONLY_FLIGHT",
  ONLY_TRAIN = "ONLY_TRAIN",
  FLIGHT_HOTEL = "FLIGHT_HOTEL",
  FLIGHT_HOUSE = "FLIGHT_HOUSE",
  ONLY_TICKET = "ONLY_TICKET",
  EVENT_TICKET = "EVENT_TICKET",
  SPECIAL_TICKET = "SPECIAL_TICKET",
  ONLY_CAR = "ONLY_CAR",
  ONLY_TRANSFER = "ONLY_TRANSFER",
  HOLIDAYS = "HOLIDAYS",
  GIFTCARD = "GIFTCARD",
  EXTERNAL_SEARCH_BOX = "EXTERNAL_SEARCH_BOX",
  GIFT_BOX = "GIFT_BOX",
  ROUTING = "ROUTING",
  PRIVATE_TOUR = "PRIVATE_TOUR",
  MAGIC_BOX = "MAGIC_BOX",
  CRUISES = "CRUISES",
  ONLY_RIDE_HAILING = "ONLY_RIDE_HAILING",
  AI_TRIP = "AI_TRIP",
  MEMBERSHIP = "MEMBERSHIP",
  ONLY_INSURANCE = "ONLY_INSURANCE",
  ONLY_ITEM = "ONLY_ITEM",
  TRIP_PLANNER = "TRIP_PLANNER",
}

// Language Support - All supported languages
export enum Language {
  EN = "en",
  EN_IE = "en_ie",
  EN_US = "en_us",
  ES = "es",
  IT = "it",
  FR = "fr",
  PT = "pt",
  PT_BR = "pt_br",
  AR = "ar",
  RO = "ro",
  EL = "el",
  FI = "fi",
  DE = "de",
  NL = "nl",
  SV = "sv",
  ZH = "zh",
  ZH_TW = "zh_tw",
  RU = "ru",
  HU = "hu",
  FA = "fa",
  PL = "pl",
  CA = "ca",
  BG = "bg",
  JA = "ja",
  MS = "ms",
  NO = "no",
  TR = "tr",
  SK = "sk",
  SL = "sl",
  CS = "cs",
  HR = "hr",
  AZ = "az",
  HE = "he",
  DA = "da",
  TH = "th",
  SQ = "sq",
}

// -----------------------------------------------------------------------------
// TOP-LEVEL TYPE-GUARDS (needed by other modules)
// -----------------------------------------------------------------------------

/**
 * Check if a given string is a valid TripType.
 * Re-exported at module level so it can be imported with:
 *   import { isValidTripType } from "@/lib/travel-compositor-accommodation-schemas"
 */
export const isValidTripType = (type: string): type is TripType => {
  return Object.values(TripType).includes(type as TripType)
}

/**
 * Check if a given string is a valid Language code.
 * Re-exported at module level so it can be imported with:
 *   import { isValidLanguage } from "@/lib/travel-compositor-accommodation-schemas"
 */
export const isValidLanguage = (lang: string): lang is Language => {
  return Object.values(Language).includes(lang as Language)
}
