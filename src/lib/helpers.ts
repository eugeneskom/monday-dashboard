import { createMondayAPI } from "./api";

export async function fetchBoards(boardIds: number[]) {
  const monday = createMondayAPI();
  const boardIdsStr = boardIds.map(id => id.toString());
  const result = await monday.getBoardsWithItems(boardIdsStr);
  return result.boards;
}
