export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Verwerking</h2>
              <p>
                Deze Travel Assistant app verwerkt booking data uitsluitend voor het tonen van reis informatie. Geen
                persoonlijke data wordt opgeslagen op externe servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Local Storage</h2>
              <p>
                Voor betere performance worden booking details tijdelijk opgeslagen in je browser's local storage. Deze
                data blijft lokaal en wordt niet gedeeld.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Travel Compositor API</h2>
              <p>
                De app maakt verbinding met Travel Compositor API's om booking informatie op te halen. Deze verbindingen
                zijn beveiligd en geautoriseerd.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
              <p>Voor vragen over privacy, neem contact op met het development team.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
