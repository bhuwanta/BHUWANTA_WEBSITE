import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function resetPassword() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error("Error listing users:", error)
    return
  }

  const adminEmail1 = 'info@bhuwanta.com'
  const adminEmail2 = 'bhuwanta9@gmail.com'
  
  const admin = users.find((u: any) => u.email === adminEmail1 || u.email === adminEmail2)
  
  if (admin) {
    const newPassword = 'AdminPassword123!'
    const { error: updateError } = await supabase.auth.admin.updateUserById(admin.id, { password: newPassword })
    
    if (updateError) {
      console.error("Error updating password:", updateError)
    } else {
      console.log(`Password successfully reset for ${admin.email}`)
      console.log(`New Password: ${newPassword}`)
    }
  } else {
    console.log("Admin user not found.")
  }
}

resetPassword()
