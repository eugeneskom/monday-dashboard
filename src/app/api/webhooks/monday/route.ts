import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // Monday URL verification (challenge)
  if (body?.challenge) {
    return NextResponse.json({ challenge: body.challenge });
  }

  // Broadcast the event to all SSE clients
  const payload = {
    type: 'monday_webhook',
    timestamp: new Date().toISOString(),
    event: body?.event ?? body,
  };
  
  // Access broadcaster from global
  const sseGlobal = globalThis as unknown as { __sseBroadcast?: (data: unknown) => void };
  if (sseGlobal.__sseBroadcast) {
    sseGlobal.__sseBroadcast(payload);
  }

  return NextResponse.json({ ok: true });
}

// Optional: quick health check
export async function GET() {
  return NextResponse.json({ ok: true });
}
