import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, variables } = await request.json();
    
    const token = process.env.MONDAY_API_TOKEN;
    if (!token) {
      throw new Error('MONDAY_API_TOKEN is not configured');
    }

    const response = await fetch(`${process.env.MONDAY_API_UR}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(`Monday.com API error: ${result.errors[0].message}`);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Monday API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Monday.com' },
      { status: 500 }
    );
  }
}
