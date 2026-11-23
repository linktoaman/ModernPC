import type { IdentityPrincipal } from './index';
import {
  getPatientAccountForIdentity,
  registerPatientAccount,
  type PatientAccountInput,
  type PatientAccountProfile
} from './accessPolicies';

export interface IdentityRouteResponse {
  readonly statusCode: number;
  readonly body: Record<string, unknown>;
}

export const createPatientAccountRouteResponse = (
  identity: IdentityPrincipal,
  body: unknown,
  correlationId: string
): IdentityRouteResponse => {
  if (!isJsonObject(body)) {
    return {
      statusCode: 400,
      body: {
        error: 'invalid_request',
        message: 'A JSON request body is required.',
        correlationId
      }
    };
  }

  const result = registerPatientAccount(identity, body as PatientAccountInput);

  if (!result.ok) {
    return {
      statusCode: 400,
      body: {
        error: 'invalid_patient_account',
        message: 'The patient account profile is incomplete or invalid.',
        details: result.errors,
        correlationId
      }
    };
  }

  return {
    statusCode: 201,
    body: {
      patient: serializePatientProfile(result.value),
      correlationId
    }
  };
};

export const getPatientMeRouteResponse = (
  identity: IdentityPrincipal,
  correlationId: string
): IdentityRouteResponse => {
  const patientProfile = getPatientAccountForIdentity(identity);

  if (patientProfile === undefined) {
    return {
      statusCode: 404,
      body: {
        error: 'patient_account_not_found',
        message: 'A patient account profile is required for this request.',
        correlationId
      }
    };
  }

  return {
    statusCode: 200,
    body: {
      patient: serializePatientProfile(patientProfile),
      correlationId
    }
  };
};

const serializePatientProfile = (
  profile: PatientAccountProfile
): Record<string, unknown> => ({
  id: profile.id,
  role: profile.role,
  givenName: profile.givenName,
  familyName: profile.familyName,
  dateOfBirth: profile.dateOfBirth,
  status: profile.status,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
  ...(profile.contactEmail === undefined ? {} : { contactEmail: profile.contactEmail }),
  ...(profile.contactPhone === undefined ? {} : { contactPhone: profile.contactPhone })
});

const isJsonObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);
