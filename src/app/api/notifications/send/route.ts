import { NextRequest, NextResponse } from 'next/server';
import { NotificationPayload } from '@/core/services/notifications/notification.types';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json() as NotificationPayload;

    if (!payload.category || !payload.title || !payload.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

    if (!restApiKey || !appId) {
      console.warn('[API] OneSignal keys not configured');
      // Still return 200 so we don't break the client, but indicate it wasn't sent
      return NextResponse.json({ success: false, reason: 'unconfigured' });
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${restApiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        // For testing we will send to all subscribed users or a specific segment.
        // Assuming included_segments for now. In real implementation it might be specific player_ids
        included_segments: ['Subscribed Users'],
        contents: {
          en: payload.message,
          es: payload.message
        },
        headings: {
          en: payload.title,
          es: payload.title
        },
        data: payload.data,
        send_after: payload.sendAfter,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API] OneSignal error:', errorData);
      return NextResponse.json({ success: false, error: 'OneSignal error' }, { status: response.status });
    }

    const responseData = await response.json();
    return NextResponse.json({ success: true, data: responseData });

  } catch (error) {
    console.error('[API] Failed to send notification', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
