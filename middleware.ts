import { NextRequest, NextResponse } from "next/server";
import { createClient } from "./lib/supabaseClient";

export async function middleware(request: NextRequest) {
  const supabase = createClient();

  const authToken =
    request.cookies.get("sb-pgrubovujiulezselost-auth-token.0")?.value ||
    request.cookies.get("sb-pgrubovujiulezselost-auth-token.1")?.value;
  if (!authToken) {
    console.log("Vous n'etes pas connecte , Token inexistant");
    return NextResponse.redirect(new URL("/", request.url));
  }
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data) {
      console.error("Erreur d'authentification :", error);
      return NextResponse.redirect(new URL("/", request.url));
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
