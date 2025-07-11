import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const bookingId = searchParams.get("bookingId")

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId ontbreekt" }, { status: 400 })
  }

  // Verschillende trip data gebaseerd op bookingId
  const isParisFrance = bookingId.toLowerCase().includes("paris") || bookingId.toLowerCase().includes("france")

  if (isParisFrance) {
    // Frankrijk/Paris trip
    return NextResponse.json({
      bookingId,
      tripType: "Frankrijk Road Trip",
      totalDays: 3,
      generatedAt: new Date().toISOString(),
      dagen: [
        {
          datum: "12 augustus 2025",
          bestemming: "Parijs",
          hotel: "Hotel Viva la Paris",
          beschrijving:
            "Vandaag aankomst in Parijs! Na het inchecken lekker wandelen langs de Seine en natuurlijk een foto bij de Eiffeltoren 📸. Globy tip: ga rond zonsondergang naar de Trocadéro voor de mooiste foto's!",
          route: "Aankomst met de trein op Gare du Nord, daarna taxi naar hotel (€15-20)",
          stops: ["Eiffeltoren (gratis buitenkant)", "Louvre (€17 pp)", "Seine wandeling", "Café de Flore voor koffie"],
          activiteiten: [
            { tijd: "14:00", activiteit: "Inchecken hotel", kosten: "€0" },
            { tijd: "15:30", activiteit: "Wandeling naar Eiffeltoren", kosten: "€0" },
            { tijd: "17:00", activiteit: "Seine cruise (optioneel)", kosten: "€15 pp" },
            { tijd: "19:30", activiteit: "Diner bij bistro", kosten: "€35 pp" },
          ],
          restaurants: [
            {
              naam: "Le Comptoir du Relais",
              type: "Bistro",
              prijs: "€25-35 pp",
              beschrijving: "Authentiek Parijse bistro met klassieke gerechten",
            },
            {
              naam: "Breizh Café",
              type: "Crêperie",
              prijs: "€12-18 pp",
              beschrijving: "Moderne crêpes, perfect voor lunch",
            },
          ],
          budget: "€80-120 per persoon",
          globyTip:
            'Download de Citymapper app voor makkelijk navigeren in Parijs! En vergeet niet: in Frankrijk zeg je altijd "Bonjour" als je een winkel binnenkomt 😊',
        },
        {
          datum: "13 augustus 2025",
          bestemming: "Loire Vallei",
          hotel: "Château Hotel Loire",
          beschrijving:
            "Vandaag rijden jullie naar de prachtige Loire vallei via de mooie D-roads. Onderweg stoppen bij kastelen en lekker picknicken tussen de wijngaarden! 🍷",
          route: "Auto via A10 en D952, route langs kastelen (2,5 uur rijden)",
          stops: ["Château de Chambord", "Tours centrum", "Wijngaard bezoek", "Super U supermarkt voor picknick"],
          activiteiten: [
            { tijd: "09:00", activiteit: "Ontbijt en uitchecken", kosten: "€0" },
            { tijd: "10:30", activiteit: "Vertrek naar Loire", kosten: "€25 benzine" },
            { tijd: "13:00", activiteit: "Château de Chambord bezoek", kosten: "€14,50 pp" },
            { tijd: "15:30", activiteit: "Picknick in wijngaard", kosten: "€20 boodschappen" },
            { tijd: "17:00", activiteit: "Inchecken château hotel", kosten: "€0" },
          ],
          restaurants: [
            {
              naam: "La Maison d'à Côté",
              type: "Gastronomisch",
              prijs: "€45-65 pp",
              beschrijving: "Michelin restaurant met lokale specialiteiten",
            },
            {
              naam: "Le Bistrot du Boucher",
              type: "Lokaal",
              prijs: "€20-30 pp",
              beschrijving: "Gezellig lokaal restaurant met vlees specialiteiten",
            },
          ],
          budget: "€100-150 per persoon",
          globyTip:
            "Koop je kasteeltickets online voor korting! En probeer zeker de lokale geitenkaas - Loire is er beroemd om 🧀",
        },
        {
          datum: "14 augustus 2025",
          bestemming: "Bordeaux",
          hotel: "Hotel Bordeauville",
          beschrijving:
            "Laatste dag! Rijden naar Bordeaux, de wijnhoofdstad van Frankrijk. Tijd voor een wijnproeverij en wandelen door het prachtige centrum 🍷",
          route: "Loire naar Bordeaux via A10 (3 uur rijden)",
          stops: ["Cognac distilleerderij", "Bordeaux centrum", "Wijnproeverij", "Place de la Bourse"],
          activiteiten: [
            { tijd: "09:30", activiteit: "Ontbijt en uitchecken", kosten: "€0" },
            { tijd: "11:00", activiteit: "Vertrek naar Bordeaux", kosten: "€35 benzine" },
            { tijd: "14:30", activiteit: "Lunch in Bordeaux centrum", kosten: "€25 pp" },
            { tijd: "16:00", activiteit: "Wijnproeverij", kosten: "€20 pp" },
            { tijd: "18:00", activiteit: "Wandeling Place de la Bourse", kosten: "€0" },
          ],
          restaurants: [
            {
              naam: "Le Chapon Fin",
              type: "Gastronomisch",
              prijs: "€60-90 pp",
              beschrijving: "Historisch restaurant sinds 1825, perfecte afsluiting",
            },
            {
              naam: "Chez Dupont",
              type: "Brasserie",
              prijs: "€18-28 pp",
              beschrijving: "Lokale brasserie met verse oesters en wijnen",
            },
          ],
          budget: "€90-130 per persoon",
          globyTip:
            "Bordeaux heeft gratis WiFi in het hele centrum! En de tram is super handig om rond te komen. Proef zeker een glas Bordeaux wijn bij zonsondergang 🌅",
        },
      ],
    })
  }

  // Default Amsterdam trip
  return NextResponse.json({
    bookingId,
    tripType: "Amsterdam Ontdekking",
    totalDays: 5,
    generatedAt: new Date().toISOString(),
    dagen: [
      {
        datum: "15 juli 2025",
        bestemming: "Amsterdam Centrum",
        hotel: "Hotel V Nesplein",
        beschrijving:
          "Welkom in Amsterdam! Vandaag verkennen we het historische centrum. Eerst inchecken, dan lekker wandelen langs de beroemde grachten 🏛️",
        route: "Vanaf Schiphol met de trein naar Centraal Station (€4,20 pp), dan tram 2 naar hotel",
        stops: ["Dam Square", "Koninklijk Paleis", "Bloemenmarkt", "Rembrandtplein"],
        activiteiten: [
          { tijd: "12:00", activiteit: "Aankomst en inchecken", kosten: "€0" },
          { tijd: "14:00", activiteit: "Grachten wandeling", kosten: "€0" },
          { tijd: "16:00", activiteit: "Rijksmuseum bezoek", kosten: "€22,50 pp" },
          { tijd: "18:30", activiteit: "Borrel op een terrasje", kosten: "€15 pp" },
        ],
        restaurants: [
          {
            naam: "Café de Reiger",
            type: "Bruin café",
            prijs: "€18-25 pp",
            beschrijving: "Authentiek Amsterdams café met Nederlandse gerechten",
          },
          {
            naam: "Restaurant Greetje",
            type: "Modern Nederlands",
            prijs: "€35-45 pp",
            beschrijving: "Moderne twist op klassieke Nederlandse keuken",
          },
        ],
        budget: "€60-85 per persoon",
        globyTip:
          "Koop een GVB dagkaart (€8,50) voor onbeperkt openbaar vervoer! En let op de fietsers - ze hebben altijd voorrang 🚲",
      },
      {
        datum: "16 juli 2025",
        bestemming: "Amsterdam Musea",
        hotel: "Hotel V Nesplein",
        beschrijving:
          "Museumdag! Vandaag duiken we in de rijke cultuur van Amsterdam. Van Van Gogh tot Anne Frank - een dag vol geschiedenis en kunst 🎨",
        route: "Te voet en met tram door de stad",
        stops: ["Van Gogh Museum", "Anne Frank Huis", "Jordaan wijk", "Vondelpark"],
        activiteiten: [
          { tijd: "09:00", activiteit: "Ontbijt in hotel", kosten: "€12 pp" },
          { tijd: "10:30", activiteit: "Van Gogh Museum", kosten: "€22 pp" },
          { tijd: "13:00", activiteit: "Lunch in Jordaan", kosten: "€15 pp" },
          { tijd: "15:00", activiteit: "Anne Frank Huis", kosten: "€16 pp" },
          { tijd: "17:30", activiteit: "Wandeling Vondelpark", kosten: "€0" },
        ],
        restaurants: [
          { naam: "Winkel 43", type: "Café", prijs: "€8-15 pp", beschrijving: "Beroemd om hun appeltaart - een must!" },
          {
            naam: "De Kas",
            type: "Restaurant",
            prijs: "€28-38 pp",
            beschrijving: "Restaurant in een kas met verse, lokale ingrediënten",
          },
        ],
        budget: "€75-95 per persoon",
        globyTip:
          "Boek Anne Frank Huis tickets online vooraf - ze zijn vaak uitverkocht! En probeer zeker de beroemde appeltaart bij Winkel 43 🍰",
      },
      {
        datum: "17 juli 2025",
        bestemming: "Zaanse Schans",
        hotel: "Hotel V Nesplein",
        beschrijving:
          "Dagje uit naar de Zaanse Schans! Echte Nederlandse molens, klompenmakers en kaasboerderijen. Een perfecte Nederlandse ervaring! 🧀",
        route: "Trein naar Zaandijk Zaanse Schans (30 min, €7,50 pp retour)",
        stops: ["Historische molens", "Kaasboerderij", "Klompenmakerij", "Souvenirwinkels"],
        activiteiten: [
          { tijd: "09:30", activiteit: "Trein naar Zaanse Schans", kosten: "€7,50 pp" },
          { tijd: "10:30", activiteit: "Molens bezoeken", kosten: "€5 pp per molen" },
          { tijd: "12:00", activiteit: "Kaasproeverij", kosten: "€8 pp" },
          { tijd: "14:00", activiteit: "Lunch met uitzicht", kosten: "€18 pp" },
          { tijd: "16:00", activiteit: "Klompen workshop", kosten: "€12 pp" },
          { tijd: "17:30", activiteit: "Terug naar Amsterdam", kosten: "€0" },
        ],
        restaurants: [
          {
            naam: "Restaurant de Hoop op d'Swarte Walvis",
            type: "Nederlands",
            prijs: "€16-24 pp",
            beschrijving: "Traditioneel restaurant met uitzicht op de molens",
          },
          {
            naam: "Pannenkoekenrestaurant",
            type: "Pannenkoeken",
            prijs: "€12-18 pp",
            beschrijving: "Echte Nederlandse pannenkoeken in alle varianten",
          },
        ],
        budget: "€65-85 per persoon",
        globyTip:
          "Ga vroeg (voor 10:00) om de drukte te vermijden! En koop zeker wat echte Nederlandse kaas om mee naar huis te nemen 🧀",
      },
      {
        datum: "18 juli 2025",
        bestemming: "Amsterdam Noord",
        hotel: "Hotel V Nesplein",
        beschrijving:
          "Ontdek het hippe Amsterdam Noord! Met de gratis pont over het IJ naar creatieve hotspots, foodhallen en geweldige uitzichten 🌊",
        route: "Gratis pont vanaf Centraal Station naar Noord",
        stops: ["A'DAM Lookout", "NDSM Werf", "Foodhallen Noord", "EYE Filmmuseum"],
        activiteiten: [
          { tijd: "10:00", activiteit: "Pont naar Noord", kosten: "€0" },
          { tijd: "10:30", activiteit: "A'DAM Lookout + schommel", kosten: "€17,50 pp" },
          { tijd: "12:30", activiteit: "Lunch bij NDSM", kosten: "€16 pp" },
          { tijd: "14:00", activiteit: "EYE Filmmuseum", kosten: "€11 pp" },
          { tijd: "16:00", activiteit: "Koffie met IJ uitzicht", kosten: "€8 pp" },
          { tijd: "18:00", activiteit: "Terug naar centrum", kosten: "€0" },
        ],
        restaurants: [
          {
            naam: "Pllek",
            type: "Beach club",
            prijs: "€14-22 pp",
            beschrijving: "Strand gevoel in de stad met uitzicht op het IJ",
          },
          {
            naam: "Café de Ceuvel",
            type: "Duurzaam café",
            prijs: "€12-18 pp",
            beschrijving: "Duurzaam café op een voormalige scheepswerf",
          },
        ],
        budget: "€55-75 per persoon",
        globyTip:
          "De schommel op A'DAM Lookout is eng maar zo gaaf! En de pont rijdt 24/7 gratis - perfect voor mooie foto's van de skyline 📸",
      },
      {
        datum: "19 juli 2025",
        bestemming: "Amsterdam Afscheid",
        hotel: "Hotel V Nesplein",
        beschrijving:
          "Laatste dag in Amsterdam! Tijd voor laatste souvenirs, nog een grachtenrondvaart en genieten van de gezellige sfeer ⛵",
        route: "Wandelen door centrum en naar Schiphol",
        stops: ["Laatste souvenirs", "Grachtenrondvaart", "Albert Cuyp Markt", "Schiphol"],
        activiteiten: [
          { tijd: "09:00", activiteit: "Uitchecken hotel", kosten: "€0" },
          { tijd: "10:00", activiteit: "Albert Cuyp Markt", kosten: "€10 pp souvenirs" },
          { tijd: "11:30", activiteit: "Grachtenrondvaart", kosten: "€18 pp" },
          { tijd: "13:00", activiteit: "Afscheidslunch", kosten: "€22 pp" },
          { tijd: "15:00", activiteit: "Naar Schiphol", kosten: "€4,20 pp" },
          { tijd: "16:00", activiteit: "Vlucht check-in", kosten: "€0" },
        ],
        restaurants: [
          {
            naam: "Café Loetje",
            type: "Steakhouse",
            prijs: "€18-28 pp",
            beschrijving: "Beroemd om hun biefstuk - perfecte afsluiting",
          },
          {
            naam: "Gartine",
            type: "Lunch café",
            prijs: "€14-20 pp",
            beschrijving: "Gezellig lunch café met verse, biologische gerechten",
          },
        ],
        budget: "€50-70 per persoon",
        globyTip:
          "Koop stroopwafels op de Albert Cuyp Markt - vers en warm zijn ze het lekkerst! En check-in online voor je vlucht om tijd te besparen ✈️",
      },
    ],
  })
}
