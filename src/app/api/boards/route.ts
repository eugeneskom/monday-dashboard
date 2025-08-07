import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      query GetAllBoards {
        boards(limit: 100) {
          id
          name
          description
          items_count
        }
      }
    `;

    const response = await fetch(`${process.env.MONDAY_API_URL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
      }),
    });

    if (!response.ok) {
      throw new Error(`Monday API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('Monday API errors:', data.errors);
      throw new Error('Monday API returned errors');
    }

    return NextResponse.json({
      boards: data.data.boards || []
    });

  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}
