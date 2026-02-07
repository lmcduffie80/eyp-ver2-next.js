/**
 * Database utility functions for handling SQL query results
 * 
 * The sql connection can return results in two formats:
 * 1. Direct array (from standard pg library)
 * 2. {rows, rowCount} object (from custom connection wrapper)
 * 
 * These utilities normalize the results to always be an array.
 */

type SQLResult<T = any> = T[] | { rows: T[]; rowCount?: number };

/**
 * Normalize SQL query results to always return an array
 * @param result - The SQL query result
 * @returns Array of rows
 */
export function normalizeRows<T = any>(result: SQLResult<T>): T[] {
  if (Array.isArray(result)) {
    return result;
  }
  return result.rows || [];
}

/**
 * Get a single row from SQL result or null if not found
 * @param result - The SQL query result  
 * @returns Single row or null
 */
export function getSingleRow<T = any>(result: SQLResult<T>): T | null {
  const rows = normalizeRows(result);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Check if SQL result has any rows
 * @param result - The SQL query result
 * @returns true if result has rows
 */
export function hasRows(result: SQLResult): boolean {
  const rows = normalizeRows(result);
  return rows.length > 0;
}
