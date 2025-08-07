import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const boardIds = ['9458292426', '9458295478'];
    
    console.log('Testing boards query with IDs:', boardIds);

    const query = `
      query GetBoardsWithItems($boardIds: [ID!]!) {
        boards(ids: $boardIds) {
          id
          name
          items_page {
            items {
              id
              name
              column_values {
                id
                text
                value
              }
              subitems {
                id
                name
                column_values {
                  id
                  text
                  value
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.monday.com/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_TOKEN!,
      },
      body: JSON.stringify({
        query,
        variables: { boardIds }
      }),
    });

    console.log('Boards query response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Boards API Error Response:', errorText);
      return NextResponse.json({ 
        error: `API request failed: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('Boards API Result:', JSON.stringify(result, null, 2));

    if (result.errors && result.errors.length > 0) {
      console.error('Monday.com boards API errors:', result.errors);
      return NextResponse.json({ 
        error: `Monday.com API error: ${result.errors[0].message}`,
        errors: result.errors
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      boards: result.data.boards,
      boardCount: result.data.boards?.length || 0
    });

  } catch (error) {
    console.error('Test Boards API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to test boards API',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
