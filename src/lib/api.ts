interface MondayResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

interface GraphQLVariables {
  [key: string]: string | number | boolean | string[] | number[] | null | undefined;
}

interface BoardsResponse {
  boards: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
      column_values: Array<{
        id: string;
        title: string;
        text: string;
        value: string;
      }>;
    }>;
  }>;
}

export class MondayAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest<T>(query: string, variables?: GraphQLVariables): Promise<T> {
    const response = await fetch(`${process.env.MONDAY_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result: MondayResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(`Monday.com API error: ${result.errors[0].message}`);
    }

    return result.data;
  }

  async getBoards(): Promise<BoardsResponse> {
    const query = `
      query {
        boards {
          id
          name
          items {
            id
            name
            column_values {
              id
              title
              text
              value
            }
          }
        }
      }
    `;

    return this.makeRequest<BoardsResponse>(query);
  }

  async getBoardsWithItems(boardIds: string[]): Promise<BoardsResponse> {
    const query = `
      query GetBoardsWithItems($boardIds: [ID!]!) {
        boards(ids: $boardIds) {
          id
          name
          items {
            id
            name
            column_values {
              id
              title
              text
              value
            }
          }
        }
      }
    `;

    return this.makeRequest<BoardsResponse>(query, { boardIds });
  }

  async getItemsWithStatus(boardIds: string[]): Promise<BoardsResponse> {
    const query = `
      query GetItemsWithStatus($boardIds: [ID!]!) {
        boards(ids: $boardIds) {
          id
          name
          items {
            id
            name
            column_values(ids: ["status", "person", "numbers"]) {
              id
              title
              text
              value
            }
          }
        }
      }
    `;

    return this.makeRequest<BoardsResponse>(query, { boardIds });
  }
}

// Create API instance (server-side only)
export function createMondayAPI(): MondayAPI {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) {
    throw new Error('MONDAY_API_TOKEN is not set');
  }
  return new MondayAPI(token);
}


