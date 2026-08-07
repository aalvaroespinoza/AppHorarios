import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/strava/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'Strava Client ID no configurado' }, { status: 500 });
  }

  const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=activity:read_all`;
  
  return NextResponse.redirect(stravaAuthUrl);
}
