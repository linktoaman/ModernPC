import type { IncomingMessage } from 'node:http';

import { describe, expect, test } from 'vitest';

import type { RequestContext } from '../../middleware/requestContext';
import type { IdentityPrincipal, PharmacyRole } from './index';
import {
  patientAccountOwnershipPolicy,
  provisionStaffAccount,
  provisionedStaffPolicy,
  registerPatientAccount,
  staffProvisioningPolicy,
  validateSessionPolicy,
} from './accessPolicies';

const createIdentity = (
  subject: string,
  roles: readonly PharmacyRole[],
): IdentityPrincipal => ({
  roleClaims: roles.map((role) => ({
    role,
    source: 'managed-oidc',
  })),
  roles,
  subject,
});

const createContext = (
  identity: IdentityPrincipal | undefined,
  correlationId = 'corr-policy',
): RequestContext => ({
  audit: {
    actorId: identity?.subject ?? 'anonymous',
    actorRoles: identity?.roles ?? [],
    correlationId,
    receivedAt: '2026-01-01T00:00:00.000Z',
    requestId: `${correlationId}-request`,
    requestMethod: 'GET',
    requestPath: '/api/policy-test',
  },
  correlationId,
  ...(identity === undefined ? {} : { identity }),
  receivedAt: '2026-01-01T00:00:00.000Z',
  requestId: `${correlationId}-request`,
  roleClaims: identity?.roleClaims ?? [],
});

const createRequest = (
  headers: Record<string, string>,
): IncomingMessage => ({
  headers,
}) as IncomingMessage;

describe('identity access policies', () => {
  test('allows only administrators to use staff provisioning policies', () => {
    const administrator = createContext(
      createIdentity('admin:policy-provisioning', ['administrator']),
    );
    const patient = createContext(createIdentity('patient:policy-provisioning', ['patient']));
    const pharmacist = createContext(
      createIdentity('staff:policy-provisioning', ['pharmacist']),
    );

    expect(staffProvisioningPolicy.evaluate(createContext(undefined), {
      type: 'staff-provisioning',
    })).toEqual({
      allowed: false,
      reasonCode: 'administrator_role_required',
    });
    expect(staffProvisioningPolicy.evaluate(patient, { type: 'staff-provisioning' })).toEqual({
      allowed: false,
      reasonCode: 'administrator_role_required',
    });
    expect(staffProvisioningPolicy.evaluate(pharmacist, { type: 'staff-provisioning' })).toEqual({
      allowed: false,
      reasonCode: 'administrator_role_required',
    });
    expect(staffProvisioningPolicy.evaluate(administrator, {
      type: 'staff-provisioning',
    })).toEqual({
      allowed: true,
    });
  });

  test('requires a patient-owned registered account for patient account access', () => {
    const registeredPatient = createIdentity('patient:policy-owner', ['patient']);
    const wrongPatient = createIdentity('patient:policy-wrong-owner', ['patient']);

    registerPatientAccount(registeredPatient, {
      dateOfBirth: '1990-07-19',
      familyName: 'Avery',
      givenName: 'Casey',
    });

    expect(patientAccountOwnershipPolicy.evaluate(createContext(registeredPatient), {
      ownerSubject: registeredPatient.subject,
      type: 'patient-account',
    })).toEqual({
      allowed: true,
    });
    expect(patientAccountOwnershipPolicy.evaluate(createContext(wrongPatient), {
      ownerSubject: registeredPatient.subject,
      type: 'patient-account',
    })).toEqual({
      allowed: false,
      reasonCode: 'patient_account_required',
    });
    expect(patientAccountOwnershipPolicy.evaluate(createContext(registeredPatient), {
      ownerSubject: 'patient:someone-else',
      type: 'patient-account',
    })).toEqual({
      allowed: false,
      reasonCode: 'patient_account_required',
    });
  });

  test('requires staff accounts to be provisioned, active, and role-aligned', () => {
    const administrator = createIdentity('admin:staff-policy', ['administrator']);
    const pharmacist = createIdentity('staff:policy-pharmacist', ['pharmacist']);
    const technician = createIdentity('staff:policy-pharmacist', ['technician']);
    const suspendedStaff = createIdentity('staff:policy-suspended', ['pharmacist']);

    provisionStaffAccount(administrator, {
      familyName: 'Singh',
      givenName: 'Dev',
      providerSubject: pharmacist.subject,
      role: 'pharmacist',
      status: 'active',
    });
    provisionStaffAccount(administrator, {
      familyName: 'Gray',
      givenName: 'Jamie',
      providerSubject: suspendedStaff.subject,
      role: 'pharmacist',
      status: 'suspended',
    });

    expect(provisionedStaffPolicy.evaluate(createContext(undefined), {
      type: 'patient-worklist',
    })).toEqual({
      allowed: false,
      reasonCode: 'staff_provisioning_required',
    });
    expect(provisionedStaffPolicy.evaluate(createContext(createIdentity('staff:missing', [
      'pharmacist',
    ])), {
      type: 'patient-worklist',
    })).toEqual({
      allowed: false,
      reasonCode: 'staff_provisioning_required',
    });
    expect(provisionedStaffPolicy.evaluate(createContext(technician), {
      type: 'patient-worklist',
    })).toEqual({
      allowed: false,
      reasonCode: 'staff_provisioning_required',
    });
    expect(provisionedStaffPolicy.evaluate(createContext(suspendedStaff), {
      type: 'patient-worklist',
    })).toEqual({
      allowed: false,
      reasonCode: 'staff_provisioning_required',
    });
    expect(provisionedStaffPolicy.evaluate(createContext(pharmacist), {
      type: 'patient-worklist',
    })).toEqual({
      allowed: true,
    });
  });

  test('denies expired sessions before protected authorization checks continue', () => {
    const context = createContext(
      createIdentity('patient:expired-session', ['patient']),
      'corr-expired-session',
    );

    expect(validateSessionPolicy(createRequest({
      'x-session-expires-at': '2025-12-31T23:59:59.000Z',
    }), context)).toEqual({
      allowed: false,
      reasonCode: 'session_timed_out',
    });
    expect(validateSessionPolicy(createRequest({
      'x-authenticated-at': '2026-01-01T00:00:00.000Z',
      'x-session-timeout-seconds': '900',
    }), context)).toEqual({
      allowed: true,
    });
  });
});
