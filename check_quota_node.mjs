
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
const fs = await import('fs');

  const logStream = fs.createWriteStream('node_internal_output.txt');
  function log(msg) {
      console.log(msg);
      logStream.write(msg + '\n');
  }

  log("Searching for user 'Exposant 18m Test'...");
  let userId = null

  // 1. Search public.users
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
  
  if (users) {
      for (const user of users) {
          const fullName = user.full_name || user.name || (user.first_name + ' ' + user.last_name) || ''
          log(`Checking user: ${fullName} (ID: ${user.id})`)
          if (fullName.includes("Exposant 18m Test")) {
              log(`MATCH FOUND in public.users: ${fullName}`)
              userId = user.id
              break
          }
      }
  }

  // 2. Search auth.users if not found
  if (!userId) {
      log("Searching in auth.users...")
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
      if (authUsers) {
          for (const user of authUsers) {
               const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
               const email = user.email || ''
               log(`Checking Auth User: ${email} | Name: ${fullName}`)
               if (fullName.includes("Exposant 18m Test") || email.includes("Exposant 18m Test")) {
                  log(`MATCH FOUND in auth.users: ${email}`)
                   userId = user.id
                   break
               }
          }
      }
  }

  if (userId) {
      log(`User ID found: ${userId}`)
      log("Calling rpc 'check_b2b_quota_available'...")
      const { data, error } = await supabase.rpc('check_b2b_quota_available', { p_user_id: userId })
      
      log("RPC Result: " + JSON.stringify(data))
      if (error) log("RPC Error: " + JSON.stringify(error))
  } else {
      log("User not found")
  }
}

main()
