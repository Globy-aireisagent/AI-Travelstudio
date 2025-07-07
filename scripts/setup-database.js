import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log("🚀 Setting up database...")

  const sqlFiles = ["create-feature-requests-table.sql", "create-bookings-table.sql", "create-webhook-tables.sql"]

  for (const file of sqlFiles) {
    try {
      console.log(`📄 Executing ${file}...`)
      const sqlContent = fs.readFileSync(path.join("scripts", file), "utf8")

      const { error } = await supabase.rpc("exec_sql", { sql: sqlContent })

      if (error) {
        console.error(`❌ Error executing ${file}:`, error)
      } else {
        console.log(`✅ Successfully executed ${file}`)
      }
    } catch (err) {
      console.error(`❌ Error reading ${file}:`, err)
    }
  }

  console.log("🎉 Database setup complete!")
}

setupDatabase()
