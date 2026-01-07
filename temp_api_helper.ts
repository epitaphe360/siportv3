
/**
 * Create User via API (Faster than UI)
 */
export async function createUserViaAPI(user: TestUser, userType: string): Promise<boolean> {
  console.log('Attempting API creation for ' + user.email + '...');
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { first_name: user.firstName, last_name: user.lastName, role: userType, account_type: userType }
      });
      if (error) throw error;
      console.log(' User ' + user.email + ' created via Admin API');
      return true;
    } catch (e: any) { console.log(' Admin API creation failed: ' + e.message); }
  }
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: { data: { first_name: user.firstName, last_name: user.lastName, role: userType, account_type: userType } }
      });
      if (error) throw error;
      console.log(' User ' + user.email + ' created via Public API');
      return true;
    } catch (e: any) { console.log(' Public API creation failed: ' + e.message); }
  }
  return false;
}

