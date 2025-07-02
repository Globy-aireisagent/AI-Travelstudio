export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Algemene Voorwaarden</h1>

          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Gebruik van de Applicatie</h2>
              <p>
                Deze Travel Assistant applicatie is bedoeld voor het bekijken en beheren van reis data uit Travel
                Compositor. Gebruik is voorbehouden aan geautoriseerde gebruikers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Data en Privacy</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Booking data wordt uitsluitend gebruikt voor weergave doeleinden</li>
                <li>Geen permanente opslag van persoonlijke gegevens</li>
                <li>Local storage wordt gebruikt voor performance optimalisatie</li>
                <li>Alle API verbindingen zijn beveiligd en geautoriseerd</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Beschikbaarheid</h2>
              <p>
                Wij streven naar maximale beschikbaarheid van de service, maar kunnen geen 100% uptime garanderen.
                Onderhoud en updates kunnen tijdelijke onderbrekingen veroorzaken.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Aansprakelijkheid</h2>
              <p>
                De applicatie wordt aangeboden "as-is". Wij zijn niet aansprakelijk voor eventuele schade door het
                gebruik van deze tool.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Wijzigingen</h2>
              <p>
                Deze voorwaarden kunnen worden gewijzigd. Gebruikers worden geïnformeerd over belangrijke wijzigingen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
              <p>Voor vragen over deze voorwaarden, neem contact op met het development team.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
