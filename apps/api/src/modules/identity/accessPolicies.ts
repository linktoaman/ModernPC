import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

import type { RequestContext } from '../../middleware/requestContext';
import type {
  IdentityPrincipal,
  PolicyCheck,
  PolicyDecision,
  PolicyResource
} from './index';

export type AccountStatus = 'active' | 'invited' | 'suspended' | 'deactivated';

export interface PatientAccountProfile {
  readonly id: string;
  readonly identityProvider: 'managed-oidc';
  readonly providerSubject: string;
  readonly role: 'patient';
  readonly givenName: string;
  readonly familyName: string;
  readonly dateOfBirth: string;
  readonly contactEmail?: string;
  readonly contactPhone?: string;
  readonly status: AccountStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface StaffAccountProfile {
  readonly id: string;
  readonly identityProvider: 'managed-oidc';
  readonly providerSubject: string;
  readonly role: StaffProvisioningRole;
  readonly givenName: string;
  readonly familyName: string;
  readonly email?: string;
  readonly licenseIdentifier?: string;
  readonly provisionedBySubject: string;
  readonly provisionedAt: string;
  readonly status: AccountStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PatientAccountInput {
  readonly givenName?: unknown;
  readonly familyName?: unknown;
  readonly dateOfBirth?: unknown;
  readonly contactEmail?: unknown;
  readonly contactPhone?: unknown;
}

export interface StaffProvisioningInput {
  readonly providerSubject?: unknown;
  readonly givenName?: unknown;
  readonly familyName?: unknown;
  readonly role?: unknown;
  readonly email?: unknown;
  readonly licenseIdentifier?: unknown;
  readonly status?: unknown;
}

export interface StaffProvisioningPatchInput {
  readonly givenName?: unknown;
  readonly familyName?: unknown;
  readonly role?: unknown;
  readonly email?: unknown;
  readonly licenseIdentifier?: unknown;
  readonly status?: unknown;
}

export interface ValidationFailure {
  readonly ok: false;
  readonly errors: readonly string[];
}

export interface ValidationSuccess<TValue> {
  readonly ok: true;
  readonly value: TValue;
}

export type ValidationResult<TValue> = ValidationSuccess<TValue> | ValidationFailure;

export interface SessionPolicyDecision {
  readonly allowed: boolean;
  readonly reasonCode?: 'session_timed_out';
}

export type StaffProvisioningRole = 'administrator' | 'pharmacist' | 'technician';

export const staffProvisioningRoles: readonly StaffProvisioningRole[] = [
  'administrator',
  'pharmacist',
  'technician'
];

const staffProvisioningRoleSet = new Set<string>(staffProvisioningRoles);
const activeStatuses = new Set<AccountStatus>(['active', 'invited']);
const defaultSessionTimeoutSeconds = 15 * 60;
const patientProfilesBySubject = new Map<string, PatientAccountProfile>();
const staffProfilesBySubject = new Map<string, StaffAccountProfile>();
const staffProfilesById = new Map<string, StaffAccountProfile>();

export const validateSessionPolicy = (
  request: IncomingMessage,
  context: RequestContext
): SessionPolicyDecision => {
  const receivedAtMs = Date.parse(context.receivedAt);
  const explicitExpiryMs = readDateHeaderMs(request, 'x-session-expires-at')
    ?? readDateHeaderMs(request, 'x-session-timeout-at');

  if (explicitExpiryMs !== undefined && explicitExpiryMs <= receivedAtMs) {
    return {
      allowed: false,
      reasonCode: 'session_timed_out'
    };
  }

  const authenticatedAtMs = readDateHeaderMs(request, 'x-authenticated-at')
    ?? readDateHeaderMs(request, 'x-session-started-at');

  if (authenticatedAtMs === undefined) {
    return { allowed: true };
  }

  const policyTimeoutSeconds = readPositiveInteger(
    request.headers['x-session-timeout-seconds']
  ) ?? defaultSessionTimeoutSeconds;
  const elapsedSeconds = (receivedAtMs - authenticatedAtMs) / 1000;

  if (elapsedSeconds > policyTimeoutSeconds) {
    return {
      allowed: false,
      reasonCode: 'session_timed_out'
    };
  }

  return { allowed: true };
};

export const registerPatientAccount = (
  identity: IdentityPrincipal,
  input: PatientAccountInput
): ValidationResult<PatientAccountProfile> => {
  if (identity.roles.some((role) => role !== 'patient')) {
    return {
      ok: false,
      errors: ['Patient self-registration is not available for staff identities.']
    };
  }

  const validation = validatePatientAccountInput(input);

  if (!validation.ok) {
    return validation;
  }

  const existingProfile = patientProfilesBySubject.get(identity.subject);
  const now = new Date().toISOString();

  if (existingProfile !== undefined) {
    const updatedProfile: PatientAccountProfile = {
      ...existingProfile,
      ...validation.value,
      updatedAt: now
    };

    patientProfilesBySubject.set(identity.subject, updatedProfile);

    return {
      ok: true,
      value: updatedProfile
    };
  }

  const createdProfile: PatientAccountProfile = {
    id: randomUUID(),
    identityProvider: 'managed-oidc',
    providerSubject: identity.subject,
    role: 'patient',
    ...validation.value,
    status: 'active',
    createdAt: now,
    updatedAt: now
  };

  patientProfilesBySubject.set(identity.subject, createdProfile);

  return {
    ok: true,
    value: createdProfile
  };
};

export const getPatientAccountForIdentity = (
  identity: IdentityPrincipal
): PatientAccountProfile | undefined => patientProfilesBySubject.get(identity.subject);

export const provisionStaffAccount = (
  administrator: IdentityPrincipal,
  input: StaffProvisioningInput
): ValidationResult<StaffAccountProfile> => {
  const validation = validateStaffProvisioningInput(input);

  if (!validation.ok) {
    return validation;
  }

  if (patientProfilesBySubject.has(validation.value.providerSubject)) {
    return {
      ok: false,
      errors: ['Staff access cannot be self-registered or linked to a patient profile.']
    };
  }

  const now = new Date().toISOString();
  const existingProfile = staffProfilesBySubject.get(validation.value.providerSubject);

  if (existingProfile !== undefined) {
    const updatedProfile: StaffAccountProfile = {
      ...existingProfile,
      ...validation.value,
      provisionedBySubject: administrator.subject,
      provisionedAt: now,
      updatedAt: now
    };

    saveStaffProfile(updatedProfile);

    return {
      ok: true,
      value: updatedProfile
    };
  }

  const createdProfile: StaffAccountProfile = {
    id: randomUUID(),
    identityProvider: 'managed-oidc',
    ...validation.value,
    provisionedBySubject: administrator.subject,
    provisionedAt: now,
    createdAt: now,
    updatedAt: now
  };

  saveStaffProfile(createdProfile);

  return {
    ok: true,
    value: createdProfile
  };
};

export const updateStaffAccount = (
  staffUserId: string,
  administrator: IdentityPrincipal,
  input: StaffProvisioningPatchInput
): ValidationResult<StaffAccountProfile> => {
  const existingProfile = staffProfilesById.get(staffUserId);

  if (existingProfile === undefined) {
    return {
      ok: false,
      errors: ['The staff account could not be updated.']
    };
  }

  const validation = validateStaffProvisioningPatchInput(input);

  if (!validation.ok) {
    return validation;
  }

  const updatedProfile: StaffAccountProfile = {
    ...existingProfile,
    ...validation.value,
    provisionedBySubject: administrator.subject,
    updatedAt: new Date().toISOString()
  };

  saveStaffProfile(updatedProfile);

  return {
    ok: true,
    value: updatedProfile
  };
};

export const getStaffAccountForIdentity = (
  identity: IdentityPrincipal
): StaffAccountProfile | undefined => staffProfilesBySubject.get(identity.subject);

export const staffProvisioningPolicy: PolicyCheck = {
  name: 'staff-provisioning',
  evaluate: (context): PolicyDecision => {
    const identity = context.identity;

    if (identity === undefined || !identity.roles.includes('administrator')) {
      return {
        allowed: false,
        reasonCode: 'administrator_role_required'
      };
    }

    return { allowed: true };
  }
};

export const provisionedStaffPolicy: PolicyCheck = {
  name: 'provisioned-staff',
  evaluate: (context): PolicyDecision => {
    const identity = context.identity;

    if (identity === undefined) {
      return {
        allowed: false,
        reasonCode: 'staff_provisioning_required'
      };
    }

    const staffProfile = staffProfilesBySubject.get(identity.subject);

    if (
      staffProfile === undefined
      || !activeStatuses.has(staffProfile.status)
      || !identity.roles.includes(staffProfile.role)
    ) {
      return {
        allowed: false,
        reasonCode: 'staff_provisioning_required'
      };
    }

    return { allowed: true };
  }
};

export const patientAccountOwnershipPolicy: PolicyCheck = {
  name: 'patient-account-ownership',
  evaluate: (context, resource: PolicyResource): PolicyDecision => {
    if (
      context.identity !== undefined
      && resource.ownerSubject === context.identity.subject
      && patientProfilesBySubject.has(context.identity.subject)
    ) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reasonCode: 'patient_account_required'
    };
  }
};

const validatePatientAccountInput = (
  input: PatientAccountInput
): ValidationResult<Omit<
  PatientAccountProfile,
  'id' | 'identityProvider' | 'providerSubject' | 'role' | 'status' | 'createdAt' | 'updatedAt'
>> => {
  const errors: string[] = [];
  const givenName = readRequiredString(input.givenName, 'givenName', errors);
  const familyName = readRequiredString(input.familyName, 'familyName', errors);
  const dateOfBirth = readRequiredIsoDate(input.dateOfBirth, 'dateOfBirth', errors);
  const contactEmail = readOptionalEmail(input.contactEmail, 'contactEmail', errors);
  const contactPhone = readOptionalString(input.contactPhone, 'contactPhone', errors);

  if (givenName === undefined || familyName === undefined || dateOfBirth === undefined) {
    return {
      ok: false,
      errors
    };
  }

  return {
    ok: true,
    value: {
      givenName,
      familyName,
      dateOfBirth,
      ...(contactEmail === undefined ? {} : { contactEmail }),
      ...(contactPhone === undefined ? {} : { contactPhone })
    }
  };
};

const validateStaffProvisioningInput = (
  input: StaffProvisioningInput
): ValidationResult<Omit<
  StaffAccountProfile,
  | 'id'
  | 'identityProvider'
  | 'provisionedBySubject'
  | 'provisionedAt'
  | 'createdAt'
  | 'updatedAt'
>> => {
  const errors: string[] = [];
  const providerSubject = readRequiredString(input.providerSubject, 'providerSubject', errors);
  const givenName = readRequiredString(input.givenName, 'givenName', errors);
  const familyName = readRequiredString(input.familyName, 'familyName', errors);
  const role = readStaffProvisioningRole(input.role, errors);
  const email = readOptionalEmail(input.email, 'email', errors);
  const licenseIdentifier = readOptionalString(
    input.licenseIdentifier,
    'licenseIdentifier',
    errors
  );
  const status = readAccountStatus(input.status, errors) ?? 'active';

  if (
    providerSubject === undefined
    || givenName === undefined
    || familyName === undefined
    || role === undefined
  ) {
    return {
      ok: false,
      errors
    };
  }

  return {
    ok: true,
    value: {
      providerSubject,
      givenName,
      familyName,
      role,
      status,
      ...(email === undefined ? {} : { email }),
      ...(licenseIdentifier === undefined ? {} : { licenseIdentifier })
    }
  };
};

const validateStaffProvisioningPatchInput = (
  input: StaffProvisioningPatchInput
): ValidationResult<Partial<Omit<
  StaffAccountProfile,
  | 'id'
  | 'identityProvider'
  | 'providerSubject'
  | 'provisionedBySubject'
  | 'provisionedAt'
  | 'createdAt'
  | 'updatedAt'
>>> => {
  const errors: string[] = [];
  const givenName = readOptionalString(input.givenName, 'givenName', errors);
  const familyName = readOptionalString(input.familyName, 'familyName', errors);
  const role = input.role === undefined ? undefined : readStaffProvisioningRole(input.role, errors);
  const email = readOptionalEmail(input.email, 'email', errors);
  const licenseIdentifier = readOptionalString(
    input.licenseIdentifier,
    'licenseIdentifier',
    errors
  );
  const status = input.status === undefined ? undefined : readAccountStatus(input.status, errors);

  if (errors.length > 0) {
    return {
      ok: false,
      errors
    };
  }

  return {
    ok: true,
    value: {
      ...(givenName === undefined ? {} : { givenName }),
      ...(familyName === undefined ? {} : { familyName }),
      ...(role === undefined ? {} : { role }),
      ...(email === undefined ? {} : { email }),
      ...(licenseIdentifier === undefined ? {} : { licenseIdentifier }),
      ...(status === undefined ? {} : { status })
    }
  };
};

const saveStaffProfile = (profile: StaffAccountProfile): void => {
  staffProfilesBySubject.set(profile.providerSubject, profile);
  staffProfilesById.set(profile.id, profile);
};

const readRequiredString = (
  value: unknown,
  fieldName: string,
  errors: string[]
): string | undefined => {
  const optionalValue = readOptionalString(value, fieldName, errors);

  if (optionalValue === undefined) {
    errors.push(`${fieldName} is required.`);
  }

  return optionalValue;
};

const readOptionalString = (
  value: unknown,
  fieldName: string,
  errors: string[]
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${fieldName} must be a non-empty string.`);
    return undefined;
  }

  return value.trim();
};

const readOptionalEmail = (
  value: unknown,
  fieldName: string,
  errors: string[]
): string | undefined => {
  const email = readOptionalString(value, fieldName, errors);

  if (email === undefined) {
    return undefined;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push(`${fieldName} must be a valid email address.`);
    return undefined;
  }

  return email.toLowerCase();
};

const readRequiredIsoDate = (
  value: unknown,
  fieldName: string,
  errors: string[]
): string | undefined => {
  const dateValue = readRequiredString(value, fieldName, errors);

  if (dateValue === undefined) {
    return undefined;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue) || Number.isNaN(Date.parse(dateValue))) {
    errors.push(`${fieldName} must be an ISO date.`);
    return undefined;
  }

  return dateValue;
};

const readStaffProvisioningRole = (
  value: unknown,
  errors: string[]
): StaffProvisioningRole | undefined => {
  if (typeof value !== 'string' || !staffProvisioningRoleSet.has(value)) {
    errors.push('role must be pharmacist, technician, or administrator.');
    return undefined;
  }

  return value as StaffProvisioningRole;
};

const readAccountStatus = (
  value: unknown,
  errors: string[]
): AccountStatus | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (
    value !== 'active'
    && value !== 'invited'
    && value !== 'suspended'
    && value !== 'deactivated'
  ) {
    errors.push('status must be active, invited, suspended, or deactivated.');
    return undefined;
  }

  return value;
};

const readDateHeaderMs = (
  request: IncomingMessage,
  name: string
): number | undefined => {
  const rawValue = request.headers[name.toLowerCase()];
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

  if (value === undefined || value.trim() === '') {
    return undefined;
  }

  const parsedValue = /^\d+$/.test(value)
    ? Number.parseInt(value, 10)
    : Date.parse(value);

  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

const readPositiveInteger = (value: string | readonly string[] | undefined): number | undefined => {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (rawValue === undefined || !/^\d+$/.test(rawValue)) {
    return undefined;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  return parsedValue > 0 ? parsedValue : undefined;
};
