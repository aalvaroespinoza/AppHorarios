import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Falta código de autorización' }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Credenciales de Strava no configuradas' }, { status: 500 });
  }

  try {
    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!res.ok) {
      throw new Error('Fallo al obtener token de Strava');
    }

    const data = await res.json();
    
    // Imprimir el token en consola según solicitado
    console.log('--- STRAVA ACCESS TOKEN OBTENIDO ---');
    console.log(data.access_token);
    
    // Guardar tokens en cookies seguras
    const cookieStore = await cookies();
    cookieStore.set('strava_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: data.expires_in,
      path: '/',
    });
    
    cookieStore.set('strava_refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
    });

    return NextResponse.redirect(new URL('/focus', request.url));
  } catch (error: any) {
    console.error('Error Strava Callback:', error);
    return NextResponse.json({ error: 'Fallo la autenticación con Strava' }, { status: 500 });
  }
}
