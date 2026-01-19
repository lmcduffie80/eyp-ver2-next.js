'use client';

import { useState } from 'react';
import {
  parseCSVLine,
  convertDateToYYYYMMDD,
  findColumnIndex,
  parseNumeric,
} from '../utils/csvParser';

interface ImportStatus {
  visible: boolean;
  title: string;
  message: string;
  details: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface DJ {
  username: string;
  firstName?: string;
  lastName?: string;
}

interface Booking {
  id?: number;
  djUser: string;
  date: string;
  eventType: string;
  location: string | null;
  clientName: string | null;
  payout: number | null;
  totalRevenue: number | null;
  ccPayment: number | null;
  time: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
}

export function useCSVImport() {
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<ImportStatus>({
    visible: false,
    title: '',
    message: '',
    details: '',
    type: 'info',
  });

  const updateStatus = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'warning' = 'info',
    details: string = ''
  ) => {
    setStatus({
      visible: true,
      title,
      message,
      details,
      type,
    });
  };

  const importCSV = async (file: File): Promise<void> => {
    setImporting(true);
    updateStatus('Reading File', `Reading CSV file: ${file.name}...`, 'info');

    try {
      // Read file
      const text = await readFile(file);

      updateStatus('Parsing CSV', 'Parsing CSV file content...', 'info');

      // Remove BOM if present
      let csv = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

      // Handle different line endings (Windows \r\n, Mac \r, Unix \n)
      const lines = csv.split(/\r?\n|\r/).filter((line) => line.trim());

      if (lines.length < 2) {
        updateStatus(
          'Import Error',
          'CSV file must have at least a header row and one data row.',
          'error'
        );
        setImporting(false);
        return;
      }

      // Parse header row - try multiple methods
      let headerValues: string[] = [];
      let headers: string[] = [];

      // Method 1: Try proper CSV parsing (handles quoted values)
      try {
        headerValues = parseCSVLine(lines[0]);
        headers = headerValues.map((h) =>
          h.trim().replace(/^["']|["']$/g, '').toLowerCase()
        );
      } catch {
        // Fallback to simple split
      }

      // Method 2: If that fails or returns empty, try simple comma split
      if (headers.length === 0 || headers.every((h) => !h)) {
        headerValues = lines[0]
          .split(',')
          .map((h) => h.trim().replace(/^["']|["']$/g, ''));
        headers = headerValues.map((h) => h.toLowerCase());
      }

      // Method 3: Try tab-separated (TSV)
      if (headers.length === 0 || headers.every((h) => !h)) {
        headerValues = lines[0]
          .split('\t')
          .map((h) => h.trim().replace(/^["']|["']$/g, ''));
        headers = headerValues.map((h) => h.toLowerCase());
      }

      // Method 4: Try semicolon-separated (common in European Excel exports)
      if (headers.length === 0 || headers.every((h) => !h)) {
        headerValues = lines[0]
          .split(';')
          .map((h) => h.trim().replace(/^["']|["']$/g, ''));
        headers = headerValues.map((h) => h.toLowerCase());
      }

      // Check if headers are empty
      if (headers.length === 0 || headers.every((h) => !h)) {
        updateStatus(
          'Import Error',
          `Could not parse CSV headers. First line of file: "${lines[0].substring(0, 200)}...". Please ensure the first row contains column names: Data (Date), DJ, Project, Location, Payment, CC Payment 6%, DJ Payout`,
          'error'
        );
        setImporting(false);
        return;
      }

      // Store the separator for use in data parsing
      let csvSeparator = ',';
      if (lines[0].includes('\t') && !lines[0].includes(',')) {
        csvSeparator = '\t';
      } else if (lines[0].includes(';') && !lines[0].includes(',')) {
        csvSeparator = ';';
      }

      // Find column indices (flexible matching)
      const dateIndex = findColumnIndex(headers, ['data', 'date', 'date of project']);
      const djNameIndex = findColumnIndex(headers, ['dj', 'dj name', 'djname']);
      const projectNameIndex = findColumnIndex(headers, [
        'project',
        'project name',
        'projectname',
      ]);
      const locationIndex = findColumnIndex(headers, [
        'location',
        'location for venue',
        'venue location',
      ]);
      const paymentIndex = findColumnIndex(headers, [
        'payment',
        'total revenue',
        'totalrevenue',
        'revenue',
      ]);
      const ccPaymentIndex = findColumnIndex(headers, [
        'cc payment',
        'cc payment 6%',
        'cc payment 6',
      ]);
      const payoutIndex = findColumnIndex(headers, ['dj payout', 'payout', 'djpayout']);

      if (
        dateIndex === -1 ||
        djNameIndex === -1 ||
        projectNameIndex === -1 ||
        locationIndex === -1
      ) {
        const missing: string[] = [];
        if (dateIndex === -1) missing.push('Data (Date)');
        if (djNameIndex === -1) missing.push('DJ');
        if (projectNameIndex === -1) missing.push('Project');
        if (locationIndex === -1) missing.push('Location');

        updateStatus(
          'Import Error',
          `CSV is missing required columns: ${missing.join(', ')}. Found headers: "${headerValues.join('", "')}". Please ensure your CSV has columns: Data (Date), DJ, Project, Location, Payment, CC Payment 6%, DJ Payout`,
          'error'
        );
        setImporting(false);
        return;
      }

      // Create a helper function that uses the detected separator
      const parseRow = (line: string): string[] => {
        if (csvSeparator === '\t') {
          return line.split('\t').map((v) => v.trim().replace(/^["']|["']$/g, ''));
        } else if (csvSeparator === ';') {
          return line.split(';').map((v) => v.trim().replace(/^["']|["']$/g, ''));
        } else {
          // Try proper CSV parsing first for comma-separated
          try {
            return parseCSVLine(line);
          } catch {
            // Fallback to simple split
            return line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
          }
        }
      };

      // Start processing from row 1 (row 0 is the header)
      const startRow = 1;

      // Validate that the date column actually looks like it contains dates
      let dateColumnValid = false;
      let sampleDateValue = '';

      if (lines.length > startRow && dateIndex !== -1) {
        for (let i = startRow; i < Math.min(startRow + 10, lines.length); i++) {
          const testValues = parseRow(lines[i]);
          if (testValues.length > dateIndex && testValues[dateIndex]) {
            const testDate = testValues[dateIndex].trim();
            if (!testDate) continue;
            sampleDateValue = testDate;
            // Check if it looks like a date (contains numbers and separators)
            if (/\d/.test(testDate) && (/[/\-.]/.test(testDate) || /^\d{4}/.test(testDate))) {
              dateColumnValid = true;
              break;
            }
          }
        }
      } else if (dateIndex === -1) {
        dateColumnValid = true;
      } else {
        dateColumnValid = true;
      }

      if (!dateColumnValid && sampleDateValue) {
        const dateHeaderName = headerValues[dateIndex] || 'Date of Project';
        updateStatus(
          'Import Error',
          `The Date column (column ${dateIndex + 1}: "${dateHeaderName}") doesn't contain valid date values. Sample value found: "${sampleDateValue}". Please check that your CSV has the correct column headers and that row 2 contains valid date data.`,
          'error'
        );
        setImporting(false);
        return;
      }

      updateStatus('Processing Data', 'Processing CSV rows and validating data...', 'info');

      // Fetch all DJs for name normalization
      const allDJs = await fetchAllDJs();

      // Parse data rows starting from row 1 (row 0 is header)
      const newBookings: Booking[] = [];
      let skippedCount = 0;
      const skipReasons = {
        notEnoughColumns: 0,
        missingFields: 0,
        invalidDate: 0,
        duplicate: 0,
      };
      const invalidDateExamples: string[] = [];

      for (let i = startRow; i < lines.length; i++) {
        const values = parseRow(lines[i]);

        if (
          values.length <
          Math.max(djNameIndex, dateIndex, projectNameIndex, locationIndex) + 1
        ) {
          skipReasons.notEnoughColumns++;
          skippedCount++;
          continue;
        }

        const djName = values[djNameIndex] ? values[djNameIndex].trim() : '';
        const dateStr = values[dateIndex] ? values[dateIndex].trim() : '';
        const projectName = values[projectNameIndex] ? values[projectNameIndex].trim() : '';
        const location = values[locationIndex] ? values[locationIndex].trim() : '';
        const payment =
          paymentIndex !== -1 && values[paymentIndex] ? values[paymentIndex].trim() : '';
        const ccPayment =
          ccPaymentIndex !== -1 && values[ccPaymentIndex] ? values[ccPaymentIndex].trim() : '';
        const payout =
          payoutIndex !== -1 && values[payoutIndex] ? values[payoutIndex].trim() : '';
        const totalRevenue = payment || '';

        if (!djName || !dateStr || !projectName || !location) {
          skipReasons.missingFields++;
          skippedCount++;
          continue;
        }

        // Convert date to YYYY-MM-DD format
        const formattedDate = convertDateToYYYYMMDD(dateStr);
        if (!formattedDate) {
          if (invalidDateExamples.length < 3) {
            invalidDateExamples.push(`"${dateStr}"`);
          }
          skipReasons.invalidDate++;
          skippedCount++;
          continue;
        }

        // Normalize DJ name to match user format
        let normalizedDJName = djName.trim();

        const matchingDJ = allDJs.find((dj) => {
          const djFullName =
            dj.firstName && dj.lastName ? `${dj.firstName} ${dj.lastName}` : dj.username;
          return (
            djFullName.toLowerCase() === djName.toLowerCase().trim() ||
            dj.username.toLowerCase() === djName.toLowerCase().trim() ||
            (dj.firstName && dj.firstName.toLowerCase() === djName.toLowerCase().trim()) ||
            (dj.lastName && dj.lastName.toLowerCase() === djName.toLowerCase().trim())
          );
        });

        if (matchingDJ) {
          normalizedDJName =
            matchingDJ.firstName && matchingDJ.lastName
              ? `${matchingDJ.firstName} ${matchingDJ.lastName}`
              : matchingDJ.username;
        }

        // Check if booking already exists in the current CSV import
        const exists = newBookings.some(
          (b) =>
            b.djUser === normalizedDJName &&
            b.date === formattedDate &&
            b.eventType === projectName
        );

        if (exists) {
          skipReasons.duplicate++;
          skippedCount++;
          continue;
        }

        // Create booking object
        const booking: Booking = {
          djUser: normalizedDJName,
          date: formattedDate,
          eventType: projectName,
          location: location || null,
          clientName: projectName || null,
          payout: parseNumeric(payout),
          totalRevenue: parseNumeric(totalRevenue),
          ccPayment: parseNumeric(ccPayment),
          time: null,
          contactEmail: null,
          contactPhone: null,
          notes: payout ? `Payout: ${payout}` : null,
        };

        newBookings.push(booking);
      }

      // Replace all existing bookings with new ones
      try {
        // Helper function to add delay between API calls
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        
        // First, get all existing bookings and delete them
        updateStatus(
          'Deleting Old Data',
          `Deleting existing bookings...`,
          'info'
        );
        const existingBookings = await fetchAllBookings();

        for (let i = 0; i < existingBookings.length; i++) {
          const booking = existingBookings[i];
          if (booking.id) {
            await deleteBooking(booking.id);
            // Add small delay every 5 deletions to prevent cache warnings
            if ((i + 1) % 5 === 0) {
              await delay(100); // 100ms delay
            }
          }
        }

        // Then create new bookings
        updateStatus(
          'Importing Data',
          `Importing ${newBookings.length} new bookings...`,
          'info'
        );

        let successCount = 0;
        for (let i = 0; i < newBookings.length; i++) {
          try {
            await createBooking(newBookings[i]);
            successCount++;
            
            // Add small delay every 5 creates to prevent cache warnings
            if ((i + 1) % 5 === 0) {
              await delay(100); // 100ms delay
            }
            
            // Update progress every 10 bookings
            if ((i + 1) % 10 === 0 || i === newBookings.length - 1) {
              updateStatus(
                'Importing Data',
                `Importing new bookings... (${i + 1} of ${newBookings.length})`,
                'info'
              );
            }
          } catch (error) {
            console.error(`Failed to create booking ${i + 1}:`, error);
          }
        }

        // Build success message with skip details
        let detailsMsg = '';
        if (skippedCount > 0) {
          const reasons: string[] = [];
          if (skipReasons.notEnoughColumns > 0)
            reasons.push(`${skipReasons.notEnoughColumns} not enough columns`);
          if (skipReasons.missingFields > 0)
            reasons.push(`${skipReasons.missingFields} missing required fields`);
          if (skipReasons.invalidDate > 0)
            reasons.push(`${skipReasons.invalidDate} invalid dates`);
          if (skipReasons.duplicate > 0)
            reasons.push(`${skipReasons.duplicate} duplicates`);
          detailsMsg = `Skipped ${skippedCount} rows: ${reasons.join(', ')}`;
          if (invalidDateExamples.length > 0) {
            detailsMsg += `. Invalid date examples: ${invalidDateExamples.join(', ')}`;
          }
        }

        updateStatus(
          'Import Complete',
          `Successfully imported ${successCount} bookings.${skippedCount > 0 ? ` Skipped ${skippedCount} rows.` : ''}`,
          'success',
          detailsMsg
        );
      } catch (error) {
        console.error('Import error:', error);
        updateStatus(
          'Import Failed',
          `Failed to import bookings: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error'
        );
      }
    } catch (error) {
      console.error('CSV parsing error:', error);
      updateStatus(
        'Import Error',
        `Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    } finally {
      setImporting(false);
    }
  };

  return { importing, status, importCSV };
}

// Helper functions for file reading and API calls

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(file);
  });
}

async function fetchAllDJs(): Promise<DJ[]> {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch DJs');
    const users = await response.json();
    return users.filter((u: any) => u.usertype === 'dj');
  } catch (error) {
    console.error('Error fetching DJs:', error);
    return [];
  }
}

async function fetchAllBookings(): Promise<Booking[]> {
  try {
    const response = await fetch('/api/bookings');
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

async function deleteBooking(id: number): Promise<void> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete booking ${id}`);
  }
}

async function createBooking(booking: Booking): Promise<void> {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  });
  if (!response.ok) {
    throw new Error('Failed to create booking');
  }
}
