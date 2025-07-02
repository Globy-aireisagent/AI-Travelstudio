export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Help & Support</h1>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Hoe gebruik je de Travel Assistant?</h2>
              <div className="space-y-2 text-gray-600">
                <p>
                  • <strong>Import:</strong> Voer een booking ID of idea ID in om data op te halen
                </p>
                <p>
                  • <strong>Roadbook:</strong> Bekijk je reis details in een overzichtelijke layout
                </p>
                <p>
                  • <strong>Zoeken:</strong> Gebruik de zoekfunctie om snel bookings te vinden
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Ondersteunde Booking IDs</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Formaten: RRP-1234, TC-5678, IDEA-9012</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
              <p className="text-gray-600">Voor technische ondersteuning, neem contact op met het development team.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
