export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function paginate<T>(
  items: T[],
  params: PaginationParams
): PaginatedResponse<T> {
  const { page, pageSize } = params;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = items.slice(start, end);
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export class CursorPagination<T> {
  constructor(
    private items: T[],
    private getCursor: (item: T) => string
  ) {}

  getPage(cursor: string | null, limit: number): {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
  } {
    let startIndex = 0;

    if (cursor) {
      startIndex = this.items.findIndex(
        (item) => this.getCursor(item) === cursor
      );
      if (startIndex === -1) startIndex = 0;
      else startIndex += 1;
    }

    const data = this.items.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < this.items.length;
    const nextCursor = hasMore && data.length > 0 
      ? this.getCursor(data[data.length - 1]) 
      : null;

    return {
      data,
      nextCursor,
      hasMore,
    };
  }
}

export function createCursorPagination<T>(
  items: T[],
  getCursor: (item: T) => string
): CursorPagination<T> {
  return new CursorPagination(items, getCursor);
}
