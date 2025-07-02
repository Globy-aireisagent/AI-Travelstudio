export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Over Travel Assistant</h1>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Wat is Travel Assistant?</h2>
              <p className="text-gray-600">
                Travel Assistant is een moderne tool voor het importeren en weergeven van reis data uit Travel
                Compositor. Het biedt een overzichtelijke roadbook weergave van bookings en travel ideas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Functionaliteiten</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">📥 Import</h3>
                  <p className="text-blue-700 text-sm">
                    Snel en betrouwbaar importeren van bookings en ideas uit Travel Compositor
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">📋 Roadbook</h3>
                  <p className="text-green-700 text-sm">
                    Moderne, overzichtelijke weergave van alle reis details en accommodaties
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">⚡ Performance</h3>
                  <p className="text-purple-700 text-sm">
                    Geoptimaliseerde API calls en smart caching voor snelle laadtijden
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">📱 Responsive</h3>
                  <p className="text-orange-700 text-sm">Werkt perfect op desktop, tablet en mobiele apparaten</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Technologie</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">
                  Gebouwd met Next.js, React, TypeScript en Tailwind CSS. Integreert met Travel Compositor API voor
                  real-time booking data.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
