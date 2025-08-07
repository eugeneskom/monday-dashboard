import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { boardId, webhookUrl } = await request.json();

    if (!boardId || !webhookUrl) {
      return NextResponse.json(
        { error: 'Board ID and webhook URL are required' },
        { status: 400 }
      );
    }

    const createWebhookMutation = `
      mutation CreateWebhook($boardId: ID!, $url: String!, $event: WebhookEventType!) {
        create_webhook(board_id: $boardId, url: $url, event: $event) {
          id
          board_id
          url
          event
        }
      }
    `;

    const events = [
      'update_column_value',
      'create_item',
      'update_item',
      'delete_item'
    ];

    const webhooks = [];

    // Create webhooks for different events
    for (const event of events) {
      const response = await fetch(`${process.env.MONDAY_API_URL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: createWebhookMutation,
          variables: {
            boardId: boardId,
            url: webhookUrl,
            event: event.toUpperCase()
          }
        }),
      });

      if (!response.ok) {
        console.error(`Failed to create webhook for event ${event}:`, response.status);
        continue;
      }

      const data = await response.json();
      
      if (data.errors) {
        console.error(`Monday API errors for event ${event}:`, data.errors);
        continue;
      }

      if (data.data?.create_webhook) {
        webhooks.push(data.data.create_webhook);
      }
    }

    return NextResponse.json({
      success: true,
      webhooks,
      message: `Created ${webhooks.length} webhooks for board ${boardId}`
    });

  } catch (error) {
    console.error('Error creating webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to create webhooks' },
      { status: 500 }
    );
  }
}

// Get existing webhooks
export async function GET() {
  try {
    const query = `
      query GetWebhooks {
        webhooks {
          id
          board_id
          url
          event
        }
      }
    `;

    const response = await fetch(`${process.env.MONDAY_API_URL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Monday API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error('Monday API returned errors');
    }

    return NextResponse.json({
      webhooks: data.data?.webhooks || []
    });

  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}
