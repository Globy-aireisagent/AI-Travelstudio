/**
 * Centralised client-side API helpers for the Travel Assistant app.
 *
 * Currently exposes:
 *   • generateTravelContent  –  create rich AI-assisted travel content by
 *     calling the `/api/travel-content-chat` route.
 *
 * The helper gracefully handles different call signatures so legacy
 * components continue to work after this fix.
 */

export interface GenerateTravelContentInput {
  prompt: string
  /* Allows arbitrary extra fields (e.g. locale, tone, images …) */
  [key: string]: unknown
}

export interface GenerateTravelContentSuccess {
  /**
   * The generated Markdown / HTML or other formatted content.
   * Exact structure depends on the server implementation.
   */
  content: string
  /**
   * Any additional metadata returned by the server.
   */
  meta?: Record<string, unknown>
}

export interface GenerateTravelContentError {
  error: string
}

/**
 * Generate AI-powered travel content.
 *
 * Accepts either:
 *   • a raw prompt               → generateTravelContent("Nice trip to Japan")
 *   • a full payload object      → generateTravelContent({ prompt: "…", tone: "friendly" })
 */
export async function generateTravelContent(
  input: string | GenerateTravelContentInput,
): Promise<GenerateTravelContentSuccess> {
  // Normalise arguments ─────────────────────────────────────────
  const payload: GenerateTravelContentInput = typeof input === "string" ? { prompt: input } : input

  // Call the server action / route handler ─────────────────────
  const res = await fetch("/api/travel-content-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  // Handle network / app-level errors ──────────────────────────
  if (!res.ok) {
    const message = `generateTravelContent: ${res.status} ${res.statusText}`
    console.error(message)
    throw new Error(message)
  }

  const data = (await res.json()) as GenerateTravelContentSuccess | GenerateTravelContentError

  if ("error" in data) {
    throw new Error(`generateTravelContent: ${data.error}`)
  }

  return data
}
