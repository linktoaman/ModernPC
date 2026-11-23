import { describe, expect, test } from 'vitest';

import type { RequestContext } from '../../middleware/requestContext';
import {
  getStaffProvisioningAuditRecords,
} from '../audit-reporting';
import type { IdentityPrincipal } from './index';
import { createPatientAccountRouteResponse } from './accountRoutes';
import {
  createStaffProvisioningRouteResponse,
  matchStaffProvisioningRoute,
  updateStaffProvisioningRouteResponse,
} from './staffProvisioningRoutes';

const createIdentity = (
  subject: string,
  roles: IdentityPrincipal['roles'],
): IdentityPrincipal => ({
  roleClaims: roles.map((role) => ({
    role,
    source: 'managed-oidc',
  })),
  roles,
  subject,
});

const createContext = (
  identity: IdentityPrincipal,
  correlationId: string,
): RequestContext => ({
  audit: {
    actorId: identity.subject,
    actorRoles: identity.roles,
    correlationId,
    receivedAt: '2026-01-01T00:00:00.000Z',
    requestId: `${correlationId}-request`,
    requestMethod: 'POST',
    requestPath: '/api/admin/staff',
  },
  correlationId,
  identity,
  receivedAt: '2026-01-01T00:00:00.000Z',
  requestId: `${correlationId}-request`,
  roleClaims: identity.roleClaims,
});

describe('staff provisioning routes', () => {
  test('matches create and update staff provisioning API routes only', () => {
    expect(matchStaffProvisioningRoute('POST', '/api/admin/staff')).toEqual({
      action: 'create',
    });
    expect(matchStaffProvisioningRoute('PATCH', '/api/admin/staff/staff-123')).toEqual({
      action: 'update',
      staffUserId: 'staff-123',
    });
    expect(matchStaffProvisioningRoute('GET', '/api/admin/staff')).toBeUndefined();
  });

  test('validates required staff provisioning fields', () => {
    const administrator = createIdentity('admin:staff-invalid', ['administrator']);
    const response = createStaffProvisioningRouteResponse(
      administrator,
      {
        email: 'not-an-email',
        providerSubject: '',
        role: 'operations',
      },
      createContext(administrator, 'corr-staff-invalid'),
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toMatchObject({
      correlationId: 'corr-staff-invalid',
      error: 'invalid_staff_provisioning',
    });
    expect(response.body.details).toEqual([
      'providerSubject is required.',
      'givenName is required.',
      'familyName is required.',
      'role must be pharmacist, technician, or administrator.',
      'email must be a valid email address.',
    ]);
  });

  test('rejects provisioning a staff account over an existing patient profile', () => {
    const administrator = createIdentity('admin:patient-link-rejected', ['administrator']);
    const patient = createIdentity('patient:staff-link-rejected', ['patient']);

    createPatientAccountRouteResponse(
      patient,
      {
        dateOfBirth: '1987-03-21',
        familyName: 'Lopez',
        givenName: 'Morgan',
      },
      'corr-patient-before-staff',
    );

    const response = createStaffProvisioningRouteResponse(
      administrator,
      {
        familyName: 'Lopez',
        givenName: 'Morgan',
        providerSubject: patient.subject,
        role: 'technician',
      },
      createContext(administrator, 'corr-staff-link-rejected'),
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.details).toEqual([
      'Staff access cannot be self-registered or linked to a patient profile.',
    ]);
  });

  test('creates and updates staff accounts with audit events for administrator actions', () => {
    const administrator = createIdentity('admin:staff-success', ['administrator']);
    const recordsBefore = getStaffProvisioningAuditRecords().length;

    const createdResponse = createStaffProvisioningRouteResponse(
      administrator,
      {
        email: 'taylor@pharmacytwo.test',
        familyName: 'Kim',
        givenName: 'Taylor',
        licenseIdentifier: 'LIC-100',
        providerSubject: 'staff:route-success',
        role: 'pharmacist',
      },
      createContext(administrator, 'corr-staff-create'),
    );
    const staff = createdResponse.body.staff as { readonly id: string };
    const updatedResponse = updateStaffProvisioningRouteResponse(
      staff.id,
      administrator,
      {
        role: 'technician',
        status: 'invited',
      },
      createContext(administrator, 'corr-staff-update'),
    );
    const recordsAfter = getStaffProvisioningAuditRecords();

    expect(createdResponse.statusCode).toBe(201);
    expect(updatedResponse.statusCode).toBe(200);
    expect(updatedResponse.body.staff).toMatchObject({
      email: 'taylor@pharmacytwo.test',
      id: staff.id,
      role: 'technician',
      status: 'invited',
    });
    expect(recordsAfter.slice(recordsBefore)).toEqual([
      expect.objectContaining({
        action: 'staff_provisioned',
        correlationId: 'corr-staff-create',
        outcome: 'success',
        staffRole: 'pharmacist',
      }),
      expect.objectContaining({
        action: 'staff_provisioning_updated',
        correlationId: 'corr-staff-update',
        outcome: 'success',
        staffRole: 'technician',
      }),
    ]);
  });
});
