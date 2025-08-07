import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.MONDAY_API_TOKEN;
  
  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenStart: token ? token.substring(0, 10) + '...' : 'Not found',
    environment: process.env.NODE_ENV,
  });
}
