import type { RuntimeEnvironment } from '@pharmacy-two/shared';

export interface DatabaseConfig {
  readonly connectionString: string;
  readonly environment: RuntimeEnvironment;
  readonly sslRequired: boolean;
}

export interface MigrationDescriptor {
  readonly id: string;
  readonly description: string;
  readonly filename: string;
  readonly reversible: boolean;
}

export const initialMigrations: readonly MigrationDescriptor[] = [
  {
    id: '0001-foundation',
    description: 'Initial PostgreSQL schema for PharmacyTwo application-owned records.',
    filename: '0001_foundation.sql',
    reversible: false
  }
];

export const createDatabaseConfig = (
  connectionString: string,
  environment: RuntimeEnvironment
): DatabaseConfig => ({
  connectionString,
  environment,
  sslRequired: environment === 'production' || environment === 'staging'
});
