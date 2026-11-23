export type RuntimeEnvironment = 'development' | 'test' | 'staging' | 'production';

export interface HealthStatus {
  readonly service: string;
  readonly status: 'ok';
  readonly environment: RuntimeEnvironment;
  readonly checkedAt: string;
}

export interface PharmacyUserRole {
  readonly id: string;
  readonly label: string;
  readonly canAccessPhi: boolean;
}

export const supportedRoles: readonly PharmacyUserRole[] = [
  {
    id: 'pharmacist',
    label: 'Pharmacist',
    canAccessPhi: true
  },
  {
    id: 'technician',
    label: 'Technician',
    canAccessPhi: true
  },
  {
    id: 'operations',
    label: 'Operations',
    canAccessPhi: false
  }
];

export const createHealthStatus = (
  service: string,
  environment: RuntimeEnvironment
): HealthStatus => ({
  service,
  status: 'ok',
  environment,
  checkedAt: new Date().toISOString()
});
