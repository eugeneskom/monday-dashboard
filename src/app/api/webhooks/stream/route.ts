import { NextRequest } from 'next/server';

type Client = { id: number; send: (data: unknown) => void };
const g = globalThis as unknown as { __sseClients?: Map<number, Client> };
if (!g.__sseClients) g.__sseClients = new Map();
const clients = g.__sseClients;

function broadcast(data: unknown) {
  for (const { send } of clients.values()) send(data);
}

// Expose a broadcaster for other routes (monday)
export const SSE = { broadcast };

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const id = Date.now() + Math.random();
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      clients.set(id, { id, send });

      // greet + keep-alive
      send({ type: 'connected', timestamp: new Date().toISOString() });
      const ka = setInterval(() => controller.enqueue(encoder.encode(':\n\n')), 20000);

      req.signal.addEventListener('abort', () => {
        clearInterval(ka);
        clients.delete(id);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}