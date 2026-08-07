import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { StravaService } from '@/lib/services/strava.service';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('strava_access_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const activities = await StravaService.getLatestActivities(token);

  if (!activities) {
    return NextResponse.json({ authenticated: true, activities: [], error: 'Failed to fetch activities' });
  }

  return NextResponse.json({ authenticated: true, activities });
}
