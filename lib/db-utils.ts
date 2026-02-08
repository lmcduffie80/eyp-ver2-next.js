/**
 * Database utility functions for normalizing SQL query results
 */

/**
 * Normalize SQL query results to always return an array
 * Handles both direct array results and {rows, rowCount} object results
 */
export function normalizeRows(result: any): any[] {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (result.rows && Array.isArray(result.rows)) return result.rows;
  return [];
}

/**
 * Get a single row from query results or null
 */
export function getSingleRow(result: any): any | null {
  const rows = normalizeRows(result);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Check if query results contain any rows
 */
export function hasRows(result: any): boolean {
  return normalizeRows(result).length > 0;
}
