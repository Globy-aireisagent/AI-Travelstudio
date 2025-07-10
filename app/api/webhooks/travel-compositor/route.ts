import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/neon-client"

/**
 * Travel-Compositor webhook handler.
 * - In productie: schrijft naar Neon/Postgres.
 * - In demo-/CI-modus: logt alleen, zodat de build nooit faalt.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    console.log("🔔  TC-webhook ontvangen")
    console.dir(payload, { depth: 4 })

    // Bepaal type
    const kind = detectKind(payload)

    if (!(await isDatabaseAvailable())) {
      console.warn("💾  DATABASE_URL ontbreekt – demo-modus, niets wordt geschreven.")
      return NextResponse.json({ ok: true, demo: true, kind })
    }

    let id: string | undefined

    switch (kind) {
      case "booking":
        id = await upsertBooking(extractBooking(payload))
        break
      case "idea":
        id = await upsertIdea(extractIdea(payload))
        break
      case "package":
        id = await upsertPackage(extractPackage(payload))
        break
      default:
        return NextResponse.json({ ok: false, error: "Unknown payload" }, { status: 400 })
    }

    return NextResponse.json({ ok: true, id, kind })
  } catch (err) {
    console.error("❌  Webhook-fout:", err)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function detectKind(p: any): "booking" | "idea" | "package" | "unknown" {
  if (p.booking || p.bookingReference) return "booking"
  if (p.idea || p.travelIdea) return "idea"
  if (p.package || p.holidayPackage) return "package"
  return "unknown"
}

/* ----------  extractors (basic – pas aan naar eigen payload vorm) -- */

function extractBooking(p: any) {
  const b = p.booking ?? p
  return {
    id: b.id,
    ref: b.bookingReference ?? b.id,
    client_name: b.client?.name ?? "",
    destination: b.destination ?? "",
    raw: b,
  }
}

function extractIdea(p: any) {
  const i = p.idea ?? p
  return {
    id: i.id,
    title: i.title ?? `idea-${i.id}`,
    destination: i.destination ?? "",
    raw: i,
  }
}

function extractPackage(p: any) {
  const g = p.package ?? p
  return {
    id: g.id,
    title: g.title ?? `pkg-${g.id}`,
    destination: g.destination ?? "",
    raw: g,
  }
}

/* ----------  upsert-helpers --------------------------------------- */

async function upsertBooking(b: ReturnType<typeof extractBooking>) {
  await sql`
    INSERT INTO bookings (id, booking_reference, client_name, destination, raw_data)
    VALUES (${b.id}, ${b.ref}, ${b.client_name}, ${b.destination}, ${b.raw})
    ON CONFLICT (id) DO UPDATE
      SET booking_reference = EXCLUDED.booking_reference,
          client_name       = EXCLUDED.client_name,
          destination       = EXCLUDED.destination,
          raw_data          = EXCLUDED.raw_data`
  return b.id
}

async function upsertIdea(i: ReturnType<typeof extractIdea>) {
  await sql`
    INSERT INTO travel_ideas (id, title, destination, raw_data)
    VALUES (${i.id}, ${i.title}, ${i.destination}, ${i.raw})
    ON CONFLICT (id) DO UPDATE
      SET title       = EXCLUDED.title,
          destination = EXCLUDED.destination,
          raw_data    = EXCLUDED.raw_data`
  return i.id
}

async function upsertPackage(p: ReturnType<typeof extractPackage>) {
  await sql`
    INSERT INTO holiday_packages (id, title, destination, raw_data)
    VALUES (${p.id}, ${p.title}, ${p.destination}, ${p.raw})
    ON CONFLICT (id) DO UPDATE
      SET title       = EXCLUDED.title,
          destination = EXCLUDED.destination,
          raw_data    = EXCLUDED.raw_data`
  return p.id
}
