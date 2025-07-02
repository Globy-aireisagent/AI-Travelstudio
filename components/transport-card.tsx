"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, Luggage, ArrowRight } from "lucide-react"

interface TransportCardProps {
  transport: any
  index: number
}

export default function TransportCard({ transport, index }: TransportCardProps) {
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "Onbekend"
    try {
      const date = new Date(dateStr)
      return date.toLocaleString("nl-NL", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Onbekend"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const getFlightDuration = (departure: string, arrival: string) => {
    if (!departure || !arrival) return null
    try {
      const dep = new Date(departure)
      const arr = new Date(arrival)
      const diffMs = arr.getTime() - dep.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      return `${diffHours}u ${diffMinutes}m`
    } catch {
      return null
    }
  }

  const isReturn = transport.returnDepartureAirport && transport.returnArrivalAirport

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plane className="w-5 h-5 text-blue-600" />
          Vlucht {index + 1}
          {isReturn && <Badge variant="outline">Retour</Badge>}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Outbound Flight */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">{isReturn ? "Heenvlucht" : "Vlucht"}</h4>
            <Badge className="bg-blue-600">{transport.provider || transport.operatorProvider || "Airline"}</Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Departure */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{transport.departureAirport || "???"}</div>
              <div className="text-sm text-gray-600 mt-1">
                {formatDateTime(transport.startDate || transport.departureDate)}
              </div>
              <div className="text-xs text-gray-500">Vertrek</div>
            </div>

            {/* Flight Info */}
            <div className="text-center flex flex-col justify-center">
              <ArrowRight className="w-6 h-6 mx-auto text-blue-600 mb-1" />
              {getFlightDuration(
                transport.startDate || transport.departureDate,
                transport.endDate || transport.arrivalDate,
              ) && (
                <div className="text-sm text-gray-600">
                  {getFlightDuration(
                    transport.startDate || transport.departureDate,
                    transport.endDate || transport.arrivalDate,
                  )}
                </div>
              )}
              {transport.segment && transport.segment.length > 0 && (
                <div className="text-xs text-gray-500">
                  {transport.segment.length > 1 ? `${transport.segment.length} stops` : "Direct"}
                </div>
              )}
            </div>

            {/* Arrival */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{transport.arrivalAirport || "???"}</div>
              <div className="text-sm text-gray-600 mt-1">
                {formatDateTime(transport.endDate || transport.arrivalDate)}
              </div>
              <div className="text-xs text-gray-500">Aankomst</div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-blue-200">
            {transport.bookingReference && (
              <div className="text-xs">
                <span className="text-gray-500">Booking:</span>
                <div className="font-mono">{transport.bookingReference}</div>
              </div>
            )}
            {transport.providerBookingReference && (
              <div className="text-xs">
                <span className="text-gray-500">PNR:</span>
                <div className="font-mono">{transport.providerBookingReference}</div>
              </div>
            )}
            {transport.includedBaggage && (
              <div className="text-xs flex items-center gap-1">
                <Luggage className="w-3 h-3" />
                <span>{transport.includedBaggage}</span>
              </div>
            )}
            {transport.status && (
              <div className="text-xs">
                <Badge variant={transport.status === "BOOKED" ? "default" : "secondary"} className="text-xs">
                  {transport.status}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Return Flight */}
        {isReturn && (
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Terugvlucht</h4>
              <Badge className="bg-green-600">{transport.provider || transport.operatorProvider || "Airline"}</Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Return Departure */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{transport.returnDepartureAirport || "???"}</div>
                <div className="text-sm text-gray-600 mt-1">{formatDateTime(transport.returnDepartureDate)}</div>
                <div className="text-xs text-gray-500">Vertrek</div>
              </div>

              {/* Return Flight Info */}
              <div className="text-center flex flex-col justify-center">
                <ArrowRight className="w-6 h-6 mx-auto text-green-600 mb-1" />
                {getFlightDuration(transport.returnDepartureDate, transport.returnArrivalDate) && (
                  <div className="text-sm text-gray-600">
                    {getFlightDuration(transport.returnDepartureDate, transport.returnArrivalDate)}
                  </div>
                )}
              </div>

              {/* Return Arrival */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{transport.returnArrivalAirport || "???"}</div>
                <div className="text-sm text-gray-600 mt-1">{formatDateTime(transport.returnArrivalDate)}</div>
                <div className="text-xs text-gray-500">Aankomst</div>
              </div>
            </div>
          </div>
        )}

        {/* Segments Details */}
        {transport.segment && transport.segment.length > 0 && (
          <div className="border rounded-lg p-3 bg-gray-50">
            <h5 className="font-medium text-sm text-gray-900 mb-2">Vlucht segmenten</h5>
            <div className="space-y-2">
              {transport.segment.map((segment: any, segIndex: number) => (
                <div key={segIndex} className="text-xs text-gray-600 flex justify-between">
                  <span>
                    {segment.departureAirport} → {segment.arrivalAirport}
                  </span>
                  <span>{segment.flightNumber || segment.airline}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DETAILED FLIGHT SEGMENTS */}
        {transport.segments && transport.segments.length > 0 && (
          <div className="border rounded-lg p-3 bg-gray-50">
            <h5 className="font-medium text-sm text-gray-900 mb-3">✈️ Vlucht Details</h5>
            <div className="space-y-3">
              {transport.segments.map((segment: any, segIndex: number) => (
                <div key={segIndex} className="bg-white rounded p-3 border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Vlucht:</span>
                      <div className="font-mono font-medium">
                        {segment.marketingAirlineCode || segment.operatingAirlineCode} {segment.flightNumber}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Route:</span>
                      <div>
                        {segment.departureAirport} → {segment.arrivalAirport}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Klasse:</span>
                      <div>
                        {segment.cabinClass} ({segment.bookingClass})
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duur:</span>
                      <div>
                        {segment.durationInMinutes
                          ? `${Math.floor(segment.durationInMinutes / 60)}u ${segment.durationInMinutes % 60}m`
                          : "Onbekend"}
                      </div>
                    </div>
                  </div>

                  {segment.departureAirportName && (
                    <div className="mt-2 text-xs text-gray-600">
                      <strong>Vertrek:</strong> {segment.departureAirportName} • <strong>Aankomst:</strong>{" "}
                      {segment.arrivalAirportName}
                    </div>
                  )}

                  {segment.technicalStops && segment.technicalStops.length > 0 && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {segment.technicalStops.length} tussenstop(s)
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BAGGAGE INFO */}
        {transport.baggage && transport.baggage.length > 0 && (
          <div className="border rounded-lg p-3 bg-blue-50">
            <h5 className="font-medium text-sm text-gray-900 mb-2">🧳 Bagage</h5>
            <div className="space-y-2">
              {transport.baggage.map((bag: any, bagIndex: number) => (
                <div key={bagIndex} className="text-xs flex justify-between items-center">
                  <span>
                    {bag.quantity}x {bag.weight}
                    {bag.perPerson ? " per persoon" : " totaal"}
                    {bag.isReturn ? " (retour)" : ""}
                  </span>
                  {bag.totalPrice && <span className="font-medium">€{bag.totalPrice.amount}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* E-TICKETS */}
        {transport.etickets && transport.etickets.length > 0 && (
          <div className="border rounded-lg p-3 bg-green-50">
            <h5 className="font-medium text-sm text-gray-900 mb-2">🎫 E-Tickets</h5>
            <div className="space-y-1">
              {transport.etickets.map((ticket: any, ticketIndex: number) => (
                <div key={ticketIndex} className="text-xs">
                  Ticket #{ticketIndex + 1}: {ticket.ticketNumber || "Wordt gegenereerd"}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
