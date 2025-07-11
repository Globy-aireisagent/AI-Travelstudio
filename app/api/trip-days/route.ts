import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const bookingId = searchParams.get("bookingId")

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId ontbreekt" }, { status: 400 })
  }

  // Verschillende trip scenarios gebaseerd op bookingId
  const isParisFrance = bookingId.toLowerCase().includes("paris") || bookingId.toLowerCase().includes("france")

  if (isParisFrance) {
    // Paris/France roadtrip scenario
    return NextResponse.json({
      tripType: "France Roadtrip",
      totalDays: 4,
      timestamp: new Date().toISOString(),
      dagen: [
        {
          datum: "12 augustus 2025",
          bestemming: "Parijs",
          hotel: "Hotel Viva la Paris",
          beschrijving:
            "Vandaag aankomst in Parijs! Na het inchecken lekker wandelen langs de Seine en een foto bij de Eiffeltoren 📸. Perfect voor Nova en Zyam om hun eerste TikTok van de reis te maken!",
          route: "Aankomst met de trein vanaf Amsterdam, daarna taxi naar hotel (€35)",
          stops: ["Eiffeltoren (gratis foto)", "Louvre buitenkant", "Fietspad langs de Seine"],
          activiteiten: [
            { tijd: "14:00", activiteit: "Check-in hotel", kosten: "€0" },
            { tijd: "15:30", activiteit: "Wandeling naar Eiffeltoren", kosten: "€0" },
            { tijd: "18:00", activiteit: "Diner bij Café de Flore", kosten: "€80" },
          ],
          restaurants: [
            { naam: "Café de Flore", type: "Frans bistro", prijs: "€€€", tip: "Beroemd café, perfect voor foto's!" },
            { naam: "L'As du Fallafel", type: "Falafel", prijs: "€", tip: "Beste falafel van Parijs, kids love it!" },
          ],
          budget: "€150 per dag",
          globyTip: "🎯 Globy's tip: Download de Citymapper app voor makkelijk navigeren in Parijs!",
        },
        {
          datum: "13 augustus 2025",
          bestemming: "Tours (Loire)",
          hotel: "Hotel Château Loire",
          beschrijving:
            "Vandaag rijden jullie naar de Loire vallei! Onderweg stoppen bij het prachtige kasteel Chambord. Nova en Zyam kunnen hier hun Disney-prinses dromen waarmaken! 🏰",
          route: "Auto via A10, 2.5 uur rijden met kasteel stops",
          stops: ["Château de Chambord", "Orléans centrum", "Picknick spot bij Loire rivier"],
          activiteiten: [
            { tijd: "09:00", activiteit: "Ontbijt en checkout", kosten: "€25" },
            { tijd: "10:30", activiteit: "Vertrek naar Loire", kosten: "€45 benzine" },
            { tijd: "13:00", activiteit: "Château de Chambord bezoek", kosten: "€60" },
            { tijd: "16:00", activiteit: "Check-in hotel Tours", kosten: "€0" },
          ],
          restaurants: [
            { naam: "La Roche Le Roy", type: "Gastronomisch", prijs: "€€€€", tip: "Michelin restaurant, reserveren!" },
            { naam: "Chez Jules", type: "Traditioneel Frans", prijs: "€€", tip: "Kindvriendelijk, goede pizza!" },
          ],
          budget: "€180 per dag",
          globyTip: "🏰 Globy's tip: In Chambord kunnen jullie een audioguide voor kinderen krijgen - super leuk!",
        },
        {
          datum: "14 augustus 2025",
          bestemming: "Bordeaux",
          hotel: "Hotel Bordeauville",
          beschrijving:
            "Vandaag naar de wijnstad Bordeaux! Geen zorgen, er is genoeg voor de kids te doen. Bezoek het Cité du Vin (interactief wijnmuseum met kids activiteiten) en wandel door het historische centrum.",
          route: "Auto via A10 naar Bordeaux, 3 uur rijden via Poitiers",
          stops: ["Poitiers centrum", "Cognac (optioneel)", "Bordeaux Place de la Bourse"],
          activiteiten: [
            { tijd: "09:30", activiteit: "Vertrek naar Bordeaux", kosten: "€55 benzine" },
            { tijd: "13:30", activiteit: "Lunch in Poitiers", kosten: "€45" },
            { tijd: "16:00", activiteit: "Aankomst Bordeaux", kosten: "€0" },
            { tijd: "17:30", activiteit: "Cité du Vin bezoek", kosten: "€70" },
          ],
          restaurants: [
            {
              naam: "Le Petit Commerce",
              type: "Zeevruchten",
              prijs: "€€€",
              tip: "Verse oesters, maar ook pasta voor kids",
            },
            {
              naam: "Darwin Ecosystem",
              type: "Food court",
              prijs: "€€",
              tip: "Hip food court, veel keuze voor iedereen!",
            },
          ],
          budget: "€200 per dag",
          globyTip: "🍇 Globy's tip: Bij Cité du Vin hebben ze een speciale kids tour - perfect voor Nova en Zyam!",
        },
        {
          datum: "15 augustus 2025",
          bestemming: "Bordeaux → Amsterdam",
          hotel: "Terugreis",
          beschrijving:
            "Laatste dag! Ochtend nog even shoppen in Bordeaux centrum, daarna terug naar Amsterdam. Wat een geweldige reis hebben jullie gehad! 🎉",
          route: "Vlucht Bordeaux → Amsterdam (1.5 uur) of auto (8 uur)",
          stops: ["Rue Sainte-Catherine (shopping)", "Bordeaux Airport"],
          activiteiten: [
            { tijd: "10:00", activiteit: "Shopping Rue Sainte-Catherine", kosten: "€100" },
            { tijd: "12:00", activiteit: "Lunch bij airport", kosten: "€50" },
            { tijd: "14:30", activiteit: "Vlucht naar Amsterdam", kosten: "€300" },
            { tijd: "17:00", activiteit: "Aankomst Amsterdam", kosten: "€0" },
          ],
          restaurants: [
            { naam: "Comptoir du 7ème", type: "Brunch", prijs: "€€", tip: "Perfecte laatste Franse brunch!" },
          ],
          budget: "€150 + vliegtickets",
          globyTip: "✈️ Globy's tip: Vergeet niet souvenirs te kopen voor vrienden thuis!",
        },
      ],
    })
  }

  // Default Amsterdam trip scenario
  return NextResponse.json({
    tripType: "Amsterdam Family Adventure",
    totalDays: 5,
    timestamp: new Date().toISOString(),
    dagen: [
      {
        datum: "10 augustus 2025",
        bestemming: "Amsterdam Centrum",
        hotel: "Hotel V Nesplein",
        beschrijving:
          "Welkom in Amsterdam! Vandaag verkennen jullie het historische centrum. Perfect voor Nova en Zyam om hun eerste Nederlandse TikTok te maken bij de beroemde grachten! 📱",
        route: "Vanaf Centraal Station met tram 2 naar Leidseplein",
        stops: ["Dam Square", "Bloemenmarkt", "Vondelpark"],
        activiteiten: [
          { tijd: "14:00", activiteit: "Check-in hotel", kosten: "€0" },
          { tijd: "15:30", activiteit: "Grachtenrondvaart", kosten: "€60" },
          { tijd: "17:00", activiteit: "Bloemenmarkt bezoek", kosten: "€20" },
          { tijd: "19:00", activiteit: "Diner in Jordaan", kosten: "€85" },
        ],
        restaurants: [
          { naam: "Café de Reiger", type: "Nederlands", prijs: "€€", tip: "Authentiek Amsterdams, kindvriendelijk!" },
          { naam: "Winkel 43", type: "Café", prijs: "€€", tip: "Beste appeltaart van Amsterdam!" },
        ],
        budget: "€165 per dag",
        globyTip: "🚲 Globy's tip: Huur fietsen voor morgen - dat is de échte Amsterdamse ervaring!",
      },
      {
        datum: "11 augustus 2025",
        bestemming: "Amsterdam Noord",
        hotel: "Hotel V Nesplein",
        beschrijving:
          "Vandaag naar Amsterdam Noord! Bezoek het Eye Filmmuseum en neem de gratis pont. Nova en Zyam zullen de moderne architectuur geweldig vinden voor hun foto's! 📸",
        route: "Gratis pont vanaf Centraal Station naar Noord",
        stops: ["Eye Filmmuseum", "A'DAM Lookout", "NDSM Werf"],
        activiteiten: [
          { tijd: "10:00", activiteit: "Ontbijt in hotel", kosten: "€30" },
          { tijd: "11:00", activiteit: "Pont naar Noord", kosten: "€0" },
          { tijd: "11:30", activiteit: "Eye Filmmuseum", kosten: "€45" },
          { tijd: "14:00", activiteit: "A'DAM Lookout", kosten: "€50" },
          { tijd: "16:00", activiteit: "NDSM Werf verkennen", kosten: "€0" },
        ],
        restaurants: [
          {
            naam: "Restaurant Moon",
            type: "Revolving restaurant",
            prijs: "€€€€",
            tip: "Draaiend restaurant in A'DAM toren!",
          },
          { naam: "Pllek", type: "Beach club", prijs: "€€", tip: "Strand gevoel midden in de stad!" },
        ],
        budget: "€125 per dag",
        globyTip: "🎬 Globy's tip: In het Eye museum kunnen jullie gratis films kijken - perfect voor een regenbui!",
      },
      {
        datum: "12 augustus 2025",
        bestemming: "Zaanse Schans",
        hotel: "Hotel V Nesplein",
        beschrijving:
          "Dagje naar de beroemde Zaanse Schans! Echte Nederlandse molens, klompenmaker en kaasmakerij. Nova en Zyam kunnen hier leren hoe echte Hollandse kaas wordt gemaakt! 🧀",
        route: "Trein naar Zaandijk Zaanse Schans (17 minuten)",
        stops: ["Molens bekijken", "Kaasmakerij", "Klompenmaker", "Souvenirshop"],
        activiteiten: [
          { tijd: "09:30", activiteit: "Trein naar Zaanse Schans", kosten: "€20" },
          { tijd: "10:30", activiteit: "Molens rondleiding", kosten: "€25" },
          { tijd: "12:00", activiteit: "Kaasproeverij", kosten: "€15" },
          { tijd: "14:00", activiteit: "Klompen workshop", kosten: "€30" },
          { tijd: "16:00", activiteit: "Terug naar Amsterdam", kosten: "€20" },
        ],
        restaurants: [
          {
            naam: "Restaurant de Hoop op d'Swarte Walvis",
            type: "Nederlands",
            prijs: "€€€",
            tip: "Historisch restaurant in authentieke setting!",
          },
          {
            naam: "Pannenkoekenhuis Zaanse Schans",
            type: "Pannenkoeken",
            prijs: "€€",
            tip: "Nederlandse pannenkoeken - kids favoriet!",
          },
        ],
        budget: "€110 per dag",
        globyTip: "🥿 Globy's tip: Koop klompen als souvenir - ze zijn echt comfortabel!",
      },
      {
        datum: "13 augustus 2025",
        bestemming: "Amsterdam Musea",
        hotel: "Hotel V Nesplein",
        beschrijving:
          "Museumdag! Van Gogh Museum en Rijksmuseum staan op het programma. Geen zorgen, beide musea hebben speciale kids activiteiten. Perfect voor Nova en Zyam om cultuur en kunst te ontdekken! 🎨",
        route: "Lopen naar Museumplein (10 minuten van hotel)",
        stops: ["Van Gogh Museum", "Rijksmuseum", "Museumplein", "I amsterdam letters"],
        activiteiten: [
          { tijd: "10:00", activiteit: "Van Gogh Museum", kosten: "€76" },
          { tijd: "12:30", activiteit: "Lunch op Museumplein", kosten: "€40" },
          { tijd: "14:00", activiteit: "Rijksmuseum highlights", kosten: "€80" },
          { tijd: "16:30", activiteit: "Foto bij I amsterdam", kosten: "€0" },
          { tijd: "17:30", activiteit: "Vondelpark wandeling", kosten: "€0" },
        ],
        restaurants: [
          { naam: "Rijksmuseum Café", type: "Museum café", prijs: "€€€", tip: "Eten tussen de kunst!" },
          {
            naam: "Cobra Café",
            type: "Modern Nederlands",
            prijs: "€€",
            tip: "Artistiek restaurant, perfect na museumbezoek!",
          },
        ],
        budget: "€196 per dag",
        globyTip: "🎨 Globy's tip: Download de museum apps voor interactieve kids tours!",
      },
      {
        datum: "14 augustus 2025",
        bestemming: "Amsterdam Afscheid",
        hotel: "Check-out",
        beschrijving:
          "Laatste dag in Amsterdam! Nog even laatste souvenirs kopen op de Albert Cuyp markt en genieten van een laatste Nederlandse lunch. Wat een geweldige reis hebben Nova en Zyam gehad! 🇳🇱",
        route: "Tram naar Albert Cuyp markt, daarna naar Centraal Station",
        stops: ["Albert Cuyp Markt", "Heineken Experience (optioneel)", "Centraal Station"],
        activiteiten: [
          { tijd: "10:00", activiteit: "Check-out hotel", kosten: "€0" },
          { tijd: "10:30", activiteit: "Albert Cuyp Markt", kosten: "€50" },
          { tijd: "12:00", activiteit: "Laatste Nederlandse lunch", kosten: "€45" },
          { tijd: "14:00", activiteit: "Naar station/luchthaven", kosten: "€25" },
        ],
        restaurants: [
          { naam: "Café Loetje", type: "Steakhouse", prijs: "€€€", tip: "Beroemd om hun biefstuk!" },
          {
            naam: "Stroopwafel stand",
            type: "Street food",
            prijs: "€",
            tip: "Verse stroopwafels als laatste traktatie!",
          },
        ],
        budget: "€120 per dag",
        globyTip: "🥞 Globy's tip: Neem verse stroopwafels mee naar huis - die zijn veel lekkerder dan uit de winkel!",
      },
    ],
  })
}
