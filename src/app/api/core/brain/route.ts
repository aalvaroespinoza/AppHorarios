import { NextResponse } from 'next/server';
import { brainEngine } from '@/core/brain';

export interface BrainEngineRequest {
  text: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as BrainEngineRequest;
    
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'El campo "text" es obligatorio y debe ser un string.' }, { status: 400 });
    }

    const context = {
      currentDateIso: new Date().toISOString(),
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    const result = await brainEngine.analyzeText(body.text, context);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error del Brain Engine' }, { status: 500 });
  }
}
