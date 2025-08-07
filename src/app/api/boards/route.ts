import { NextResponse } from 'next/server';

// Types
interface MondayGraphQLResponse {
  data?: {
    boards?: Array<{
      id: string;
      name: string;
      description?: string;
      items_count: number;
    }>;
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

interface SuccessResponse {
  boards: Array<{
    id: string;
    name: string;
    description?: string;
    items_count: number;
  }>;
}

// Constants

const BOARDS_QUERY = `
  query {
    boards {
      id
      name
      description
      items_count
    }
  }
`;

// Helper functions
const createErrorResponse = (
  message: string, 
  status: number = 500, 
  details?: string
): NextResponse<ErrorResponse> => {
  return NextResponse.json(
    { error: message, ...(details && { details }) }, 
    { status }
  );
};

const isValidMondayResponse = (data: unknown): data is MondayGraphQLResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('data' in data || 'errors' in data)
  );
};

// Main handler
export async function GET(): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Validate environment variables
    const apiToken = process.env.MONDAY_API_TOKEN;
    if (!apiToken) {
      console.error('API Error: MONDAY_API_TOKEN environment variable is not set');
      return createErrorResponse(
        'Monday.com API token not configured',
        500,
        'Please check your environment variables'
      );
    }

    // Make request to Monday.com API
    const response = await fetch(`${process.env.MONDAY_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiToken,
      },
      body: JSON.stringify({
        query: BOARDS_QUERY,
      }),
    });

    // Check if response is ok
    if (!response.ok) {
      console.error(`Monday.com API request failed: ${response.status} ${response.statusText}`);
      return createErrorResponse(
        'Failed to fetch boards from Monday.com',
        response.status,
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    // Parse response
    const data: unknown = await response.json();

    // Validate response structure
    if (!isValidMondayResponse(data)) {
      console.error('Invalid response structure from Monday.com API:', data);
      return createErrorResponse(
        'Invalid response from Monday.com API',
        500,
        'Response does not match expected GraphQL structure'
      );
    }

    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      const errorMessages = data.errors.map(err => err.message).join(', ');
      console.error('Monday.com API returned GraphQL errors:', data.errors);
      return createErrorResponse(
        'Monday.com API error',
        400,
        errorMessages
      );
    }

    // Extract boards data
    const boards = data.data?.boards || [];
    
    if (boards.length === 0) {
      console.warn('No boards found in Monday.com account');
    }

    console.log(`Successfully fetched ${boards.length} boards from Monday.com`);

    return NextResponse.json<SuccessResponse>({ boards });

  } catch (error) {
    console.error('Unexpected error in boards API route:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return createErrorResponse(
      'Internal server error while fetching boards',
      500,
      errorMessage
    );
  }
}
