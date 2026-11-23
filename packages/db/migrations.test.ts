import { readFile } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

import { initialMigrations } from './src';

const requiredTables = [
  'identity_link',
  'patient_profile',
  'staff_profile',
  'prescription',
  'refill_request',
  'secure_message',
  'audit_event',
  'success_metric_event',
] as const;

describe('database migration foundation', () => {
  test('describes the initial static migration', () => {
    expect(initialMigrations).toContainEqual({
      description: 'Initial PostgreSQL schema for PharmacyTwo application-owned records.',
      filename: '0001_foundation.sql',
      id: '0001-foundation',
      reversible: false,
    });
  });

  test('includes required tables, classification metadata, and transaction boundaries', async () => {
    const migrationSql = await readFile(
      new URL('./migrations/0001_foundation.sql', import.meta.url),
      'utf8',
    );

    for (const tableName of requiredTables) {
      expect(migrationSql).toMatch(
        new RegExp(`CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+public\\.${tableName}\\b`, 'iu'),
      );
    }

    expect(migrationSql).toMatch(/Classification:\s*(Confidential|Restricted)/iu);
    expect(migrationSql).toMatch(/\bBEGIN\b/iu);
    expect(migrationSql).toMatch(/\bCOMMIT\b/iu);
  });
});
