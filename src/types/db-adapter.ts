
/**
 * Type definitions for the DatabaseAdapter
 */

export interface SelectOptions {
  head?: boolean;
  count?: 'exact' | 'planned' | 'estimated';
}

export interface DatabaseQueryResult<T> {
  data: T;
  error: any;
}

export interface DatabaseQueryBuilder {
  select: (columns: string, options?: SelectOptions) => DatabaseQueryBuilder;
  insert: (values: any, options?: any) => Promise<DatabaseQueryResult<any>>;
  update: (values: any, options?: any) => Promise<DatabaseQueryResult<any>>;
  delete: (options?: any) => Promise<DatabaseQueryResult<any>>;
  eq: (column: string, value: any) => DatabaseQueryBuilder;
  neq: (column: string, value: any) => DatabaseQueryBuilder;
  gt: (column: string, value: any) => DatabaseQueryBuilder;
  gte: (column: string, value: any) => DatabaseQueryBuilder;
  lt: (column: string, value: any) => DatabaseQueryBuilder;
  lte: (column: string, value: any) => DatabaseQueryBuilder;
  like: (column: string, value: string) => DatabaseQueryBuilder;
  ilike: (column: string, value: string) => DatabaseQueryBuilder;
  is: (column: string, value: any) => DatabaseQueryBuilder;
  in: (column: string, values: any[]) => DatabaseQueryBuilder;
  contains: (column: string, value: any) => DatabaseQueryBuilder;
  containedBy: (column: string, value: any) => DatabaseQueryBuilder;
  filter: (column: string, operator: string, value: any) => DatabaseQueryBuilder;
  not: (column: string, operator: string, value: any) => DatabaseQueryBuilder;
  or: (filters: string, options?: any) => DatabaseQueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => DatabaseQueryBuilder;
  limit: (count: number) => DatabaseQueryBuilder;
  offset: (count: number) => DatabaseQueryBuilder;
  range: (from: number, to: number) => DatabaseQueryBuilder;
  single: () => Promise<any>;
  maybeSingle: () => Promise<any>;
  call: (params: any) => Promise<any>;
}

export interface DatabaseTable {
  select: (columns: string, options?: SelectOptions) => DatabaseQueryBuilder;
  insert: (values: any, options?: any) => Promise<DatabaseQueryResult<any>>;
  update: (values: any, options?: any) => Promise<DatabaseQueryResult<any>>;
  delete: (options?: any) => Promise<DatabaseQueryResult<any>>;
  call: (params: any) => Promise<any>;
}

export interface DatabaseAdapter {
  table: (tableName: string) => DatabaseTable;
  query: <T>(tableName: string, queryFn: (queryBuilder: any) => any, fallbackData?: T) => Promise<T>;
  insert: <T>(tableName: string, data: any) => Promise<T | null>;
  update: <T>(tableName: string, data: any, matchColumn: string, matchValue: any) => Promise<T | null>;
  delete: (tableName: string, matchColumn: string, matchValue: any) => Promise<boolean>;
}
