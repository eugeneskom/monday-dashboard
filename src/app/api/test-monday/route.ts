import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing Monday.com API connection...');
    console.log('API Token exists:', !!process.env.MONDAY_API_TOKEN);
    console.log('Token length:', process.env.MONDAY_API_TOKEN?.length);

    const response = await fetch('https://api.monday.com/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_TOKEN!,
      },
      body: JSON.stringify({
        query: `
          query {
            me {
              id
              name
              email
            }
          }
        `,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return NextResponse.json({ 
        error: `API request failed: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('API Result:', result);

    if (result.errors && result.errors.length > 0) {
      console.error('Monday.com API errors:', result.errors);
      return NextResponse.json({ 
        error: `Monday.com API error: ${result.errors[0].message}`,
        errors: result.errors
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      user: result.data.me,
      message: 'Monday.com API connection successful!'
    });

  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to test Monday.com API',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
