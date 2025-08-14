import { NextRequest, NextResponse } from "next/server";
import { createClient } from "./lib/supabaseClient";

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data) {
      console.error("Erreur d'authentification :", error);
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Vérification de l'expiration de la session
    const expiresAt = data.session?.expires_at;
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000); // en secondes
      if (now >= expiresAt) {
        console.log("Session expirée");
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Erreur lors de la vérification du token :", err);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/forgot-password"],
};
