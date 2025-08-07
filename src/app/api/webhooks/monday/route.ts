import { NextRequest, NextResponse } from 'next/server';

// Store active connections for Server-Sent Events
const connections = new Set<ReadableStreamDefaultController>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Monday.com webhook received:', body);

    // Check if this is a relevant event (item updates, column value changes)
    if (body.event && (
      body.event.type === 'update_column_value' ||
      body.event.type === 'create_item' ||
      body.event.type === 'update_item' ||
      body.event.type === 'delete_item'
    )) {
      // Broadcast to all connected clients
      const message = {
        type: 'board_update',
        boardId: body.event.boardId,
        itemId: body.event.itemId,
        timestamp: new Date().toISOString(),
        event: body.event
      };

      // Send to all connected SSE clients
      connections.forEach(controller => {
        try {
          controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
        } catch (error) {
          console.log('Error sending SSE message:', error);
          connections.delete(controller);
        }
      });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Server-Sent Events endpoint for real-time updates
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to our set
      connections.add(controller);

      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'connected',
        timestamp: new Date().toISOString()
      })}\n\n`));

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        connections.delete(controller);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
