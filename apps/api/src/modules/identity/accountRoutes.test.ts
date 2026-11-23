import { describe, expect, test } from 'vitest';

import type { IdentityPrincipal } from './index';
import {
  createPatientAccountRouteResponse,
  getPatientMeRouteResponse,
} from './accountRoutes';

interface PatientResponseBody {
  readonly patient: {
    readonly id: string;
  };
}

const createIdentity = (
  subject: string,
  roles: IdentityPrincipal['roles'] = ['patient'],
): IdentityPrincipal => ({
  roleClaims: roles.map((role) => ({
    role,
    source: 'managed-oidc',
  })),
  roles,
  subject,
});

describe('patient account routes', () => {
  test('rejects invalid registration bodies with field-level validation details', () => {
    const response = createPatientAccountRouteResponse(
      createIdentity('patient:invalid-registration'),
      {
        contactEmail: 'not-an-email',
        familyName: '',
        givenName: '',
      },
      'corr-account-invalid',
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toMatchObject({
      correlationId: 'corr-account-invalid',
      error: 'invalid_patient_account',
    });
    expect(response.body.details).toEqual([
      'givenName is required.',
      'familyName is required.',
      'dateOfBirth is required.',
      'contactEmail must be a valid email address.',
    ]);
  });

  test('updates an existing patient profile instead of creating a duplicate account', () => {
    const identity = createIdentity('patient:duplicate-safe');

    const firstResponse = createPatientAccountRouteResponse(
      identity,
      {
        contactEmail: 'riley@example.com',
        dateOfBirth: '1988-04-12',
        familyName: 'Nguyen',
        givenName: 'Riley',
      },
      'corr-account-create',
    );
    const secondResponse = createPatientAccountRouteResponse(
      identity,
      {
        contactEmail: 'riley.updated@example.com',
        dateOfBirth: '1988-04-12',
        familyName: 'Nguyen',
        givenName: 'Riley',
      },
      'corr-account-update',
    );
    const firstBody = firstResponse.body as unknown as PatientResponseBody;
    const secondBody = secondResponse.body as unknown as PatientResponseBody;

    expect(firstResponse.statusCode).toBe(201);
    expect(secondResponse.statusCode).toBe(201);
    expect(secondResponse.body.patient).toMatchObject({
      contactEmail: 'riley.updated@example.com',
      role: 'patient',
      status: 'active',
    });
    expect(secondBody.patient.id).toBe(firstBody.patient.id);
  });

  test('rejects staff identities attempting patient self-registration', () => {
    const response = createPatientAccountRouteResponse(
      createIdentity('staff:patient-self-registration', ['pharmacist']),
      {
        dateOfBirth: '1979-09-08',
        familyName: 'Patel',
        givenName: 'Sam',
      },
      'corr-staff-patient-registration',
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.details).toEqual([
      'Patient self-registration is not available for staff identities.',
    ]);
  });

  test('requires a provisioned patient profile before returning /api/patient/me data', () => {
    const missingIdentity = createIdentity('patient:missing-profile');
    const registeredIdentity = createIdentity('patient:registered-profile');

    const missingResponse = getPatientMeRouteResponse(missingIdentity, 'corr-missing-profile');

    createPatientAccountRouteResponse(
      registeredIdentity,
      {
        contactPhone: '555-0100',
        dateOfBirth: '1991-01-15',
        familyName: 'Jordan',
        givenName: 'Alex',
      },
      'corr-register-profile',
    );
    const registeredResponse = getPatientMeRouteResponse(
      registeredIdentity,
      'corr-registered-profile',
    );

    expect(missingResponse.statusCode).toBe(404);
    expect(missingResponse.body).toMatchObject({
      error: 'patient_account_not_found',
    });
    expect(registeredResponse.statusCode).toBe(200);
    expect(registeredResponse.body.patient).toMatchObject({
      contactPhone: '555-0100',
      familyName: 'Jordan',
      givenName: 'Alex',
      role: 'patient',
    });
  });
});
