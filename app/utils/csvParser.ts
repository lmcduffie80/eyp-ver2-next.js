/**
 * CSV Parser Utility Functions
 * Handles CSV file parsing, date conversion, and column matching
 */

/**
 * Parse a CSV line handling quoted values, escaped quotes, and commas within quotes
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim()); // Add last field
  return result;
}

/**
 * Convert various date formats to YYYY-MM-DD
 * Supports: MM/DD/YYYY, M/D/YYYY, YYYY-MM-DD, MM-DD-YYYY, YYYY/MM/DD, and more
 */
export function convertDateToYYYYMMDD(dateStr: string): string | null {
  if (!dateStr) return null;

  // Clean the date string (remove extra spaces, quotes, etc.)
  dateStr = dateStr.trim().replace(/["']/g, '');

  // Try parsing as ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try MM/DD/YYYY or M/D/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    // Validate the date by creating it and checking if it's valid
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (
      date.getFullYear() == parseInt(year) &&
      date.getMonth() == parseInt(month) - 1 &&
      date.getDate() == parseInt(day)
    ) {
      return `${year}-${month}-${day}`;
    }
  }

  // Try MM-DD-YYYY or M-D-YYYY format (but not YYYY-MM-DD which we already handled)
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    // Validate the date
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (
      date.getFullYear() == parseInt(year) &&
      date.getMonth() == parseInt(month) - 1 &&
      date.getDate() == parseInt(day)
    ) {
      return `${year}-${month}-${day}`;
    }
  }

  // Try YYYY/MM/DD format
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (
      date.getFullYear() == parseInt(year) &&
      date.getMonth() == parseInt(month) - 1 &&
      date.getDate() == parseInt(day)
    ) {
      return `${year}-${month}-${day}`;
    }
  }

  // Try various other date formats using Date constructor
  // This will handle formats like "Jan 1, 2024", "January 1, 2024", etc.
  const date = new Date(dateStr);

  // Check if date is valid
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Validate that the parsed date makes sense (not too far in past/future)
    if (year >= 1900 && year <= 2100) {
      return `${year}-${month}-${day}`;
    }
  }

  return null;
}

/**
 * Find column index by matching against possible column names
 * Tries exact matches first, then contains matches (case-insensitive)
 */
export function findColumnIndex(headers: string[], possibleNames: string[]): number {
  // First try exact matches (case-insensitive)
  for (const name of possibleNames) {
    const nameLower = name.toLowerCase();
    const exactIndex = headers.findIndex((h) => h.toLowerCase() === nameLower);
    if (exactIndex !== -1) return exactIndex;
  }

  // Then try contains matches (but be more careful - prefer longer matches)
  for (const name of possibleNames.sort((a, b) => b.length - a.length)) {
    const nameLower = name.toLowerCase();
    const index = headers.findIndex((h) => {
      const hLower = h.toLowerCase();
      // Check if header contains the name or vice versa
      return hLower.includes(nameLower) || nameLower.includes(hLower);
    });
    if (index !== -1) return index;
  }

  return -1;
}

/**
 * Parse numeric value from string (removes $, commas, handles empty/null)
 */
export function parseNumeric(value: any): number | null {
  if (!value || value === '' || value === null || value === undefined) return null;
  // Remove currency symbols and commas
  const cleaned = String(value).replace(/[$,]/g, '').trim();
  if (!cleaned) return null;
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}
