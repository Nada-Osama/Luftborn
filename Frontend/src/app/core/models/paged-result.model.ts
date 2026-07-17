export interface PagedResult<T> {
  results: T[];
  currentPage: number;
  pageCount: number;
  pageSize: number;
  rowCount: number;
}

export function hasPreviousPage(result: PagedResult<unknown>): boolean {
  return result.currentPage > 1;
}

export function hasNextPage(result: PagedResult<unknown>): boolean {
  return result.currentPage < result.pageCount;
}
