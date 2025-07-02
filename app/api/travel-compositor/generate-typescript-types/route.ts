import type { NextRequest } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    console.log("🔧 GENERATING TYPESCRIPT TYPES FROM SWAGGER")

    const client = createTravelCompositorClient(configNumber)
    const swaggerResponse = await client.makeAuthenticatedRequest("/resources/swagger.json")

    if (!swaggerResponse.ok) {
      throw new Error(`Failed to get Swagger docs: ${swaggerResponse.status}`)
    }

    const swaggerSpec = await swaggerResponse.json()
    const schemas = swaggerSpec.components?.schemas || {}

    console.log(`🔍 Processing ${Object.keys(schemas).length} schemas...`)

    // Convert Swagger types to TypeScript types
    const convertSwaggerType = (property: any, propertyName: string): string => {
      if (property.$ref) {
        // Reference to another schema
        const refName = property.$ref.split("/").pop()
        return refName || "any"
      }

      if (property.type === "array") {
        if (property.items?.$ref) {
          const itemType = property.items.$ref.split("/").pop()
          return `${itemType}[]`
        } else if (property.items?.type) {
          return `${convertSwaggerType(property.items, propertyName)}[]`
        }
        return "any[]"
      }

      if (property.type === "object") {
        return "any" // Could be expanded to inline object types
      }

      if (property.enum) {
        // Enum type
        return property.enum.map((val: any) => `"${val}"`).join(" | ")
      }

      // Basic type mapping
      switch (property.type) {
        case "string":
          if (property.format === "date" || property.format === "date-time") {
            return "string" // Could be Date if preferred
          }
          return "string"
        case "number":
        case "integer":
          return "number"
        case "boolean":
          return "boolean"
        default:
          return "any"
      }
    }

    // Generate TypeScript interfaces
    let typescriptContent = `// Auto-generated TypeScript types from Travel Compositor API
// Generated on: ${new Date().toISOString()}
// Total schemas: ${Object.keys(schemas).length}

`

    // First pass: Generate all interfaces
    const interfaces: string[] = []
    const enums: string[] = []

    Object.entries(schemas).forEach(([schemaName, schema]: [string, any]) => {
      const properties = schema.properties || {}
      const required = schema.required || []

      if (schema.enum) {
        // This is an enum
        const enumValues = schema.enum.map((val: any) => `  ${val} = "${val}"`).join(",\n")
        enums.push(`export enum ${schemaName} {
${enumValues}
}`)
      } else {
        // This is an interface
        const propertyLines: string[] = []

        Object.entries(properties).forEach(([propName, propSchema]: [string, any]) => {
          const isRequired = required.includes(propName)
          const propType = convertSwaggerType(propSchema, propName)
          const optional = isRequired ? "" : "?"
          const description = propSchema.description ? `  /** ${propSchema.description} */\n` : ""

          propertyLines.push(`${description}  ${propName}${optional}: ${propType}`)
        })

        const interfaceContent = `export interface ${schemaName} {
${propertyLines.join("\n")}
}`

        interfaces.push(interfaceContent)
      }
    })

    // Add enums first, then interfaces
    typescriptContent += "// ========== ENUMS ==========\n\n"
    typescriptContent += enums.join("\n\n")
    typescriptContent += "\n\n// ========== INTERFACES ==========\n\n"
    typescriptContent += interfaces.join("\n\n")

    // Add some utility types
    typescriptContent += `

// ========== UTILITY TYPES ==========

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// Common types
export type Currency = string
export type DateString = string
export type MoneyAmount = {
  amount: number
  currency: Currency
}
`

    console.log("✅ TypeScript generation complete!")

    return new Response(typescriptContent, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": 'attachment; filename="travel-compositor-types.ts"',
      },
    })
  } catch (error) {
    console.error("❌ TypeScript Generation Error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
