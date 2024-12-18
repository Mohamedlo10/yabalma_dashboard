
export function getSupabaseSession() {
  const sessionData = localStorage.getItem('supabase_session');
  return sessionData ? JSON.parse(sessionData) : null;
}

export function getSupabaseUser() {
    const sessionData = localStorage.getItem('user_session');
    return sessionData ? JSON.parse(sessionData) : null;
  }