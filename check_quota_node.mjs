
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Load env if needed, or just hardcode for this script since I have them
const SUPABASE_URL = "https://eqjoqgpbxhsfgcovipgu.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  console.log("Searching for user 'Exposant 18m Test'...")
  let userId = null

  // 1. Search public.users
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
  
  if (users) {
      for (const user of users) {
          const fullName = user.full_name || user.name || (user.first_name + ' ' + user.last_name) || ''
          console.log(`Checking user: ${fullName} (ID: ${user.id})`)
          if (fullName.includes("Exposant 18m Test")) {
              console.log(`MATCH FOUND in public.users: ${fullName}`)
              userId = user.id
              break
          }
      }
  }

  // 2. Search auth.users if not found
  if (!userId) {
      console.log("Searching in auth.users...")
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
      if (authUsers) {
          for (const user of authUsers) {
               const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
               const email = user.email || ''
               console.log(`Checking Auth User: ${email} | Name: ${fullName}`)
               if (fullName.includes("Exposant 18m Test") || email.includes("Exposant 18m Test")) {
                  console.log(`MATCH FOUND in auth.users: ${email}`)
                   userId = user.id
                   break
               }
          }
      }
  }

  if (userId) {
      console.log(`User ID found: ${userId}`)
      console.log("Calling rpc 'check_b2b_quota_available'...")
      const { data, error } = await supabase.rpc('check_b2b_quota_available', { p_user_id: userId })
      
      console.log("RPC Result:", data)
      if (error) console.error("RPC Error:", error)
  } else {
      console.log("User not found")
  }
}

main()
