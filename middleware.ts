import { createClient } from '@/lib/supabaseClient';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = createClient();

  const authToken = request.cookies.get('sb-pgrubovujiulezselost-auth-token')?.value;

  if (!authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const decoded = jwt.decode(authToken);
    console.log(authToken)
    if (!decoded) {
      console.error('Token JWT mal formé');
      return NextResponse.redirect(new URL('/', request.url));
    }

    const { data, error } = await supabase.auth.getUser(authToken);

    if (error || !data) {
      console.error("Erreur d'authentification :", error);
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Erreur lors de la vérification du token :", err);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/settings'],
};
