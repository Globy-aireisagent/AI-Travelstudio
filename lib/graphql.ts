import { GraphQLClient } from "graphql-request"

/**
 * Shared GraphQL client
 *
 * 1. Uses `graphql-request`, which is automatically available in Next.js.
 * 2. Reads the endpoint from `NEXT_PUBLIC_GRAPHQL_ENDPOINT`.
 *    - On the server you can also use a private `GRAPHQL_ENDPOINT` variable.
 * 3. Exported as a *named* export called `client`, matching all existing imports.
 */
const endpoint =
  (typeof window === "undefined" ? process.env.GRAPHQL_ENDPOINT : process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT) ??
  "/api/graphql"

export const client = new GraphQLClient(endpoint, {
  headers: {
    // Add your auth headers here if needed, e.g.:
    // Authorization: `Bearer ${process.env.GRAPHQL_API_TOKEN}`,
  },
})

/**
 * Convenience wrapper for typed requests
 */
export async function gqlRequest<T = unknown, V = Record<string, unknown>>(query: string, variables?: V) {
  return client.request<T, V>(query, variables)
}
