import { NextRequest, NextResponse } from 'next/server';
import { createMondayAPI } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const { query, variables } = await request.json();

    const mondayAPI = createMondayAPI();
    const response = await fetch(`${process.env.MONDAY_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_TOKEN!,
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
