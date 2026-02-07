/**
 * Batch fix SQL result handling in API routes
 * This script adds the normalizeRows import and wraps SQL results
 */

import * as fs from 'fs';
import * as path from 'path';

const filesToFix = [
  'app/api/crm/clients/[id]/route.ts',
  'app/api/crm/payments/stripe/webhook/route.ts',
  'app/api/crm/inquiries/[id]/route.ts',
  'app/api/crm/contracts/generate/route.ts',
  'app/api/crm/contracts/templates/[id]/route.ts',
  'app/api/crm/contracts/[id]/route.ts',
  'app/api/crm/contracts/[id]/sign/route.ts',
  'app/api/crm/contracts/send/route.ts',
  'app/api/crm/projects/[id]/notes/route.ts',
  'app/api/crm/projects/[id]/route.ts',
  'app/api/crm/notes/[id]/route.ts',
];

const rootDir = '/Users/donaldmcduffie/Documents/GitHub/eyp-ver2-next.js./eyp-ver2-next.js';

function fixFile(filePath: string) {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf-8');
  
  // Check if already has normalizeRows import
  if (content.includes('normalizeRows')) {
    console.log(`✓ Already fixed: ${filePath}`);
    return;
  }
  
  // Add import for normalizeRows after the sql import
  const sqlImportRegex = /(import sql from '@\/api-old\/db\/connection';)/;
  if (sqlImportRegex.test(content)) {
    content = content.replace(
      sqlImportRegex,
      `$1\nimport { normalizeRows } from '@/lib/db-utils';`
    );
  } else {
    console.log(`⚠️  No sql import found in: ${filePath}`);
    return;
  }
  
  // Pattern 1: const varName = await sql`...`; if (varName.length ...)
  // Replace with: const result = await sql`...`; const varName = normalizeRows(result); if (varName.length ...)
  const pattern1 = /const\s+(\w+)\s+=\s+await\s+sql`([^`]+)`;\s+(\/\/[^\n]*)?\s+if\s+\(\1\.length/g;
  content = content.replace(pattern1, (match, varName, query, comment) => {
    const commentLine = comment ? `\n    ${comment}` : '';
    return `const result_${varName} = await sql\`${query}\`;${commentLine}\n    const ${varName} = normalizeRows(result_${varName});\n\n    if (${varName}.length`;
  });
  
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Fixed: ${filePath}`);
}

console.log('Starting batch fix of SQL result handling...\n');

for (const file of filesToFix) {
  try {
    fixFile(file);
  } catch (error: any) {
    console.log(`❌ Error fixing ${file}: ${error.message}`);
  }
}

console.log('\nDone!');
