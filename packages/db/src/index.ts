import type { RuntimeEnvironment } from '@pharmacy-two/shared';

export interface DatabaseConfig {
  readonly connectionString: string;
  readonly environment: RuntimeEnvironment;
  readonly sslRequired: boolean;
}

export interface MigrationDescriptor {
  readonly id: string;
  readonly description: string;
  readonly reversible: boolean;
}

export const initialMigrations: readonly MigrationDescriptor[] = [
  {
    id: '2026-11-23-initial-foundation',
    description: 'Initial PostgreSQL migration placeholder for the PharmacyTwo foundation.',
    reversible: true
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
