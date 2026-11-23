import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const requiredTables = [
  'identity_link',
  'patient_profile',
  'staff_profile',
  'prescription',
  'refill_request',
  'secure_message',
  'audit_event',
  'success_metric_event',
];

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(
  currentDirectory,
  '..',
  'migrations',
  '0001_foundation.sql',
);

const migrationSql = await readFile(migrationPath, 'utf8');

const missingTables = requiredTables.filter((tableName) => {
  const tablePattern = new RegExp(
    `CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+public\\.${tableName}\\b`,
    'i',
  );

  return !tablePattern.test(migrationSql);
});

const hasClassificationMetadata =
  /Classification:\s*(Confidential|Restricted)/i.test(migrationSql);
const hasTransaction = /\bBEGIN\b/i.test(migrationSql) && /\bCOMMIT\b/i.test(migrationSql);

if (missingTables.length > 0 || !hasClassificationMetadata || !hasTransaction) {
  console.error('Migration validation failed.');
  console.error(`Missing tables: ${missingTables.join(', ') || 'none'}`);
  console.error(`Classification metadata present: ${String(hasClassificationMetadata)}`);
  console.error(`Transaction wrapper present: ${String(hasTransaction)}`);
  process.exitCode = 1;
} else {
  console.log('Migration validation passed for 0001_foundation.sql.');
}
