import Cookies from "js-cookie";

export function getSupabaseSession() {
  const sessionData = Cookies.get("supabase_session");
  return sessionData ? JSON.parse(sessionData) : null;
}

export function getSupabaseUser() {
  const sessionData = Cookies.get("user_session");
  return sessionData ? JSON.parse(sessionData) : null;
}
